from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .user import Base # Import Base from user.py as it's defined there
# Forward reference for User model in relationships, actual import not needed at definition time for User
# from .user import User # Avoid direct import if User also imports ConnectionRequest, use string reference

class ConnectionRequest(Base):
    __tablename__ = "connection_requests"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    status = Column(String, default='pending', index=True, nullable=False) # e.g., 'pending', 'accepted', 'rejected'

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship to User model for requester
    requester = relationship(
        "User",
        foreign_keys=[requester_id],
        back_populates="sent_connection_requests"
    )

    # Relationship to User model for approver
    approver = relationship(
        "User",
        foreign_keys=[approver_id],
        back_populates="received_connection_requests"
    )

    def __repr__(self):
        return f"<ConnectionRequest(id={self.id}, requester_id={self.requester_id}, approver_id={self.approver_id}, status='{self.status}')>"
