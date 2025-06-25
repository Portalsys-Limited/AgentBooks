from .user import User, UserCreate, UserLogin, UserBase, UserInDB, Token, TokenData
from .practice import Practice, PracticeCreate, PracticeBase
from .customer import (
    Customer, CustomerCreate, CustomerBase, CustomerListItem, CustomerResponse,
    CustomerCreateRequest, CustomerUpdateRequest
)
from .client_company import ClientCompany, ClientCompanyCreate, ClientCompanyBase  # Legacy
from .business_client import (
    ClientListItem as BusinessClientListItem, ClientResponse as BusinessClientResponse, 
    ClientCreateRequest as BusinessClientCreateRequest, ClientUpdateRequest as BusinessClientUpdateRequest
)
from .customer_client_association import (
    CustomerClientAssociationCreate, CustomerClientAssociationUpdate,
    CustomerClientAssociationResponse, CustomerClientAssociationWithCustomer,
    CustomerClientAssociationWithClient, CustomerClientAssociationListItem
)
from .message import (
    Message, MessageCreate, MessageSend, MessageUpdate, MessageListItem, 
    MessageResponse, ConversationResponse
)
from .client import (
    ClientResponse, ClientCreateRequest, ClientUpdateRequest, ClientListItem,
    PersonalInfo, ContactInfo, Address, PersonalDetails, 
    GovernmentIdentifiers, FamilyInfo, EmergencyContact,
    EmploymentInfo, BankingInfo, DataProtection
)

__all__ = [
    # User schemas
    "User", "UserCreate", "UserLogin", "UserBase", "UserInDB", "Token", "TokenData",
    
    # Practice schemas  
    "Practice", "PracticeCreate", "PracticeBase",
    
    # Customer schemas
    "Customer", "CustomerCreate", "CustomerBase", "CustomerListItem", "CustomerResponse",
    "CustomerCreateRequest", "CustomerUpdateRequest",
    
    # Legacy Client Company schemas
    "ClientCompany", "ClientCompanyCreate", "ClientCompanyBase",
    
    # Business Client schemas
    "BusinessClientListItem", "BusinessClientResponse", 
    "BusinessClientCreateRequest", "BusinessClientUpdateRequest",
    
    # Customer-Client Association schemas
    "CustomerClientAssociationCreate", "CustomerClientAssociationUpdate",
    "CustomerClientAssociationResponse", "CustomerClientAssociationWithCustomer",
    "CustomerClientAssociationWithClient", "CustomerClientAssociationListItem",
    
    # Message schemas
    "Message", "MessageCreate", "MessageSend", "MessageUpdate", "MessageListItem",
    "MessageResponse", "ConversationResponse",
    
    # Client schemas (for individual customers - kept for backward compatibility)
    "ClientResponse", "ClientCreateRequest", "ClientUpdateRequest", "ClientListItem",
    "PersonalInfo", "ContactInfo", "Address", "PersonalDetails",
    "GovernmentIdentifiers", "FamilyInfo", "EmergencyContact", 
    "EmploymentInfo", "BankingInfo", "DataProtection"
] 