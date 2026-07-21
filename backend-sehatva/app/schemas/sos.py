from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SosTriggerRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None


class SosLogOut(BaseModel):
    id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    caregiver_notified: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
