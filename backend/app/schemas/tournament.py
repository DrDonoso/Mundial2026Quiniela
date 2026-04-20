import uuid
from datetime import datetime

from pydantic import BaseModel


class TeamResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    flag_url: str | None

    model_config = {"from_attributes": True}


class GroupTeamResponse(BaseModel):
    team: TeamResponse
    final_position: int | None

    model_config = {"from_attributes": True}


class GroupResponse(BaseModel):
    id: uuid.UUID
    letter: str
    teams: list[GroupTeamResponse] = []

    model_config = {"from_attributes": True}


class MatchResponse(BaseModel):
    id: uuid.UUID
    stage: str
    group_id: uuid.UUID | None
    matchday: int
    home_team_id: uuid.UUID | None
    away_team_id: uuid.UUID | None
    home_score: int | None
    away_score: int | None
    winner_team_id: uuid.UUID | None
    match_datetime: datetime
    status: str

    model_config = {"from_attributes": True}
