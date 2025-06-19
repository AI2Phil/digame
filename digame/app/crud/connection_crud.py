from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional

from digame.app.models.connection import ConnectionRequest
from digame.app.models.user import User # Assuming User model is in digame.app.models.user

def create_connection_request(db: Session, requester_id: int, approver_id: int) -> ConnectionRequest:
    """
    Creates a new connection request.
    """
    # Check if a pending or accepted request already exists between these users
    existing_request = db.query(ConnectionRequest).filter(
        or_(
            and_(ConnectionRequest.requester_id == requester_id, ConnectionRequest.approver_id == approver_id),
            and_(ConnectionRequest.requester_id == approver_id, ConnectionRequest.approver_id == requester_id)
        )
    ).filter(
        or_(
            ConnectionRequest.status == 'pending',
            ConnectionRequest.status == 'accepted'
        )
    ).first()

    if existing_request:
        # Depending on requirements, either raise an error or return the existing one
        # For now, let's prevent creating a duplicate if one is pending or already accepted
        raise ValueError(f"A pending or accepted connection request already exists between user {requester_id} and user {approver_id}.")

    if requester_id == approver_id:
        raise ValueError("Cannot create a connection request with oneself.")

    db_connection_request = ConnectionRequest(
        requester_id=requester_id,
        approver_id=approver_id,
        status='pending' # Default status
    )
    db.add(db_connection_request)
    db.commit()
    db.refresh(db_connection_request)
    return db_connection_request

def get_connection_request_by_id(db: Session, request_id: int) -> Optional[ConnectionRequest]:
    """
    Retrieves a connection request by its ID.
    """
    return db.query(ConnectionRequest).filter(ConnectionRequest.id == request_id).first()

def get_pending_connection_requests_for_user(db: Session, user_id: int) -> List[ConnectionRequest]:
    """
    Retrieves all pending connection requests for a given user (where user is the approver).
    """
    return db.query(ConnectionRequest).filter(
        ConnectionRequest.approver_id == user_id,
        ConnectionRequest.status == 'pending'
    ).all()

def update_connection_request_status(db: Session, request_id: int, new_status: str) -> Optional[ConnectionRequest]:
    """
    Updates the status of a connection request (e.g., to 'accepted' or 'rejected').
    Validates if the new_status is one of the allowed values.
    """
    allowed_statuses = ['accepted', 'rejected', 'pending'] # Define allowed statuses
    if new_status not in allowed_statuses:
        raise ValueError(f"Invalid status: '{new_status}'. Allowed statuses are: {', '.join(allowed_statuses)}")

    db_connection_request = get_connection_request_by_id(db, request_id)
    if db_connection_request:
        # Additional logic: cannot change status if already accepted or rejected, unless to 'pending' for some reason (e.g. admin override)
        # For now, we allow updating from any state to any valid state.
        db_connection_request.status = new_status
        db.commit()
        db.refresh(db_connection_request)
    return db_connection_request

def get_connections_for_user(db: Session, user_id: int) -> List[User]:
    """
    Retrieves a list of users who are connected to the given user
    (i.e., where a connection request was accepted).
    """
    # Find accepted connection requests where the user is either the requester or the approver
    accepted_requests = db.query(ConnectionRequest).filter(
        ConnectionRequest.status == 'accepted',
        or_(
            ConnectionRequest.requester_id == user_id,
            ConnectionRequest.approver_id == user_id
        )
    ).all()

    connected_user_ids = set()
    for req in accepted_requests:
        if req.requester_id == user_id:
            connected_user_ids.add(req.approver_id)
        else:
            connected_user_ids.add(req.requester_id)

    if not connected_user_ids:
        return []

    # Fetch the User objects for these IDs
    connected_users = db.query(User).filter(User.id.in_(list(connected_user_ids))).all()
    return connected_users
