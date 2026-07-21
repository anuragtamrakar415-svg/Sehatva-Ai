from datetime import date, time
from typing import Optional

from sqlalchemy import Date, ForeignKey, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, gen_uuid


class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)

    doctor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    purpose: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    appointment_date: Mapped[date] = mapped_column(Date)
    appointment_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="upcoming")  # upcoming | completed | cancelled
    reminder_sent: Mapped[bool] = mapped_column(default=False)
    source: Mapped[str] = mapped_column(String(20), default="manual")  # manual | ai_detected
