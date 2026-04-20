from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_invite_token,
    hash_password,
    verify_password,
)
from app.models.invite_token import InviteToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    body: RegisterRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    # Validate invite token
    token_hash = hash_invite_token(body.invite_token)
    result = await session.execute(
        select(InviteToken).where(
            InviteToken.token_hash == token_hash,
            InviteToken.used_by.is_(None),
        )
    )
    invite = result.scalar_one_or_none()
    if invite is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or already used invite token")
    if invite.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token has expired")

    # Check username uniqueness
    existing = await session.execute(
        select(User).where(User.username == body.username)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(
        username=body.username,
        display_name=body.display_name,
        password_hash=hash_password(body.password),
        invite_token_id=invite.id,
    )
    session.add(user)

    invite.used_by = user.id
    invite.used_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(user)
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    body: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(User).where(User.username == body.username)
    )
    user = result.scalar_one_or_none()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("5/minute")
async def refresh(
    request: Request,
    body: RefreshRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    payload = decode_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
