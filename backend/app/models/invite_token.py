import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDMixin, TimestampMixin


def _default_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=7)


class InviteToken(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "invite_tokens"

    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    used_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_default_expires_at
    )

    creator = relationship("User", foreign_keys=[created_by])
    used_by_user = relationship("User", foreign_keys=[used_by])
