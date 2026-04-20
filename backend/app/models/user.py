import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    invite_token_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("invite_tokens.id"), nullable=True
    )

    invite_token = relationship("InviteToken", foreign_keys=[invite_token_id])
    score = relationship("UserScore", back_populates="user", uselist=False)
