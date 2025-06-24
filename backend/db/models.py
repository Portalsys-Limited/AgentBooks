# Import all models from the new modular structure for backward compatibility
from .models.base import Base
from .models.user import User, UserRole
from .models.practice import Practice
from .models.customer import Customer, Gender, MaritalStatus
from .models.client_company import ClientCompany, BusinessType
from .models.associations import user_client_association

# Re-export everything for backward compatibility
__all__ = [
    'Base',
    'User',
    'UserRole',
    'Practice', 
    'Customer',
    'Gender',
    'MaritalStatus',
    'ClientCompany',
    'BusinessType',
    'user_client_association'
] 