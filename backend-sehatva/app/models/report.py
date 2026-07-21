from typing import Optional

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, gen_uuid


class MedicalReport(Base, TimestampMixin):
    __tablename__ = "medical_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)

    report_type: Mapped[str] = mapped_column(String(30))  # discharge_summary | lab_report
    report_subtype: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # CBC, blood_sugar, lipid...
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_type: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # pdf | image | docx
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    ai_summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="processing")  # processing | completed | failed
