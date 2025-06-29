"""Receipt processing nodes for document processing workflow."""

from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import re
from decimal import Decimal, InvalidOperation
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from db.models import Document, Invoice, InvoiceLineItem, ChartOfAccount
from ..states import AgentState

def process_receipt_node(state: AgentState, db_session: Session, llm: ChatOpenAI) -> AgentState:
    """Node to extract receipt data and save it to the database."""
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
        
        # Extract receipt data using the dedicated GPT-4 model passed into this node
        receipt_data = extract_receipt_data(state["extracted_text"], llm, document_type, chart_of_accounts)
        
        if not receipt_data:
            print(f"Failed to extract {document_type} data")
            state["current_node"] = "end"
            return state
        
        # Create invoice record (receipts are stored as invoices with receipt category)
        invoice = create_receipt_from_data(
            receipt_data, 
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
                    "extracted_data": receipt_data
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
        print(f"Error processing receipt: {str(e)}")
        state["current_node"] = "end"
        return state

def extract_receipt_data(extracted_text: str, llm: ChatOpenAI, document_type: str = "receipt", chart_of_accounts: List[ChartOfAccount] = None) -> Dict[str, Any]:
    """Extract structured receipt data from text using LLM."""
    
    # Build account code context
    account_context = ""
    if chart_of_accounts:
        account_context = "\nAvailable account codes:\n" + "\n".join([
            f"- {account.code}: {account.name} ({account.account_type})"
            for account in chart_of_accounts
        ])
    
    prompt = f"""
    You are an expert at extracting structured data from receipt documents. Analyze the following {document_type} text and extract the key information in JSON format.
    {account_context}

    {document_type.title()} Text:
    {extracted_text}

    Please extract the following information and return it as a valid JSON object:
    {{
        "receipt_number": "string - the receipt number or transaction ID",
        "transaction_date": "YYYY-MM-DD - the transaction/purchase date",
        "vendor_name": "string - the name of the vendor/store",
        "subtotal": "decimal - subtotal amount before tax",
        "tax_amount": "decimal - total tax amount",
        "total_amount": "decimal - final total amount",
        "line_items": [
            {{
                "description": "string - description of the item/service purchased",
                "quantity": "integer - quantity",
                "unit_price": "decimal - price per unit",
                "tax_rate": "decimal - tax rate as percentage (e.g., 20.0 for 20%)",
                "tax_amount": "decimal - tax amount for this line",
                "subtotal": "decimal - quantity * unit_price",
                "total": "decimal - subtotal + tax_amount",
                "account_code": "string - matching account code for expense categorization from available codes (if found)"
            }}
        ]
    }}

    Important:
    - Return ONLY the JSON object, no additional text, no markdown, no explanations.
    - Use decimal numbers for all monetary values
    - If a field cannot be found, use null
    - Ensure all calculations are correct
    - Tax rate should be a percentage (e.g., 20.0 for 20%)
    - For receipts, use the transaction date as both issue_date and due_date
    - For each line item, try to match the description with an appropriate expense account code from the available codes
    - Focus on expense categorization since receipts typically represent business expenses
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
        
        print(f"Parsed receipt data: {data}")
        # Validate and clean data
        return validate_receipt_data(data, document_type, chart_of_accounts)
        
    except Exception as e:
        print(f"Error extracting receipt data: {str(e)}")
        print(f"LLM response was: {getattr(response, 'content', None)}")
        return None

def validate_receipt_data(data: Dict[str, Any], document_type: str, chart_of_accounts: List[ChartOfAccount] = None) -> Dict[str, Any]:
    """Validate and clean extracted receipt data.

    This function is lenient with missing data for receipts and will substitute 
    sensible defaults so the record can still be saved.
    """
    
    print(f"Validating receipt data: {data}")
    
    # Basic validation – receipt_number is mandatory, but we can generate one if missing
    if not data.get('receipt_number'):
        # Generate a receipt number based on timestamp
        data['receipt_number'] = f"RCP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        print(f"Generated receipt number: {data['receipt_number']}")

    # Handle missing dates gracefully (common on receipts)
    today_str = datetime.utcnow().strftime('%Y-%m-%d')

    if not data.get('transaction_date'):
        data['transaction_date'] = today_str
        print("Using today's date for missing transaction date")

    # Convert receipt format to invoice format for storage
    data['invoice_number'] = data.get('receipt_number')
    data['issue_date'] = data.get('transaction_date')
    data['due_date'] = data.get('transaction_date')  # Same day for receipts

    # Validate dates
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

            # If receipt-level monetary fields were missing or zero, recompute from line items
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
    
    print(f"Validated receipt data: {data}")
    return data

def create_receipt_from_data(receipt_data: Dict[str, Any], practice_id: str, client_id: str, document_id: str, db_session: Session) -> Invoice:
    """Create receipt record (stored as invoice) and line items from extracted data."""
    
    print(f"Creating receipt from data: {receipt_data}")
    
    try:
        # Create invoice record (receipts are stored as invoices)
        invoice = Invoice(
            practice_id=practice_id,
            client_id=client_id,
            document_id=document_id,
            invoice_number=receipt_data['invoice_number'],
            issue_date=datetime.strptime(receipt_data['issue_date'], '%Y-%m-%d'),
            due_date=datetime.strptime(receipt_data['due_date'], '%Y-%m-%d'),
            subtotal=Decimal(str(receipt_data['subtotal'])).quantize(Decimal('0.01')),
            tax_amount=Decimal(str(receipt_data['tax_amount'])).quantize(Decimal('0.01')),
            total_amount=Decimal(str(receipt_data['total_amount'])).quantize(Decimal('0.01'))
        )
        
        db_session.add(invoice)
        db_session.flush()  # Get the invoice ID
        print(f"Receipt invoice created with ID: {invoice.id}")
        
        # Create line items (best-effort – skip rows that raise errors)
        if receipt_data.get('line_items'):
            for idx, item_data in enumerate(receipt_data['line_items'], start=1):
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
        print(f"Receipt saved successfully with invoice ID: {invoice.id}")
        return invoice
        
    except Exception as e:
        db_session.rollback()
        print(f"Error creating receipt: {str(e)}")
        raise 