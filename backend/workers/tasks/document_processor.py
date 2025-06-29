"""Document processing tasks including OCR extraction and document workflow."""

from celery import shared_task
from celery.utils.log import get_task_logger
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
import base64
import requests
import PyPDF2
import fitz  # PyMuPDF for better PDF text extraction
from io import BytesIO
from typing import Dict, Any
from datetime import datetime
from sqlalchemy import select
import uuid

from config.database import get_sync_session
from db.models import Document, DocumentType, DocumentAgentState
from workers.celery_app import celery_app
from agents.document_processing_agent.document_processing_agent import DocumentProcessingAgent

# Get task logger
logger = get_task_logger(__name__)

def has_embedded_text(pdf_path: str) -> bool:
    """Check if PDF has embedded text or is a scanned document."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text_content = ""
            
            # Check first few pages for text content
            pages_to_check = min(3, len(pdf_reader.pages))
            for page_num in range(pages_to_check):
                page = pdf_reader.pages[page_num]
                text_content += page.extract_text()
            
            # If we have substantial text content, it's likely a text-based PDF
            return len(text_content.strip()) > 50
    except Exception as e:
        logger.warning(f"Error checking PDF text content: {e}")
        return False

def extract_pdf_text(pdf_path: str) -> str:
    """Extract embedded text from PDF using PyMuPDF."""
    try:
        doc = fitz.open(pdf_path)
        text_content = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            text_content += f"\n--- Page {page_num + 1} ---\n{text}"
        
        doc.close()
        return text_content
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""

def encode_image_to_base64(image_path: str) -> str:
    """Encode image file to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def call_mistral_ocr(image_base64: str) -> str:
    """Call Mistral API for OCR processing."""
    try:
        api_key = os.getenv('MISTRAL_OCR')
        if not api_key:
            raise ValueError("MISTRAL_OCR not found in environment variables")
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": "pixtral-12b-2409",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all text content from this image. Return only the extracted text, no additional commentary or formatting."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 4000
        }
        
        response = requests.post(
            'https://api.mistral.ai/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            logger.error(f"Mistral API error: {response.status_code} - {response.text}")
            return ""
            
    except Exception as e:
        logger.error(f"Error calling Mistral OCR: {e}")
        return ""

def process_scanned_pdf_with_mistral(pdf_path: str) -> str:
    """Process scanned PDF using Mistral OCR."""
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=300)
        extracted_text = ""
        
        for i, image in enumerate(images):
            # Save image temporarily
            temp_image_path = f"/tmp/temp_page_{i}.jpg"
            image.save(temp_image_path, 'JPEG', quality=95)
            
            try:
                # Encode image to base64
                image_base64 = encode_image_to_base64(temp_image_path)
                
                # Call Mistral OCR
                page_text = call_mistral_ocr(image_base64)
                extracted_text += f"\n--- Page {i+1} ---\n{page_text}"
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_image_path):
                    os.remove(temp_image_path)
        
        return extracted_text
        
    except Exception as e:
        logger.error(f"Error processing scanned PDF with Mistral: {e}")
        return ""

def process_image_with_mistral(image_path: str) -> str:
    """Process image using Mistral OCR."""
    try:
        image_base64 = encode_image_to_base64(image_path)
        return call_mistral_ocr(image_base64)
    except Exception as e:
        logger.error(f"Error processing image with Mistral: {e}")
        return ""

@celery_app.task(bind=True, name='process_document_ocr')
def process_document_ocr(self, document_id: str) -> Dict[str, Any]:
    """
    Extract text from document using OCR.
    
    Args:
        document_id: UUID of the document to process
    """
    try:
        logger.info(f"Starting OCR processing for document {document_id}")
        
        # Get sync database session
        db = get_sync_session()
        
        try:
            # Fetch document from database
            document = db.execute(
                select(Document).where(Document.id == uuid.UUID(document_id))
            ).scalar_one_or_none()
            
            if not document:
                logger.error(f"Document {document_id} not found in database")
                return {
                    "success": False,
                    "error": "Document not found",
                    "document_id": document_id
                }
            
            # Update document state
            document.agent_state = DocumentAgentState.processing
            db.commit()
            
            # Get file path from document_url
            file_path = document.document_url
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Document file not found at {file_path}")
            
            extracted_text = ""
            processing_method = "unknown"
            
            # Process based on document type
            if document.document_type == DocumentType.pdf:
                # Check if PDF has embedded text or is scanned
                if has_embedded_text(file_path):
                    logger.info(f"PDF has embedded text, extracting directly")
                    extracted_text = extract_pdf_text(file_path)
                    processing_method = "embedded_text_extraction"
                else:
                    logger.info(f"PDF appears to be scanned, using Mistral OCR")
                    extracted_text = process_scanned_pdf_with_mistral(file_path)
                    processing_method = "mistral_ocr_scanned_pdf"
                    
            elif document.document_type == DocumentType.image:
                logger.info(f"Processing image with Mistral OCR")
                extracted_text = process_image_with_mistral(file_path)
                processing_method = "mistral_ocr_image"
                    
            else:
                logger.warning(f"Document type {document.document_type} not supported for OCR")
                return {
                    "success": False,
                    "error": f"Document type {document.document_type} not supported for OCR",
                    "document_id": document_id
                }
            
            # Fallback to Tesseract if Mistral OCR fails
            if not extracted_text.strip() and processing_method.startswith("mistral_ocr"):
                logger.warning(f"Mistral OCR failed or returned empty text, falling back to Tesseract")
                if document.document_type == DocumentType.pdf:
                    # Convert PDF to images and use Tesseract
                    images = convert_from_path(file_path)
                    for i, image in enumerate(images):
                        page_text = pytesseract.image_to_string(image)
                        extracted_text += f"\n--- Page {i+1} ---\n{page_text}"
                elif document.document_type == DocumentType.image:
                    # Use Tesseract directly on image
                    with Image.open(file_path) as image:
                        extracted_text = pytesseract.image_to_string(image)
                processing_method += "_fallback_tesseract"
            
            # Update document with extracted text
            document.raw_extracted_text = extracted_text
            document.agent_state = DocumentAgentState.processed
            document.processed_at = datetime.now()
            document.agent_metadata = {
                **(document.agent_metadata or {}),
                "ocr_processing": {
                    "completed_at": datetime.now().isoformat(),
                    "status": "success",
                    "processing_method": processing_method,
                    "text_length": len(extracted_text)
                }
            }
            
            db.commit()
            
            logger.info(f"OCR processing completed for document {document_id}")
            
            # Trigger document processing workflow
            process_document_workflow.delay(document_id)
            
            return {
                "success": True,
                "document_id": document_id,
                "text_length": len(extracted_text),
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing document {document_id}: {str(e)}")
            
            # Update document state to failed
            if document:
                document.agent_state = DocumentAgentState.failed
                document.agent_metadata = {
                    **(document.agent_metadata or {}),
                    "ocr_processing": {
                        "error": str(e),
                        "failed_at": datetime.now().isoformat()
                    }
                }
                db.commit()
            
            raise
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"OCR task failed for document {document_id}: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60, max_retries=3)

@celery_app.task(bind=True, name='process_document_workflow')
def process_document_workflow(self, document_id: str) -> Dict[str, Any]:
    """
    Process document through the document processing agent workflow.
    
    Args:
        document_id: UUID of the document to process
    """
    try:
        logger.info(f"Starting document processing workflow for document {document_id}")
        
        # Get sync database session
        db = get_sync_session()
        
        try:
            # Initialize document processing agent
            agent = DocumentProcessingAgent(db, uuid.UUID(document_id))
            
            # Run the processing workflow
            result = agent.process_document()
            
            logger.info(f"Document processing workflow completed for document {document_id}")
            return {
                "success": True,
                "document_id": document_id,
                "workflow_result": result,
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in document processing workflow for {document_id}: {str(e)}")
            raise
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Document processing workflow failed for {document_id}: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60, max_retries=3) 