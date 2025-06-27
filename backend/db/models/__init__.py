# Import all models from the new modular structure for backward compatibility
from .base import Base
from .user import User, UserRole
from .practice import Practice
from .customer import Customer, Gender, MaritalStatus
from .client import Client, BusinessType
from .companies_house_profile import CompaniesHouseProfile
from .customer_client_association import CustomerClientAssociation, RelationshipType
from .service import Service
from .client_service import ClientService
from .message import Message, MessageType, MessageDirection, MessageStatus
from .documents import Document, DocumentType, DocumentSource, DocumentAgentState
from .associations import user_client_association

# Re-export everything for backward compatibility
__all__ = [
    'Base',
    'User',
    'UserRole',
    'Practice', 
    'Customer',
    'Gender',
    'MaritalStatus',
    'Client',
    'BusinessType',
    'CompaniesHouseProfile',
    'CustomerClientAssociation',
    'RelationshipType',
    'Service',
    'ClientService',
    'Message',
    'MessageType',
    'MessageDirection',
    'MessageStatus',
    'Document',
    'DocumentType',
    'DocumentSource',
    'DocumentAgentState',
    'user_client_association'
] 