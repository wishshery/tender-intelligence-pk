"""Pydantic schemas for Tender endpoints"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class TenderDocumentOut(BaseModel):
    id: UUID
    doc_type: str
    filename: Optional[str]
    download_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TenderOut(BaseModel):
    id: UUID
    title: str
    issuing_authority: Optional[str]
    issuing_authority_type: Optional[str]
    reference_number: Optional[str]
    description: Optional[str]

    sector_name: Optional[str]
    industry_tags: Optional[List[str]]

    estimated_value_pkr: Optional[float]
    estimated_value_raw: Optional[str]
    currency: Optional[str]

    published_date: Optional[datetime]
    submission_deadline: Optional[datetime]
    opening_date: Optional[datetime]

    eligibility_criteria: Optional[str]
    required_documents: Optional[List[str]]

    ai_summary_short: Optional[str]
    ai_summary_detailed: Optional[str]
    sme_insights: Optional[str]
    opportunity_score: Optional[float]
    is_high_value: bool

    status: str
    ai_processed: bool
    docs_generated: bool
    source_url: Optional[str]

    documents: List[TenderDocumentOut] = []

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TenderListItem(BaseModel):
    """Lightweight version for list views."""
    id: UUID
    title: str
    issuing_authority: Optional[str]
    sector_name: Optional[str]
    estimated_value_pkr: Optional[float]
    submission_deadline: Optional[datetime]
    ai_summary_short: Optional[str]
    opportunity_score: Optional[float]
    is_high_value: bool
    status: str
    published_date: Optional[datetime]

    class Config:
        from_attributes = True


class TenderFilter(BaseModel):
    sector_code: Optional[str] = None
    keyword: Optional[str] = None
    status: Optional[str] = "active"
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    deadline_from: Optional[datetime] = None
    deadline_to: Optional[datetime] = None
    is_high_value: Optional[bool] = None


class PaginatedTenders(BaseModel):
    items: List[TenderListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
