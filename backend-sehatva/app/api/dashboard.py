from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.caregiver import Caregiver
from app.models.medicine import Medicine, MedicineLog
from app.models.report import MedicalReport
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.recovery_service import get_active_plan
from app.services.medicine_service import ensure_todays_logs

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_todays_logs(db, current_user.id)
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)

    todays_logs = (
        db.query(MedicineLog)
        .filter(MedicineLog.user_id == current_user.id, MedicineLog.scheduled_time >= start, MedicineLog.scheduled_time < end)
        .all()
    )
    missed = sum(1 for log in todays_logs if log.status == "missed")

    upcoming_log = (
        db.query(MedicineLog)
        .filter(MedicineLog.user_id == current_user.id, MedicineLog.status == "pending", MedicineLog.scheduled_time >= now)
        .order_by(MedicineLog.scheduled_time.asc())
        .first()
    )
    upcoming_medicine = upcoming_log.medicine if upcoming_log else None

    plan = get_active_plan(db, current_user.id)
    recovery_pct = 0
    if plan:
        total_tasks = len(plan.tasks) or 1
        completed_tasks = sum(1 for t in plan.tasks if t.status == "completed")
        recovery_pct = round(100 * completed_tasks / total_tasks)

    next_appt = (
        db.query(Appointment)
        .filter(Appointment.user_id == current_user.id, Appointment.status == "upcoming", Appointment.appointment_date >= date.today())
        .order_by(Appointment.appointment_date.asc())
        .first()
    )
    next_follow_up_days = (next_appt.appointment_date - date.today()).days if next_appt else None

    caregiver_count = db.query(Caregiver).filter(Caregiver.user_id == current_user.id, Caregiver.status == "active").count()

    latest_report = (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == current_user.id, MedicalReport.status == "completed")
        .order_by(MedicalReport.created_at.desc())
        .first()
    )
    recent_insight = None
    if latest_report and latest_report.ai_summary:
        recent_insight = (
            latest_report.ai_summary.get("plain_language_summary")
            or latest_report.ai_summary.get("summary")
        )

    total_today = len(todays_logs) or 1
    taken_today = sum(1 for log in todays_logs if log.status == "taken")
    adherence_pct = round(100 * taken_today / total_today)
    ai_health_score = round(0.6 * adherence_pct + 0.4 * recovery_pct)

    return DashboardResponse(
        ai_health_score=ai_health_score,
        recovery_progress_pct=recovery_pct,
        todays_medicines_count=len(todays_logs),
        upcoming_medicine=upcoming_medicine,
        missed_medicines_count=missed,
        next_follow_up_days=next_follow_up_days,
        caregiver_count=caregiver_count,
        recent_ai_insight=recent_insight,
    )
