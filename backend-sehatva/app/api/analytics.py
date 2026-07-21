from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.medicine import MedicineLog
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse
from app.services.recovery_service import get_active_plan

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)

    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    day_logs = db.query(MedicineLog).filter(
        MedicineLog.user_id == current_user.id, MedicineLog.scheduled_time >= day_start
    ).all()
    daily_pct = round(100 * sum(1 for log in day_logs if log.status == "taken") / (len(day_logs) or 1))

    week_start = now - timedelta(days=7)
    week_logs = db.query(MedicineLog).filter(
        MedicineLog.user_id == current_user.id, MedicineLog.scheduled_time >= week_start
    ).all()
    weekly_adherence = round(100 * sum(1 for log in week_logs if log.status == "taken") / (len(week_logs) or 1))

    plan = get_active_plan(db, current_user.id)
    recovery_pct = 0
    if plan:
        total_tasks = len(plan.tasks) or 1
        completed_tasks = sum(1 for t in plan.tasks if t.status == "completed")
        recovery_pct = round(100 * completed_tasks / total_tasks)

    month_start = now - timedelta(days=30)
    month_logs = db.query(MedicineLog).filter(
        MedicineLog.user_id == current_user.id, MedicineLog.scheduled_time >= month_start
    ).all()
    monthly_pct = round(100 * sum(1 for log in month_logs if log.status == "taken") / (len(month_logs) or 1))

    health_score = round(0.6 * monthly_pct + 0.4 * recovery_pct)

    return AnalyticsResponse(
        daily_medicine_adherence_pct=daily_pct,
        weekly_recovery_pct=weekly_adherence,
        monthly_progress_pct=monthly_pct,
        recovery_score=plan.recovery_score if plan else 0,
        medicine_adherence_pct=monthly_pct,
        health_score=health_score,
    )
