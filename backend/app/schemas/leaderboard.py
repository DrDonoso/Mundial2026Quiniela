import uuid
from datetime import datetime

from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    user_id: uuid.UUID
    username: str
    display_name: str
    pre_tournament_points: int
    group_stage_points: int
    knockout_points: int
    total_points: int
    rank: int

    model_config = {"from_attributes": True}


class UserScoreDetail(BaseModel):
    user_id: uuid.UUID
    pre_tournament_points: int
    group_stage_points: int
    knockout_points: int
    total_points: int
    rank: int
    last_calculated_at: datetime

    model_config = {"from_attributes": True}


class ScoreHistoryEntry(BaseModel):
    date: datetime
    total_points: int
    rank: int
