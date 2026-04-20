import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, async_session_factory
from app.models import *  # noqa: F401,F403 — ensure all models registered

logger = logging.getLogger(__name__)


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_admin() -> None:
    from app.models.user import User

    async with async_session_factory() as session:
        session: AsyncSession
        result = await session.execute(
            select(User).where(User.username == settings.ADMIN_USERNAME)
        )
        admin = result.scalar_one_or_none()
        if admin is None:
            admin = User(
                username=settings.ADMIN_USERNAME,
                display_name="Admin",
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                is_admin=True,
            )
            session.add(admin)
            await session.commit()
            logger.info("Admin user created: %s", settings.ADMIN_USERNAME)
        else:
            logger.info("Admin user already exists.")


async def init_db() -> None:
    await create_tables()
    await seed_admin()
