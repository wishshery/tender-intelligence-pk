"""User model"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    company_name = Column(String(255))
    phone = Column(String(50))

    # Role: user | admin
    role = Column(Enum("user", "admin", name="user_role"), default="user", nullable=False)

    # Account state
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255))
    reset_token = Column(String(255))
    reset_token_expires = Column(DateTime)

    # Preferred currency for display
    preferred_currency = Column(Enum("PKR", "USD", "GBP", name="currency_code"), default="PKR")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)

    # Relationships
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    alerts = relationship("Alert", back_populates="user")
    sector_subscriptions = relationship("UserSectorSubscription", back_populates="user")
    alert_matches = relationship("AlertMatch", back_populates="user")

    def __repr__(self):
        return f"<User {self.email}>"
