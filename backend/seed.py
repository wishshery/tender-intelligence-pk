"""
TenderIQ Pakistan – Database seed / bootstrap script.
Run this ONCE after running `alembic upgrade head` to populate:
  - All 18 sectors
  - 3 subscription plans (Free, Pro, Enterprise)
  - One default admin user

Usage:
    cd backend
    python seed.py

    # or with custom admin credentials:
    ADMIN_EMAIL=admin@tenderiq.pk ADMIN_PASSWORD=SecurePass123! python seed.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.sector import Sector, SECTOR_TAXONOMY
from app.models.subscription import SubscriptionPlan
from app.models.user import User
from app.utils.security import hash_password
from app.config import settings


def seed_sectors(db):
    if db.query(Sector).count() > 0:
        print("  ✓ Sectors already seeded – skipping")
        return
    for s in SECTOR_TAXONOMY:
        db.add(Sector(code=s["code"], name=s["name"], icon=s["icon"]))
    print(f"  ✓ Seeded {len(SECTOR_TAXONOMY)} sectors")


def seed_plans(db):
    if db.query(SubscriptionPlan).count() > 0:
        print("  ✓ Plans already seeded – skipping")
        return

    plans = [
        SubscriptionPlan(
            name="free", display_name="Free",
            price_pkr=0, price_usd=0.0, price_gbp=0.0,
            monthly_tender_limit=10,
            ai_summaries=False, word_pdf_export=False,
            sector_alerts=False, weekly_report=False,
            multi_user=False, api_access=False, custom_alerts=False,
            features_list=["10 tenders/month", "Basic listings", "Public data access"],
        ),
        SubscriptionPlan(
            name="pro", display_name="Pro",
            price_pkr=settings.PRO_PRICE_PKR,
            price_usd=settings.PRO_PRICE_USD,
            price_gbp=settings.PRO_PRICE_GBP,
            monthly_tender_limit=-1,
            ai_summaries=True, word_pdf_export=True,
            sector_alerts=True, weekly_report=True,
            multi_user=False, api_access=False, custom_alerts=True,
            stripe_price_id_pkr=settings.STRIPE_PRICE_PRO_PKR,
            stripe_price_id_usd=settings.STRIPE_PRICE_PRO_USD,
            stripe_price_id_gbp=settings.STRIPE_PRICE_PRO_GBP,
            features_list=[
                "Unlimited tenders",
                "AI summaries (Claude)",
                "Word & PDF downloads",
                "Sector & keyword alerts",
                "Weekly digest email",
                "Opportunity scoring",
                "SME insights",
            ],
        ),
        SubscriptionPlan(
            name="enterprise", display_name="Enterprise",
            price_pkr=settings.ENT_PRICE_PKR,
            price_usd=settings.ENT_PRICE_USD,
            price_gbp=settings.ENT_PRICE_GBP,
            monthly_tender_limit=-1,
            ai_summaries=True, word_pdf_export=True,
            sector_alerts=True, weekly_report=True,
            multi_user=True, api_access=True, custom_alerts=True,
            stripe_price_id_pkr=settings.STRIPE_PRICE_ENT_PKR,
            stripe_price_id_usd=settings.STRIPE_PRICE_ENT_USD,
            stripe_price_id_gbp=settings.STRIPE_PRICE_ENT_GBP,
            features_list=[
                "Everything in Pro",
                "5 user seats",
                "REST API access",
                "Custom workflows",
                "Priority support",
                "Account manager",
            ],
        ),
    ]
    for p in plans:
        db.add(p)
    print("  ✓ Seeded 3 subscription plans")


def seed_admin(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@tenderiq.pk")
    admin_password = os.environ.get("ADMIN_PASSWORD", "TenderIQ@2024!")

    if db.query(User).filter(User.email == admin_email).first():
        print(f"  ✓ Admin user {admin_email} already exists – skipping")
        return

    from datetime import datetime, timedelta
    from app.models.subscription import Subscription

    admin = User(
        email=admin_email,
        hashed_password=hash_password(admin_password),
        full_name="TenderIQ Admin",
        company_name="TenderIQ Pakistan",
        role="admin",
        is_active=True,
        is_verified=True,
    )
    db.add(admin)
    db.flush()

    # Assign enterprise plan to admin
    ent_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "enterprise").first()
    if ent_plan:
        sub = Subscription(
            user_id=admin.id,
            plan_id=ent_plan.id,
            status="active",
            usage_reset_date=datetime.utcnow() + timedelta(days=365),
        )
        db.add(sub)

    print(f"  ✓ Created admin user: {admin_email}")
    print(f"  ✓ Admin password:     {admin_password}")
    print("  ⚠️  CHANGE the admin password after first login!")


def main():
    print("\n🏛  TenderIQ Pakistan – Database Seed")
    print("=" * 45)

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("  ✓ Tables verified/created")

    db = SessionLocal()
    try:
        seed_sectors(db)
        seed_plans(db)
        seed_admin(db)
        db.commit()
        print("\n✅ Seeding complete!\n")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Seeding failed: {e}\n")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
