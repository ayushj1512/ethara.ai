from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=7)
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = "India"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminPasswordResetRequest(BaseModel):
    new_password: str = Field(min_length=7)


class CustomerProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str | None = None
    address_line1: str = Field(min_length=3, max_length=180)
    address_line2: str | None = None
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(min_length=3, max_length=20)
    country: str = Field(min_length=2, max_length=80)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    postal_code: str | None
    country: str | None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SessionResponse(BaseModel):
    id: int
    device_info: str | None
    ip_address: str | None
    is_active: bool
    created_at: datetime
    last_activity_at: datetime
    expires_at: datetime

    model_config = {"from_attributes": True}
