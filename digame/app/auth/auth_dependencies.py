from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt # For token decoding, if used
from typing import Optional

from ..models.user import User as SQLAlchemyUser # Renamed to avoid Pydantic model clash
from ..schemas.user_schemas import User as PydanticUser # Assuming User schema for response
from ..crud import user_crud # Assuming user_crud exists for fetching user by username/id
from ..services.rbac_service import user_has_permission
from ..db import get_db # Import get_db from the shared db module

# --- Configuration ---
# In a real app, get these from config settings
SECRET_KEY = "your-secret-key" # Replace with a strong secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Define a specific permission required for RBAC admin tasks
MANAGE_RBAC_PERMISSION = "manage_rbac_permissions" # Or a more granular set of permissions

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token") # Assuming a /auth/token endpoint for login

# --- Placeholder User Database (for simulation if no real DB/CRUD) ---
# Replace with actual database interaction via user_crud
class MockDBUser: # To simulate SQLAlchemy User model with roles and permissions
    def __init__(self, id: int, username: str, email: str, roles: list, hashed_password: str = "fakepass", is_active: bool = True):
        self.id = id
        self.username = username
        self.email = email
        self.roles = roles # List of MockRole objects
        self.hashed_password = hashed_password
        self.is_active = is_active

class MockPermission:
    def __init__(self, name):
        self.name = name

class MockRole:
    def __init__(self, name, permissions_list=None):
        self.name = name
        self.permissions = permissions_list if permissions_list else []

perm_manage_rbac = MockPermission(name=MANAGE_RBAC_PERMISSION)
perm_view_data = MockPermission(name="view_data")

role_admin = MockRole(name="Administrator", permissions_list=[perm_manage_rbac, perm_view_data])
role_viewer = MockRole(name="Viewer", permissions_list=[perm_view_data])

# Simulated users
fake_users_db = {
    "admin@example.com": MockDBUser(id=1, username="admin", email="admin@example.com", roles=[role_admin]),
    "user@example.com": MockDBUser(id=2, username="user", email="user@example.com", roles=[role_viewer]),
    "inactive@example.com": MockDBUser(id=3, username="inactive", email="inactive@example.com", roles=[role_viewer], is_active=False),
}

# --- Simulated Token Decoding and User Fetching ---
async def fake_decode_token(token: str, db: Session) -> Optional[SQLAlchemyUser]:
    """
    Simulates token decoding. In a real app, this would verify the token,
    extract the user identifier (e.g., username or user_id), and fetch the user from the DB.
    """
    # This is a very basic simulation.
    # A real implementation would use jwt.decode() and handle exceptions.
    if token == "fake-admin-token":
        # Simulate fetching a SQLAlchemy user object from the database
        # user = user_crud.get_user_by_email(db, email="admin@example.com")
        # For this placeholder, we return a mock SQLAlchemy-like user object
        mock_sqla_user = SQLAlchemyUser(id=1, username="admin", email="admin@example.com", hashed_password="...", is_active=True)
        # Manually attach mock roles/permissions for the service layer to work
        mock_sqla_user.roles = [role_admin] 
        return mock_sqla_user
    elif token == "fake-user-token":
        # mock_sqla_user = user_crud.get_user_by_email(db, email="user@example.com")
        mock_sqla_user = SQLAlchemyUser(id=2, username="user", email="user@example.com", hashed_password="...", is_active=True)
        mock_sqla_user.roles = [role_viewer]
        return mock_sqla_user
    return None

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> SQLAlchemyUser:
    """
    Dependency to get the current user from a token.
    Placeholder implementation.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user = await fake_decode_token(token, db) # In real app, this would be a proper JWT decode
    if user is None:
        raise credentials_exception
    # If using real user_crud, user would be SQLAlchemyUser. Ensure it has roles loaded.
    # user = user_crud.get_user_by_username(db, username=user_identifier_from_token)
    # if user is None:
    #     raise credentials_exception
    return user # Should be an SQLAlchemy User model instance

async def get_current_active_user(current_user: SQLAlchemyUser = Depends(get_current_user)) -> SQLAlchemyUser:
    """
    Dependency to get the current active user.
    Checks if the user (obtained from get_current_user) is active.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def get_current_active_admin_user(current_user: SQLAlchemyUser = Depends(get_current_active_user)) -> SQLAlchemyUser:
    """
    Dependency to ensure the current user is active AND has the MANAGE_RBAC_PERMISSION.
    """
    # Use the rbac_service to check for permission
    # The current_user should be an SQLAlchemy User object with roles and permissions loaded
    if not user_has_permission(user=current_user, permission_name=MANAGE_RBAC_PERMISSION):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User does not have the required '{MANAGE_RBAC_PERMISSION}' permission.",
        )
    return current_user


# --- General Permission Checker Dependency ---
class PermissionChecker:
    """
    Dependency factory for checking if the current active user has a specific permission.
    Usage: Depends(PermissionChecker("permission_name_to_check"))
    """
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    async def __call__(self, current_user: SQLAlchemyUser = Depends(get_current_active_user)) -> SQLAlchemyUser:
        if not user_has_permission(user=current_user, permission_name=self.required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have the required '{self.required_permission}' permission."
            )
        return current_user

# Example of a permission-specific dependency if needed for more granularity
# def require_permission(permission_name: str):
#     async def permission_checker(current_user: SQLAlchemyUser = Depends(get_current_active_user)):
#         if not user_has_permission(user=current_user, permission_name=permission_name):
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=f"User does not have the required '{permission_name}' permission."
#             )
#         return current_user
#     return permission_checker
