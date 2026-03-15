"""Tender and TenderDocument models"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Source identifiers (CKAN)
    ckan_id = Column(String(255), unique=True, index=True)
    ckan_package_id = Column(String(255), index=True)
    source_url = Column(Text)

    # Core tender info
    title = Column(Text, nullable=False)
    issuing_authority = Column(String(500))
    issuing_authority_type = Column(String(100))    # federal | provincial | local
    reference_number = Column(String(255))
    description = Column(Text)

    # Sector / category
    sector_id = Column(UUID(as_uuid=True), ForeignKey("sectors.id"), nullable=True)
    sector_name = Column(String(255))               # denormalized for speed
    industry_tags = Column(JSON, default=list)      # e.g. ["IT", "Cloud", "Software"]

    # Financial
    estimated_value_pkr = Column(Float)             # normalised to PKR
    estimated_value_raw = Column(String(255))       # original string
    currency = Column(String(10), default="PKR")

    # Dates
    published_date = Column(DateTime)
    submission_deadline = Column(DateTime, index=True)
    opening_date = Column(DateTime)

    # Eligibility
    eligibility_criteria = Column(Text)
    required_documents = Column(JSON, default=list)
    minimum_experience_years = Column(Integer)

    # AI-generated content
    ai_summary_short = Column(Text)                 # ≤ 150 words
    ai_summary_detailed = Column(Text)              # full analysis
    sme_insights = Column(Text)
    opportunity_score = Column(Float)               # 0-100
    is_high_value = Column(Boolean, default=False)

    # Status
    status = Column(
        Enum("active", "closed", "awarded", "cancelled", name="tender_status"),
        default="active",
        index=True,
    )
    ai_processed = Column(Boolean, default=False)
    docs_generated = Column(Boolean, default=False)

    # Raw CKAN metadata
    raw_ckan_data = Column(JSON)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ingested_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sector = relationship("Sector", back_populates="tenders")
    documents = relationship("TenderDocument", back_populates="tender")

    def __repr__(self):
        return f"<Tender {self.title[:60]}>"


class TenderDocument(Base):
    __tablename__ = "tender_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tender_id = Column(UUID(as_uuid=True), ForeignKey("tenders.id"), nullable=False)

    doc_type = Column(
        Enum("word", "pdf", "original", name="doc_type"),
        nullable=False,
    )
    filename = Column(String(500))
    file_path = Column(String(1000))         # local path or S3 key
    download_url = Column(Text)              # public URL if hosted

    created_at = Column(DateTime, default=datetime.utcnow)

    tender = relationship("Tender", back_populates="documents")
