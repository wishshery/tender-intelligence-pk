"""
Celery task: AI processing queue.
Picks up unanalysed tenders and runs them through Claude.
"""

import asyncio
import logging

from celery import shared_task
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.sector import Sector
from app.models.tender import Tender
from app.services.ai_service import analyse_tender

logger = logging.getLogger(__name__)

BATCH_SIZE = 10  # process N tenders per run to stay within rate limits


@shared_task(name="app.workers.ai_processing.process_pending_tenders")
def process_pending_tenders():
    """Process up to BATCH_SIZE unanalysed tenders."""
    db: Session = SessionLocal()
    try:
        unprocessed = (
            db.query(Tender)
            .filter(Tender.ai_processed == False)
            .order_by(Tender.created_at.asc())
            .limit(BATCH_SIZE)
            .all()
        )
        logger.info(f"AI processing {len(unprocessed)} tenders...")

        for tender in unprocessed:
            try:
                _process_tender(db, tender)
            except Exception as e:
                logger.error(f"Failed to AI-process tender {tender.id}: {e}")
                continue

        db.commit()
        logger.info("AI batch processing complete.")
        return {"processed": len(unprocessed)}
    finally:
        db.close()


@shared_task(name="app.workers.ai_processing.process_single_tender")
def process_single_tender(tender_id: str):
    """Force AI reprocessing of a single tender (admin action)."""
    db: Session = SessionLocal()
    try:
        tender = db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            logger.warning(f"Tender {tender_id} not found for reprocessing")
            return
        _process_tender(db, tender)
        db.commit()
    finally:
        db.close()


def _process_tender(db: Session, tender: Tender):
    """Run AI analysis and update the tender record."""
    tender_dict = {
        "title": tender.title,
        "issuing_authority": tender.issuing_authority,
        "description": tender.description,
        "eligibility_criteria": tender.eligibility_criteria,
        "reference_number": tender.reference_number,
        "published_date": str(tender.published_date) if tender.published_date else "",
        "submission_deadline": str(tender.submission_deadline) if tender.submission_deadline else "",
    }

    result = asyncio.run(analyse_tender(tender_dict))

    # Apply AI results
    tender.ai_summary_short = result.get("ai_summary_short", "")
    tender.ai_summary_detailed = result.get("ai_summary_detailed", "")
    tender.sme_insights = result.get("sme_insights", "")
    tender.eligibility_criteria = result.get("eligibility_criteria") or tender.eligibility_criteria
    tender.opportunity_score = result.get("opportunity_score", 50.0)
    tender.is_high_value = result.get("is_high_value", False)
    tender.industry_tags = result.get("industry_tags", [])
    tender.issuing_authority_type = result.get("issuing_authority_type", "federal")
    tender.ai_processed = True

    # Resolve sector
    sector_code = result.get("sector_code", "OTHER")
    sector = db.query(Sector).filter(Sector.code == sector_code).first()
    if sector:
        tender.sector_id = sector.id
        tender.sector_name = sector.name
        # Update sector tender count
        sector.tender_count = (sector.tender_count or 0) + 1
