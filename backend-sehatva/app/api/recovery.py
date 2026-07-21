from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.recovery import Badge, RecoveryPlan
from app.models.user import User
from app.schemas.recovery import (
    BadgeOut,
    RecoveryGenerateRequest,
    RecoveryPlanOut,
    RecoveryTaskStatusUpdate,
)
from app.services.recovery_service import generate_recovery_plan, get_active_plan, update_task_status

router = APIRouter(prefix="/recovery", tags=["Recovery Roadmap"])


@router.post("/generate", response_model=RecoveryPlanOut)
async def generate_plan(
    payload: RecoveryGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = get_active_plan(db, current_user.id)
    if existing:
        existing.status = "paused"
        db.commit()
    return await generate_recovery_plan(db, current_user.id, payload)


@router.get("/active", response_model=RecoveryPlanOut)
def active_plan(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = get_active_plan(db, current_user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active recovery plan yet")
    return plan


@router.patch("/tasks/{task_id}", response_model=RecoveryPlanOut)
def update_task(
    task_id: str,
    payload: RecoveryTaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = update_task_status(db, current_user.id, task_id, payload.status)
    return task.plan


@router.get("/badges", response_model=list[BadgeOut])
def list_badges(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Badge).filter(Badge.user_id == current_user.id).order_by(Badge.earned_at.desc()).all()
