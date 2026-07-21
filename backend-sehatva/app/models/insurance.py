from typing import Optional

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, gen_uuid


class InsuranceClaim(Base, TimestampMixin):
    __tablename__ = "insurance_claims"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    report_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("medical_reports.id"), nullable=True)

    diagnosis: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    surgery: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    required_documents: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    government_schemes: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    claim_checklist: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    estimated_coverage_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft | in_progress | submitted | approved
