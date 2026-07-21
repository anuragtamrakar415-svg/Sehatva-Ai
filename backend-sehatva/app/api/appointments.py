from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentUpdate

router = APIRouter(prefix="/appointments", tags=["Follow-up Management"])


@router.get("", response_model=list[AppointmentOut])
def list_appointments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Appointment)
        .filter(Appointment.user_id == current_user.id)
        .order_by(Appointment.appointment_date.asc())
        .all()
    )


@router.get("/next", response_model=AppointmentOut)
def next_appointment(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import date

    appt = (
        db.query(Appointment)
        .filter(
            Appointment.user_id == current_user.id,
            Appointment.status == "upcoming",
            Appointment.appointment_date >= date.today(),
        )
        .order_by(Appointment.appointment_date.asc())
        .first()
    )
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No upcoming follow-up")
    return appt


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    appt = Appointment(user_id=current_user.id, **payload.model_dump())
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.put("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: str,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id, Appointment.user_id == current_user.id)
        .first()
    )
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    appt = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id, Appointment.user_id == current_user.id)
        .first()
    )
    if appt:
        db.delete(appt)
        db.commit()
    return {"success": True}
