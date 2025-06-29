from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from .base import Base

# Enum for user roles
class UserRole(str, enum.Enum):
    practice_owner = "practice_owner"
    accountant = "accountant"
    bookkeeper = "bookkeeper"
    payroll = "payroll"
    client = "client"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), nullable=False)
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="users")
    uploaded_documents = relationship("Document", foreign_keys="Document.uploaded_by_user_id", back_populates="uploaded_by")
    validated_documents = relationship("Document", foreign_keys="Document.validated_by_user_id", back_populates="validated_by")
    archived_documents = relationship("Document", foreign_keys="Document.archived_by_user_id", back_populates="archived_by")
    messages = relationship("Message", back_populates="user")
    
    @property
    def full_name(self):
        """Return the full name of the user"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email 