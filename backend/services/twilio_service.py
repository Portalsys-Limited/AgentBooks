from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        
        if not all([self.account_sid, self.auth_token]):
            raise ValueError("Missing required Twilio configuration. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
        
        self.client = Client(self.account_sid, self.auth_token)
    
    async def send_whatsapp_message(self, to_phone: str, message_body: str, from_whatsapp_number: str, media_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Send a WhatsApp message using Twilio
        
        Args:
            to_phone: Phone number in E.164 format (e.g., +1234567890)
            message_body: The message text
            from_whatsapp_number: The practice's WhatsApp number (e.g., whatsapp:+14155238886)
            media_url: Optional media URL for images/documents
            
        Returns:
            Dict containing message SID and status, or error information
        """
        try:
            # Ensure phone number is in WhatsApp format
            if not to_phone.startswith("whatsapp:"):
                to_phone = f"whatsapp:{to_phone}"
            
            # Ensure from number is in WhatsApp format
            if not from_whatsapp_number.startswith("whatsapp:"):
                from_whatsapp_number = f"whatsapp:{from_whatsapp_number}"
            
            message_params = {
                "body": message_body,
                "from_": from_whatsapp_number,
                "to": to_phone
            }
            
            # Add media if provided
            if media_url:
                message_params["media_url"] = [media_url]
            
            message = self.client.messages.create(**message_params)
            
            return {
                "success": True,
                "sid": message.sid,
                "status": message.status,
                "error_code": message.error_code,
                "error_message": message.error_message,
                "from_": str(message.from_),
                "to": str(message.to)
            }
            
        except TwilioException as e:
            return {
                "success": False,
                "error": str(e),
                "error_code": getattr(e, 'code', None),
                "error_message": getattr(e, 'msg', str(e))
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    async def get_message_status(self, message_sid: str) -> Dict[str, Any]:
        """
        Get the status of a sent message
        
        Args:
            message_sid: Twilio message SID
            
        Returns:
            Dict containing message status and details
        """
        try:
            message = self.client.messages(message_sid).fetch()
            
            return {
                "success": True,
                "sid": message.sid,
                "status": message.status,
                "error_code": message.error_code,
                "error_message": message.error_message,
                "date_created": message.date_created,
                "date_updated": message.date_updated,
                "date_sent": message.date_sent,
                "from_": str(message.from_),
                "to": str(message.to),
                "body": message.body,
                "price": message.price,
                "price_unit": message.price_unit
            }
            
        except TwilioException as e:
            return {
                "success": False,
                "error": str(e),
                "error_code": getattr(e, 'code', None)
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    async def validate_phone_number(self, phone_number: str) -> bool:
        """
        Validate if a phone number is valid for WhatsApp
        
        Args:
            phone_number: Phone number to validate
            
        Returns:
            Boolean indicating if the number is valid
        """
        try:
            # Basic validation - should start with + and contain only digits
            if not phone_number.startswith('+'):
                return False
            
            # Remove + and check if remaining characters are digits
            number_digits = phone_number[1:]
            if not number_digits.isdigit():
                return False
            
            # Should be between 7 and 15 digits (international standard)
            if len(number_digits) < 7 or len(number_digits) > 15:
                return False
            
            return True
            
        except Exception:
            return False

# Singleton instance
twilio_service = TwilioService() 