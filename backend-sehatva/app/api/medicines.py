from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.activity import ActivityLog
from app.models.medicine import Medicine, MedicineLog
from app.models.user import User
from app.schemas.medicine import (
    MedicineCreate,
    MedicineLogOut,
    MedicineLogUpdate,
    MedicineOut,
    MedicineUpdate,
)
from app.services.medicine_service import ensure_todays_logs, explain_medicine

router = APIRouter(prefix="/medicines", tags=["Medicines"])


def _get_owned_medicine(db: Session, medicine_id: str, user_id: str) -> Medicine:
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id, Medicine.user_id == user_id).first()
    if not medicine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")
    return medicine


@router.get("", response_model=list[MedicineOut])
def list_medicines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Medicine).filter(Medicine.user_id == current_user.id).order_by(Medicine.created_at.desc()).all()


@router.post("", response_model=MedicineOut, status_code=status.HTTP_201_CREATED)
def create_medicine(
    payload: MedicineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    medicine = Medicine(user_id=current_user.id, **payload.model_dump())
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    ensure_todays_logs(db, current_user.id)
    return medicine


@router.put("/{medicine_id}", response_model=MedicineOut)
def update_medicine(
    medicine_id: str,
    payload: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    medicine = _get_owned_medicine(db, medicine_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(medicine, field, value)
    db.commit()
    db.refresh(medicine)
    ensure_todays_logs(db, current_user.id)
    return medicine


@router.delete("/{medicine_id}")
def delete_medicine(
    medicine_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    medicine = _get_owned_medicine(db, medicine_id, current_user.id)
    db.delete(medicine)
    db.commit()
    return {"success": True}


@router.get("/{medicine_id}/history", response_model=list[MedicineLogOut])
def medicine_history(
    medicine_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    _get_owned_medicine(db, medicine_id, current_user.id)
    return (
        db.query(MedicineLog)
        .filter(MedicineLog.medicine_id == medicine_id, MedicineLog.user_id == current_user.id)
        .order_by(MedicineLog.scheduled_time.desc())
        .all()
    )


@router.post("/{medicine_id}/explain")
async def explain_medicine_route(
    medicine_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    medicine = _get_owned_medicine(db, medicine_id, current_user.id)
    explanation = await explain_medicine(medicine.name, medicine.dosage)
    return {"explanation": explanation}


@router.get("/logs/today", response_model=list[MedicineLogOut])
def todays_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_todays_logs(db, current_user.id)
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return (
        db.query(MedicineLog)
        .filter(
            MedicineLog.user_id == current_user.id,
            MedicineLog.scheduled_time >= start,
            MedicineLog.scheduled_time < end,
        )
        .order_by(MedicineLog.scheduled_time.asc())
        .all()
    )


@router.patch("/logs/{log_id}", response_model=MedicineLogOut)
def update_log_status(
    log_id: str,
    payload: MedicineLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.query(MedicineLog).filter(MedicineLog.id == log_id, MedicineLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log entry not found")

    log.status = payload.status
    if payload.status == "taken":
        log.taken_time = datetime.now(timezone.utc)
        if log.medicine.stock > 0:
            log.medicine.stock -= 1
        db.add(ActivityLog(user_id=current_user.id, action="medicine_taken", details={"medicine_id": log.medicine_id}))

    db.commit()
    db.refresh(log)
    return log
