from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class MedicalReportOut(BaseModel):
    id: str
    report_type: str
    report_subtype: Optional[str] = None
    file_type: Optional[str] = None
    ai_summary: Optional[dict[str, Any]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportExplainRequest(BaseModel):
    report_subtype: str  # CBC | blood_sugar | lipid_profile | liver_function | kidney_function | vitamin
    raw_text: str
