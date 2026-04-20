import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    invite_token: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    display_name: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}
