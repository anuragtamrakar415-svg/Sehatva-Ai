from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.user import EmergencyContact, User
from app.schemas.user import (
    EmergencyContactIn,
    EmergencyContactOut,
    MeResponse,
    ProfileUpdateRequest,
)

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=MeResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return MeResponse(user=current_user, profile=current_user.profile)


@router.put("", response_model=MeResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name

    profile = current_user.profile
    for field in ("age", "weight_kg", "height_cm", "blood_group", "date_of_birth", "allergies", "medical_history", "avatar_url"):
        value = getattr(payload, field)
        if value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(current_user)
    return MeResponse(user=current_user, profile=current_user.profile)


@router.post("/emergency-contacts", response_model=EmergencyContactOut, status_code=201)
def add_emergency_contact(
    payload: EmergencyContactIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = EmergencyContact(profile_id=current_user.profile.id, **payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/emergency-contacts/{contact_id}")
def delete_emergency_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.profile_id == current_user.profile.id)
        .first()
    )
    if contact:
        db.delete(contact)
        db.commit()
    return {"success": True}
