"""Client assignment nodes for document processing workflow."""

from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import os
import asyncio
import urllib.parse

from db.models import Document, Individual, Customer, Client, CustomerClientAssociation, Practice
from services.twilio_service import twilio_service
from ..states import AgentState, CLIENT_REQUIRED_CATEGORIES, ClientInfo

def load_available_clients(db_session: Session, individual_id: str) -> List[ClientInfo]:
    """Load all clients available to an individual through their customer relationships."""
    # Get all customers for the individual with their individual details
    customers = db_session.execute(
        select(Customer, Individual)
        .join(Individual, Customer.individual_id == Individual.id)
        .where(Customer.individual_id == individual_id)
    ).all()
    
    available_clients = []
    for customer, individual in customers:
        # Get all client associations for each customer
        associations = db_session.execute(
            select(CustomerClientAssociation, Client)
            .join(Client, CustomerClientAssociation.client_id == Client.id)
            .where(CustomerClientAssociation.customer_id == customer.id)
            .where(CustomerClientAssociation.is_active == "active")
        ).all()
        
        for assoc, client in associations:
            available_clients.append(ClientInfo(
                client_id=str(client.id),
                client_name=client.business_name,
                customer_id=str(customer.id),
                customer_name=f"{individual.first_name} {individual.last_name}"
            ))
    
    return available_clients

def check_client_assignment_node(state: AgentState, db_session: Session) -> AgentState:
    """Node to check if document needs client assignment and load available clients."""
    print("Checking client assignment requirements...")
    
    # Get document category
    category = state["classification_result"]["document_category"]
    
    # Check if this category requires client assignment
    if category not in CLIENT_REQUIRED_CATEGORIES:
        print(f"Category {category} does not require client assignment")
        state["current_node"] = "end"
        return state
    
    try:
        # Load document to get individual_id and check if client is already assigned
        document = db_session.execute(
            select(Document).where(Document.id == state["document_id"])
        ).scalar_one_or_none()
        
        if not document or not document.individual_id:
            print("No individual associated with document")
            state["current_node"] = "end"
            return state
        
        # Check if document already has a client assigned
        if document.client_id:
            print(f"Document already has client assigned: {document.client_id}")
            # If it's an invoice or receipt, go directly to invoice processing
            if category in ["invoice", "receipt"]:
                print(f"Document is a {category}, proceeding to invoice processing")
                state["current_node"] = "process_invoice"
            else:
                print("Document already processed, ending workflow")
                state["current_node"] = "end"
            return state
        
        # Store individual_id in state
        state["individual_id"] = str(document.individual_id)
        
        # Load available clients
        available_clients = load_available_clients(db_session, state["individual_id"])
        state["available_clients"] = available_clients
        
        print(f"Found {len(available_clients)} available clients")
        
        if not available_clients:
            # Individual has no clients, send rejection message
            state["current_node"] = "send_rejection_message"
        elif len(available_clients) == 1:
            # Only one client, can assign directly
            state["current_node"] = "assign_single_client"
        else:
            # Multiple clients, need selection
            state["current_node"] = "send_selection_poll"
            state["requires_client_selection"] = True
        
        return state
        
    except Exception as e:
        print(f"Error in check_client_assignment_node: {str(e)}")
        raise

def send_rejection_message_node(state: AgentState, db_session: Session) -> AgentState:
    """Node to send WhatsApp message when individual is not registered."""
    print("Sending rejection message...")
    
    try:
        # Load individual to get phone number
        individual = db_session.execute(
            select(Individual).where(Individual.id == state["individual_id"])
        ).scalar_one_or_none()
        
        if individual and individual.primary_mobile:
            # Send WhatsApp message
            message = (
                "We received your document, but we noticed you're not yet registered as a customer. "
                "Please contact our office to set up your account before sending documents."
            )
            
            try:
                # Get practice's WhatsApp number
                practice = db_session.execute(
                    select(Practice).where(Practice.id == individual.practice_id)
                ).scalar_one_or_none()
                
                if practice and practice.whatsapp_number:
                    # Run async Twilio call in sync context
                    asyncio.run(
                        twilio_service.send_whatsapp_message(
                            to_phone=individual.primary_mobile,
                            message_body=message,
                            from_whatsapp_number=practice.whatsapp_number
                        )
                    )
                    state["whatsapp_message_sent"] = True
                    print("Rejection message sent successfully")
                else:
                    print("Practice WhatsApp number not found")
                    state["whatsapp_message_sent"] = False
            except Exception as e:
                print(f"Error sending rejection message: {str(e)}")
                state["whatsapp_message_sent"] = False
        
        state["current_node"] = "end"
        return state
        
    except Exception as e:
        print(f"Error in send_rejection_message_node: {str(e)}")
        raise

def send_selection_poll_node(state: AgentState, db_session: Session) -> AgentState:
    """Node to send a templated WhatsApp List Message for client selection."""
    print("Sending client selection template message...")
    
    try:
        individual = db_session.execute(
            select(Individual).where(Individual.id == state["individual_id"])
        ).scalar_one_or_none()
        
        if individual and individual.primary_mobile:
            try:
                practice = db_session.execute(
                    select(Practice).where(Practice.id == individual.practice_id)
                ).scalar_one_or_none()
                
                if practice and practice.whatsapp_number:
                    available_clients = state["available_clients"]
                    document_id = state["document_id"]
                    template_sid = "HX24ef0aa82e352c05f706529c50f1afe4"

                    # The template supports 3 items. Chunk clients into groups of 3.
                    chunk_size = 3
                    client_chunks = [available_clients[i:i + chunk_size] for i in range(0, len(available_clients), chunk_size)]

                    for chunk in client_chunks:
                        # The variable numbers in the template are not sequential per item.
                        # Item 1: name={{1}}, id={{2}}, desc={{3}}
                        # Item 2: name={{4}}, id={{5}}, desc={{6}}
                        # Item 3: name={{9}}, id={{7}}, desc={{8}}
                        variable_map = [
                            {"name": "1", "id": "2", "desc": "3"},
                            {"name": "4", "id": "5", "desc": "6"},
                            {"name": "9", "id": "7", "desc": "8"},
                        ]

                        content_variables = {}
                        for i, client in enumerate(chunk):
                            var_indices = variable_map[i]
                            
                            # Populate variables for the template
                            content_variables[var_indices["name"]] = client['client_name']
                            content_variables[var_indices["id"]] = f"assign_client:{document_id}:{client['client_id']}"
                            content_variables[var_indices["desc"]] = f"Customer: {client['customer_name']}"
                        
                        asyncio.run(
                            twilio_service.send_whatsapp_message(
                                to_phone=individual.primary_mobile,
                                from_whatsapp_number=practice.whatsapp_number,
                                content_sid=template_sid,
                                content_variables=content_variables,
                                message_body="Please select a client for the document you sent."
                            )
                        )
                    
                    state["whatsapp_message_sent"] = True
                    print("Client selection template message sent successfully.")
                else:
                    print("Practice WhatsApp number not found")
                    state["whatsapp_message_sent"] = False
            except Exception as e:
                print(f"Error sending selection poll: {str(e)}")
                state["whatsapp_message_sent"] = False
        
        state["current_node"] = "end"
        return state
        
    except Exception as e:
        print(f"Error in send_selection_poll_node: {str(e)}")
        raise

def assign_single_client_node(state: AgentState, db_session: Session) -> AgentState:
    """Node to assign document to the single available client."""
    print("Assigning document to single client...")
    
    client_info = state["available_clients"][0]
    
    try:
        # Load and update document
        document = db_session.execute(
            select(Document).where(Document.id == state["document_id"])
        ).scalar_one_or_none()
        
        if document:
            document.client_id = client_info["client_id"]
            document.customer_id = client_info["customer_id"]
            document.agent_metadata = {
                **(document.agent_metadata or {}),
                "client_assignment": {
                    "assigned_at": datetime.utcnow().isoformat(),
                    "client_id": client_info["client_id"],
                    "client_name": client_info["client_name"],
                    "customer_id": client_info["customer_id"],
                    "customer_name": client_info["customer_name"],
                    "automatic": True
                }
            }
            
            db_session.add(document)
            db_session.commit()
            print(f"Document assigned to client {client_info['client_name']}")
            
            # Check if this is an invoice or receipt that needs further processing
            if state["classification_result"]["document_category"] in ["invoice", "receipt"]:
                state["current_node"] = "process_invoice"
            else:
                state["current_node"] = "end"
            
    except Exception as e:
        if db_session.in_transaction():
            db_session.rollback()
        print(f"Error in assign_single_client_node: {str(e)}")
        raise
    
    return state 