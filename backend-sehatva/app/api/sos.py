from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.activity import ActivityLog
from app.models.caregiver import Caregiver
from app.models.notification import Notification
from app.models.sos import SosLog
from app.models.user import User
from app.schemas.sos import SosLogOut, SosTriggerRequest

router = APIRouter(prefix="/sos", tags=["Emergency SOS"])


@router.post("/trigger", response_model=SosLogOut, status_code=201)
def trigger_sos(
    payload: SosTriggerRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    caregivers = db.query(Caregiver).filter(Caregiver.user_id == current_user.id, Caregiver.status == "active").all()

    sos_log = SosLog(
        user_id=current_user.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        notes=payload.notes,
        caregiver_notified=bool(caregivers),
    )
    db.add(sos_log)

    for cg in caregivers:
        db.add(
            Notification(
                user_id=current_user.id,
                type="sos",
                title="Emergency SOS triggered",
                message=f"{current_user.name} triggered an emergency SOS. Caregiver to notify: {cg.name} ({cg.phone}).",
            )
        )

    db.add(ActivityLog(user_id=current_user.id, action="sos_triggered", details={"caregivers_notified": len(caregivers)}))
    db.commit()
    db.refresh(sos_log)
    return sos_log


@router.get("/history", response_model=list[SosLogOut])
def sos_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SosLog).filter(SosLog.user_id == current_user.id).order_by(SosLog.created_at.desc()).all()


@router.post("/{sos_id}/resolve", response_model=SosLogOut)
def resolve_sos(sos_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from fastapi import HTTPException, status

    sos_log = db.query(SosLog).filter(SosLog.id == sos_id, SosLog.user_id == current_user.id).first()
    if not sos_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS log not found")
    sos_log.status = "resolved"
    db.commit()
    db.refresh(sos_log)
    return sos_log
