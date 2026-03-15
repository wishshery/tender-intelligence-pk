"""Celery application instance and beat schedule."""

from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "tenderiq",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.ingestion",
        "app.workers.ai_processing",
        "app.workers.notifications",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Karachi",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# ── Scheduled tasks (Celery Beat) ─────────────────────────────────────────────
celery_app.conf.beat_schedule = {
    # Daily CKAN ingestion at 6 AM PKT
    "daily-ckan-ingestion": {
        "task": "app.workers.ingestion.run_ingestion_pipeline",
        "schedule": crontab(hour=6, minute=0),
        "args": (),
    },
    # AI processing queue – every 30 minutes
    "process-unanalysed-tenders": {
        "task": "app.workers.ai_processing.process_pending_tenders",
        "schedule": crontab(minute="*/30"),
        "args": (),
    },
    # Instant alert matching – every 15 minutes
    "match-alerts": {
        "task": "app.workers.notifications.match_and_notify",
        "schedule": crontab(minute="*/15"),
        "args": (),
    },
    # Weekly digest – every Monday at 9 AM PKT
    "weekly-digest": {
        "task": "app.workers.notifications.send_weekly_digest",
        "schedule": crontab(day_of_week=1, hour=9, minute=0),
        "args": (),
    },
    # Reset monthly usage counters – 1st of each month
    "reset-monthly-usage": {
        "task": "app.workers.notifications.reset_monthly_usage",
        "schedule": crontab(day_of_month=1, hour=0, minute=0),
        "args": (),
    },
}
