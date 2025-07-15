from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base  # Import Base from user.py

class UserSetting(Base):
    __table_args__ = {'extend_existing': True}
    __tablename__ = 'user_settings'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, index=True)
    api_keys = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # user = relationship("app.models.user.User", back_populates="settings")
