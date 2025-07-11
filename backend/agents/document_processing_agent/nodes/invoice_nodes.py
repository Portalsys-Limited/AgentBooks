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

from db.models import Document, Invoice, InvoiceLineItem, ChartOfAccount
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
        
        # Load client's chart of accounts
        chart_of_accounts = db_session.execute(
            select(ChartOfAccount).where(ChartOfAccount.client_id == document.client_id)
        ).scalars().all()
        
        # Extract invoice/receipt data using the dedicated GPT-4 model passed into this node
        invoice_data = extract_invoice_data(state["extracted_text"], llm, document_type, chart_of_accounts)
        
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
        print(f"Error processing invoice: {str(e)}")
        state["current_node"] = "end"
        return state

def extract_invoice_data(extracted_text: str, llm: ChatOpenAI, document_type: str = "invoice", chart_of_accounts: List[ChartOfAccount] = None) -> Dict[str, Any]:
    """Extract structured invoice/receipt data from text using LLM."""
    
    # Build account code context
    account_context = ""
    if chart_of_accounts:
        account_context = "\nAvailable account codes:\n" + "\n".join([
            f"- {account.code}: {account.name} ({account.account_type})"
            for account in chart_of_accounts
        ])
    
    prompt = f"""
    You are an expert at extracting structured data from financial documents. Analyze the following {document_type} text and extract the key information in JSON format.
    {account_context}

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
                "total": "decimal - subtotal + tax_amount",
                "account_code": "string - matching account code to be assigned to invoice line item from available codes (if found)"
            }}
        ]
    }}

    Important:
    - Return ONLY the JSON object, no additional text, no markdown, no explanations.
    - Use decimal numbers for all monetary values
    - If a field cannot be found, use null
    - Ensure all calculations are correct
    - Tax rate should be a percentage (e.g., 20.0 for 20%)
    - For invoices: If no due date is found, calculate it as 30 days from issue date
    - For receipts: Use the transaction date as both issue_date and due_date
    - For each line item, try to match the description with an appropriate account code from the available codes
    """

    try:
        # Call LLM to extract data
        messages = [HumanMessage(content=prompt)]
        response = llm.invoke(messages)
        
        # Debug logging
        print(f"LLM raw response: {response.content!r}")
        
        response_text = response.content.strip()
        if not response_text:
            print("LLM response is empty!")
            return None

        # Try to extract JSON from the response (handle markdown fences, extra text)
        import re
        match = re.search(r'({.*})', response_text, re.DOTALL)
        if match:
            json_text = match.group(1)
            data = json.loads(json_text)
        else:
            # Fallback: try parsing the entire response as JSON
            try:
                data = json.loads(response_text)
            except json.JSONDecodeError:
                print("No valid JSON found in LLM response")
                return None
        
        print(f"Parsed invoice data: {data}")
        # Validate and clean data
        return validate_invoice_data(data, document_type, chart_of_accounts)
        
    except Exception as e:
        print(f"Error extracting invoice data: {str(e)}")
        print(f"LLM response was: {getattr(response, 'content', None)}")
        return None

def validate_invoice_data(data: Dict[str, Any], document_type: str, chart_of_accounts: List[ChartOfAccount] = None) -> Dict[str, Any]:
    """Validate and clean extracted invoice/receipt data.

    This function is lenient with missing dates for receipts. If `issue_date` or
    `due_date` are missing we will substitute sensible defaults so the record
    can still be saved (receipts often omit explicit dates).
    """
    
    print(f"Validating invoice data: {data}")
    
    # Basic validation – invoice_number is mandatory
    if not data.get('invoice_number'):
        print("Missing required field: invoice_number")
        return None

    # Handle missing dates gracefully (common on receipts)
    # Default to today for issue_date; for invoices we still require a date if
    # we cannot infer it.
    today_str = datetime.utcnow().strftime('%Y-%m-%d')

    if not data.get('issue_date'):
        if document_type == 'receipt':
            data['issue_date'] = today_str
        else:
            print("Missing issue_date for invoice – aborting")
            return None

    if not data.get('due_date'):
        if document_type == 'invoice':
            # Default due date 30 days after issue_date
            try:
                issue_dt = datetime.strptime(data['issue_date'], '%Y-%m-%d')
                from datetime import timedelta
                data['due_date'] = (issue_dt + timedelta(days=30)).strftime('%Y-%m-%d')
            except ValueError:
                print("Invalid issue_date format – aborting")
                return None
        else:
            # For receipts use the same day as issue_date
            data['due_date'] = data['issue_date']

    # Validate dates (now guaranteed to be present)
    try:
        data['issue_date'] = datetime.strptime(data['issue_date'], '%Y-%m-%d').strftime('%Y-%m-%d')
        data['due_date'] = datetime.strptime(data['due_date'], '%Y-%m-%d').strftime('%Y-%m-%d')
    except ValueError as e:
        print(f"Date validation error: {str(e)}")
        return None
    
    # Clean and validate monetary values
    try:
        def _to_float(val):
            """Convert value to float, treating None/empty/invalid as 0.0"""
            try:
                # Strip currency symbols or commas if present
                if isinstance(val, str):
                    val = val.replace(',', '').replace('£', '').replace('$', '')
                return float(val)
            except (TypeError, ValueError):
                return 0.0

        data['subtotal'] = _to_float(data.get('subtotal'))
        data['tax_amount'] = _to_float(data.get('tax_amount'))
        data['total_amount'] = _to_float(data.get('total_amount'))
        
        # Validate line items
        if data.get('line_items'):
            cleaned_items = []
            account_code_map = {acc.code: acc for acc in (chart_of_accounts or [])}
            
            for item in data['line_items']:
                cleaned_item = {
                    'description': str(item.get('description', '')),
                    'quantity': int(item.get('quantity', 1)),
                    'unit_price': float(item.get('unit_price', 0)),
                    'tax_rate': float(item.get('tax_rate', 0)),
                    'tax_amount': float(item.get('tax_amount', 0)),
                    'subtotal': float(item.get('subtotal', 0)),
                    'total': float(item.get('total', 0)),
                    'account_code': None,
                    'account_id': None
                }
                
                # Handle account code assignment
                if account_code := item.get('account_code'):
                    if account := account_code_map.get(account_code):
                        cleaned_item['account_code'] = account.code
                        cleaned_item['account_id'] = str(account.id)
                
                # Recalculate values to ensure consistency
                cleaned_item['subtotal'] = cleaned_item['quantity'] * cleaned_item['unit_price']
                cleaned_item['tax_amount'] = cleaned_item['subtotal'] * (cleaned_item['tax_rate'] / 100)
                cleaned_item['total'] = cleaned_item['subtotal'] + cleaned_item['tax_amount']
                
                cleaned_items.append(cleaned_item)
            
            data['line_items'] = cleaned_items

            # If invoice-level monetary fields were missing or zero, recompute from line items
            subtotal_sum = sum(item['subtotal'] for item in cleaned_items)
            tax_sum = sum(item['tax_amount'] for item in cleaned_items)
            total_sum = sum(item['total'] for item in cleaned_items)

            if data['subtotal'] == 0:
                data['subtotal'] = subtotal_sum
            if data['tax_amount'] == 0:
                data['tax_amount'] = tax_sum
            if data['total_amount'] == 0:
                data['total_amount'] = total_sum
        
    except (ValueError, TypeError) as e:
        print(f"Monetary value validation error: {str(e)}")
        return None
    
    print(f"Validated invoice data: {data}")
    return data

def create_invoice_from_data(invoice_data: Dict[str, Any], practice_id: str, client_id: str, document_id: str, db_session: Session) -> Invoice:
    """Create invoice and line items from extracted data."""
    
    print(f"Creating invoice from data: {invoice_data}")
    
    try:
        # Create invoice
        invoice = Invoice(
            practice_id=practice_id,
            client_id=client_id,
            document_id=document_id,
            invoice_number=invoice_data['invoice_number'],
            issue_date=datetime.strptime(invoice_data['issue_date'], '%Y-%m-%d'),
            due_date=datetime.strptime(invoice_data['due_date'], '%Y-%m-%d'),
            subtotal=Decimal(str(invoice_data['subtotal'])).quantize(Decimal('0.01')),
            tax_amount=Decimal(str(invoice_data['tax_amount'])).quantize(Decimal('0.01')),
            total_amount=Decimal(str(invoice_data['total_amount'])).quantize(Decimal('0.01'))
        )
        
        db_session.add(invoice)
        db_session.flush()  # Get the invoice ID
        print(f"Invoice created with ID: {invoice.id}")
        
        # Create line items (best-effort – skip rows that raise errors)
        if invoice_data.get('line_items'):
            for idx, item_data in enumerate(invoice_data['line_items'], start=1):
                try:
                    line_item = InvoiceLineItem(
                        invoice_id=invoice.id,
                        description=item_data.get('description', f'Item {idx}')[:255],
                        quantity=item_data.get('quantity', 1),
                        unit_price=Decimal(str(item_data.get('unit_price', 0))).quantize(Decimal('0.01')),
                        tax_rate=Decimal(str(item_data.get('tax_rate', 0))).quantize(Decimal('0.01')),
                        tax_amount=Decimal(str(item_data.get('tax_amount', 0))).quantize(Decimal('0.01')),
                        subtotal=Decimal(str(item_data.get('subtotal', 0))).quantize(Decimal('0.01')),
                        total=Decimal(str(item_data.get('total', 0))).quantize(Decimal('0.01')),
                        account_id=item_data.get('account_id'),
                        account_code=item_data.get('account_code')
                    )
                    db_session.add(line_item)
                except Exception as item_err:
                    print(f"⚠️  Skipped line item {idx} due to error: {item_err}")
        
        db_session.commit()
        print(f"Invoice saved successfully with invoice ID: {invoice.id}")
        return invoice
        
    except Exception as e:
        db_session.rollback()
        print(f"Error creating invoice: {str(e)}")
        raise 