from datetime import date, datetime
from typing import Optional

from sqlalchemy import JSON, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, gen_uuid


class RecoveryPlan(Base, TimestampMixin):
    __tablename__ = "recovery_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    source_report_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("medical_reports.id"), nullable=True)

    diagnosis: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    surgery: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date] = mapped_column(Date)
    total_days: Mapped[int] = mapped_column(default=30)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | completed | paused

    recovery_score: Mapped[int] = mapped_column(default=0)
    recovery_xp: Mapped[int] = mapped_column(default=0)
    recovery_level: Mapped[int] = mapped_column(default=1)
    daily_streak: Mapped[int] = mapped_column(default=0)

    tasks: Mapped[list["RecoveryTask"]] = relationship(back_populates="plan", cascade="all, delete-orphan")


class RecoveryTask(Base, TimestampMixin):
    __tablename__ = "recovery_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    recovery_plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("recovery_plans.id"), index=True)

    day_start: Mapped[int] = mapped_column()
    day_end: Mapped[int] = mapped_column()
    stage_label: Mapped[str] = mapped_column(String(50))  # e.g. "Day 1-3", "Week 2", "Month 1"
    category: Mapped[str] = mapped_column(String(30))  # medicine | activity | water | sleep | doctor_visit | dressing
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="upcoming")  # upcoming | in_progress | completed

    plan: Mapped["RecoveryPlan"] = relationship(back_populates="tasks")


class Badge(Base, TimestampMixin):
    __tablename__ = "badges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    badge_key: Mapped[str] = mapped_column(String(50))  # medicine_master | hydration_hero | ...
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
