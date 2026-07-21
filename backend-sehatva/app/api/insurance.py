from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.insurance import InsuranceClaim
from app.models.user import User
from app.schemas.insurance import InsuranceClaimOut, InsuranceSuggestRequest
from app.services.insurance_service import suggest_insurance

router = APIRouter(prefix="/insurance", tags=["Insurance Assistant"])


@router.post("/suggest", response_model=InsuranceClaimOut)
async def suggest(
    payload: InsuranceSuggestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await suggest_insurance(db, current_user.id, payload)


@router.get("", response_model=list[InsuranceClaimOut])
def list_claims(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(InsuranceClaim)
        .filter(InsuranceClaim.user_id == current_user.id)
        .order_by(InsuranceClaim.created_at.desc())
        .all()
    )
