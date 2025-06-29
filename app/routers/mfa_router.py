"""
Multi-Factor Authentication (MFA) Router
Provides endpoints for MFA device management and verification
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ..database import get_db
from ..auth.jwt_handler import get_current_user
from ..auth.mfa_service import MFAService
from ..models.user import User
from ..models.security import MFADevice


router = APIRouter(prefix="/mfa", tags=["Multi-Factor Authentication"])


# Pydantic Models
class MFADeviceCreate(BaseModel):
    device_type: str = Field(..., description="Device type: totp, sms, email")
    device_name: str = Field(..., description="Human-readable device name")
    phone_number: Optional[str] = Field(None, description="Phone number for SMS")


class MFADeviceResponse(BaseModel):
    id: int
    device_type: str
    device_name: str
    is_active: bool
    is_verified: bool
    use_count: int
    last_used: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class MFASetupResponse(BaseModel):
    device_id: int
    qr_code_url: Optional[str] = None
    secret_key: Optional[str] = None
    backup_codes: List[str] = []


class MFAVerifyRequest(BaseModel):
    device_id: int
    code: str


class MFAVerifyResponse(BaseModel):
    success: bool
    message: str
    backup_codes: Optional[List[str]] = None


class BackupCodeResponse(BaseModel):
    backup_codes: List[str]


class IPRestrictionCreate(BaseModel):
    ip_address: str = Field(..., description="IP address to allow")
    description: Optional[str] = Field(None, description="Description of the IP restriction")


class IPRestrictionResponse(BaseModel):
    id: int
    ip_address: str
    description: Optional[str]
    is_active: bool
    use_count: int
    last_used: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


# MFA Device Management Endpoints

@router.get("/devices", response_model=List[MFADeviceResponse])
async def get_mfa_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all MFA devices for the current user"""
    mfa_service = MFAService(db)
    devices = mfa_service.get_user_devices(current_user.id)
    return devices


@router.post("/devices", response_model=MFASetupResponse)
async def create_mfa_device(
    device_data: MFADeviceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new MFA device"""
    mfa_service = MFAService(db)
    
    try:
        if device_data.device_type == "totp":
            result = mfa_service.setup_totp_device(
                user_id=current_user.id,
                device_name=device_data.device_name
            )
            return MFASetupResponse(
                device_id=result["device_id"],
                qr_code_url=result["qr_code_url"],
                secret_key=result["secret_key"],
                backup_codes=result["backup_codes"]
            )
        elif device_data.device_type == "sms":
            if not device_data.phone_number:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number is required for SMS MFA"
                )
            result = mfa_service.setup_sms_device(
                user_id=current_user.id,
                device_name=device_data.device_name,
                phone_number=device_data.phone_number
            )
            return MFASetupResponse(
                device_id=result["device_id"],
                backup_codes=result["backup_codes"]
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported device type: {device_data.device_type}"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/devices/{device_id}/verify", response_model=MFAVerifyResponse)
async def verify_mfa_device(
    device_id: int,
    verify_data: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify and activate an MFA device"""
    mfa_service = MFAService(db)
    
    try:
        success = mfa_service.verify_device_setup(
            user_id=current_user.id,
            device_id=device_id,
            verification_code=verify_data.code
        )
        
        if success:
            return MFAVerifyResponse(
                success=True,
                message="MFA device verified and activated successfully"
            )
        else:
            return MFAVerifyResponse(
                success=False,
                message="Invalid verification code"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/verify", response_model=MFAVerifyResponse)
async def verify_mfa_code(
    verify_data: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify an MFA code during authentication"""
    mfa_service = MFAService(db)
    
    try:
        success = mfa_service.verify_mfa_code(
            user_id=current_user.id,
            device_id=verify_data.device_id,
            code=verify_data.code
        )
        
        if success:
            return MFAVerifyResponse(
                success=True,
                message="MFA verification successful"
            )
        else:
            return MFAVerifyResponse(
                success=False,
                message="Invalid MFA code"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/devices/{device_id}")
async def delete_mfa_device(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an MFA device"""
    mfa_service = MFAService(db)
    
    try:
        success = mfa_service.remove_device(current_user.id, device_id)
        if success:
            return {"message": "MFA device removed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="MFA device not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/backup-codes", response_model=BackupCodeResponse)
async def generate_backup_codes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate new backup codes for the user"""
    mfa_service = MFAService(db)
    
    try:
        backup_codes = mfa_service.generate_backup_codes(current_user.id)
        return BackupCodeResponse(backup_codes=backup_codes)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# IP Restriction Management Endpoints

@router.get("/ip-restrictions", response_model=List[IPRestrictionResponse])
async def get_ip_restrictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all IP restrictions for the current user"""
    mfa_service = MFAService(db)
    restrictions = mfa_service.get_user_ip_restrictions(current_user.id)
    return restrictions


@router.post("/ip-restrictions", response_model=IPRestrictionResponse)
async def create_ip_restriction(
    restriction_data: IPRestrictionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new IP restriction"""
    mfa_service = MFAService(db)
    
    try:
        restriction = mfa_service.add_ip_restriction(
            user_id=current_user.id,
            ip_address=restriction_data.ip_address,
            description=restriction_data.description
        )
        return restriction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/ip-restrictions/{restriction_id}")
async def delete_ip_restriction(
    restriction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an IP restriction"""
    mfa_service = MFAService(db)
    
    try:
        success = mfa_service.remove_ip_restriction(current_user.id, restriction_id)
        if success:
            return {"message": "IP restriction removed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="IP restriction not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/ip-restrictions/validate")
async def validate_ip_access(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate if current IP is allowed for the user"""
    mfa_service = MFAService(db)
    
    # Get client IP from request
    client_ip = request.client.host if request.client else "unknown"
    
    try:
        is_allowed = mfa_service.validate_ip_access(current_user.id, client_ip)
        return {
            "ip_address": client_ip,
            "is_allowed": is_allowed,
            "message": "IP access allowed" if is_allowed else "IP access denied"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating IP access: {str(e)}"
        )


# MFA Status and Configuration

@router.get("/status")
async def get_mfa_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get MFA status for the current user"""
    mfa_service = MFAService(db)
    
    devices = mfa_service.get_user_devices(current_user.id)
    active_devices = [d for d in devices if d.is_active and d.is_verified]
    ip_restrictions = mfa_service.get_user_ip_restrictions(current_user.id)
    active_restrictions = [r for r in ip_restrictions if r.is_active]
    
    return {
        "mfa_enabled": len(active_devices) > 0,
        "device_count": len(active_devices),
        "devices": [
            {
                "id": d.id,
                "type": d.device_type,
                "name": d.device_name,
                "last_used": d.last_used
            }
            for d in active_devices
        ],
        "ip_restrictions_enabled": len(active_restrictions) > 0,
        "ip_restriction_count": len(active_restrictions),
        "security_level": "high" if len(active_devices) > 0 and len(active_restrictions) > 0 
                        else "medium" if len(active_devices) > 0 or len(active_restrictions) > 0
                        else "basic"
    }


@router.post("/disable")
async def disable_mfa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable MFA for the current user (removes all devices)"""
    mfa_service = MFAService(db)
    
    try:
        devices = mfa_service.get_user_devices(current_user.id)
        removed_count = 0
        
        for device in devices:
            if mfa_service.remove_device(current_user.id, device.id):
                removed_count += 1
        
        return {
            "message": f"MFA disabled successfully. Removed {removed_count} devices.",
            "devices_removed": removed_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error disabling MFA: {str(e)}"
        )