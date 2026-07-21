from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai.gemini_client import GeminiNotConfiguredError, GeminiRequestError, generate_json
from app.ai.prompts import RECOVERY_ROADMAP_PROMPT, RECOVERY_ROADMAP_SYSTEM
from app.models.recovery import RecoveryPlan, RecoveryTask
from app.schemas.recovery import RecoveryGenerateRequest

# Generic fallback roadmap used if Gemini is not configured, so the roadmap
# screen is still demoable without an API key.
FALLBACK_STAGES = [
    {
        "day_start": 1, "day_end": 3, "stage_label": "Day 1 - 3",
        "tasks": [
            {"category": "medicine", "title": "Take prescribed medicines", "description": "Take all prescribed medicines on time and rest well."},
            {"category": "sleep", "title": "Prioritise rest", "description": "Get plenty of sleep and avoid overexertion."},
        ],
    },
    {
        "day_start": 4, "day_end": 7, "stage_label": "Day 4 - 7",
        "tasks": [
            {"category": "activity", "title": "Light walking", "description": "Walk for 10-15 minutes in the morning."},
            {"category": "water", "title": "Stay hydrated", "description": "Drink at least 8 glasses of water a day."},
        ],
    },
    {
        "day_start": 8, "day_end": 14, "stage_label": "Day 8 - 14",
        "tasks": [
            {"category": "activity", "title": "Increase physical activity", "description": "Gradually do light physical activities as tolerated."},
            {"category": "dressing", "title": "Wound/dressing care", "description": "Change dressing as advised and watch for infection."},
        ],
    },
    {
        "day_start": 15, "day_end": 21, "stage_label": "Day 15 - 21",
        "tasks": [
            {"category": "doctor_visit", "title": "Follow-up checkup", "description": "Visit your doctor for follow-up and evaluation."},
        ],
    },
    {
        "day_start": 22, "day_end": 30, "stage_label": "Day 22 - 30",
        "tasks": [
            {"category": "activity", "title": "Return to normal", "description": "Gradually return to your normal routine and stay healthy."},
        ],
    },
]


async def generate_recovery_plan(db: Session, user_id: str, payload: RecoveryGenerateRequest) -> RecoveryPlan:
    plan = RecoveryPlan(
        user_id=user_id,
        source_report_id=payload.source_report_id,
        diagnosis=payload.diagnosis,
        surgery=payload.surgery,
        start_date=date.today(),
        total_days=payload.total_days,
    )
    db.add(plan)
    db.flush()

    stages = None
    try:
        prompt = RECOVERY_ROADMAP_PROMPT.format(
            total_days=payload.total_days,
            diagnosis=payload.diagnosis or "not specified",
            surgery=payload.surgery or "not specified",
        )
        result = await generate_json(prompt, system_instruction=RECOVERY_ROADMAP_SYSTEM)
        stages = result.get("stages")
    except (GeminiNotConfiguredError, GeminiRequestError):
        stages = None  # fall back below

    if not stages:
        stages = FALLBACK_STAGES

    for stage in stages:
        for task in stage.get("tasks", []):
            db.add(
                RecoveryTask(
                    recovery_plan_id=plan.id,
                    day_start=stage["day_start"],
                    day_end=stage["day_end"],
                    stage_label=stage["stage_label"],
                    category=task.get("category", "activity"),
                    title=task.get("title", ""),
                    description=task.get("description"),
                    status="upcoming" if stage["day_start"] > 1 else "in_progress",
                )
            )

    db.commit()
    db.refresh(plan)
    return plan


def get_active_plan(db: Session, user_id: str) -> RecoveryPlan | None:
    return (
        db.query(RecoveryPlan)
        .filter(RecoveryPlan.user_id == user_id, RecoveryPlan.status == "active")
        .order_by(RecoveryPlan.created_at.desc())
        .first()
    )


def update_task_status(db: Session, user_id: str, task_id: str, new_status: str) -> RecoveryTask:
    task = (
        db.query(RecoveryTask)
        .join(RecoveryPlan)
        .filter(RecoveryTask.id == task_id, RecoveryPlan.user_id == user_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery task not found")

    task.status = new_status
    if new_status == "completed":
        task.plan.recovery_xp += 10
        task.plan.recovery_score = min(1000, task.plan.recovery_score + 15)
        task.plan.recovery_level = 1 + task.plan.recovery_xp // 100

    db.commit()
    db.refresh(task)
    return task
