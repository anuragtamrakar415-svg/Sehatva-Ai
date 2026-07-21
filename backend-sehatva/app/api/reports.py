from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.report import MedicalReport
from app.models.user import User
from app.schemas.report import MedicalReportOut, ReportExplainRequest
from app.services.report_service import analyze_discharge_summary, explain_medical_report

router = APIRouter(prefix="/reports", tags=["AI Reports"])


@router.post("/discharge-summary/analyze", response_model=MedicalReportOut)
async def analyze_discharge_summary_route(
    file: UploadFile = File(...),
    language: str = Form("English"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analyze_discharge_summary(db, current_user.id, file, language)


@router.post("/explain", response_model=MedicalReportOut)
async def explain_report_route(
    payload: ReportExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await explain_medical_report(db, current_user.id, payload.report_subtype, payload.raw_text)


@router.get("", response_model=list[MedicalReportOut])
def list_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == current_user.id)
        .order_by(MedicalReport.created_at.desc())
        .all()
    )


@router.get("/{report_id}", response_model=MedicalReportOut)
def get_report(report_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from fastapi import HTTPException, status

    report = (
        db.query(MedicalReport)
        .filter(MedicalReport.id == report_id, MedicalReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report
