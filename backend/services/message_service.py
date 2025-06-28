from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import joinedload, selectinload
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
import os
import aiohttp
import mimetypes
from pathlib import Path

from db.models.message import Message, MessageType, MessageDirection, MessageStatus
from db.models.individuals import Individual
from db.models.practice import Practice
from db.models.documents import Document, DocumentType, DocumentSource, DocumentAgentState
from db.schemas.message import MessageCreate, MessageUpdate, MessageSend
from services.twilio_service import twilio_service
from workers.tasks.whatsapp_processor import process_whatsapp_message_task


class MessageService:
    
    @staticmethod
    async def create_message(db: AsyncSession, message_data: MessageCreate) -> Message:
        """Create a new message in the database"""
        db_message = Message(**message_data.model_dump())
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)
        return db_message
    
    @staticmethod
    async def get_message_by_id(db: AsyncSession, message_id: UUID) -> Optional[Message]:
        """Get a message by its ID"""
        result = await db.execute(
            select(Message).where(Message.id == message_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_messages_for_individual(
        db: AsyncSession,
        individual_id: UUID,
        practice_id: UUID,
        message_type: Optional[MessageType] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Message]:
        """Get messages for a specific individual"""
        query = select(Message).where(
            and_(
                Message.individual_id == individual_id,
                Message.practice_id == practice_id
            )
        )
        
        if message_type:
            query = query.where(Message.message_type == message_type)
        
        query = query.order_by(desc(Message.created_at)).offset(offset).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_conversation_with_individual(
        db: AsyncSession,
        individual_id: UUID,
        practice_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get conversation history with an individual"""
        # Get individual info
        individual_result = await db.execute(
            select(Individual).where(Individual.id == individual_id)
        )
        individual = individual_result.scalar_one_or_none()
        
        if not individual:
            return {"individual": None, "messages": [], "total_count": 0}
        
        # Get messages
        messages = await MessageService.get_messages_for_individual(
            db, individual_id, practice_id, limit=limit, offset=offset
        )
        
        # Get total count
        count_result = await db.execute(
            select(Message).where(
                and_(
                    Message.individual_id == individual_id,
                    Message.practice_id == practice_id
                )
            )
        )
        total_count = len(count_result.scalars().all())
        
        return {
            "individual": individual,
            "messages": messages,
            "total_count": total_count
        }
    
    @staticmethod
    async def send_whatsapp_message(
        db: AsyncSession,
        message_data: MessageSend,
        practice_id: UUID,
        user_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Send a WhatsApp message and save to database"""
        try:
            # Get individual details
            individual_result = await db.execute(
                select(Individual).where(Individual.id == message_data.individual_id)
            )
            individual = individual_result.scalar_one_or_none()
            
            if not individual:
                return {"success": False, "error": "Individual not found"}
            
            if not individual.primary_mobile:
                return {"success": False, "error": "Individual has no phone number"}
            
            # Validate phone number
            if not await twilio_service.validate_phone_number(individual.primary_mobile):
                return {"success": False, "error": "Invalid phone number format"}
            
            # Get practice's whatsapp_number
            practice_result = await db.execute(
                select(Practice).where(Practice.id == practice_id)
            )
            practice = practice_result.scalar_one_or_none()
            
            if not practice or not practice.whatsapp_number:
                return {"success": False, "error": "Practice has no whatsapp_number"}
            
            # Send message via Twilio
            twilio_response = await twilio_service.send_whatsapp_message(
                individual.primary_mobile,
                message_data.body,
                practice.whatsapp_number
            )
            
            # Create message record in database
            message_create = MessageCreate(
                message_type=MessageType.whatsapp,
                direction=MessageDirection.outgoing,
                body=message_data.body,
                individual_id=message_data.individual_id,
                practice_id=practice_id,
                user_id=user_id,
                from_address=practice.whatsapp_number,
                to_address=f"whatsapp:{individual.primary_mobile}"
            )
            
            db_message = await MessageService.create_message(db, message_create)
            
            # Update message with Twilio response
            if twilio_response["success"]:
                db_message.twilio_sid = twilio_response["sid"]
                db_message.status = MessageStatus.sent
                db_message.message_metadata = {
                    "twilio_status": twilio_response["status"],
                    "sent_at": datetime.utcnow().isoformat()
                }
            else:
                db_message.status = MessageStatus.failed
                db_message.error_message = twilio_response.get("error", "Unknown error")
                db_message.message_metadata = {
                    "error_code": twilio_response.get("error_code"),
                    "error_message": twilio_response.get("error_message")
                }
            
            await db.commit()
            await db.refresh(db_message)
            
            return {
                "success": twilio_response["success"],
                "message": db_message,
                "twilio_response": twilio_response
            }
            
        except Exception as e:
            await db.rollback()
            return {"success": False, "error": f"Unexpected error: {str(e)}"}
    
    @staticmethod
    async def update_message_status(
        db: AsyncSession,
        message_id: UUID,
        status_update: MessageUpdate
    ) -> Optional[Message]:
        """Update message status (typically called by webhooks)"""
        message = await MessageService.get_message_by_id(db, message_id)
        if not message:
            return None
        
        if status_update.status:
            message.status = status_update.status
        
        if status_update.error_message:
            message.error_message = status_update.error_message
        
        if status_update.metadata:
            if message.message_metadata:
                message.message_metadata.update(status_update.metadata)
            else:
                message.message_metadata = status_update.metadata
        
        message.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(message)
        return message
    
    @staticmethod
    async def process_twilio_webhook(
        db: AsyncSession,
        message_sid: str,
        message_status: str,
        from_phone: str,
        to_phone: str,
        body: str,
        media_items: List[Dict[str, Any]],
        webhook_data: Dict[str, Any],
        received_at: str
    ) -> Dict[str, Any]:
        """Process incoming Twilio webhook for both messages and status updates."""
        try:
            print("🔄 Starting webhook processing in message service")
            
            # Determine if this is an incoming message or status update
            is_incoming_message = bool(body or media_items)
            print(f"📋 Webhook type: {'incoming message' if is_incoming_message else 'status update'}")
            
            if is_incoming_message:
                # Find practice by WhatsApp number
                clean_to_phone = to_phone.replace("whatsapp:", "")
                print(f"🔍 Looking for practice with WhatsApp number: {clean_to_phone}")
                
                practice_result = await db.execute(
                    select(Practice).where(Practice.whatsapp_number == clean_to_phone)
                )
                practice = practice_result.scalar_one_or_none()
                
                if not practice:
                    print(f"❌ No practice found with WhatsApp number {clean_to_phone}")
                    return {
                        "status": "error",
                        "message": f"No practice found with WhatsApp number {clean_to_phone}"
                    }
                
                print(f"✅ Found practice: {practice.name} (ID: {practice.id})")
                
                # Process incoming message
                print("🚀 Processing incoming message...")
                result = await MessageService.process_incoming_message(
                    db=db,
                    from_phone=from_phone,
                    to_phone=to_phone,
                    body=body,
                    twilio_sid=message_sid,
                    practice_id=practice.id,
                    media_items=media_items,
                    metadata={
                        "webhook_data": webhook_data,
                        "received_at": received_at,
                        "media_count": len(media_items)
                    }
                )
                
                print("✅ Message processing result:", result)
                return result
                
            else:
                print("🔄 Processing status update...")
                # Process status update
                status_mapping = {
                    "sent": MessageStatus.sent,
                    "delivered": MessageStatus.delivered,
                    "read": MessageStatus.read,
                    "failed": MessageStatus.failed,
                    "undelivered": MessageStatus.failed
                }
                
                new_status = status_mapping.get(message_status.lower())
                if not new_status:
                    print(f"⚠️ Ignoring unknown status: {message_status}")
                    return {"status": "success", "message": "Status update ignored"}
                    
                print(f"🔍 Looking for message with Twilio SID: {message_sid}")
                # Find message by Twilio SID
                message = await db.execute(
                    select(Message).where(Message.twilio_sid == message_sid)
                )
                message = message.scalar_one_or_none()
                
                if not message:
                    print(f"❌ No message found with Twilio SID: {message_sid}")
                    return {"status": "error", "message": "Message not found"}
                
                print(f"✅ Found message (ID: {message.id})")
                print(f"📝 Updating status to: {new_status}")
                
                # Update message status
                status_update = MessageUpdate(
                    status=new_status,
                    metadata={
                        "status_update": {
                            "twilio_status": message_status,
                            "updated_at": received_at,
                            "webhook_data": webhook_data
                        }
                    }
                )
                
                await MessageService.update_message_status(
                    db=db,
                    message_id=message.id,
                    status_update=status_update
                )
                
                print("✅ Status updated successfully")
                return {"status": "success", "message": "Status updated"}
                
        except Exception as e:
            print(f"❌ Error in process_twilio_webhook: {str(e)}")
            import traceback
            print(f"❌ Full traceback:\n{traceback.format_exc()}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def process_incoming_message(
        db: AsyncSession,
        from_phone: str,
        to_phone: str,
        body: str,
        twilio_sid: str,
        practice_id: UUID,
        media_items: Optional[List[Dict[str, Any]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process an incoming WhatsApp message including any media attachments."""
        try:
            print("🔄 Starting incoming message processing")
            
            # Clean phone number and find individual
            clean_phone = from_phone.replace("whatsapp:", "")
            print(f"🔍 Looking for individual with phone number: {clean_phone}")
            
            individual_result = await db.execute(
                select(Individual).where(Individual.primary_mobile == clean_phone)
            )
            individual = individual_result.scalar_one_or_none()
            
            if not individual:
                print(f"❌ No individual found with phone number {clean_phone}")
                return {
                    "success": False,
                    "error": f"No individual found with phone number {clean_phone}"
                }
            
            print(f"✅ Found individual: {individual.full_name} (ID: {individual.id})")
            
            # Create message record
            print("📝 Creating message record...")
            message = Message(
                message_type=MessageType.whatsapp,
                direction=MessageDirection.incoming,
                status=MessageStatus.delivered,
                body=body,
                individual_id=individual.id,
                practice_id=practice_id,
                from_address=from_phone,
                to_address=to_phone,
                twilio_sid=twilio_sid,
                message_metadata=metadata or {}
            )
            
            print("💾 Saving message to database...")
            db.add(message)
            await db.commit()
            await db.refresh(message)
            print(f"✅ Message saved with ID: {message.id}")
            
            # Process any media attachments
            if media_items:
                print(f"📎 Processing {len(media_items)} media attachments...")
                await MessageService._save_whatsapp_media_attachments(
                    db=db,
                    media_items=media_items,
                    message_id=message.id,
                    individual=individual,
                    practice_id=practice_id,
                    twilio_sid=twilio_sid
                )
                print("✅ Media attachments processed")
            
            # Trigger Celery task for processing
            try:
                print("🤖 Triggering agent processing task...")
                task_result = process_whatsapp_message_task.delay(
                    message_id=str(message.id),
                    individual_id=str(individual.id),
                    practice_id=str(practice_id)
                )
                
                print(f"✅ Agent task triggered (Task ID: {task_result.task_id})")
                
                # Update message metadata with task info
                message.message_metadata = {
                    **message.message_metadata,
                    "celery_task_id": task_result.task_id,
                    "task_triggered_at": datetime.utcnow().isoformat()
                }
                await db.commit()
                
                return {
                    "status": "success",
                    "message": "Message processed and agent task triggered",
                    "message_id": str(message.id),
                    "task_id": task_result.task_id
                }
                
            except Exception as e:
                print(f"⚠️ Agent task trigger failed: {str(e)}")
                # Don't fail if agent processing fails
                return {
                    "status": "partial_success",
                    "message": "Message saved but agent processing failed",
                    "message_id": str(message.id),
                    "error": str(e)
                }
            
        except Exception as e:
            print(f"❌ Error in process_incoming_message: {str(e)}")
            import traceback
            print(f"❌ Full traceback:\n{traceback.format_exc()}")
            await db.rollback()
            return {"success": False, "error": f"Error processing message: {str(e)}"}

    @staticmethod
    async def _save_whatsapp_media_attachments(
        db: AsyncSession,
        media_items: List[Dict[str, Any]],
        message_id: UUID,
        individual: Individual,
        practice_id: UUID,
        twilio_sid: str
    ) -> None:
        """Save WhatsApp media attachments as documents."""
        try:
            # Create directory structure
            base_dir = Path("documents")
            practice_dir = base_dir / str(practice_id)
            individual_dir = practice_dir / str(individual.id)
            now = datetime.now()
            date_dir = individual_dir / str(now.year) / f"{now.month:02d}"
            date_dir.mkdir(parents=True, exist_ok=True)
            
            # Get Twilio credentials
            twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            
            if not twilio_account_sid or not twilio_auth_token:
                raise Exception("Twilio credentials not found")
            
            auth = aiohttp.BasicAuth(twilio_account_sid, twilio_auth_token)
            
            async with aiohttp.ClientSession() as session:
                for media_item in media_items:
                    try:
                        media_url = media_item["url"]
                        content_type = media_item["content_type"]
                        media_index = media_item["index"]
                        
                        async with session.get(media_url, auth=auth) as response:
                            if response.status != 200:
                                continue
                            
                            # Generate filename
                            extension = mimetypes.guess_extension(content_type) or ".bin"
                            timestamp = now.strftime("%Y%m%d_%H%M%S")
                            filename = f"whatsapp_{timestamp}_{twilio_sid}_{media_index}{extension}"
                            file_path = date_dir / filename
                            
                            # Save file
                            with open(file_path, 'wb') as f:
                                async for chunk in response.content.iter_chunked(8192):
                                    f.write(chunk)
                            
                            # Create document record
                            document = Document(
                                filename=filename,
                                original_filename=f"WhatsApp_Media_{media_index}{extension}",
                                document_url=str(file_path),
                                file_size=str(os.path.getsize(file_path)),
                                mime_type=content_type,
                                document_type=MessageService._get_document_type_from_mime(content_type),
                                document_source=DocumentSource.whatsapp,
                                document_category="whatsapp_attachment",
                                title=f"WhatsApp Document from {individual.full_name}",
                                description=f"Document received via WhatsApp from {individual.full_name}",
                                tags=["whatsapp", "incoming", "attachment"],
                                practice_id=practice_id,
                                individual_id=individual.id,
                                message_id=message_id,
                                agent_state=DocumentAgentState.pending,
                                upload_source_details={
                                    "source": "whatsapp",
                                    "twilio_sid": twilio_sid,
                                    "media_url": media_url,
                                    "media_index": media_index,
                                    "received_at": now.isoformat()
                                }
                            )
                            
                            db.add(document)
                            
                    except Exception as e:
                        print(f"Error saving media item {media_index}: {str(e)}")
                        continue
                
                await db.commit()
                
        except Exception as e:
            print(f"Error saving media attachments: {str(e)}")
            raise

    @staticmethod
    def _get_document_type_from_mime(mime_type: str) -> DocumentType:
        """Map MIME type to DocumentType enum."""
        mime_type = mime_type.lower()
        
        if mime_type.startswith("image/"):
            return DocumentType.image
        elif mime_type == "application/pdf":
            return DocumentType.pdf
        elif mime_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            return DocumentType.word_doc
        elif mime_type in ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
            return DocumentType.excel
        elif mime_type in ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]:
            return DocumentType.powerpoint
        elif mime_type.startswith("text/"):
            return DocumentType.text
        elif mime_type == "text/csv":
            return DocumentType.csv
        else:
            return DocumentType.other

# Service instance
message_service = MessageService() 