"""Sector taxonomy model"""

import uuid
from sqlalchemy import Column, String, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base

# ── Pre-defined sector taxonomy for Pakistan govt procurement ──
SECTOR_TAXONOMY = [
    {"code": "CONST",  "name": "Construction & Civil Works",    "icon": "🏗️"},
    {"code": "IT",     "name": "IT & Digital Services",          "icon": "💻"},
    {"code": "MED",    "name": "Medical & Pharmaceuticals",      "icon": "🏥"},
    {"code": "INFRA",  "name": "Infrastructure & Utilities",     "icon": "⚡"},
    {"code": "CONS",   "name": "Government Consulting",          "icon": "📊"},
    {"code": "EDU",    "name": "Education & Training",           "icon": "📚"},
    {"code": "SEC",    "name": "Security & Defense",             "icon": "🛡️"},
    {"code": "TRANS",  "name": "Transport & Logistics",          "icon": "🚛"},
    {"code": "ENV",    "name": "Environment & Sanitation",       "icon": "🌿"},
    {"code": "AGRI",   "name": "Agriculture & Food",             "icon": "🌾"},
    {"code": "ENERGY", "name": "Energy & Renewables",            "icon": "☀️"},
    {"code": "TELE",   "name": "Telecommunications",             "icon": "📡"},
    {"code": "WATER",  "name": "Water & Sanitation",             "icon": "💧"},
    {"code": "PRINT",  "name": "Printing & Publishing",          "icon": "🖨️"},
    {"code": "SUPPLY", "name": "General Supplies & Stationery",  "icon": "📦"},
    {"code": "HR",     "name": "HR & Manpower Services",         "icon": "👥"},
    {"code": "LEGAL",  "name": "Legal & Audit Services",         "icon": "⚖️"},
    {"code": "OTHER",  "name": "Other / Miscellaneous",          "icon": "📋"},
]


class Sector(Base):
    __tablename__ = "sectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    icon = Column(String(10))
    tender_count = Column(Integer, default=0)   # denormalized counter

    # Relationships
    tenders = relationship("Tender", back_populates="sector")
    user_subscriptions = relationship("UserSectorSubscription", back_populates="sector")

    def __repr__(self):
        return f"<Sector {self.code}: {self.name}>"
