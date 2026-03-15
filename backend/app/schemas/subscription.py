"""Pydantic schemas for Subscription and Payment endpoints"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class PlanOut(BaseModel):
    id: UUID
    name: str
    display_name: str
    price_pkr: int
    price_usd: float
    price_gbp: float
    monthly_tender_limit: int
    ai_summaries: bool
    word_pdf_export: bool
    sector_alerts: bool
    weekly_report: bool
    multi_user: bool
    api_access: bool
    features_list: List[str]

    class Config:
        from_attributes = True


class SubscriptionOut(BaseModel):
    id: UUID
    plan_name: str
    status: str
    currency: str
    billing_interval: str
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    tenders_viewed_this_month: int
    payment_gateway: Optional[str]

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    plan: str          # "pro" | "enterprise"
    currency: str      # "PKR" | "USD" | "GBP"
    billing_interval: str = "monthly"  # "monthly" | "annual"
    gateway: str = "stripe"            # "stripe" | "easypaisa"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    checkout_url: Optional[str] = None     # Stripe hosted page
    session_id: Optional[str] = None       # Stripe session ID
    easypaisa_payload: Optional[dict] = None
    gateway: str


class CancelSubscriptionRequest(BaseModel):
    at_period_end: bool = True
