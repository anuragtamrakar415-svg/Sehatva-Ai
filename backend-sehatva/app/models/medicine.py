from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, gen_uuid


class Medicine(Base, TimestampMixin):
    __tablename__ = "medicines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)

    name: Mapped[str] = mapped_column(String(150))
    dosage: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g. "650mg"
    frequency: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g. "twice a day"
    timing: Mapped[str] = mapped_column(String(200), default="morning")  # csv: morning,afternoon,evening,night
    food_relation: Mapped[str] = mapped_column(String(20), default="after_food")  # before_food | after_food
    stock: Mapped[int] = mapped_column(default=0)
    low_stock_threshold: Mapped[int] = mapped_column(default=5)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)

    logs: Mapped[list["MedicineLog"]] = relationship(back_populates="medicine", cascade="all, delete-orphan")


class MedicineLog(Base, TimestampMixin):
    __tablename__ = "medicine_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    medicine_id: Mapped[str] = mapped_column(String(36), ForeignKey("medicines.id"), index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)

    scheduled_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    taken_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | taken | missed

    medicine: Mapped["Medicine"] = relationship(back_populates="logs")
