"""
AI Service – processes tender documents using Anthropic Claude.

For each tender this service:
  1. Extracts structured key information
  2. Generates a short summary (≤150 words)
  3. Generates a detailed SME-focused analysis
  4. Identifies sector / industry tags
  5. Extracts eligibility criteria and deadlines
  6. Generates SME insights and opportunity score (0–100)
  7. Flags high-value opportunities
"""

import json
import logging
from typing import Any, Dict, List, Optional

import anthropic

from app.config import settings
from app.models.sector import SECTOR_TAXONOMY

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SECTOR_LIST = "\n".join(
    f"  - {s['code']}: {s['name']}" for s in SECTOR_TAXONOMY
)

# ── Prompts ───────────────────────────────────────────────────────────────────

EXTRACTION_PROMPT = """You are an expert Government Procurement Analyst specialising in Pakistan's public sector tendering landscape (PPRA regulations, government procurement rules).

You will analyse the following tender/procurement document and return a structured JSON response.

TENDER DATA:
Title: {title}
Issuing Authority: {issuing_authority}
Description: {description}
Eligibility: {eligibility}
Reference No: {reference_number}
Published: {published_date}
Submission Deadline: {submission_deadline}

Respond ONLY with a valid JSON object (no markdown, no explanation) with the following fields:

{{
  "sector_code": "<one of the sector codes below>",
  "industry_tags": ["<tag1>", "<tag2>", ...],
  "ai_summary_short": "<concise summary in 100-150 words, SME-friendly, jargon-free>",
  "ai_summary_detailed": "<detailed 400-600 word analysis covering: what is being procured, who can bid, key requirements, risks, opportunities, and strategic advice for Pakistani SMEs>",
  "sme_insights": "<3-5 practical bullet points as a single string, separated by \\n, advising SMEs on how to approach this tender>",
  "key_requirements": ["<req1>", "<req2>", ...],
  "eligibility_summary": "<clear plain-English eligibility summary>",
  "submission_details": "<what documents are needed and how to submit>",
  "opportunity_score": <integer 0-100 representing how attractive this is for a Pakistani SME>,
  "is_high_value": <true if estimated value > PKR 10 million or strategically important>,
  "opportunity_score_rationale": "<one sentence explaining the score>",
  "estimated_contract_duration": "<e.g. 6 months, 1 year, or null if unknown>",
  "issuing_authority_type": "<federal|provincial|local|soe>"
}}

Available sector codes:
{sector_list}

Opportunity score guide:
  90-100: Exceptional – large contract, clear specs, SME-friendly criteria
  70-89:  High – good opportunity, manageable requirements
  50-69:  Medium – viable but competitive or complex
  30-49:  Low – very competitive, heavy requirements, or vague specs
  0-29:   Very low – unsuitable for most SMEs"""


async def analyse_tender(tender_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a tender to Claude for analysis and return enriched fields.
    Returns a dict with all AI-generated fields.
    """
    prompt = EXTRACTION_PROMPT.format(
        title=tender_data.get("title", ""),
        issuing_authority=tender_data.get("issuing_authority", ""),
        description=tender_data.get("description", "")[:4000],  # cap tokens
        eligibility=tender_data.get("eligibility_criteria", ""),
        reference_number=tender_data.get("reference_number", ""),
        published_date=tender_data.get("published_date", ""),
        submission_deadline=tender_data.get("submission_deadline", ""),
        sector_list=SECTOR_LIST,
    )

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = message.content[0].text.strip()

        # Strip any accidental markdown fences
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]

        result = json.loads(raw_text)

        # Validate / clamp opportunity score
        score = float(result.get("opportunity_score", 50))
        score = max(0, min(100, score))

        return {
            "sector_code": result.get("sector_code", "OTHER"),
            "industry_tags": result.get("industry_tags", []),
            "ai_summary_short": result.get("ai_summary_short", ""),
            "ai_summary_detailed": result.get("ai_summary_detailed", ""),
            "sme_insights": result.get("sme_insights", ""),
            "eligibility_criteria": result.get("eligibility_summary", ""),
            "opportunity_score": score,
            "is_high_value": bool(result.get("is_high_value", False)),
            "issuing_authority_type": result.get("issuing_authority_type", "federal"),
            "ai_processed": True,
        }

    except json.JSONDecodeError as e:
        logger.error(f"Claude returned invalid JSON for tender '{tender_data.get('title')}': {e}")
        return _fallback_analysis(tender_data)
    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        return _fallback_analysis(tender_data)


def _fallback_analysis(tender_data: Dict[str, Any]) -> Dict[str, Any]:
    """Minimal fallback if AI call fails."""
    return {
        "sector_code": "OTHER",
        "industry_tags": [],
        "ai_summary_short": tender_data.get("description", "")[:300],
        "ai_summary_detailed": tender_data.get("description", ""),
        "sme_insights": "AI analysis unavailable. Please review the original document.",
        "eligibility_criteria": tender_data.get("eligibility_criteria", ""),
        "opportunity_score": 50.0,
        "is_high_value": False,
        "issuing_authority_type": "federal",
        "ai_processed": False,
    }


async def generate_weekly_digest(tenders: List[Dict[str, Any]], user_name: str) -> str:
    """
    Generate a personalised weekly digest narrative using Claude.
    `tenders` is a list of tender dicts with AI summaries already populated.
    """
    tender_summaries = "\n\n".join(
        f"**{i+1}. {t['title']}**\n"
        f"Sector: {t.get('sector_name', 'N/A')} | "
        f"Deadline: {t.get('submission_deadline', 'N/A')} | "
        f"Score: {t.get('opportunity_score', 'N/A')}/100\n"
        f"{t.get('ai_summary_short', '')}"
        for i, t in enumerate(tenders[:10])
    )

    prompt = (
        f"You are TenderIQ, Pakistan's leading procurement intelligence platform.\n\n"
        f"Write a professional weekly tender digest email body for {user_name}.\n"
        f"The digest should highlight the top opportunities, provide market commentary, "
        f"and close with a motivating call to action for SMEs.\n\n"
        f"This week's top tenders:\n\n{tender_summaries}\n\n"
        f"Format: professional email body text, no markdown headers, 300-400 words total."
    )

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except Exception as e:
        logger.error(f"Weekly digest generation failed: {e}")
        return f"This week we identified {len(tenders)} new procurement opportunities for you."
