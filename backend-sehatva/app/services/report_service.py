import re
from datetime import date, datetime, timedelta, timezone

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.ai.gemini_client import GeminiNotConfiguredError, GeminiRequestError, generate_json
from app.ai.prompts import (
    DISCHARGE_SUMMARY_PROMPT,
    DISCHARGE_SUMMARY_SYSTEM,
    REPORT_EXPLAINER_PROMPT,
    REPORT_EXPLAINER_SYSTEM,
)
from app.models.activity import ActivityLog
from app.models.appointment import Appointment
from app.models.medicine import Medicine
from app.models.report import MedicalReport
from app.services.medicine_service import ensure_todays_logs
from app.utils.file_upload import classify_file_type, mime_type_for, save_upload
from app.utils.text_extract import extract_text_from_docx, extract_text_from_pdf

_NUMBER_WORDS = {
    "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}


def _parse_follow_up_date(text: str | None) -> date | None:
    """Best-effort parse of a natural-language follow-up date like 'Within 2 weeks',
    'after 10 days', or an ISO date, into an actual date. Returns None if it can't."""
    if not text:
        return None
    text = text.strip().lower()

    # Try a straight ISO / common date format first.
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%B %d, %Y", "%b %d, %Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            pass

    match = re.search(r"(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s*(day|week|month)s?", text)
    if not match:
        return None
    qty_raw, unit = match.groups()
    qty = int(qty_raw) if qty_raw.isdigit() else _NUMBER_WORDS.get(qty_raw, 1)
    days = qty if unit == "day" else qty * 7 if unit == "week" else qty * 30
    return date.today() + timedelta(days=days)


def _create_medicines_from_ai(db: Session, user_id: str, medicines: list[dict]) -> None:
    for med in medicines or []:
        name = (med or {}).get("name")
        if not name:
            continue
        db.add(
            Medicine(
                user_id=user_id,
                name=name,
                dosage=med.get("dosage"),
                frequency=med.get("frequency"),
                start_date=date.today(),
                notes="Auto-added from AI discharge summary scan.",
            )
        )


def _create_followup_from_ai(db: Session, user_id: str, follow_up_date: str | None, doctor: str | None) -> None:
    parsed_date = _parse_follow_up_date(follow_up_date)
    if not parsed_date:
        return
    db.add(
        Appointment(
            user_id=user_id,
            doctor_name=doctor,
            purpose="Follow-up (from discharge summary)",
            appointment_date=parsed_date,
            status="upcoming",
            source="ai_detected",
        )
    )

_NOT_CONFIGURED_NOTE = (
    "AI analysis is not available right now (the AI assistant isn't configured or is "
    "temporarily unreachable), so this is a generic placeholder, not a real reading of your "
    "document. Please review the original file yourself and consult your doctor for anything "
    "important."
)


def _discharge_summary_fallback() -> dict:
    return {
        "diagnosis": None,
        "disease": None,
        "surgery": None,
        "medicines": [],
        "lifestyle_advice": ["Follow the instructions on your original discharge document."],
        "diet_restrictions": [],
        "emergency_warning_signs": [
            "Seek immediate medical attention for severe pain, high fever, breathlessness, or heavy bleeding.",
        ],
        "follow_up_date": None,
        "follow_up_doctor": None,
        "important_notes": [_NOT_CONFIGURED_NOTE],
        "plain_language_summary": _NOT_CONFIGURED_NOTE,
    }


def _report_explainer_fallback() -> dict:
    return {
        "summary": _NOT_CONFIGURED_NOTE,
        "abnormal_values": [],
        "important_findings": [],
        "lifestyle_suggestions": [],
        "doctor_consultation_advice": "Please share this report with your doctor for a proper reading.",
    }


async def analyze_discharge_summary(db: Session, user_id: str, file: UploadFile, language: str = "English") -> MedicalReport:
    path, raw_bytes = save_upload(file, subfolder="discharge_summaries")
    file_type = classify_file_type(file.filename or "")

    local_text = ""
    if file_type == "pdf":
        local_text = extract_text_from_pdf(raw_bytes)
    elif file_type == "docx":
        local_text = extract_text_from_docx(raw_bytes)

    report = MedicalReport(
        user_id=user_id,
        report_type="discharge_summary",
        file_path=path,
        file_type=file_type,
        raw_text=local_text or None,
        status="processing",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    prompt = DISCHARGE_SUMMARY_PROMPT.format(
        language=language,
        document_text=local_text or "(no extracted text — read directly from the attached file)",
    )

    try:
        inline_file = None
        if file_type in ("image", "pdf"):
            inline_file = (raw_bytes, mime_type_for(file.filename or ""))
        result = await generate_json(
            prompt, system_instruction=DISCHARGE_SUMMARY_SYSTEM, inline_file=inline_file
        )
        report.ai_summary = result
        _create_medicines_from_ai(db, user_id, result.get("medicines", []))
        _create_followup_from_ai(db, user_id, result.get("follow_up_date"), result.get("follow_up_doctor"))
    except (GeminiNotConfiguredError, GeminiRequestError) as exc:
        print("🔴 DISCHARGE SUMMARY GEMINI ERROR:", repr(exc))
        report.ai_summary = _discharge_summary_fallback()
    report.status = "completed"

    db.add(ActivityLog(user_id=user_id, action="discharge_summary_analyzed", details={"report_id": report.id}))
    db.commit()
    db.refresh(report)
    ensure_todays_logs(db, user_id)
    return report


async def explain_medical_report(db: Session, user_id: str, report_subtype: str, raw_text: str, language: str = "English") -> MedicalReport:
    report = MedicalReport(
        user_id=user_id,
        report_type="lab_report",
        report_subtype=report_subtype,
        raw_text=raw_text,
        status="processing",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    prompt = REPORT_EXPLAINER_PROMPT.format(report_subtype=report_subtype, language=language, report_text=raw_text)

    try:
        result = await generate_json(prompt, system_instruction=REPORT_EXPLAINER_SYSTEM)
        report.ai_summary = result
    except (GeminiNotConfiguredError, GeminiRequestError):
        report.ai_summary = _report_explainer_fallback()
    report.status = "completed"

    db.add(ActivityLog(user_id=user_id, action="health_report_explained", details={"report_id": report.id}))
    db.commit()
    db.refresh(report)
    return report