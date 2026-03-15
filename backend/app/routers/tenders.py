"""
Tenders Router – browse, search, filter, and download tender documents.
"""

import math
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tender import Tender, TenderDocument
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.user import User
from app.routers.auth import get_current_user, require_verified
from app.schemas.tender import PaginatedTenders, TenderListItem, TenderOut
from app.services.document_service import generate_pdf_document, generate_word_document

router = APIRouter(prefix="/tenders", tags=["Tenders"])


def _check_tender_access(user: User, db: Session):
    """Enforce free-tier throttling."""
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub:
        return
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == sub.plan_id).first()
    if plan and plan.name != "free":
        return  # paid plans have no limit
    limit = plan.monthly_tender_limit if plan else 10
    if sub.tenders_viewed_this_month >= limit:
        raise HTTPException(
            status_code=402,
            detail=f"Monthly tender limit ({limit}) reached. Upgrade to Pro for unlimited access.",
        )


@router.get("", response_model=PaginatedTenders)
async def list_tenders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sector_code: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    status: Optional[str] = Query("active"),
    min_value: Optional[float] = Query(None),
    max_value: Optional[float] = Query(None),
    is_high_value: Optional[bool] = Query(None),
    sort_by: str = Query("published_date"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Tender)

    if status:
        query = query.filter(Tender.status == status)
    if sector_code:
        query = query.filter(Tender.sector_name.ilike(f"%{sector_code}%"))
    if keyword:
        search = f"%{keyword}%"
        query = query.filter(
            or_(
                Tender.title.ilike(search),
                Tender.description.ilike(search),
                Tender.issuing_authority.ilike(search),
                Tender.ai_summary_short.ilike(search),
            )
        )
    if min_value is not None:
        query = query.filter(Tender.estimated_value_pkr >= min_value)
    if max_value is not None:
        query = query.filter(Tender.estimated_value_pkr <= max_value)
    if is_high_value is not None:
        query = query.filter(Tender.is_high_value == is_high_value)

    total = query.count()

    sort_col = getattr(Tender, sort_by, Tender.published_date)
    if order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedTenders(
        items=[TenderListItem.from_orm(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size),
    )


@router.get("/recent", response_model=list)
async def recent_tenders(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tenders = (
        db.query(Tender)
        .filter(Tender.status == "active")
        .order_by(Tender.published_date.desc())
        .limit(limit)
        .all()
    )
    return [TenderListItem.from_orm(t) for t in tenders]


@router.get("/high-value", response_model=list)
async def high_value_tenders(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tenders = (
        db.query(Tender)
        .filter(Tender.is_high_value == True, Tender.status == "active")
        .order_by(Tender.opportunity_score.desc())
        .limit(limit)
        .all()
    )
    return [TenderListItem.from_orm(t) for t in tenders]


@router.get("/{tender_id}", response_model=TenderOut)
async def get_tender(
    tender_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    # Throttle free users
    _check_tender_access(user, db)

    # Increment usage counter
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if sub:
        sub.tenders_viewed_this_month = (sub.tenders_viewed_this_month or 0) + 1
        db.commit()

    return TenderOut.from_orm(tender)


@router.get("/{tender_id}/download/word")
async def download_word(
    tender_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    """Generate and return a Word document for the tender."""
    sub = db.query(Subscription).join(SubscriptionPlan).filter(
        Subscription.user_id == user.id,
        SubscriptionPlan.word_pdf_export == True,
    ).first()
    if not sub:
        raise HTTPException(status_code=402, detail="Pro plan required for document downloads")

    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    tender_dict = {
        "title": tender.title,
        "issuing_authority": tender.issuing_authority,
        "reference_number": tender.reference_number,
        "sector_name": tender.sector_name,
        "estimated_value_pkr": tender.estimated_value_pkr,
        "published_date": tender.published_date,
        "submission_deadline": tender.submission_deadline,
        "opportunity_score": tender.opportunity_score,
        "ai_summary_short": tender.ai_summary_short,
        "ai_summary_detailed": tender.ai_summary_detailed,
        "eligibility_criteria": tender.eligibility_criteria,
        "sme_insights": tender.sme_insights,
    }

    content, filename = generate_word_document(tender_dict)
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{tender_id}/download/pdf")
async def download_pdf(
    tender_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_verified),
):
    """Generate and return a PDF document for the tender."""
    sub = db.query(Subscription).join(SubscriptionPlan).filter(
        Subscription.user_id == user.id,
        SubscriptionPlan.word_pdf_export == True,
    ).first()
    if not sub:
        raise HTTPException(status_code=402, detail="Pro plan required for document downloads")

    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    tender_dict = {
        "title": tender.title,
        "issuing_authority": tender.issuing_authority,
        "reference_number": tender.reference_number,
        "sector_name": tender.sector_name,
        "estimated_value_pkr": tender.estimated_value_pkr,
        "published_date": tender.published_date,
        "submission_deadline": tender.submission_deadline,
        "opportunity_score": tender.opportunity_score,
        "ai_summary_short": tender.ai_summary_short,
        "ai_summary_detailed": tender.ai_summary_detailed,
        "eligibility_criteria": tender.eligibility_criteria,
        "sme_insights": tender.sme_insights,
    }

    content, filename = generate_pdf_document(tender_dict)
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/stats/summary")
async def tender_stats(db: Session = Depends(get_db)):
    """Public endpoint – basic stats for landing page."""
    total = db.query(func.count(Tender.id)).scalar()
    active = db.query(func.count(Tender.id)).filter(Tender.status == "active").scalar()
    high_value = db.query(func.count(Tender.id)).filter(Tender.is_high_value == True).scalar()
    return {
        "total_tenders": total,
        "active_tenders": active,
        "high_value_tenders": high_value,
    }
