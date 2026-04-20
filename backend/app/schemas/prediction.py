import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Pre-tournament
# ---------------------------------------------------------------------------

class PreTournamentPick(BaseModel):
    prediction_type: str
    team_id: uuid.UUID


class PreTournamentPredictionCreate(BaseModel):
    picks: list[PreTournamentPick] = Field(..., min_length=1, max_length=4)


class PreTournamentPredictionResponse(BaseModel):
    id: uuid.UUID
    prediction_type: str
    team_id: uuid.UUID
    locked: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Group stage
# ---------------------------------------------------------------------------

class GroupStagePick(BaseModel):
    team_id: uuid.UUID
    predicted_position: int = Field(..., ge=1, le=2)


class GroupStagePredictionCreate(BaseModel):
    picks: list[GroupStagePick] = Field(..., min_length=1, max_length=2)


class GroupStagePredictionResponse(BaseModel):
    id: uuid.UUID
    group_id: uuid.UUID
    team_id: uuid.UUID
    predicted_position: int
    locked: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Knockout
# ---------------------------------------------------------------------------

class KnockoutPredictionCreate(BaseModel):
    predicted_winner_team_id: uuid.UUID


class KnockoutPredictionResponse(BaseModel):
    id: uuid.UUID
    match_id: uuid.UUID
    predicted_winner_team_id: uuid.UUID
    locked: bool
    created_at: datetime

    model_config = {"from_attributes": True}
