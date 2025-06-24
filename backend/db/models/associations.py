from sqlalchemy import Column, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

# Association table for many-to-many relationship between users and clients
user_client_association = Table(
    'user_client_assignments',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('customer_id', UUID(as_uuid=True), ForeignKey('customers.id'), primary_key=True)
) 