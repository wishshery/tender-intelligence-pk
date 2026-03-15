"""Subscription and SubscriptionPlan models"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class SubscriptionPlan(Base):
    """Static plan definitions (seeded at startup)."""

    __tablename__ = "subscription_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(
        Enum("free", "pro", "enterprise", name="plan_name"),
        unique=True,
        nullable=False,
    )
    display_name = Column(String(100))

    # Monthly prices in each currency
    price_pkr = Column(Integer, default=0)
    price_usd = Column(Float, default=0.0)
    price_gbp = Column(Float, default=0.0)

    # Feature limits
    monthly_tender_limit = Column(Integer, default=10)  # -1 = unlimited
    ai_summaries = Column(Boolean, default=False)
    word_pdf_export = Column(Boolean, default=False)
    sector_alerts = Column(Boolean, default=False)
    weekly_report = Column(Boolean, default=False)
    multi_user = Column(Boolean, default=False)
    api_access = Column(Boolean, default=False)
    custom_alerts = Column(Boolean, default=False)

    # Stripe Price IDs (populated from env)
    stripe_price_id_pkr = Column(String(255))
    stripe_price_id_usd = Column(String(255))
    stripe_price_id_gbp = Column(String(255))

    features_list = Column(JSON, default=list)  # human-readable bullet points

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base):
    """Active user subscription record."""

    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=False)

    # Billing
    status = Column(
        Enum("active", "trialing", "past_due", "cancelled", "unpaid", name="sub_status"),
        default="active",
    )
    currency = Column(Enum("PKR", "USD", "GBP", name="sub_currency"), default="PKR")
    billing_interval = Column(Enum("monthly", "annual", name="billing_interval"), default="monthly")
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)

    # Payment gateway references
    payment_gateway = Column(Enum("stripe", "easypaisa", name="gateway"), nullable=True)
    stripe_customer_id = Column(String(255))
    stripe_subscription_id = Column(String(255))
    easypaisa_order_id = Column(String(255))

    # Usage (for free tier throttling)
    tenders_viewed_this_month = Column(Integer, default=0)
    usage_reset_date = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
