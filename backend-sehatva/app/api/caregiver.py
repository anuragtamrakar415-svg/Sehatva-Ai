from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.caregiver import Caregiver
from app.models.medicine import MedicineLog
from app.models.recovery import RecoveryPlan
from app.models.sos import SosLog
from app.models.user import User
from app.schemas.caregiver import CaregiverCreate, CaregiverOut, CaregiverUpdate
from app.services.recovery_service import get_active_plan

router = APIRouter(prefix="/caregivers", tags=["Caregiver"])


@router.get("", response_model=list[CaregiverOut])
def list_caregivers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Caregiver).filter(Caregiver.user_id == current_user.id).all()


@router.post("", response_model=CaregiverOut, status_code=status.HTTP_201_CREATED)
def add_caregiver(
    payload: CaregiverCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    caregiver = Caregiver(user_id=current_user.id, **payload.model_dump())
    db.add(caregiver)
    db.commit()
    db.refresh(caregiver)
    return caregiver


@router.put("/{caregiver_id}", response_model=CaregiverOut)
def update_caregiver(
    caregiver_id: str,
    payload: CaregiverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    caregiver = (
        db.query(Caregiver).filter(Caregiver.id == caregiver_id, Caregiver.user_id == current_user.id).first()
    )
    if not caregiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(caregiver, field, value)
    db.commit()
    db.refresh(caregiver)
    return caregiver


@router.delete("/{caregiver_id}")
def delete_caregiver(
    caregiver_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    caregiver = (
        db.query(Caregiver).filter(Caregiver.id == caregiver_id, Caregiver.user_id == current_user.id).first()
    )
    if caregiver:
        db.delete(caregiver)
        db.commit()
    return {"success": True}


@router.get("/dashboard")
def caregiver_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Summary view for the Caregiver Dashboard module (medicine %, recovery %,
    missed meds, SOS history, patient status, next appointment)."""
    logs = db.query(MedicineLog).filter(MedicineLog.user_id == current_user.id).all()
    total = len(logs) or 1
    taken = sum(1 for log in logs if log.status == "taken")
    missed = [log for log in logs if log.status == "missed"]

    plan = get_active_plan(db, current_user.id)
    recovery_pct = 0
    if plan:
        total_tasks = len(plan.tasks) or 1
        completed_tasks = sum(1 for t in plan.tasks if t.status == "completed")
        recovery_pct = round(100 * completed_tasks / total_tasks)

    sos_logs = (
        db.query(SosLog).filter(SosLog.user_id == current_user.id).order_by(SosLog.created_at.desc()).limit(10).all()
    )

    return {
        "medicine_taken_pct": round(100 * taken / total),
        "recovery_pct": recovery_pct,
        "missed_medicines_count": len(missed),
        "sos_history_count": len(sos_logs),
        "patient_status": "stable" if len(missed) < 3 else "needs_attention",
    }
