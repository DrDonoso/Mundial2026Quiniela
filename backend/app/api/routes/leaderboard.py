from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.score import UserScore
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, UserScoreDetail

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(UserScore, User)
        .join(User, UserScore.user_id == User.id)
        .order_by(UserScore.rank.asc())
    )
    rows = result.all()
    return [
        LeaderboardEntry(
            user_id=score.user_id,
            username=user.username,
            display_name=user.display_name,
            pre_tournament_points=score.pre_tournament_points,
            group_stage_points=score.group_stage_points,
            knockout_points=score.knockout_points,
            total_points=score.total_points,
            rank=score.rank,
        )
        for score, user in rows
    ]


@router.get("/me", response_model=UserScoreDetail)
async def get_my_score(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(UserScore).where(UserScore.user_id == current_user.id)
    )
    score = result.scalar_one_or_none()
    if score is None:
        return UserScoreDetail(
            user_id=current_user.id,
            pre_tournament_points=0,
            group_stage_points=0,
            knockout_points=0,
            total_points=0,
            rank=0,
            last_calculated_at=current_user.created_at,
        )
    return score


@router.get("/history")
async def get_score_history(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    # Score history snapshots would require a separate table (daily snapshots).
    # For now, return the current state as a single-entry list.
    result = await session.execute(
        select(UserScore).where(UserScore.user_id == current_user.id)
    )
    score = result.scalar_one_or_none()
    if score is None:
        return []
    return [
        {
            "date": score.last_calculated_at.isoformat(),
            "total_points": score.total_points,
            "rank": score.rank,
        }
    ]
