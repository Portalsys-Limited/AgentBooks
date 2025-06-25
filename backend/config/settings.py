from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"  # Allow extra fields to be ignored
    )
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/agentbooks"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Twilio
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    # Note: WhatsApp numbers are now stored per-practice in the database
    
    # Companies House API
    companies_house_api_key: Optional[str] = None

settings = Settings() 