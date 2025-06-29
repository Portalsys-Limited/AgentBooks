"""Invoice processing nodes for document processing workflow."""

from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime
import json
import re
from decimal import Decimal, InvalidOperation
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from db.models import Document, Invoice, InvoiceLineItem
from ..states import AgentState

def process_invoice_node(state: AgentState, db_session: Session, llm: ChatOpenAI) -> AgentState:
    """Node to extract invoice/receipt data and save it to the database."""
    document_type = state["classification_result"]["document_category"]
    print(f"Processing {document_type} data...")
    
    try:
        # Load document
        document = db_session.execute(
            select(Document).where(Document.id == state["document_id"])
        ).scalar_one_or_none()
        
        if not document:
            print("Document not found")
            state["current_node"] = "end"
            return state
        
        # Extract invoice/receipt data using LLM
        invoice_data = extract_invoice_data(state["extracted_text"], llm, document_type)
        
        if not invoice_data:
            print(f"Failed to extract {document_type} data")
            state["current_node"] = "end"
            return state
        
        # Create invoice record
        invoice = create_invoice_from_data(
            invoice_data, 
            document.practice_id, 
            document.client_id, 
            document.id,
            db_session
        )
        
        if invoice:
            # Update document metadata
            document.agent_metadata = {
                **(document.agent_metadata or {}),
                "financial_document_processing": {
                    "processed_at": datetime.utcnow().isoformat(),
                    "document_type": document_type,
                    "invoice_id": str(invoice.id),
                    "extracted_data": invoice_data
                }
            }
            
            db_session.add(document)
            db_session.commit()
            
            print(f"Financial document ({document_type}) processed successfully with invoice ID: {invoice.id}")
            state["invoice_id"] = str(invoice.id)
        
        state["current_node"] = "end"
        return state
        
    except Exception as e:
        if db_session.in_transaction():
            db_session.rollback()
        print(f"Error in process_invoice_node: {str(e)}")
        raise

def extract_invoice_data(extracted_text: str, llm: ChatOpenAI, document_type: str = "invoice") -> Dict[str, Any]:
    """Extract structured invoice/receipt data from text using LLM."""
    
    prompt = f"""
    You are an expert at extracting structured data from financial documents. Analyze the following {document_type} text and extract the key information in JSON format.

    {document_type.title()} Text:
    {extracted_text}

    Please extract the following information and return it as a valid JSON object:
    {{
        "invoice_number": "string - the document number (invoice number, receipt number, etc.)",
        "issue_date": "YYYY-MM-DD - the document issue/transaction date",
        "due_date": "YYYY-MM-DD - the payment due date (for invoices) or transaction date (for receipts)",
        "subtotal": "decimal - subtotal amount before tax",
        "tax_amount": "decimal - total tax amount",
        "total_amount": "decimal - final total amount",
        "line_items": [
            {{
                "description": "string - description of the item/service",
                "quantity": "integer - quantity",
                "unit_price": "decimal - price per unit",
                "tax_rate": "decimal - tax rate as percentage (e.g., 20.0 for 20%)",
                "tax_amount": "decimal - tax amount for this line",
                "subtotal": "decimal - quantity * unit_price",
                "total": "decimal - subtotal + tax_amount"
            }}
        ]
    }}

    Important:
    - Return ONLY the JSON object, no additional text
    - Use decimal numbers for all monetary values
    - If a field cannot be found, use null
    - Ensure all calculations are correct
    - Tax rate should be a percentage (e.g., 20.0 for 20%)
    - For invoices: If no due date is found, calculate it as 30 days from issue date
    - For receipts: Use the transaction date as both issue_date and due_date
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        
        # Extract JSON from response
        response_text = response.content.strip()
        
        # Try to find JSON in the response
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start != -1 and json_end != -1:
            json_text = response_text[json_start:json_end]
            invoice_data = json.loads(json_text)
            
            # Validate and clean the data
            return validate_invoice_data(invoice_data)
        else:
            print("No JSON found in LLM response")
            return None
            
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        return None
    except Exception as e:
        print(f"Error extracting invoice data: {str(e)}")
        return None

def validate_invoice_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and clean extracted invoice/receipt data."""
    
    # Required fields
    required_fields = ['invoice_number', 'issue_date', 'total_amount']
    for field in required_fields:
        if not data.get(field):
            print(f"Missing required field: {field}")
            return None
    
    # Clean and validate dates
    try:
        issue_date = datetime.strptime(data['issue_date'], '%Y-%m-%d')
        
        if not data.get('due_date'):
            # Calculate due date as 30 days from issue date
            from datetime import timedelta
            due_date = issue_date + timedelta(days=30)
            data['due_date'] = due_date.strftime('%Y-%m-%d')
        else:
            # Validate due date format
            datetime.strptime(data['due_date'], '%Y-%m-%d')
            
    except ValueError as e:
        print(f"Date validation error: {str(e)}")
        return None
    
    # Clean and validate monetary values
    try:
        data['subtotal'] = float(data.get('subtotal', 0))
        data['tax_amount'] = float(data.get('tax_amount', 0))
        data['total_amount'] = float(data.get('total_amount', 0))
        
        # Validate line items
        if data.get('line_items'):
            cleaned_items = []
            for item in data['line_items']:
                cleaned_item = {
                    'description': str(item.get('description', '')),
                    'quantity': int(item.get('quantity', 1)),
                    'unit_price': float(item.get('unit_price', 0)),
                    'tax_rate': float(item.get('tax_rate', 0)),
                    'tax_amount': float(item.get('tax_amount', 0)),
                    'subtotal': float(item.get('subtotal', 0)),
                    'total': float(item.get('total', 0))
                }
                
                # Recalculate values to ensure consistency
                cleaned_item['subtotal'] = cleaned_item['quantity'] * cleaned_item['unit_price']
                cleaned_item['tax_amount'] = cleaned_item['subtotal'] * (cleaned_item['tax_rate'] / 100)
                cleaned_item['total'] = cleaned_item['subtotal'] + cleaned_item['tax_amount']
                
                cleaned_items.append(cleaned_item)
            
            data['line_items'] = cleaned_items
        
    except (ValueError, TypeError) as e:
        print(f"Monetary value validation error: {str(e)}")
        return None
    
    return data

def create_invoice_from_data(invoice_data: Dict[str, Any], practice_id: str, client_id: str, document_id: str, db_session: Session) -> Invoice:
    """Create invoice and line items from extracted data."""
    
    try:
        # Create invoice
        invoice = Invoice(
            practice_id=practice_id,
            client_id=client_id,
            document_id=document_id,
            invoice_number=invoice_data['invoice_number'],
            issue_date=datetime.strptime(invoice_data['issue_date'], '%Y-%m-%d'),
            due_date=datetime.strptime(invoice_data['due_date'], '%Y-%m-%d'),
            subtotal=Decimal(str(invoice_data['subtotal'])),
            tax_amount=Decimal(str(invoice_data['tax_amount'])),
            total_amount=Decimal(str(invoice_data['total_amount']))
        )
        
        db_session.add(invoice)
        db_session.flush()  # Get the invoice ID
        
        # Create line items
        if invoice_data.get('line_items'):
            for item_data in invoice_data['line_items']:
                line_item = InvoiceLineItem(
                    invoice_id=invoice.id,
                    description=item_data['description'],
                    quantity=item_data['quantity'],
                    unit_price=Decimal(str(item_data['unit_price'])),
                    tax_rate=Decimal(str(item_data['tax_rate'])),
                    tax_amount=Decimal(str(item_data['tax_amount'])),
                    subtotal=Decimal(str(item_data['subtotal'])),
                    total=Decimal(str(item_data['total']))
                )
                
                db_session.add(line_item)
        
        db_session.commit()
        return invoice
        
    except Exception as e:
        db_session.rollback()
        print(f"Error creating invoice: {str(e)}")
        raise 