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
    
    # Redis & Celery
    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: Optional[str] = None
    
    @property
    def redis_url(self) -> str:
        """Build Redis URL from components."""
        if self.redis_password:
            return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}"
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    # Celery settings
    celery_broker_url: Optional[str] = None
    celery_result_backend: Optional[str] = None
    
    @property
    def broker_url(self) -> str:
        """Get Celery broker URL."""
        return self.celery_broker_url or self.redis_url
    
    @property
    def result_backend_url(self) -> str:
        """Get Celery result backend URL."""
        return self.celery_result_backend or self.redis_url

settings = Settings() 