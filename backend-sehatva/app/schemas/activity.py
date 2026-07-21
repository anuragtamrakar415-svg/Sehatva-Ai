from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ActivityLogOut(BaseModel):
    id: str
    action: str
    details: Optional[dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
