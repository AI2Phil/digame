"""
Authentication System Examples for Digame Platform

This module provides comprehensive examples of how to use the authentication system,
including user registration, login, token management, and protected endpoint access.
"""

import asyncio
import httpx
import json
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DigameAuthClient:
    """
    Example client for interacting with the Digame authentication system
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.user_info: Optional[Dict[str, Any]] = None
    
    async def register_user(
        self, 
        username: str, 
        email: str, 
        password: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Register a new user
        
        Args:
            username: Unique username
            email: Valid email address
            password: Strong password
            first_name: Optional first name
            last_name: Optional last name
            
        Returns:
            Registration response with user info and tokens
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/register",
                json={
                    "username": username,
                    "email": email,
                    "password": password,
                    "first_name": first_name,
                    "last_name": last_name
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                self.access_token = data["tokens"]["access_token"]
                self.refresh_token = data["tokens"]["refresh_token"]
                self.user_info = data["user"]
                logger.info(f"✅ User registered successfully: {email}")
                return data
            else:
                logger.error(f"❌ Registration failed: {response.text}")
                response.raise_for_status()
    
    async def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        Login with username/email and password
        
        Args:
            username: Username or email
            password: User password
            
        Returns:
            Login response with user info and tokens
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/login",
                data={
                    "username": username,
                    "password": password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data["tokens"]["access_token"]
                self.refresh_token = data["tokens"]["refresh_token"]
                self.user_info = data["user"]
                logger.info(f"✅ Login successful: {username}")
                return data
            else:
                logger.error(f"❌ Login failed: {response.text}")
                response.raise_for_status()
    
    async def refresh_access_token(self) -> Dict[str, Any]:
        """
        Refresh the access token using refresh token
        
        Returns:
            New token pair
        """
        if not self.refresh_token:
            raise ValueError("No refresh token available")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/refresh",
                json={"refresh_token": self.refresh_token}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data["access_token"]
                self.refresh_token = data["refresh_token"]
                logger.info("✅ Token refreshed successfully")
                return data
            else:
                logger.error(f"❌ Token refresh failed: {response.text}")
                response.raise_for_status()
    
    async def get_current_user(self) -> Dict[str, Any]:
        """
        Get current user information
        
        Returns:
            Current user data
        """
        if not self.access_token:
            raise ValueError("No access token available")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/auth/me",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.user_info = data
                logger.info("✅ User info retrieved successfully")
                return data
            else:
                logger.error(f"❌ Failed to get user info: {response.text}")
                response.raise_for_status()
    
    async def change_password(self, current_password: str, new_password: str) -> Dict[str, Any]:
        """
        Change user password
        
        Args:
            current_password: Current password
            new_password: New password
            
        Returns:
            Success response
        """
        if not self.access_token:
            raise ValueError("No access token available")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/password-change",
                json={
                    "current_password": current_password,
                    "new_password": new_password
                },
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Password changed successfully")
                return data
            else:
                logger.error(f"❌ Password change failed: {response.text}")
                response.raise_for_status()
    
    async def request_password_reset(self, email: str) -> Dict[str, Any]:
        """
        Request password reset
        
        Args:
            email: Email address
            
        Returns:
            Reset response with token (for demo purposes)
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/password-reset/request",
                json={"email": email}
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Password reset requested for: {email}")
                return data
            else:
                logger.error(f"❌ Password reset request failed: {response.text}")
                response.raise_for_status()
    
    async def confirm_password_reset(self, token: str, new_password: str) -> Dict[str, Any]:
        """
        Confirm password reset with token
        
        Args:
            token: Reset token
            new_password: New password
            
        Returns:
            Success response
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/password-reset/confirm",
                json={
                    "token": token,
                    "new_password": new_password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Password reset confirmed successfully")
                return data
            else:
                logger.error(f"❌ Password reset confirmation failed: {response.text}")
                response.raise_for_status()
    
    async def logout(self) -> Dict[str, Any]:
        """
        Logout user by blacklisting tokens
        
        Returns:
            Success response
        """
        if not self.access_token or not self.refresh_token:
            raise ValueError("No tokens available")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/logout",
                data={"refresh_token": self.refresh_token},
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            
            if response.status_code == 204:
                self.access_token = None
                self.refresh_token = None
                self.user_info = None
                logger.info("✅ Logout successful")
                return {"message": "Logged out successfully"}
            else:
                logger.error(f"❌ Logout failed: {response.text}")
                response.raise_for_status()
    
    async def access_protected_endpoint(self, endpoint: str) -> Dict[str, Any]:
        """
        Access a protected endpoint with authentication
        
        Args:
            endpoint: API endpoint to access
            
        Returns:
            Endpoint response
        """
        if not self.access_token:
            raise ValueError("No access token available")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}{endpoint}",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Successfully accessed: {endpoint}")
                return data
            else:
                logger.error(f"❌ Failed to access {endpoint}: {response.text}")
                response.raise_for_status()

# Example usage functions
async def example_user_registration_and_login():
    """Example: User registration and login flow"""
    print("\n🔐 Example: User Registration and Login")
    print("=" * 50)
    
    client = DigameAuthClient()
    
    try:
        # Register a new user
        print("1. Registering new user...")
        registration_data = await client.register_user(
            username="johndoe",
            email="john@example.com",
            password="SecurePassword123!",
            first_name="John",
            last_name="Doe"
        )
        print(f"   User ID: {registration_data['user']['id']}")
        print(f"   Username: {registration_data['user']['username']}")
        print(f"   Email: {registration_data['user']['email']}")
        
        # Get current user info
        print("\n2. Getting current user info...")
        user_info = await client.get_current_user()
        print(f"   Full name: {user_info.get('first_name', '')} {user_info.get('last_name', '')}")
        print(f"   Active: {user_info.get('is_active', False)}")
        
        # Logout
        print("\n3. Logging out...")
        await client.logout()
        
        # Login again
        print("\n4. Logging in again...")
        login_data = await client.login("johndoe", "SecurePassword123!")
        print(f"   Welcome back: {login_data['user']['username']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

async def example_password_management():
    """Example: Password change and reset flow"""
    print("\n🔑 Example: Password Management")
    print("=" * 50)
    
    client = DigameAuthClient()
    
    try:
        # Login first
        print("1. Logging in...")
        await client.login("johndoe", "SecurePassword123!")
        
        # Change password
        print("\n2. Changing password...")
        await client.change_password("SecurePassword123!", "NewSecurePassword456!")
        print("   Password changed successfully")
        
        # Logout
        print("\n3. Logging out...")
        await client.logout()
        
        # Test login with new password
        print("\n4. Testing login with new password...")
        await client.login("johndoe", "NewSecurePassword456!")
        print("   Login with new password successful")
        
        # Request password reset
        print("\n5. Requesting password reset...")
        reset_data = await client.request_password_reset("john@example.com")
        reset_token = reset_data.get("reset_token")  # In production, this would be sent via email
        
        if reset_token:
            print("\n6. Confirming password reset...")
            await client.confirm_password_reset(reset_token, "ResetPassword789!")
            print("   Password reset successful")
            
            # Test login with reset password
            print("\n7. Testing login with reset password...")
            await client.login("johndoe", "ResetPassword789!")
            print("   Login with reset password successful")
        
    except Exception as e:
        print(f"❌ Error: {e}")

async def example_token_refresh():
    """Example: Token refresh flow"""
    print("\n🔄 Example: Token Refresh")
    print("=" * 50)
    
    client = DigameAuthClient()
    
    try:
        # Login
        print("1. Logging in...")
        await client.login("johndoe", "ResetPassword789!")
        
        original_token = client.access_token
        print(f"   Original token (first 20 chars): {original_token[:20]}...")
        
        # Refresh token
        print("\n2. Refreshing access token...")
        await client.refresh_access_token()
        
        new_token = client.access_token
        print(f"   New token (first 20 chars): {new_token[:20]}...")
        print(f"   Tokens are different: {original_token != new_token}")
        
        # Test access with new token
        print("\n3. Testing access with new token...")
        user_info = await client.get_current_user()
        print(f"   Access successful for user: {user_info['username']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

async def example_protected_endpoints():
    """Example: Accessing protected endpoints"""
    print("\n🛡️  Example: Protected Endpoints")
    print("=" * 50)
    
    client = DigameAuthClient()
    
    try:
        # Login
        print("1. Logging in...")
        await client.login("johndoe", "ResetPassword789!")
        
        # Access various protected endpoints
        endpoints = [
            "/auth/verify-token",
            "/health",
            "/info"
        ]
        
        for endpoint in endpoints:
            print(f"\n2. Accessing {endpoint}...")
            try:
                data = await client.access_protected_endpoint(endpoint)
                print(f"   Response: {json.dumps(data, indent=2)[:100]}...")
            except Exception as e:
                print(f"   Failed: {e}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

async def example_error_handling():
    """Example: Error handling scenarios"""
    print("\n⚠️  Example: Error Handling")
    print("=" * 50)
    
    client = DigameAuthClient()
    
    # Test invalid login
    print("1. Testing invalid login...")
    try:
        await client.login("invalid_user", "wrong_password")
    except httpx.HTTPStatusError as e:
        print(f"   Expected error: {e.response.status_code} - Invalid credentials")
    
    # Test accessing protected endpoint without token
    print("\n2. Testing protected endpoint without token...")
    try:
        await client.access_protected_endpoint("/auth/me")
    except ValueError as e:
        print(f"   Expected error: {e}")
    
    # Test duplicate registration
    print("\n3. Testing duplicate registration...")
    try:
        await client.register_user(
            username="johndoe",  # Already exists
            email="john@example.com",
            password="AnotherPassword123!"
        )
    except httpx.HTTPStatusError as e:
        print(f"   Expected error: {e.response.status_code} - User already exists")

async def run_all_examples():
    """Run all authentication examples"""
    print("🚀 Digame Authentication System Examples")
    print("=" * 60)
    
    examples = [
        example_user_registration_and_login,
        example_password_management,
        example_token_refresh,
        example_protected_endpoints,
        example_error_handling
    ]
    
    for example in examples:
        try:
            await example()
        except Exception as e:
            print(f"❌ Example failed: {e}")
        
        print("\n" + "-" * 60)
    
    print("\n✅ All examples completed!")

# CLI runner
if __name__ == "__main__":
    print("Starting Digame Authentication Examples...")
    print("Make sure the Digame API is running on http://localhost:8000")
    print()
    
    try:
        asyncio.run(run_all_examples())
    except KeyboardInterrupt:
        print("\n👋 Examples interrupted by user")
    except Exception as e:
        print(f"\n❌ Examples failed: {e}")