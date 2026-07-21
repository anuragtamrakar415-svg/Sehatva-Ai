from typing import Optional

from pydantic import BaseModel


class CaregiverCreate(BaseModel):
    name: str
    relation: Optional[str] = None
    phone: str
    email: Optional[str] = None


class CaregiverUpdate(BaseModel):
    name: Optional[str] = None
    relation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None


class CaregiverOut(BaseModel):
    id: str
    name: str
    relation: Optional[str] = None
    phone: str
    email: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
