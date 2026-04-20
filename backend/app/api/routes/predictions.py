import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.match import Match, MatchStage
from app.models.prediction import (
    GroupStagePrediction,
    KnockoutPrediction,
    PreTournamentPrediction,
    PreTournamentType,
)
from app.models.user import User
from app.schemas.prediction import (
    GroupStagePredictionCreate,
    GroupStagePredictionResponse,
    KnockoutPredictionCreate,
    KnockoutPredictionResponse,
    PreTournamentPredictionCreate,
    PreTournamentPredictionResponse,
)

router = APIRouter(prefix="/predictions", tags=["predictions"])


# ---------------------------------------------------------------------------
# Pre-tournament
# ---------------------------------------------------------------------------

@router.get("/pre-tournament", response_model=list[PreTournamentPredictionResponse])
async def get_pre_tournament(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(PreTournamentPrediction).where(
            PreTournamentPrediction.user_id == current_user.id
        )
    )
    return result.scalars().all()


@router.put("/pre-tournament", response_model=list[PreTournamentPredictionResponse])
async def update_pre_tournament(
    body: PreTournamentPredictionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    # Check if any existing prediction is locked
    result = await session.execute(
        select(PreTournamentPrediction).where(
            PreTournamentPrediction.user_id == current_user.id,
            PreTournamentPrediction.locked.is_(True),
        )
    )
    if result.scalars().first() is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pre-tournament predictions are locked",
        )

    # Validate prediction types
    seen_types: set[str] = set()
    for pick in body.picks:
        if pick.prediction_type not in {e.value for e in PreTournamentType}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid prediction type: {pick.prediction_type}",
            )
        if pick.prediction_type in seen_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate prediction type: {pick.prediction_type}",
            )
        seen_types.add(pick.prediction_type)

    # Upsert predictions
    for pick in body.picks:
        result = await session.execute(
            select(PreTournamentPrediction).where(
                PreTournamentPrediction.user_id == current_user.id,
                PreTournamentPrediction.prediction_type == pick.prediction_type,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.team_id = pick.team_id
        else:
            session.add(PreTournamentPrediction(
                user_id=current_user.id,
                prediction_type=PreTournamentType(pick.prediction_type),
                team_id=pick.team_id,
            ))

    await session.commit()

    # Return all
    result = await session.execute(
        select(PreTournamentPrediction).where(
            PreTournamentPrediction.user_id == current_user.id
        )
    )
    return result.scalars().all()


# ---------------------------------------------------------------------------
# Group stage
# ---------------------------------------------------------------------------

@router.get("/groups", response_model=list[GroupStagePredictionResponse])
async def get_group_predictions(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(GroupStagePrediction).where(
            GroupStagePrediction.user_id == current_user.id
        )
    )
    return result.scalars().all()


@router.put("/groups/{group_id}", response_model=list[GroupStagePredictionResponse])
async def update_group_prediction(
    group_id: uuid.UUID,
    body: GroupStagePredictionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    # Check lock
    result = await session.execute(
        select(GroupStagePrediction).where(
            GroupStagePrediction.user_id == current_user.id,
            GroupStagePrediction.group_id == group_id,
            GroupStagePrediction.locked.is_(True),
        )
    )
    if result.scalars().first() is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Predictions for this group are locked",
        )

    # Validate: no duplicate positions
    positions = [p.predicted_position for p in body.picks]
    if len(positions) != len(set(positions)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate predicted positions",
        )

    # Upsert
    for pick in body.picks:
        result = await session.execute(
            select(GroupStagePrediction).where(
                GroupStagePrediction.user_id == current_user.id,
                GroupStagePrediction.group_id == group_id,
                GroupStagePrediction.predicted_position == pick.predicted_position,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.team_id = pick.team_id
        else:
            session.add(GroupStagePrediction(
                user_id=current_user.id,
                group_id=group_id,
                team_id=pick.team_id,
                predicted_position=pick.predicted_position,
            ))

    await session.commit()

    result = await session.execute(
        select(GroupStagePrediction).where(
            GroupStagePrediction.user_id == current_user.id,
            GroupStagePrediction.group_id == group_id,
        )
    )
    return result.scalars().all()


# ---------------------------------------------------------------------------
# Knockout
# ---------------------------------------------------------------------------

@router.get("/knockout", response_model=list[KnockoutPredictionResponse])
async def get_knockout_predictions(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    result = await session.execute(
        select(KnockoutPrediction).where(
            KnockoutPrediction.user_id == current_user.id
        )
    )
    return result.scalars().all()


@router.put("/knockout/{match_id}", response_model=KnockoutPredictionResponse)
async def update_knockout_prediction(
    match_id: uuid.UUID,
    body: KnockoutPredictionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    # Verify match exists and is knockout
    result = await session.execute(
        select(Match).where(Match.id == match_id)
    )
    match = result.scalar_one_or_none()
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    if match.stage == MatchStage.GROUP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot predict winner for group stage matches",
        )

    # Check lock
    result = await session.execute(
        select(KnockoutPrediction).where(
            KnockoutPrediction.user_id == current_user.id,
            KnockoutPrediction.match_id == match_id,
            KnockoutPrediction.locked.is_(True),
        )
    )
    if result.scalars().first() is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Prediction for this match is locked",
        )

    # Validate predicted winner is one of the match's teams
    valid_teams = {match.home_team_id, match.away_team_id} - {None}
    if body.predicted_winner_team_id not in valid_teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Predicted winner must be one of the match's teams",
        )

    # Upsert
    result = await session.execute(
        select(KnockoutPrediction).where(
            KnockoutPrediction.user_id == current_user.id,
            KnockoutPrediction.match_id == match_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.predicted_winner_team_id = body.predicted_winner_team_id
    else:
        existing = KnockoutPrediction(
            user_id=current_user.id,
            match_id=match_id,
            predicted_winner_team_id=body.predicted_winner_team_id,
        )
        session.add(existing)

    await session.commit()
    await session.refresh(existing)
    return existing
