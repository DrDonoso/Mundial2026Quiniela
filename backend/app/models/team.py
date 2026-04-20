from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDMixin


class Team(Base, UUIDMixin):
    __tablename__ = "teams"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(3), nullable=False)
    flag_url: Mapped[str] = mapped_column(String(500), nullable=True, default="")
    api_external_id: Mapped[int | None] = mapped_column(Integer, nullable=True, unique=True)
