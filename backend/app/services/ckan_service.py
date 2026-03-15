"""
CKAN Service – fetches procurement/tender data from data.gov.pk

CKAN API reference: https://docs.ckan.org/en/latest/api/
Primary endpoint: https://data.gov.pk/api/3/action/
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

CKAN_API = f"{settings.CKAN_BASE_URL}/api/3/action"

# Search terms that identify PPRA / procurement datasets
PROCUREMENT_KEYWORDS = [
    "PPRA", "procurement", "tender", "bid", "contract award",
    "RFP", "RFQ", "EOI", "expression of interest",
    "public procurement", "government procurement",
]

HEADERS = {
    "Authorization": settings.CKAN_API_KEY,
    "Content-Type": "application/json",
} if settings.CKAN_API_KEY else {}


async def search_procurement_packages(
    query: str = "procurement tender PPRA",
    rows: int = 100,
    start: int = 0,
    sort: str = "metadata_modified desc",
) -> Dict[str, Any]:
    """Search CKAN packages (datasets) related to procurement."""
    params = {
        "q": query,
        "rows": rows,
        "start": start,
        "sort": sort,
        "include_private": False,
    }
    async with httpx.AsyncClient(timeout=30, headers=HEADERS) as client:
        resp = await client.get(f"{CKAN_API}/package_search", params=params)
        resp.raise_for_status()
        data = resp.json()
        if not data.get("success"):
            raise ValueError(f"CKAN error: {data.get('error')}")
        return data["result"]


async def get_package_detail(package_id: str) -> Dict[str, Any]:
    """Fetch full metadata for a single CKAN package."""
    async with httpx.AsyncClient(timeout=30, headers=HEADERS) as client:
        resp = await client.get(
            f"{CKAN_API}/package_show", params={"id": package_id}
        )
        resp.raise_for_status()
        data = resp.json()
        if not data.get("success"):
            raise ValueError(f"CKAN error: {data.get('error')}")
        return data["result"]


async def list_all_packages(limit: int = 1000) -> List[str]:
    """Return all package IDs from the portal."""
    async with httpx.AsyncClient(timeout=30, headers=HEADERS) as client:
        resp = await client.get(
            f"{CKAN_API}/package_list", params={"limit": limit}
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("result", [])


async def get_resource_data(resource_url: str) -> Optional[bytes]:
    """Download raw bytes from a CKAN resource URL."""
    try:
        async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
            resp = await client.get(resource_url)
            resp.raise_for_status()
            return resp.content
    except Exception as e:
        logger.warning(f"Failed to download resource {resource_url}: {e}")
        return None


def parse_ckan_package_to_tender_dict(pkg: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map a raw CKAN package dict to the fields expected by the Tender model.
    This is a best-effort mapping; data quality on data.gov.pk varies widely.
    """
    # Extract extras as a flat dict
    extras: Dict[str, str] = {
        e["key"]: e["value"] for e in pkg.get("extras", [])
    }

    # Try to parse a deadline date from various fields
    deadline_raw = (
        extras.get("submission_deadline")
        or extras.get("deadline")
        or extras.get("closing_date")
        or pkg.get("metadata_modified")
    )
    deadline = _try_parse_date(deadline_raw)

    published_raw = (
        pkg.get("metadata_created")
        or pkg.get("metadata_modified")
    )
    published = _try_parse_date(published_raw)

    # Collect all resource download URLs
    resources = pkg.get("resources", [])
    source_url = resources[0]["url"] if resources else None

    # Try to extract estimated value
    value_raw = (
        extras.get("estimated_value")
        or extras.get("contract_value")
        or extras.get("budget")
        or ""
    )
    value_pkr = _parse_numeric_value(value_raw)

    # Build description from notes + extras
    description = pkg.get("notes") or ""
    if extras.get("eligibility"):
        description += f"\n\nEligibility: {extras['eligibility']}"

    return {
        "ckan_id": pkg["id"],
        "ckan_package_id": pkg["id"],
        "source_url": source_url or f"{settings.CKAN_BASE_URL}/dataset/{pkg.get('name', pkg['id'])}",
        "title": pkg.get("title") or pkg.get("name", "Untitled Tender"),
        "issuing_authority": (
            pkg.get("organization", {}).get("title")
            or extras.get("issuing_authority")
            or extras.get("procuring_agency")
            or "Government of Pakistan"
        ),
        "reference_number": extras.get("reference_number") or extras.get("tender_no") or "",
        "description": description,
        "eligibility_criteria": extras.get("eligibility") or "",
        "estimated_value_raw": value_raw,
        "estimated_value_pkr": value_pkr,
        "currency": extras.get("currency", "PKR"),
        "published_date": published,
        "submission_deadline": deadline,
        "status": "active",
        "raw_ckan_data": pkg,
    }


def _try_parse_date(raw: Optional[str]) -> Optional[datetime]:
    if not raw:
        return None
    formats = [
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d %B %Y",
        "%B %d, %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(raw[:26], fmt)
        except (ValueError, TypeError):
            continue
    return None


def _parse_numeric_value(raw: str) -> Optional[float]:
    """Extract a numeric PKR value from a raw string like 'PKR 5,000,000'."""
    if not raw:
        return None
    import re
    cleaned = re.sub(r"[^\d.]", "", raw.replace(",", ""))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


async def fetch_all_procurement_tenders(max_pages: int = 10) -> List[Dict[str, Any]]:
    """
    Paginate through all procurement-related packages and return
    a list of normalized tender dicts ready for DB insertion.
    """
    all_tenders: List[Dict[str, Any]] = []
    rows_per_page = 100

    for keyword in PROCUREMENT_KEYWORDS[:4]:  # limit to top 4 terms to avoid duplicate
        for page in range(max_pages):
            try:
                result = await search_procurement_packages(
                    query=keyword,
                    rows=rows_per_page,
                    start=page * rows_per_page,
                )
                packages = result.get("results", [])
                if not packages:
                    break
                for pkg in packages:
                    tender = parse_ckan_package_to_tender_dict(pkg)
                    all_tenders.append(tender)
                if len(packages) < rows_per_page:
                    break
                await asyncio.sleep(0.5)  # be polite to the API
            except Exception as e:
                logger.error(f"CKAN fetch error (keyword={keyword}, page={page}): {e}")
                break

    # Deduplicate by ckan_id
    seen = set()
    unique_tenders = []
    for t in all_tenders:
        if t["ckan_id"] not in seen:
            seen.add(t["ckan_id"])
            unique_tenders.append(t)

    logger.info(f"CKAN: fetched {len(unique_tenders)} unique tender packages")
    return unique_tenders
