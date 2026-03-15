"""
Subscriptions Router – plan info, checkout, and webhook handling.
"""

import uuid
from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.user import User
from app.routers.auth import get_current_user, require_verified
from app.schemas.subscription import (
    CancelSubscriptionRequest, CheckoutRequest, CheckoutResponse,
    PlanOut, SubscriptionOut,
)
from app.services.email_service import send_subscription_confirmation_email
from app.services.payment_service import (
    cancel_stripe_subscription, create_easypaisa_payment,
    create_stripe_checkout_session, handle_stripe_webhook,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ── Plans ─────────────────────────────────────────────────────────────────────

@router.get("/plans", response_model=List[PlanOut])
async def list_plans(db: Session = Depends(get_db)):
    return db.query(SubscriptionPlan).all()


@router.get("/plans/{plan_name}", response_model=PlanOut)
async def get_plan(plan_name: str, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == plan_name).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


# ── Current subscription ──────────────────────────────────────────────────────

@router.get("/my", response_model=SubscriptionOut)
async def my_subscription(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == sub.plan_id).first()
    return SubscriptionOut(
        id=sub.id,
        plan_name=plan.name if plan else "free",
        status=sub.status,
        currency=sub.currency,
        billing_interval=sub.billing_interval,
        current_period_end=sub.current_period_end,
        cancel_at_period_end=sub.cancel_at_period_end,
        tenders_viewed_this_month=sub.tenders_viewed_this_month,
        payment_gateway=sub.payment_gateway,
    )


# ── Checkout ──────────────────────────────────────────────────────────────────

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    body: CheckoutRequest,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    if body.plan not in ("pro", "enterprise"):
        raise HTTPException(status_code=400, detail="Invalid plan")
    if body.currency not in ("PKR", "USD", "GBP"):
        raise HTTPException(status_code=400, detail="Invalid currency")

    if body.gateway == "easypaisa":
        # Easypaisa only available in PKR
        if body.currency != "PKR":
            raise HTTPException(status_code=400, detail="Easypaisa only supports PKR")

        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == body.plan).first()
        amount = plan.price_pkr if plan else 4999
        order_id = f"TIQ-{uuid.uuid4().hex[:10].upper()}"

        result = await create_easypaisa_payment(
            order_id=order_id,
            amount_pkr=float(amount),
            user_email=user.email,
            user_phone=user.phone or "03000000000",
            plan=body.plan,
            success_url=body.success_url,
        )
        return CheckoutResponse(
            easypaisa_payload=result,
            gateway="easypaisa",
        )
    else:
        result = await create_stripe_checkout_session(
            user_id=str(user.id),
            user_email=user.email,
            plan=body.plan,
            currency=body.currency,
            billing_interval=body.billing_interval,
            success_url=body.success_url,
            cancel_url=body.cancel_url,
        )
        return CheckoutResponse(
            checkout_url=result["checkout_url"],
            session_id=result["session_id"],
            gateway="stripe",
        )


# ── Cancel ────────────────────────────────────────────────────────────────────

@router.post("/cancel")
async def cancel_subscription(
    body: CancelSubscriptionRequest,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub or not sub.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active Stripe subscription")

    result = await cancel_stripe_subscription(
        sub.stripe_subscription_id, at_period_end=body.at_period_end
    )
    sub.cancel_at_period_end = result["cancel_at_period_end"]
    db.commit()
    return {"message": "Subscription cancellation scheduled", **result}


# ── Stripe Webhook ────────────────────────────────────────────────────────────

@router.post("/webhook/stripe", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db),
):
    payload = await request.body()
    try:
        event = await handle_stripe_webhook(payload, stripe_signature)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    action = event.get("action")

    if action == "activate_subscription":
        user_id = event.get("user_id")
        plan_name = event.get("plan", "pro")
        currency = event.get("currency", "USD")

        user = db.query(User).filter(User.id == user_id).first()
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == plan_name).first()
        if user and plan:
            from datetime import datetime, timedelta
            sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
            if sub:
                sub.plan_id = plan.id
                sub.status = "active"
                sub.currency = currency
                sub.payment_gateway = "stripe"
                sub.stripe_customer_id = event.get("stripe_customer_id")
                sub.stripe_subscription_id = event.get("stripe_subscription_id")
                sub.current_period_start = datetime.utcnow()
                sub.current_period_end = datetime.utcnow() + timedelta(days=30)
                sub.tenders_viewed_this_month = 0
                db.commit()

            import asyncio
            asyncio.create_task(
                send_subscription_confirmation_email(
                    user.email,
                    user.full_name or "there",
                    plan_name,
                    f"{currency} {plan.price_usd if currency == 'USD' else plan.price_pkr}",
                )
            )

    elif action == "update_subscription":
        stripe_sub_id = event.get("stripe_subscription_id")
        sub = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_sub_id
        ).first()
        if sub:
            sub.status = event.get("status", sub.status)
            sub.cancel_at_period_end = event.get("cancel_at_period_end", False)
            if event.get("current_period_end"):
                from datetime import datetime
                sub.current_period_end = datetime.utcfromtimestamp(event["current_period_end"])
            db.commit()

    return {"received": True}
