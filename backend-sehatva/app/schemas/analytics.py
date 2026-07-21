from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    daily_medicine_adherence_pct: int
    weekly_recovery_pct: int
    monthly_progress_pct: int
    recovery_score: int
    medicine_adherence_pct: int
    health_score: int
