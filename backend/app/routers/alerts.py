"""
Alerts Router – manage keyword alerts, sector subscriptions, and dashboard notifications.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert, AlertMatch, UserSectorSubscription
from app.models.sector import Sector
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.user import User
from app.routers.auth import require_verified
from app.schemas.alert import (
    AlertCreate, AlertMatchOut, AlertOut, AlertUpdate,
    SectorOut, SectorSubscriptionRequest,
)

router = APIRouter(prefix="/alerts", tags=["Alerts"])


def _require_pro(user: User, db: Session):
    sub = db.query(Subscription).join(SubscriptionPlan).filter(
        Subscription.user_id == user.id,
        SubscriptionPlan.sector_alerts == True,
    ).first()
    if not sub:
        raise HTTPException(status_code=402, detail="Pro plan required for alert features")


# ── Sectors ───────────────────────────────────────────────────────────────────

@router.get("/sectors", response_model=List[SectorOut])
async def list_sectors(db: Session = Depends(get_db)):
    return db.query(Sector).order_by(Sector.name).all()


@router.get("/sectors/my", response_model=List[SectorOut])
async def my_sector_subscriptions(
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    subs = db.query(UserSectorSubscription).filter(
        UserSectorSubscription.user_id == user.id,
        UserSectorSubscription.is_active == True,
    ).all()
    sector_ids = [s.sector_id for s in subs]
    return db.query(Sector).filter(Sector.id.in_(sector_ids)).all()


@router.post("/sectors/subscribe")
async def subscribe_sectors(
    body: SectorSubscriptionRequest,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    _require_pro(user, db)
    # Remove existing subscriptions
    db.query(UserSectorSubscription).filter(
        UserSectorSubscription.user_id == user.id
    ).delete()

    for code in body.sector_codes:
        sector = db.query(Sector).filter(Sector.code == code).first()
        if sector:
            db.add(UserSectorSubscription(user_id=user.id, sector_id=sector.id))

    db.commit()
    return {"message": f"Subscribed to {len(body.sector_codes)} sectors"}


# ── Keyword Alerts ────────────────────────────────────────────────────────────

@router.get("", response_model=List[AlertOut])
async def list_alerts(
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    return db.query(Alert).filter(Alert.user_id == user.id).all()


@router.post("", response_model=AlertOut, status_code=201)
async def create_alert(
    body: AlertCreate,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    _require_pro(user, db)
    alert = Alert(user_id=user.id, **body.dict())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/{alert_id}", response_model=AlertOut)
async def update_alert(
    alert_id: UUID,
    body: AlertUpdate,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    for field, value in body.dict(exclude_unset=True).items():
        setattr(alert, field, value)
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: UUID,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()


# ── Alert Matches (Notifications) ─────────────────────────────────────────────

@router.get("/matches", response_model=List[AlertMatchOut])
async def get_matches(
    unread_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    query = db.query(AlertMatch).filter(AlertMatch.user_id == user.id)
    if unread_only:
        query = query.filter(AlertMatch.read == False)
    matches = query.order_by(AlertMatch.created_at.desc()).limit(limit).all()

    result = []
    for m in matches:
        result.append(AlertMatchOut(
            id=m.id,
            alert_id=m.alert_id,
            alert_name=m.alert.name if m.alert else "",
            tender_id=m.tender_id,
            tender_title=m.tender.title if m.tender else "",
            tender_sector=m.tender.sector_name if m.tender else None,
            matched_keywords=m.matched_keywords or [],
            read=m.read,
            created_at=m.created_at,
        ))
    return result


@router.post("/matches/{match_id}/read")
async def mark_match_read(
    match_id: UUID,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    from datetime import datetime
    match = db.query(AlertMatch).filter(
        AlertMatch.id == match_id, AlertMatch.user_id == user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.read = True
    match.read_at = datetime.utcnow()
    db.commit()
    return {"message": "Marked as read"}


@router.post("/matches/read-all")
async def mark_all_read(
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    from datetime import datetime
    db.query(AlertMatch).filter(
        AlertMatch.user_id == user.id, AlertMatch.read == False
    ).update({"read": True, "read_at": datetime.utcnow()})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.get("/matches/count")
async def unread_count(
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    count = db.query(AlertMatch).filter(
        AlertMatch.user_id == user.id, AlertMatch.read == False
    ).count()
    return {"unread_count": count}
