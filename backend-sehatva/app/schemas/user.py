from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class EmergencyContactIn(BaseModel):
    name: str
    relation: Optional[str] = None
    phone: str


class EmergencyContactOut(EmergencyContactIn):
    id: str

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=100)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=100)


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileOut(BaseModel):
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    avatar_url: Optional[str] = None
    language: str = "en"
    dark_mode: bool = False
    emergency_contacts: list[EmergencyContactOut] = []

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    avatar_url: Optional[str] = None


class MeResponse(BaseModel):
    user: UserOut
    profile: ProfileOut
