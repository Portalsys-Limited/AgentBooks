# Import all models from the new modular structure for backward compatibility
from .base import Base
from .user import User, UserRole
from .practice import Practice
from .customer import Customer, MLRStatus, CustomerStatus
from .client import Client, BusinessType, ClientMLRStatus, AccountingSoftware, BillingFrequency, PaymentMethod, EngagementLetterStatus, BookkeepingFormat, PayrollFrequency, PayrollType
from .companies_house_profile import CompaniesHouseProfile
from .customer_client_association import CustomerClientAssociation, RelationshipType
from .service import Service
from .client_service import ClientService
from .message import Message, MessageType, MessageDirection, MessageStatus, MessageSender
from .documents import Document, DocumentType, DocumentSource, DocumentAgentState
from .individuals import Individual, Gender, MaritalStatus
from .income import Income, IncomeType
from .property import Property, PropertyType, PropertyStatus
from .individual_relationship import IndividualRelationship, IndividualRelationType

# Re-export everything for backward compatibility
__all__ = [
    'Base',
    'User',
    'UserRole',
    'Practice', 
    'Customer',
    'MLRStatus',
    'CustomerStatus',
    'Client',
    'BusinessType',
    'ClientMLRStatus',
    'AccountingSoftware',
    'BillingFrequency',
    'PaymentMethod',
    'EngagementLetterStatus',
    'BookkeepingFormat',
    'PayrollFrequency',
    'PayrollType',
    'CompaniesHouseProfile',
    'CustomerClientAssociation',
    'RelationshipType',
    'Service',
    'ClientService',
    'Message',
    'MessageType',
    'MessageDirection',
    'MessageStatus',
    'MessageSender',
    'Document',
    'DocumentType',
    'DocumentSource',
    'DocumentAgentState',
    'Individual',
    'Gender',
    'MaritalStatus',
    'Income',
    'IncomeType',
    'Property',
    'PropertyType',
    'PropertyStatus',
    'IndividualRelationship',
    'IndividualRelationType'
] 