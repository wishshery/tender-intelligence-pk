"""
Admin Router – dashboard analytics, manual ingestion trigger, user management.
Requires admin role.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import AlertMatch
from app.models.sector import Sector
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.tender import Tender
from app.models.user import User
from app.routers.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Overall platform statistics for the admin dashboard."""
    total_users = db.query(func.count(User.id)).scalar()
    paid_users = (
        db.query(func.count(Subscription.id))
        .join(SubscriptionPlan)
        .filter(SubscriptionPlan.name != "free")
        .scalar()
    )
    total_tenders = db.query(func.count(Tender.id)).scalar()
    active_tenders = db.query(func.count(Tender.id)).filter(Tender.status == "active").scalar()
    ai_processed = db.query(func.count(Tender.id)).filter(Tender.ai_processed == True).scalar()
    high_value = db.query(func.count(Tender.id)).filter(Tender.is_high_value == True).scalar()

    # New users last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_30d = (
        db.query(func.count(User.id)).filter(User.created_at >= thirty_days_ago).scalar()
    )

    # Tenders ingested last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    new_tenders_7d = (
        db.query(func.count(Tender.id)).filter(Tender.ingested_at >= seven_days_ago).scalar()
    )

    # Unread alert matches
    pending_notifications = db.query(func.count(AlertMatch.id)).filter(
        AlertMatch.email_sent == False
    ).scalar()

    # Subscription plan breakdown
    plan_breakdown = (
        db.query(SubscriptionPlan.name, func.count(Subscription.id))
        .join(Subscription)
        .group_by(SubscriptionPlan.name)
        .all()
    )

    # Sector distribution
    sector_distribution = (
        db.query(Sector.name, func.count(Tender.id))
        .join(Tender, Tender.sector_id == Sector.id)
        .group_by(Sector.name)
        .order_by(func.count(Tender.id).desc())
        .limit(10)
        .all()
    )

    return {
        "users": {
            "total": total_users,
            "paid": paid_users,
            "free": total_users - paid_users,
            "new_last_30_days": new_users_30d,
        },
        "tenders": {
            "total": total_tenders,
            "active": active_tenders,
            "ai_processed": ai_processed,
            "high_value": high_value,
            "new_last_7_days": new_tenders_7d,
        },
        "notifications": {
            "pending_emails": pending_notifications,
        },
        "plan_breakdown": {name: count for name, count in plan_breakdown},
        "sector_distribution": [{"name": n, "count": c} for n, c in sector_distribution],
    }


@router.get("/users")
async def list_users(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total = db.query(func.count(User.id)).scalar()
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "total": total,
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "company_name": u.company_name,
                "role": u.role,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at,
                "last_login": u.last_login,
            }
            for u in users
        ],
    }


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}


@router.post("/ingest/trigger")
async def trigger_ingestion(_: User = Depends(require_admin)):
    """Manually trigger the CKAN ingestion pipeline."""
    from app.workers.ingestion import run_ingestion_pipeline
    run_ingestion_pipeline.delay()
    return {"message": "Ingestion job queued"}


@router.post("/ai/reprocess/{tender_id}")
async def reprocess_tender(
    tender_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Re-run AI analysis on a specific tender."""
    from app.workers.ai_processing import process_single_tender
    process_single_tender.delay(tender_id)
    return {"message": "AI reprocessing job queued"}


@router.get("/tenders/unprocessed")
async def unprocessed_tenders(
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenders = (
        db.query(Tender)
        .filter(Tender.ai_processed == False)
        .order_by(Tender.created_at.desc())
        .limit(limit)
        .all()
    )
    return [{"id": str(t.id), "title": t.title, "created_at": t.created_at} for t in tenders]
