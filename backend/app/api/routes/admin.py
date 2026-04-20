import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, require_admin
from app.core.scoring import recalculate_all_scores
from app.core.security import generate_invite_token, hash_invite_token
from app.models.invite_token import InviteToken
from app.models.user import User
from app.services.football_api import sync_all

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Schemas local to admin
# ---------------------------------------------------------------------------

class InviteCreateRequest(BaseModel):
    expires_in_days: int = 7


class InviteCreateResponse(BaseModel):
    id: uuid.UUID
    token: str  # plaintext, shown once
    created_by: uuid.UUID
    created_by_username: str
    used_by: uuid.UUID | None = None
    used_by_username: str | None = None
    used_at: datetime | None = None
    expires_at: datetime
    created_at: datetime


class InviteListItem(BaseModel):
    id: uuid.UUID
    token: str
    created_by: uuid.UUID
    created_by_username: str
    used_by: uuid.UUID | None
    used_by_username: str | None
    used_at: datetime | None
    expires_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Invite CRUD
# ---------------------------------------------------------------------------

@router.post("/invites", response_model=InviteCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_invite(
    body: InviteCreateRequest,
    admin: Annotated[User, Depends(require_admin)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    raw_token = generate_invite_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=body.expires_in_days)
    invite = InviteToken(
        token_hash=hash_invite_token(raw_token),
        created_by=admin.id,
        expires_at=expires_at,
    )
    session.add(invite)
    await session.commit()
    await session.refresh(invite)
    return InviteCreateResponse(
        id=invite.id,
        token=raw_token,
        created_by=admin.id,
        created_by_username=admin.username,
        used_by=None,
        used_by_username=None,
        used_at=None,
        expires_at=invite.expires_at,
        created_at=invite.created_at,
    )


@router.get("/invites", response_model=list[InviteListItem])
async def list_invites(
    admin: Annotated[User, Depends(require_admin)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(InviteToken)
        .options(selectinload(InviteToken.creator), selectinload(InviteToken.used_by_user))
        .order_by(InviteToken.created_at.desc())
    )
    invites = result.scalars().all()
    return [
        InviteListItem(
            id=inv.id,
            token=inv.token_hash[:8] + "...",
            created_by=inv.created_by,
            created_by_username=inv.creator.username if inv.creator else "unknown",
            used_by=inv.used_by,
            used_by_username=inv.used_by_user.username if inv.used_by_user else None,
            used_at=inv.used_at,
            expires_at=inv.expires_at,
            created_at=inv.created_at,
        )
        for inv in invites
    ]


@router.delete("/invites/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_invite(
    invite_id: uuid.UUID,
    admin: Annotated[User, Depends(require_admin)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(InviteToken).where(InviteToken.id == invite_id)
    )
    invite = result.scalar_one_or_none()
    if invite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    if invite.used_by is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot revoke a used invite")
    await session.delete(invite)
    await session.commit()


# ---------------------------------------------------------------------------
# Manual triggers
# ---------------------------------------------------------------------------

@router.post("/sync", status_code=status.HTTP_200_OK)
async def trigger_sync(
    admin: Annotated[User, Depends(require_admin)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    await sync_all(session)
    return {"detail": "Sync completed"}


@router.post("/recalculate", status_code=status.HTTP_200_OK)
async def trigger_recalculate(
    admin: Annotated[User, Depends(require_admin)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    scores = await recalculate_all_scores(session)
    return {"detail": f"Recalculated scores for {len(scores)} users"}
