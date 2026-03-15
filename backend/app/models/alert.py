"""Alert, AlertMatch, and UserSectorSubscription models"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, String, Text, JSON, Enum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class UserSectorSubscription(Base):
    """User subscribed to a sector for alerts."""

    __tablename__ = "user_sector_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sector_id = Column(UUID(as_uuid=True), ForeignKey("sectors.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sector_subscriptions")
    sector = relationship("Sector", back_populates="user_subscriptions")


class Alert(Base):
    """
    Keyword-based alert rule created by a user.
    When a new tender matches, an AlertMatch is created and an email sent.
    """

    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    name = Column(String(255), nullable=False)
    keywords = Column(JSON, default=list)          # list of keyword strings
    sectors = Column(JSON, default=list)           # list of sector codes
    min_value_pkr = Column(String(50))             # optional minimum value filter
    max_value_pkr = Column(String(50))             # optional maximum value filter

    # Notification preferences
    email_notify = Column(Boolean, default=True)
    dashboard_notify = Column(Boolean, default=True)
    frequency = Column(
        Enum("instant", "daily", "weekly", name="alert_frequency"),
        default="instant",
    )

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="alerts")
    matches = relationship("AlertMatch", back_populates="alert")


class AlertMatch(Base):
    """
    Records that a specific tender matched a user's alert rule.
    Drives the notification queue.
    """

    __tablename__ = "alert_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"), nullable=False)
    tender_id = Column(UUID(as_uuid=True), ForeignKey("tenders.id"), nullable=False)

    matched_keywords = Column(JSON, default=list)
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alert_matches")
    alert = relationship("Alert", back_populates="matches")
    tender = relationship("Tender")
