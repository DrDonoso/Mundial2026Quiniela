import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, SmallInteger, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDMixin, TimestampMixin


class PreTournamentType(str, enum.Enum):
    CHAMPION = "champion"
    MOST_GOALS_SCORED = "most_goals_scored"
    MOST_GOALS_CONCEDED = "most_goals_conceded"
    MOST_RED_CARDS = "most_red_cards"


class PreTournamentPrediction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "pre_tournament_predictions"
    __table_args__ = (
        UniqueConstraint("user_id", "prediction_type", name="uq_pre_tournament_user_type"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    prediction_type: Mapped[PreTournamentType] = mapped_column(
        Enum(PreTournamentType, native_enum=False), nullable=False
    )
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id"), nullable=False)
    locked: Mapped[bool] = mapped_column(Boolean, default=False)

    user = relationship("User")
    team = relationship("Team")


class GroupStagePrediction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "group_stage_predictions"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "group_id", "predicted_position",
            name="uq_group_stage_user_group_position",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    group_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("groups.id"), nullable=False)
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id"), nullable=False)
    predicted_position: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    locked: Mapped[bool] = mapped_column(Boolean, default=False)

    user = relationship("User")
    group = relationship("Group")
    team = relationship("Team")


class KnockoutPrediction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "knockout_predictions"
    __table_args__ = (
        UniqueConstraint("user_id", "match_id", name="uq_knockout_user_match"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    match_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("matches.id"), nullable=False)
    predicted_winner_team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id"), nullable=False
    )
    locked: Mapped[bool] = mapped_column(Boolean, default=False)

    user = relationship("User")
    match = relationship("Match")
    predicted_winner = relationship("Team")
