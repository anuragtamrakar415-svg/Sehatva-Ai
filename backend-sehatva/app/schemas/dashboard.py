from typing import Optional

from pydantic import BaseModel

from app.schemas.medicine import MedicineOut


class DashboardResponse(BaseModel):
    ai_health_score: int
    recovery_progress_pct: int
    todays_medicines_count: int
    upcoming_medicine: Optional[MedicineOut] = None
    missed_medicines_count: int
    next_follow_up_days: Optional[int] = None
    caregiver_count: int
    recent_ai_insight: Optional[str] = None
