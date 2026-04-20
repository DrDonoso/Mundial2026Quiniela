import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDMixin


class MatchStage(str, enum.Enum):
    GROUP = "group"
    ROUND_OF_32 = "round_of_32"
    ROUND_OF_16 = "round_of_16"
    QUARTER_FINAL = "quarter_final"
    SEMI_FINAL = "semi_final"
    THIRD_PLACE = "third_place"
    FINAL = "final"


class MatchStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    FINISHED = "finished"


class Match(Base, UUIDMixin):
    __tablename__ = "matches"

    stage: Mapped[MatchStage] = mapped_column(Enum(MatchStage, native_enum=False), nullable=False)
    group_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("groups.id"), nullable=True)
    matchday: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)
    home_team_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id"), nullable=True)
    away_team_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id"), nullable=True)
    home_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    away_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    winner_team_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id"), nullable=True)
    match_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus, native_enum=False), nullable=False, default=MatchStatus.SCHEDULED
    )
    api_external_id: Mapped[int | None] = mapped_column(Integer, nullable=True, unique=True)

    group = relationship("Group")
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    winner_team = relationship("Team", foreign_keys=[winner_team_id])
