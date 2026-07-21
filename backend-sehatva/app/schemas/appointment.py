from datetime import date, time
from typing import Optional

from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    doctor_name: Optional[str] = None
    purpose: Optional[str] = None
    appointment_date: date
    appointment_time: Optional[time] = None
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    doctor_name: Optional[str] = None
    purpose: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class AppointmentOut(BaseModel):
    id: str
    doctor_name: Optional[str] = None
    purpose: Optional[str] = None
    appointment_date: date
    appointment_time: Optional[time] = None
    notes: Optional[str] = None
    status: str
    source: str

    class Config:
        from_attributes = True
