import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.group import Group
from app.models.match import Match, MatchStage, MatchStatus
from app.models.team import Team
from app.models.user import User
from app.schemas.tournament import GroupResponse, MatchResponse, TeamResponse

router = APIRouter(prefix="/tournament", tags=["tournament"])


@router.get("/teams", response_model=list[TeamResponse])
async def list_teams(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(select(Team).order_by(Team.name))
    return result.scalars().all()


@router.get("/groups", response_model=list[GroupResponse])
async def list_groups(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(Group).options(selectinload(Group.teams)).order_by(Group.letter)
    )
    return result.scalars().all()


@router.get("/groups/{group_id}", response_model=GroupResponse)
async def get_group(
    group_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(Group).options(selectinload(Group.teams)).where(Group.id == group_id)
    )
    group = result.scalar_one_or_none()
    if group is None:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return group


@router.get("/matches", response_model=list[MatchResponse])
async def list_matches(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    stage: MatchStage | None = Query(None),
    matchday: int | None = Query(None),
    match_status: MatchStatus | None = Query(None, alias="status"),
):
    stmt = select(Match).order_by(Match.match_datetime)
    if stage is not None:
        stmt = stmt.where(Match.stage == stage)
    if matchday is not None:
        stmt = stmt.where(Match.matchday == matchday)
    if match_status is not None:
        stmt = stmt.where(Match.status == match_status)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/matches/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if match is None:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return match
