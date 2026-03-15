"""
TenderIQ Pakistan – FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import admin, alerts, auth, subscriptions, tenders

logger = logging.getLogger(__name__)


# ── Startup / shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME}...")
    # Create all tables (Alembic should handle migrations in production)
    Base.metadata.create_all(bind=engine)
    # Seed reference data
    _seed_data()
    yield
    logger.info("Shutting down...")


def _seed_data():
    """Seed sectors and subscription plans on first run."""
    from app.models.sector import Sector, SECTOR_TAXONOMY
    from app.models.subscription import SubscriptionPlan

    db = SessionLocal()
    try:
        # Seed sectors
        if db.query(Sector).count() == 0:
            for s in SECTOR_TAXONOMY:
                db.add(Sector(code=s["code"], name=s["name"], icon=s["icon"]))
            logger.info(f"Seeded {len(SECTOR_TAXONOMY)} sectors")

        # Seed subscription plans
        if db.query(SubscriptionPlan).count() == 0:
            plans = [
                SubscriptionPlan(
                    name="free",
                    display_name="Free",
                    price_pkr=0, price_usd=0, price_gbp=0,
                    monthly_tender_limit=10,
                    ai_summaries=False, word_pdf_export=False,
                    sector_alerts=False, weekly_report=False,
                    multi_user=False, api_access=False, custom_alerts=False,
                    features_list=[
                        "10 tenders/month",
                        "Basic tender listings",
                        "Public data access",
                    ],
                ),
                SubscriptionPlan(
                    name="pro",
                    display_name="Pro",
                    price_pkr=settings.PRO_PRICE_PKR,
                    price_usd=settings.PRO_PRICE_USD,
                    price_gbp=settings.PRO_PRICE_GBP,
                    monthly_tender_limit=-1,
                    ai_summaries=True, word_pdf_export=True,
                    sector_alerts=True, weekly_report=True,
                    multi_user=False, api_access=False, custom_alerts=True,
                    features_list=[
                        "Unlimited tender access",
                        "AI-powered summaries",
                        "Word & PDF report downloads",
                        "Sector & keyword alerts",
                        "Weekly digest email",
                        "Opportunity scoring",
                        "SME insights",
                    ],
                    stripe_price_id_pkr=settings.STRIPE_PRICE_PRO_PKR,
                    stripe_price_id_usd=settings.STRIPE_PRICE_PRO_USD,
                    stripe_price_id_gbp=settings.STRIPE_PRICE_PRO_GBP,
                ),
                SubscriptionPlan(
                    name="enterprise",
                    display_name="Enterprise",
                    price_pkr=settings.ENT_PRICE_PKR,
                    price_usd=settings.ENT_PRICE_USD,
                    price_gbp=settings.ENT_PRICE_GBP,
                    monthly_tender_limit=-1,
                    ai_summaries=True, word_pdf_export=True,
                    sector_alerts=True, weekly_report=True,
                    multi_user=True, api_access=True, custom_alerts=True,
                    features_list=[
                        "Everything in Pro",
                        "Multi-user access (5 seats)",
                        "REST API access",
                        "Custom alert workflows",
                        "Priority support",
                        "Dedicated account manager",
                        "Custom sector reports",
                    ],
                    stripe_price_id_pkr=settings.STRIPE_PRICE_ENT_PKR,
                    stripe_price_id_usd=settings.STRIPE_PRICE_ENT_USD,
                    stripe_price_id_gbp=settings.STRIPE_PRICE_ENT_GBP,
                ),
            ]
            for plan in plans:
                db.add(plan)
            logger.info("Seeded subscription plans")

        db.commit()
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()


# ── App instance ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="TenderIQ Pakistan API",
    description="Government Procurement Intelligence Platform for Pakistani SMEs",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api/v1")
app.include_router(tenders.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(subscriptions.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to TenderIQ Pakistan API",
        "docs": "/api/docs",
        "version": "1.0.0",
    }
