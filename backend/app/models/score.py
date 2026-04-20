import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, _utcnow


class UserScore(Base):
    __tablename__ = "user_scores"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), primary_key=True
    )
    pre_tournament_points: Mapped[int] = mapped_column(SmallInteger, default=0)
    group_stage_points: Mapped[int] = mapped_column(SmallInteger, default=0)
    knockout_points: Mapped[int] = mapped_column(SmallInteger, default=0)
    total_points: Mapped[int] = mapped_column(SmallInteger, default=0)
    rank: Mapped[int] = mapped_column(SmallInteger, default=0)
    last_calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )

    user = relationship("User", back_populates="score")
