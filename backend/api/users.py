from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import uuid

from config.database import get_db
from db.schemas import User, TokenData
from db.models import User as UserModel, UserRole
from services.auth_service import verify_token
from services.user_service import get_user_by_id

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token."""
    token_data = verify_token(token)
    user = get_user_by_id(db, token_data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user

@router.get("/me/token-data")
async def get_token_data(token: str = Depends(oauth2_scheme)):
    """Get decoded token data for debugging/frontend use."""
    token_data = verify_token(token)
    return {
        "user_id": str(token_data.user_id),
        "email": token_data.email,
        "role": token_data.role.value if token_data.role else None,
        "practice_id": str(token_data.practice_id) if token_data.practice_id else None,
        "client_ids": [str(cid) for cid in token_data.client_ids]
    }

@router.get("/practice/{practice_id}")
async def get_users_by_practice(
    practice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users for a specific practice (Practice Owner only)."""
    
    # Parse UUID
    try:
        practice_uuid = uuid.UUID(practice_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid practice ID format"
        )
    
    # Check permissions - only practice owners can view all users
    if (current_user.role != UserRole.practice_owner or 
        current_user.practice_id != practice_uuid):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this practice's users"
        )
    
    # Get users for the practice
    users = db.query(UserModel).filter(UserModel.practice_id == practice_uuid).all()
    
    # Format response
    response = []
    for user in users:
        # Get client IDs for this user
        client_ids = [str(client.id) for client in user.assigned_clients]
        
        response.append({
            "id": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "practice_id": str(user.practice_id) if user.practice_id else None,
            "client_ids": client_ids,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        })
    
    return response

@router.post("/")
async def create_user(
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new user (Practice Owner only)."""
    
    # Check permissions
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create users"
        )
    
    # Check if email already exists
    existing_user = db.query(UserModel).filter(UserModel.email == user_data["email"]).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user with default password (should be changed on first login)
    from services.auth_service import hash_password
    
    user = UserModel(
        email=user_data["email"],
        password_hash=hash_password("admin"),  # Default password
        role=UserRole(user_data["role"]),
        practice_id=current_user.practice_id
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "practice_id": str(user.practice_id),
        "created_at": user.created_at.isoformat()
    }

@router.put("/{user_id}")
async def update_user(
    user_id: str,
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a user (Practice Owner only)."""
    
    # Check permissions
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update users"
        )
    
    # Parse UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Get user
    user = db.query(UserModel).filter(
        UserModel.id == user_uuid,
        UserModel.practice_id == current_user.practice_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user
    if "role" in user_data:
        user.role = UserRole(user_data["role"])
    
    if "email" in user_data:
        # Check if new email is already taken
        existing_user = db.query(UserModel).filter(
            UserModel.email == user_data["email"],
            UserModel.id != user_uuid
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        user.email = user_data["email"]
    
    db.commit()
    db.refresh(user)
    
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "practice_id": str(user.practice_id),
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a user (Practice Owner only)."""
    
    # Check permissions
    if current_user.role != UserRole.practice_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete users"
        )
    
    # Parse UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Prevent self-deletion
    if user_uuid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Get user
    user = db.query(UserModel).filter(
        UserModel.id == user_uuid,
        UserModel.practice_id == current_user.practice_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete user
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"} 