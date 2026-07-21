from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class MedicineCreate(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: str = "morning"  # comma separated: morning,afternoon,evening,night
    food_relation: str = "after_food"
    stock: int = 0
    low_stock_threshold: int = 5
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    food_relation: Optional[str] = None
    stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class MedicineOut(BaseModel):
    id: str
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: str
    food_relation: str
    stock: int
    low_stock_threshold: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class MedicineLogOut(BaseModel):
    id: str
    medicine_id: str
    scheduled_time: datetime
    taken_time: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


class MedicineLogUpdate(BaseModel):
    status: str = Field(pattern="^(taken|missed|pending)$")
