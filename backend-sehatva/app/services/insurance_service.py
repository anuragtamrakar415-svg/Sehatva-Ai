from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai.gemini_client import GeminiNotConfiguredError, GeminiRequestError, generate_json
from app.ai.prompts import INSURANCE_ASSISTANT_PROMPT, INSURANCE_ASSISTANT_SYSTEM
from app.models.insurance import InsuranceClaim
from app.schemas.insurance import InsuranceSuggestRequest

FALLBACK_DOCUMENTS = [
    "Aadhaar Card", "PAN Card", "Hospital Bills", "Pharmacy Bills",
    "Discharge Summary", "Bank Passbook", "Doctor Certificate",
]
FALLBACK_SCHEMES = [
    {"name": "PM-JAY (Ayushman Bharat)", "eligibility_note": "Check eligibility on the official PM-JAY portal based on your family's SECC data."},
    {"name": "State Health Scheme", "eligibility_note": "Varies by state — check your state health department website."},
    {"name": "CGHS", "eligibility_note": "Applicable to central government employees/pensioners and dependents."},
]
FALLBACK_CHECKLIST = [
    "Collect all original hospital bills and receipts",
    "Get discharge summary signed and stamped by hospital",
    "Verify policy/scheme number and beneficiary ID",
    "Submit claim within the insurer's/scheme's claim window",
]


async def suggest_insurance(db: Session, user_id: str, payload: InsuranceSuggestRequest) -> InsuranceClaim:
    claim = InsuranceClaim(
        user_id=user_id,
        report_id=payload.report_id,
        diagnosis=payload.diagnosis,
        surgery=payload.surgery,
        status="draft",
    )

    try:
        prompt = INSURANCE_ASSISTANT_PROMPT.format(
            diagnosis=payload.diagnosis or "not specified",
            surgery=payload.surgery or "not specified",
        )
        result = await generate_json(prompt, system_instruction=INSURANCE_ASSISTANT_SYSTEM)
        claim.required_documents = result.get("required_documents", FALLBACK_DOCUMENTS)
        claim.government_schemes = result.get("government_schemes", FALLBACK_SCHEMES)
        claim.claim_checklist = result.get("claim_checklist", FALLBACK_CHECKLIST)
        claim.estimated_coverage_note = result.get(
            "estimated_coverage_note",
            "This is informational only. Confirm exact coverage with your insurer/hospital TPA desk.",
        )
    except (GeminiNotConfiguredError, GeminiRequestError):
        claim.required_documents = FALLBACK_DOCUMENTS
        claim.government_schemes = FALLBACK_SCHEMES
        claim.claim_checklist = FALLBACK_CHECKLIST
        claim.estimated_coverage_note = (
            "AI assistant is not configured (missing GEMINI_API_KEY), showing general guidance. "
            "This is informational only — confirm with your insurer/hospital TPA desk."
        )

    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim
