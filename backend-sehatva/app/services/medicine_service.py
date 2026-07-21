from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.ai.gemini_client import GeminiNotConfiguredError, GeminiRequestError, generate_text
from app.ai.prompts import MEDICINE_EXPLAINER_PROMPT, MEDICINE_EXPLAINER_SYSTEM
from app.models.medicine import Medicine, MedicineLog

# Default clock time for each timing slot, used when generating today's dose schedule.
_SLOT_HOURS = {"morning": 8, "afternoon": 13, "evening": 18, "night": 21}


def ensure_todays_logs(db: Session, user_id: str) -> None:
    """
    Lazily creates today's MedicineLog rows for every active medicine that doesn't
    already have one for each of its timing slots today. Nothing else in this
    codebase generates these rows (no scheduler/cron), so this must be called
    before any read of "today's medicines" (dashboard, medicines page) and right
    after a medicine is created/updated so the schedule shows up immediately.
    """
    today = date.today()
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)

    medicines = (
        db.query(Medicine)
        .filter(
            Medicine.user_id == user_id,
            Medicine.is_active.is_(True),
            (Medicine.start_date.is_(None)) | (Medicine.start_date <= today),
            (Medicine.end_date.is_(None)) | (Medicine.end_date >= today),
        )
        .all()
    )
    if not medicines:
        return

    existing = (
        db.query(MedicineLog)
        .filter(MedicineLog.user_id == user_id, MedicineLog.scheduled_time >= start, MedicineLog.scheduled_time < end)
        .all()
    )
    existing_medicine_hours = {(log.medicine_id, log.scheduled_time.hour) for log in existing}

    created = False
    for medicine in medicines:
        slots = [s.strip().lower() for s in (medicine.timing or "morning").split(",") if s.strip()]
        for slot in slots:
            hour = _SLOT_HOURS.get(slot, 8)
            if (medicine.id, hour) in existing_medicine_hours:
                continue
            scheduled_time = start.replace(hour=hour)
            db.add(
                MedicineLog(
                    medicine_id=medicine.id,
                    user_id=user_id,
                    scheduled_time=scheduled_time,
                    status="pending",
                )
            )
            created = True

    if created:
        db.commit()


async def explain_medicine(name: str, dosage: str | None = None, language: str = "English") -> str:
    dosage_clause = f" ({dosage})" if dosage else ""
    prompt = MEDICINE_EXPLAINER_PROMPT.format(name=name, dosage_clause=dosage_clause, language=language)
    try:
        return await generate_text(prompt, system_instruction=MEDICINE_EXPLAINER_SYSTEM)
    except (GeminiNotConfiguredError, GeminiRequestError):
        return (
            f"AI explanations aren't available right now (the AI assistant isn't configured or is "
            f"temporarily unreachable), so here's general guidance only: take {name} exactly as your "
            f"doctor or pharmacist prescribed, at the same time(s) each day, and ask them directly about "
            f"its purpose, food timing, and any side effects to watch for."
        )
