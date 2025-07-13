"""
Test to validate that all fixtures work correctly
"""
import pytest
from app.models.user import User
from app.models.rbac import Role, UserRole


def test_admin_user_fixture(test_admin_user, db_session):
    """Test that admin user fixture works correctly"""
    assert test_admin_user is not None
    assert test_admin_user.username == "admin"
    assert test_admin_user.email == "admin@example.com"
    assert test_admin_user.id == 100
    
    # Check that admin role was created and assigned
    admin_role = db_session.query(Role).filter(Role.name == "admin").first()
    assert admin_role is not None
    
    user_role = db_session.query(UserRole).filter(
        UserRole.user_id == test_admin_user.id,
        UserRole.role_id == admin_role.id
    ).first()
    assert user_role is not None
    assert user_role.is_active == True


def test_non_admin_user_fixture(test_non_admin_user, db_session):
    """Test that non-admin user fixture works correctly"""
    assert test_non_admin_user is not None
    assert test_non_admin_user.username == "regularuser"
    assert test_non_admin_user.email == "regular@example.com"
    assert test_non_admin_user.id == 101
    
    # Check that user role was created and assigned
    user_role_obj = db_session.query(Role).filter(Role.name == "user").first()
    assert user_role_obj is not None
    
    user_role_assignment = db_session.query(UserRole).filter(
        UserRole.user_id == test_non_admin_user.id,
        UserRole.role_id == user_role_obj.id
    ).first()
    assert user_role_assignment is not None
    assert user_role_assignment.is_active == True


def test_client_fixture(client):
    """Test that client fixture works correctly"""
    assert client is not None
    # Test a simple endpoint
    response = client.get("/")
    # Should get some response (even if it's 404, it means the client works)
    assert response is not None


def test_basic_user_fixtures(test_user, test_user_2, db_session):
    """Test that basic user fixtures work correctly"""
    assert test_user is not None
    assert test_user.username == "testuser"
    assert test_user.id == 1
    
    assert test_user_2 is not None
    assert test_user_2.username == "testuser2"
    assert test_user_2.id == 2
    
    # Verify both users exist in database
    users = db_session.query(User).all()
    user_ids = [u.id for u in users]
    assert 1 in user_ids
    assert 2 in user_ids