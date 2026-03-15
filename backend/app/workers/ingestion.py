"""
Celery task: Daily CKAN ingestion pipeline.
Fetches new tenders from data.gov.pk, deduplicates, and inserts into the database.
"""

import asyncio
import logging

from celery import shared_task
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.sector import Sector
from app.models.tender import Tender
from app.services.ckan_service import fetch_all_procurement_tenders

logger = logging.getLogger(__name__)


@shared_task(name="app.workers.ingestion.run_ingestion_pipeline", bind=True, max_retries=3)
def run_ingestion_pipeline(self):
    """
    Main ingestion task.
    1. Fetch all procurement tenders from CKAN
    2. Insert new ones, skip already-ingested ones
    3. Trigger AI processing for new tenders
    """
    logger.info("Starting CKAN ingestion pipeline...")
    db: Session = SessionLocal()

    try:
        # Run async code inside the sync Celery task
        tenders_data = asyncio.run(fetch_all_procurement_tenders(max_pages=5))
        logger.info(f"Fetched {len(tenders_data)} tenders from CKAN")

        new_count = 0
        for tender_dict in tenders_data:
            ckan_id = tender_dict.get("ckan_id")
            if not ckan_id:
                continue

            existing = db.query(Tender).filter(Tender.ckan_id == ckan_id).first()
            if existing:
                continue  # already in DB

            # Resolve sector from issuing authority / title heuristics
            tender_dict["sector_id"] = None  # will be set by AI processing

            tender = Tender(**{
                k: v for k, v in tender_dict.items()
                if hasattr(Tender, k)
            })
            db.add(tender)
            new_count += 1

        db.commit()
        logger.info(f"Ingestion complete. {new_count} new tenders added.")

        # Queue AI processing for the new batch
        from app.workers.ai_processing import process_pending_tenders
        process_pending_tenders.delay()

        return {"new_tenders": new_count, "total_fetched": len(tenders_data)}

    except Exception as exc:
        logger.error(f"Ingestion failed: {exc}")
        db.rollback()
        raise self.retry(exc=exc, countdown=60 * 5)
    finally:
        db.close()
