import uuid

from sqlalchemy import CHAR, ForeignKey, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDMixin


class Group(Base, UUIDMixin):
    __tablename__ = "groups"

    letter: Mapped[str] = mapped_column(CHAR(1), unique=True, nullable=False)

    teams = relationship("GroupTeam", back_populates="group", lazy="selectin")


class GroupTeam(Base, UUIDMixin):
    __tablename__ = "group_teams"

    group_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("groups.id"), nullable=False)
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id"), nullable=False)
    final_position: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    group = relationship("Group", back_populates="teams")
    team = relationship("Team")
