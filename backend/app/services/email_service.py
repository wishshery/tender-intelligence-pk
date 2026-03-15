"""
Email Service – uses Resend API for transactional and alert emails.
HTML email templates with professional TenderIQ branding.
"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

RESEND_API = "https://api.resend.com/emails"


# ── Base HTML Template ────────────────────────────────────────────────────────

def _base_template(subject: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:#F5F7FA;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0D47A1;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#ffffff;font-size:22px;font-weight:bold;">🏛 TenderIQ</span>
                    <span style="color:#90CAF9;font-size:13px;margin-left:8px;">Pakistan</span>
                  </td>
                  <td align="right">
                    <span style="color:#F57F17;font-size:11px;font-style:italic;">Government Procurement Intelligence</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              {body_html}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F5F5;padding:16px 32px;border-top:1px solid #E0E0E0;">
              <p style="margin:0;font-size:11px;color:#9E9E9E;text-align:center;">
                TenderIQ Pakistan | <a href="{settings.FRONTEND_URL}" style="color:#0D47A1;">www.tenderiq.pk</a><br>
                Data sourced from data.gov.pk (PPRA / Government of Pakistan)<br>
                <a href="{settings.FRONTEND_URL}/settings/notifications" style="color:#9E9E9E;">Manage notification preferences</a> |
                <a href="{settings.FRONTEND_URL}/unsubscribe" style="color:#9E9E9E;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


async def _send(to: str, subject: str, html: str) -> bool:
    """Send an email via Resend API."""
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set – email not sent.")
        return False
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                RESEND_API,
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
                    "to": [to],
                    "subject": subject,
                    "html": html,
                },
            )
            resp.raise_for_status()
            return True
    except Exception as e:
        logger.error(f"Email send failed to {to}: {e}")
        return False


# ── Email Templates ───────────────────────────────────────────────────────────

async def send_welcome_email(user_email: str, user_name: str, verification_token: str) -> bool:
    verify_url = f"{settings.FRONTEND_URL}/auth/verify?token={verification_token}"
    body = f"""
      <h2 style="color:#0D47A1;margin-top:0;">Welcome to TenderIQ Pakistan, {user_name}! 🎉</h2>
      <p style="color:#424242;line-height:1.6;">
        You're now part of Pakistan's leading Government Procurement Intelligence platform.
        We help SMEs like yours discover and win government contracts.
      </p>
      <p style="color:#424242;line-height:1.6;">
        Please verify your email address to activate your account:
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{verify_url}"
           style="background:#0D47A1;color:#ffffff;padding:14px 32px;border-radius:6px;
                  text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
          ✅ Verify My Email
        </a>
      </div>
      <p style="color:#757575;font-size:12px;">
        If the button doesn't work, copy this link: {verify_url}
      </p>
    """
    subject = "Welcome to TenderIQ Pakistan – Please Verify Your Email"
    return await _send(user_email, subject, _base_template(subject, body))


async def send_password_reset_email(user_email: str, user_name: str, reset_token: str) -> bool:
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={reset_token}"
    body = f"""
      <h2 style="color:#0D47A1;margin-top:0;">Password Reset Request</h2>
      <p style="color:#424242;line-height:1.6;">Hi {user_name},</p>
      <p style="color:#424242;line-height:1.6;">
        We received a request to reset your TenderIQ password. Click the button below to set a new password.
        This link expires in 1 hour.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{reset_url}"
           style="background:#F57F17;color:#ffffff;padding:14px 32px;border-radius:6px;
                  text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
          🔑 Reset My Password
        </a>
      </div>
      <p style="color:#757575;font-size:12px;">
        If you didn't request this, please ignore this email. Your password will not change.
      </p>
    """
    subject = "TenderIQ – Password Reset Request"
    return await _send(user_email, subject, _base_template(subject, body))


async def send_tender_alert_email(
    user_email: str,
    user_name: str,
    alert_name: str,
    tenders: List[Dict[str, Any]],
) -> bool:
    """Send an alert email when new tenders match a user's alert rule."""
    tender_rows = ""
    for t in tenders[:5]:
        deadline = t.get("submission_deadline", "N/A")
        score = t.get("opportunity_score", "N/A")
        tender_url = f"{settings.FRONTEND_URL}/tenders/{t.get('id', '')}"
        tender_rows += f"""
        <tr>
          <td style="padding:12px;border-bottom:1px solid #E0E0E0;">
            <a href="{tender_url}" style="color:#0D47A1;font-weight:bold;text-decoration:none;">
              {t.get('title', 'Untitled')[:80]}
            </a><br>
            <small style="color:#757575;">
              {t.get('issuing_authority', 'N/A')} | Sector: {t.get('sector_name', 'N/A')}
            </small>
          </td>
          <td style="padding:12px;border-bottom:1px solid #E0E0E0;text-align:center;color:#757575;font-size:13px;">
            {deadline}
          </td>
          <td style="padding:12px;border-bottom:1px solid #E0E0E0;text-align:center;">
            <span style="background:#E3F2FD;color:#0D47A1;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;">
              {score}/100
            </span>
          </td>
        </tr>"""

    body = f"""
      <h2 style="color:#0D47A1;margin-top:0;">🔔 New Tenders Matching Your Alert</h2>
      <p style="color:#424242;line-height:1.6;">Hi {user_name},</p>
      <p style="color:#424242;line-height:1.6;">
        We found <strong>{len(tenders)} new tender(s)</strong> matching your alert:
        <span style="background:#E3F2FD;color:#0D47A1;padding:2px 8px;border-radius:4px;font-weight:bold;">
          {alert_name}
        </span>
      </p>
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #E0E0E0;border-radius:6px;overflow:hidden;margin:16px 0;">
        <thead>
          <tr style="background:#0D47A1;color:#ffffff;font-size:13px;">
            <th style="padding:12px;text-align:left;">Tender</th>
            <th style="padding:12px;text-align:center;">Deadline</th>
            <th style="padding:12px;text-align:center;">Score</th>
          </tr>
        </thead>
        <tbody>
          {tender_rows}
        </tbody>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="{settings.FRONTEND_URL}/dashboard/alerts"
           style="background:#0D47A1;color:#ffffff;padding:12px 28px;border-radius:6px;
                  text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
          View All Matching Tenders →
        </a>
      </div>
    """
    subject = f"TenderIQ Alert: {len(tenders)} New Tender(s) for '{alert_name}'"
    return await _send(user_email, subject, _base_template(subject, body))


async def send_weekly_digest_email(
    user_email: str,
    user_name: str,
    digest_body: str,
    tender_count: int,
) -> bool:
    body = f"""
      <h2 style="color:#0D47A1;margin-top:0;">📊 Your Weekly Procurement Digest</h2>
      <p style="color:#424242;line-height:1.6;">Hi {user_name},</p>
      <div style="background:#E3F2FD;border-left:4px solid #0D47A1;padding:16px;margin:16px 0;border-radius:0 6px 6px 0;">
        <strong style="color:#0D47A1;">{tender_count} new tenders</strong> published this week across your subscribed sectors.
      </div>
      <div style="color:#424242;line-height:1.8;white-space:pre-line;">{digest_body}</div>
      <div style="text-align:center;margin:28px 0;">
        <a href="{settings.FRONTEND_URL}/dashboard"
           style="background:#0D47A1;color:#ffffff;padding:12px 28px;border-radius:6px;
                  text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
          Open My Dashboard →
        </a>
      </div>
    """
    subject = f"TenderIQ Weekly Digest – {tender_count} New Opportunities"
    return await _send(user_email, subject, _base_template(subject, body))


async def send_subscription_confirmation_email(
    user_email: str,
    user_name: str,
    plan_name: str,
    amount: str,
) -> bool:
    body = f"""
      <h2 style="color:#0D47A1;margin-top:0;">✅ Subscription Confirmed</h2>
      <p style="color:#424242;line-height:1.6;">Hi {user_name},</p>
      <p style="color:#424242;line-height:1.6;">
        Your <strong>{plan_name.upper()} Plan</strong> subscription is now active.
        Welcome to the full TenderIQ experience!
      </p>
      <div style="background:#F5F5F5;border-radius:6px;padding:20px;margin:16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color:#757575;font-size:13px;">Plan</td><td style="font-weight:bold;text-align:right;">{plan_name.upper()}</td></tr>
          <tr><td style="color:#757575;font-size:13px;padding-top:8px;">Amount</td><td style="font-weight:bold;text-align:right;padding-top:8px;">{amount}</td></tr>
          <tr><td style="color:#757575;font-size:13px;padding-top:8px;">Billing</td><td style="font-weight:bold;text-align:right;padding-top:8px;">Monthly</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="{settings.FRONTEND_URL}/dashboard"
           style="background:#1B5E20;color:#ffffff;padding:12px 28px;border-radius:6px;
                  text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
          🚀 Start Exploring Tenders
        </a>
      </div>
    """
    subject = f"TenderIQ – {plan_name.title()} Subscription Activated"
    return await _send(user_email, subject, _base_template(subject, body))
