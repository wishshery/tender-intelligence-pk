"""
Payment Service – Stripe + Easypaisa integration

Stripe: handles USD, GBP, and PKR card payments (Visa, MC, Amex)
Easypaisa: handles Pakistani mobile wallet / OTC payments
"""

import hashlib
import hmac
import logging
import time
from typing import Any, Dict, Optional

import httpx
import stripe

from app.config import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

# ── Stripe price ID mapping ───────────────────────────────────────────────────
STRIPE_PRICES: Dict[str, Dict[str, str]] = {
    "pro": {
        "PKR": settings.STRIPE_PRICE_PRO_PKR,
        "USD": settings.STRIPE_PRICE_PRO_USD,
        "GBP": settings.STRIPE_PRICE_PRO_GBP,
    },
    "enterprise": {
        "PKR": settings.STRIPE_PRICE_ENT_PKR,
        "USD": settings.STRIPE_PRICE_ENT_USD,
        "GBP": settings.STRIPE_PRICE_ENT_GBP,
    },
}


# ── Stripe ────────────────────────────────────────────────────────────────────

async def create_stripe_checkout_session(
    user_id: str,
    user_email: str,
    plan: str,
    currency: str,
    billing_interval: str = "monthly",
    success_url: Optional[str] = None,
    cancel_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a Stripe Checkout Session and return the hosted URL.
    """
    price_id = STRIPE_PRICES.get(plan, {}).get(currency.upper())
    if not price_id:
        raise ValueError(f"No Stripe price configured for plan={plan}, currency={currency}")

    # Annual discount: create a one-time session with modified price if needed
    # For simplicity we use the monthly price ID; annual billing should have
    # separate Stripe price IDs created in the dashboard.

    success_url = success_url or f"{settings.FRONTEND_URL}/dashboard?payment=success"
    cancel_url = cancel_url or f"{settings.FRONTEND_URL}/pricing?payment=cancelled"

    try:
        # Get or create Stripe customer
        customers = stripe.Customer.search(query=f'email:"{user_email}"')
        if customers.data:
            customer = customers.data[0]
        else:
            customer = stripe.Customer.create(
                email=user_email,
                metadata={"tenderiq_user_id": user_id},
            )

        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url + "&session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "tenderiq_user_id": user_id,
                "plan": plan,
                "currency": currency,
            },
            subscription_data={
                "metadata": {"tenderiq_user_id": user_id, "plan": plan}
            },
            billing_address_collection="auto",
            allow_promotion_codes=True,
        )
        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "gateway": "stripe",
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise


async def handle_stripe_webhook(payload: bytes, sig_header: str) -> Dict[str, Any]:
    """
    Verify and process Stripe webhook events.
    Returns a dict describing what action was taken.
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        raise ValueError(f"Invalid Stripe webhook: {e}")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        return {
            "action": "activate_subscription",
            "user_id": data.get("metadata", {}).get("tenderiq_user_id"),
            "plan": data.get("metadata", {}).get("plan"),
            "stripe_customer_id": data.get("customer"),
            "stripe_subscription_id": data.get("subscription"),
            "currency": data.get("currency", "usd").upper(),
        }

    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        return {
            "action": "update_subscription",
            "stripe_subscription_id": data.get("id"),
            "stripe_customer_id": data.get("customer"),
            "status": data.get("status"),
            "cancel_at_period_end": data.get("cancel_at_period_end", False),
            "current_period_end": data.get("current_period_end"),
        }

    elif event_type == "invoice.payment_failed":
        return {
            "action": "payment_failed",
            "stripe_customer_id": data.get("customer"),
            "stripe_subscription_id": data.get("subscription"),
        }

    return {"action": "ignored", "event_type": event_type}


async def cancel_stripe_subscription(
    stripe_subscription_id: str,
    at_period_end: bool = True,
) -> Dict[str, Any]:
    """Cancel (or schedule cancellation of) a Stripe subscription."""
    try:
        if at_period_end:
            sub = stripe.Subscription.modify(
                stripe_subscription_id,
                cancel_at_period_end=True,
            )
        else:
            sub = stripe.Subscription.delete(stripe_subscription_id)
        return {"status": sub.status, "cancel_at_period_end": sub.cancel_at_period_end}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe cancel error: {e}")
        raise


# ── Easypaisa ─────────────────────────────────────────────────────────────────

def _easypaisa_hash(params: Dict[str, str], salt: str) -> str:
    """
    Build the Easypaisa HMAC-SHA256 integrity hash.
    All values sorted by key, concatenated, then HMAC'd with the salt.
    """
    sorted_vals = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    return hmac.new(
        salt.encode("utf-8"),
        sorted_vals.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


async def create_easypaisa_payment(
    order_id: str,
    amount_pkr: float,
    user_email: str,
    user_phone: str,
    plan: str,
    success_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Initiate an Easypaisa payment session.
    Returns the redirect URL and payload for the frontend.
    """
    amount_str = f"{amount_pkr:.2f}"
    timestamp = str(int(time.time()))

    params = {
        "amount": amount_str,
        "merchantId": settings.EASYPAISA_MERCHANT_ID,
        "merchantPaymentRef": order_id,
        "mobileAccountNo": user_phone.replace("+92", "0").replace(" ", ""),
        "orderId": order_id,
        "paymentMethod": "MA_PAYMENT",   # Mobile Account
        "postBackURL": success_url or f"{settings.FRONTEND_URL}/dashboard?payment=success",
        "recurringPayment": "0",
        "storeName": "TenderIQ Pakistan",
        "timestamp": timestamp,
        "transactionAmount": amount_str,
        "transactionType": "InitiateTransaction",
    }

    params["hashValue"] = _easypaisa_hash(params, settings.EASYPAISA_INTEGRITY_SALT)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                settings.EASYPAISA_API_URL,
                json=params,
                headers={
                    "Content-Type": "application/json",
                    "merchantId": settings.EASYPAISA_MERCHANT_ID,
                    "Password": settings.EASYPAISA_PASSWORD,
                },
            )
            result = resp.json()
            if result.get("responseCode") == "0000":
                return {
                    "gateway": "easypaisa",
                    "order_id": order_id,
                    "redirect_url": result.get("redirectURL"),
                    "token": result.get("token"),
                    "easypaisa_payload": result,
                }
            else:
                raise ValueError(
                    f"Easypaisa error {result.get('responseCode')}: {result.get('responseDesc')}"
                )
    except Exception as e:
        logger.error(f"Easypaisa payment initiation failed: {e}")
        raise
