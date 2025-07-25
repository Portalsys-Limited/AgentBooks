from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv
import json

load_dotenv()

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_whatsapp_number = os.getenv("FROM_WHATSAPP_NUMBER")

        
        if not all([self.account_sid, self.auth_token]):
            raise ValueError("Missing required Twilio configuration. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
        
        self.client = Client(self.account_sid, self.auth_token)
    
    async def send_whatsapp_message(
        self, 
        to_phone: str, 
        from_whatsapp_number: str, 
        message_body: Optional[str] = None, 
        media_url: Optional[str] = None, 
        interactive_content: Optional[Dict[str, Any]] = None,
        content_sid: Optional[str] = None,
        content_variables: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Send a WhatsApp message using Twilio.
        Can send a simple text message, a complex interactive one, or a templated message.
        
        Args:
            to_phone: Phone number in E.164 format (e.g., +1234567890)
            from_whatsapp_number: The practice's WhatsApp number (e.g., whatsapp:+14155238886)
            message_body: The message text. Used as a fallback or for simple text messages.
            media_url: Optional media URL for images/documents.
            interactive_content: A dictionary representing the full interactive message payload.
            content_sid: The SID of the template to use.
            content_variables: A dictionary of variables to populate the template.
            
        Returns:
            Dict containing message SID and status, or error information
        """
        try:
            if not any([message_body, interactive_content, media_url, content_sid]):
                raise ValueError("At least one message content parameter must be provided.")

            # Ensure phone number is in WhatsApp format
            if not to_phone.startswith("whatsapp:"):
                to_phone = f"whatsapp:{to_phone}"
            
            # Ensure from number is in WhatsApp format
            if not from_whatsapp_number.startswith("whatsapp:"):
                from_whatsapp_number = f"whatsapp:{from_whatsapp_number}"
            
            message_params = {
                "from_": from_whatsapp_number,
                "to": to_phone
            }

            if content_sid:
                message_params["content_sid"] = content_sid
                if content_variables:
                    message_params["content_variables"] = json.dumps(content_variables)
            elif interactive_content:
                # The 'Content' parameter (with a capital C) is used for freeform interactive messages.
                message_params["Content"] = json.dumps(interactive_content)
                if message_body:
                    # For some channels, a body is still required as a fallback.
                    message_params["body"] = message_body
            elif message_body:
                message_params["body"] = message_body
            
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
    
    async def get_sandbox_qr_code(self) -> Dict[str, Any]:
        """
        Get the QR code for Twilio WhatsApp Sandbox (for testing only).
        
        Note: This is only for development/testing with Twilio's sandbox environment.
        Production WhatsApp Business accounts don't use sandbox QR codes.
        
        Returns:
            Dict containing QR code image URL or error information
        """
        try:
            import requests
            
            # Twilio Sandbox QR code endpoint
            sandbox_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Sandbox/WhatsApp/QrCode.json"
            
            response = requests.get(
                sandbox_url,
                auth=(self.account_sid, self.auth_token),
                headers={
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "qr_image_url": data.get("qr_code_url"),
                    "sandbox_number": data.get("whatsapp_number"),
                    "instructions": "Scan this QR code with WhatsApp to connect to the sandbox for testing"
                }
            elif response.status_code == 404:
                return {
                    "success": False,
                    "error": "QR code endpoint not found. This might not be available for your Twilio account type.",
                    "status_code": response.status_code,
                    "suggestion": "Check if you have WhatsApp sandbox enabled in your Twilio console"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to fetch QR code: {response.text}",
                    "status_code": response.status_code
                }
                
        except ImportError:
            return {
                "success": False,
                "error": "requests library not available. Please install with: pip install requests"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error fetching QR code: {str(e)}"
            }
    
    async def get_sandbox_participants(self) -> Dict[str, Any]:
        """
        Get list of phone numbers that are authorized to use the WhatsApp sandbox.
        
        Returns:
            Dict containing list of authorized participants or error information
        """
        try:
            import requests
            
            # Twilio Sandbox participants endpoint
            participants_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Sandbox/WhatsApp/Participants.json"
            
            response = requests.get(
                participants_url,
                auth=(self.account_sid, self.auth_token),
                headers={
                    'Accept': 'application/json'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "participants": data.get("participants", []),
                    "total_count": len(data.get("participants", []))
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to fetch participants: {response.text}",
                    "status_code": response.status_code
                }
                
        except ImportError:
            return {
                "success": False,
                "error": "requests library not available. Please install with: pip install requests"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error fetching participants: {str(e)}"
            }

# Singleton instance
twilio_service = TwilioService() 