"""
TenderIQ Pakistan – Application Configuration
Loads all environment variables and exposes a typed Settings object.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────
    APP_NAME: str = "TenderIQ Pakistan"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://tenderiq:password@localhost:5432/tenderiq_db"

    # ── Redis / Celery ───────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # ── Anthropic Claude ─────────────────────────────────────────
    ANTHROPIC_API_KEY: str = ""

    # ── CKAN ─────────────────────────────────────────────────────
    CKAN_BASE_URL: str = "https://data.gov.pk"
    CKAN_API_KEY: str = ""

    # ── Stripe ───────────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Stripe Price IDs (set after creating products in Stripe dashboard)
    STRIPE_PRICE_PRO_PKR: str = ""
    STRIPE_PRICE_PRO_USD: str = ""
    STRIPE_PRICE_PRO_GBP: str = ""
    STRIPE_PRICE_ENT_PKR: str = ""
    STRIPE_PRICE_ENT_USD: str = ""
    STRIPE_PRICE_ENT_GBP: str = ""

    # ── Easypaisa ────────────────────────────────────────────────
    EASYPAISA_MERCHANT_ID: str = ""
    EASYPAISA_PASSWORD: str = ""
    EASYPAISA_INTEGRITY_SALT: str = ""
    EASYPAISA_API_URL: str = "https://easypaisa.com.pk/easypaisa/rest/v4/initPaymentRequest"

    # ── Email (Resend) ───────────────────────────────────────────
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "alerts@tenderiq.pk"
    FROM_NAME: str = "TenderIQ Pakistan"

    # ── Frontend ─────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Currency ─────────────────────────────────────────────────
    EXCHANGE_RATE_API_KEY: str = ""

    # ── JWT ──────────────────────────────────────────────────────
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_ALGORITHM: str = "HS256"

    # ── Subscription limits ──────────────────────────────────────
    FREE_MONTHLY_TENDER_LIMIT: int = 10

    # ── Pricing (stored as base values; exchange rates applied at runtime) ──
    # Prices in PKR
    PRO_PRICE_PKR: int = 4999
    ENT_PRICE_PKR: int = 14999
    # Prices in USD
    PRO_PRICE_USD: float = 18.0
    ENT_PRICE_USD: float = 54.0
    # Prices in GBP
    PRO_PRICE_GBP: float = 14.0
    ENT_PRICE_GBP: float = 42.0

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
