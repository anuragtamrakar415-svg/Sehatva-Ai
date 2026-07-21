from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class RecoveryTaskOut(BaseModel):
    id: str
    day_start: int
    day_end: int
    stage_label: str
    category: str
    title: str
    description: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class RecoveryPlanOut(BaseModel):
    id: str
    diagnosis: Optional[str] = None
    surgery: Optional[str] = None
    start_date: date
    total_days: int
    status: str
    recovery_score: int
    recovery_xp: int
    recovery_level: int
    daily_streak: int
    tasks: list[RecoveryTaskOut] = []

    class Config:
        from_attributes = True


class RecoveryGenerateRequest(BaseModel):
    diagnosis: Optional[str] = None
    surgery: Optional[str] = None
    source_report_id: Optional[str] = None
    total_days: int = 30


class RecoveryTaskStatusUpdate(BaseModel):
    status: str


class BadgeOut(BaseModel):
    id: str
    badge_key: str
    earned_at: datetime

    class Config:
        from_attributes = True
