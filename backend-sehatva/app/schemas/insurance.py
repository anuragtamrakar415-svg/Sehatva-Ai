from typing import Any, Optional

from pydantic import BaseModel


class InsuranceSuggestRequest(BaseModel):
    diagnosis: Optional[str] = None
    surgery: Optional[str] = None
    report_id: Optional[str] = None


class InsuranceClaimOut(BaseModel):
    id: str
    diagnosis: Optional[str] = None
    surgery: Optional[str] = None
    required_documents: Optional[list[Any]] = None
    government_schemes: Optional[list[Any]] = None
    claim_checklist: Optional[list[Any]] = None
    estimated_coverage_note: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
