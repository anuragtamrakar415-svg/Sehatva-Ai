from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsUpdate(BaseModel):
    language: str | None = None
    dark_mode: bool | None = None


@router.get("")
def get_settings_(current_user: User = Depends(get_current_user)):
    return {"language": current_user.profile.language, "dark_mode": current_user.profile.dark_mode}


@router.put("")
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.language is not None:
        current_user.profile.language = payload.language
    if payload.dark_mode is not None:
        current_user.profile.dark_mode = payload.dark_mode
    db.commit()
    return {"language": current_user.profile.language, "dark_mode": current_user.profile.dark_mode}
