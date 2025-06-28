"""Document processing tasks including OCR extraction and document workflow."""

from celery import shared_task
from celery.utils.log import get_task_logger
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
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
            
            # Process based on document type
            if document.document_type == DocumentType.pdf:
                # Convert PDF to images
                images = convert_from_path(file_path)
                
                # Extract text from each page
                for i, image in enumerate(images):
                    page_text = pytesseract.image_to_string(image)
                    extracted_text += f"\n--- Page {i+1} ---\n{page_text}"
                    
            elif document.document_type == DocumentType.image:
                # Open and process image directly
                with Image.open(file_path) as image:
                    extracted_text = pytesseract.image_to_string(image)
                    
            else:
                logger.warning(f"Document type {document.document_type} not supported for OCR")
                return {
                    "success": False,
                    "error": f"Document type {document.document_type} not supported for OCR",
                    "document_id": document_id
                }
            
            # Update document with extracted text
            document.raw_extracted_text = extracted_text
            document.agent_state = DocumentAgentState.processed
            document.processed_at = datetime.now()
            document.agent_metadata = {
                **(document.agent_metadata or {}),
                "ocr_processing": {
                    "completed_at": datetime.now().isoformat(),
                    "status": "success"
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