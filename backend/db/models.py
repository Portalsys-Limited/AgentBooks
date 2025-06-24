from sqlalchemy import Column, String, ForeignKey, Table, Enum as SQLEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum
import uuid

# Enum for user roles
class UserRole(str, enum.Enum):
    practice_owner = "practice_owner"
    accountant = "accountant"
    bookkeeper = "bookkeeper"
    payroll = "payroll"
    client = "client"

# Association table for many-to-many relationship between users and clients
user_client_association = Table(
    'user_client_assignments',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('customer_id', UUID(as_uuid=True), ForeignKey('customers.id'), primary_key=True)
)

class Practice(Base):
    __tablename__ = "practices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="practice")
    customers = relationship("Customer", back_populates="practice")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="customers")
    client_companies = relationship("ClientCompany", back_populates="customer")
    assigned_users = relationship("User", secondary=user_client_association, back_populates="assigned_clients")

class ClientCompany(Base):
    __tablename__ = "client_companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="client_companies")

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    practice_id = Column(UUID(as_uuid=True), ForeignKey("practices.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    practice = relationship("Practice", back_populates="users")
    assigned_clients = relationship("Customer", secondary=user_client_association, back_populates="assigned_users") 