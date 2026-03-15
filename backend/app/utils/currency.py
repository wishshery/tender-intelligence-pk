"""
Currency conversion utilities.
Uses a cached exchange-rate API call; falls back to hard-coded rates if unavailable.
"""

import httpx
from functools import lru_cache
from typing import Dict

from app.config import settings

# Fallback rates (PKR base)
FALLBACK_RATES: Dict[str, float] = {
    "PKR": 1.0,
    "USD": 0.0036,   # approx 1 PKR = 0.0036 USD
    "GBP": 0.0028,   # approx 1 PKR = 0.0028 GBP
}


async def fetch_exchange_rates() -> Dict[str, float]:
    """Fetch live rates from exchangerate-api.com (PKR base)."""
    try:
        url = f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGE_RATE_API_KEY}/latest/PKR"
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(url)
            data = resp.json()
            if data.get("result") == "success":
                rates = data["conversion_rates"]
                return {
                    "PKR": 1.0,
                    "USD": rates.get("USD", FALLBACK_RATES["USD"]),
                    "GBP": rates.get("GBP", FALLBACK_RATES["GBP"]),
                }
    except Exception:
        pass
    return FALLBACK_RATES


def pkr_to_currency(amount_pkr: float, currency: str, rates: Dict[str, float] = None) -> float:
    """Convert a PKR amount to the target currency."""
    r = rates or FALLBACK_RATES
    rate = r.get(currency.upper(), 1.0)
    return round(amount_pkr * rate, 2)


def format_currency(amount: float, currency: str) -> str:
    """Return a formatted currency string."""
    symbols = {"PKR": "₨", "USD": "$", "GBP": "£"}
    symbol = symbols.get(currency, currency)
    if currency == "PKR":
        return f"{symbol} {amount:,.0f}"
    return f"{symbol} {amount:,.2f}"
