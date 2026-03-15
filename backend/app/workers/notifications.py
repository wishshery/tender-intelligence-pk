"""
Celery tasks: alert matching, email notifications, and weekly digest.
"""

import asyncio
import logging
from datetime import datetime, timedelta

from celery import shared_task
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.alert import Alert, AlertMatch, UserSectorSubscription
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.tender import Tender
from app.models.user import User
from app.services.ai_service import generate_weekly_digest
from app.services.email_service import (
    send_tender_alert_email, send_weekly_digest_email
)

logger = logging.getLogger(__name__)


@shared_task(name="app.workers.notifications.match_and_notify")
def match_and_notify():
    """
    For each active keyword alert, scan recently ingested tenders for matches.
    Create AlertMatch records and send email notifications.
    """
    db: Session = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(hours=1)  # tenders ingested in last hour
        new_tenders = (
            db.query(Tender)
            .filter(Tender.ingested_at >= cutoff, Tender.ai_processed == True)
            .all()
        )
        if not new_tenders:
            return {"matched": 0}

        active_alerts = db.query(Alert).filter(Alert.is_active == True).all()
        matches_created = 0

        for alert in active_alerts:
            matched_tenders = []
            for tender in new_tenders:
                matched_kw = _match_keywords(alert.keywords or [], tender)
                sector_match = _match_sectors(alert.sectors or [], tender)

                if matched_kw or sector_match:
                    # Check if match already exists
                    existing = db.query(AlertMatch).filter(
                        AlertMatch.alert_id == alert.id,
                        AlertMatch.tender_id == tender.id,
                    ).first()
                    if not existing:
                        match = AlertMatch(
                            user_id=alert.user_id,
                            alert_id=alert.id,
                            tender_id=tender.id,
                            matched_keywords=matched_kw,
                        )
                        db.add(match)
                        matched_tenders.append(tender)
                        matches_created += 1

            # Send email for instant alerts
            if matched_tenders and alert.email_notify and alert.frequency == "instant":
                user = db.query(User).filter(User.id == alert.user_id).first()
                if user and user.email:
                    tender_dicts = [
                        {
                            "id": str(t.id),
                            "title": t.title,
                            "issuing_authority": t.issuing_authority,
                            "sector_name": t.sector_name,
                            "submission_deadline": (
                                t.submission_deadline.strftime("%d %b %Y")
                                if t.submission_deadline else "N/A"
                            ),
                            "opportunity_score": t.opportunity_score,
                        }
                        for t in matched_tenders
                    ]
                    asyncio.run(
                        send_tender_alert_email(
                            user.email, user.full_name or "there",
                            alert.name, tender_dicts,
                        )
                    )
                    # Mark emails as sent
                    for match in db.query(AlertMatch).filter(
                        AlertMatch.alert_id == alert.id,
                        AlertMatch.email_sent == False,
                    ).all():
                        match.email_sent = True
                        match.email_sent_at = datetime.utcnow()

        db.commit()
        logger.info(f"Alert matching: {matches_created} new matches created")
        return {"matched": matches_created}
    except Exception as e:
        logger.error(f"Alert matching failed: {e}")
        db.rollback()
    finally:
        db.close()


@shared_task(name="app.workers.notifications.send_weekly_digest")
def send_weekly_digest():
    """
    Send a personalised weekly tender digest to all Pro/Enterprise users
    who have sector subscriptions.
    """
    db: Session = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=7)

        # Get all Pro+ users with sector subscriptions
        pro_users = (
            db.query(User)
            .join(Subscription)
            .join(SubscriptionPlan)
            .filter(
                SubscriptionPlan.weekly_report == True,
                Subscription.status == "active",
                User.is_active == True,
            )
            .all()
        )

        sent_count = 0
        for user in pro_users:
            sector_subs = db.query(UserSectorSubscription).filter(
                UserSectorSubscription.user_id == user.id,
                UserSectorSubscription.is_active == True,
            ).all()
            sector_ids = [s.sector_id for s in sector_subs]

            if not sector_ids:
                continue

            new_tenders = (
                db.query(Tender)
                .filter(
                    Tender.sector_id.in_(sector_ids),
                    Tender.ingested_at >= cutoff,
                    Tender.ai_processed == True,
                )
                .order_by(Tender.opportunity_score.desc())
                .limit(10)
                .all()
            )

            if not new_tenders:
                continue

            tender_dicts = [
                {
                    "title": t.title,
                    "sector_name": t.sector_name,
                    "submission_deadline": (
                        t.submission_deadline.strftime("%d %b %Y")
                        if t.submission_deadline else "N/A"
                    ),
                    "opportunity_score": t.opportunity_score,
                    "ai_summary_short": t.ai_summary_short,
                }
                for t in new_tenders
            ]

            digest_text = asyncio.run(
                generate_weekly_digest(tender_dicts, user.full_name or "there")
            )
            asyncio.run(
                send_weekly_digest_email(
                    user.email,
                    user.full_name or "there",
                    digest_text,
                    len(new_tenders),
                )
            )
            sent_count += 1

        logger.info(f"Weekly digest sent to {sent_count} users")
        return {"sent": sent_count}
    except Exception as e:
        logger.error(f"Weekly digest failed: {e}")
    finally:
        db.close()


@shared_task(name="app.workers.notifications.reset_monthly_usage")
def reset_monthly_usage():
    """Reset monthly tender-view counters for all users."""
    db: Session = SessionLocal()
    try:
        db.query(Subscription).update({
            "tenders_viewed_this_month": 0,
            "usage_reset_date": datetime.utcnow() + timedelta(days=30),
        })
        db.commit()
        logger.info("Monthly usage counters reset")
    finally:
        db.close()


# ── Matching helpers ──────────────────────────────────────────────────────────

def _match_keywords(keywords: list, tender: Tender) -> list:
    """Return list of keywords that match the tender (case-insensitive)."""
    if not keywords:
        return []
    text = " ".join(filter(None, [
        tender.title, tender.description, tender.issuing_authority,
        tender.ai_summary_short, " ".join(tender.industry_tags or []),
    ])).lower()
    return [kw for kw in keywords if kw.lower() in text]


def _match_sectors(sectors: list, tender: Tender) -> bool:
    """Return True if the tender's sector matches any of the alert's sectors."""
    if not sectors or not tender.sector_name:
        return False
    tender_sector = tender.sector_name.lower()
    return any(s.lower() in tender_sector or tender_sector in s.lower() for s in sectors)


@shared_task(name="app.workers.notifications.send_daily_sector_alerts")
def send_daily_sector_alerts():
    """
    Sends daily digest emails for users whose alerts have frequency='daily'.
    """
    db: Session = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=1)
        daily_alerts = db.query(Alert).filter(
            Alert.is_active == True,
            Alert.frequency == "daily",
            Alert.email_notify == True,
        ).all()

        for alert in daily_alerts:
            unnotified_matches = db.query(AlertMatch).filter(
                AlertMatch.alert_id == alert.id,
                AlertMatch.email_sent == False,
                AlertMatch.created_at >= cutoff,
            ).all()

            if not unnotified_matches:
                continue

            user = db.query(User).filter(User.id == alert.user_id).first()
            if not user:
                continue

            tender_ids = [m.tender_id for m in unnotified_matches]
            tenders = db.query(Tender).filter(Tender.id.in_(tender_ids)).all()
            tender_dicts = [
                {
                    "id": str(t.id),
                    "title": t.title,
                    "issuing_authority": t.issuing_authority,
                    "sector_name": t.sector_name,
                    "submission_deadline": (
                        t.submission_deadline.strftime("%d %b %Y")
                        if t.submission_deadline else "N/A"
                    ),
                    "opportunity_score": t.opportunity_score,
                }
                for t in tenders
            ]

            asyncio.run(
                send_tender_alert_email(
                    user.email, user.full_name or "there",
                    alert.name, tender_dicts,
                )
            )

            for m in unnotified_matches:
                m.email_sent = True
                m.email_sent_at = datetime.utcnow()

        db.commit()
    finally:
        db.close()
