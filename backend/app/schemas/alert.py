"""Pydantic schemas for Alerts"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class AlertCreate(BaseModel):
    name: str
    keywords: List[str] = []
    sectors: List[str] = []
    min_value_pkr: Optional[str] = None
    max_value_pkr: Optional[str] = None
    email_notify: bool = True
    dashboard_notify: bool = True
    frequency: str = "instant"


class AlertUpdate(BaseModel):
    name: Optional[str] = None
    keywords: Optional[List[str]] = None
    sectors: Optional[List[str]] = None
    email_notify: Optional[bool] = None
    dashboard_notify: Optional[bool] = None
    frequency: Optional[str] = None
    is_active: Optional[bool] = None


class AlertOut(BaseModel):
    id: UUID
    name: str
    keywords: List[str]
    sectors: List[str]
    min_value_pkr: Optional[str]
    max_value_pkr: Optional[str]
    email_notify: bool
    dashboard_notify: bool
    frequency: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertMatchOut(BaseModel):
    id: UUID
    alert_id: UUID
    alert_name: str
    tender_id: UUID
    tender_title: str
    tender_sector: Optional[str]
    matched_keywords: List[str]
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SectorSubscriptionRequest(BaseModel):
    sector_codes: List[str]


class SectorOut(BaseModel):
    id: UUID
    code: str
    name: str
    icon: Optional[str]
    tender_count: int

    class Config:
        from_attributes = True
