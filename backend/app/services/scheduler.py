"""
APScheduler setup — runs inside the FastAPI process.

Jobs:
- sync_job: Syncs match data from football-data.org
  - Every 5 min during active matchdays
  - Every 6 hours during idle periods
- daily_ranking_job: Sends Telegram ranking at 10:00 AM UTC daily
- lock_checker_job: Checks and locks predictions approaching kickoff (every 15 min)
"""

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.core.scoring import recalculate_all_scores
from app.db.session import async_session_factory
from app.models.match import Match, MatchStatus
from app.models.score import UserScore
from app.models.user import User
from app.services.football_api import check_and_lock_predictions, sync_all
from app.services.telegram import send_daily_ranking

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def _has_active_matchday() -> bool:
    async with async_session_factory() as session:
        result = await session.execute(
            select(Match).where(Match.status == MatchStatus.LIVE).limit(1)
        )
        return result.scalar_one_or_none() is not None


async def sync_job() -> None:
    logger.info("Running scheduled sync job.")
    async with async_session_factory() as session:
        await sync_all(session)
        await recalculate_all_scores(session)


async def daily_ranking_job() -> None:
    logger.info("Sending daily ranking via Telegram.")
    async with async_session_factory() as session:
        result = await session.execute(
            select(UserScore, User)
            .join(User, UserScore.user_id == User.id)
            .order_by(UserScore.rank.asc())
        )
        rows = result.all()
        leaderboard = [
            {
                "rank": score.rank,
                "display_name": user.display_name,
                "total_points": score.total_points,
            }
            for score, user in rows
        ]
    await send_daily_ranking(leaderboard)


async def lock_checker_job() -> None:
    logger.info("Running prediction lock checker.")
    async with async_session_factory() as session:
        await check_and_lock_predictions(session)


def start_scheduler() -> None:
    # Sync job: every 6 hours by default (reschedule to 5 min if live matches detected)
    scheduler.add_job(
        sync_job,
        "interval",
        hours=6,
        id="sync_job",
        replace_existing=True,
        next_run_time=datetime.now(timezone.utc),
    )

    # Daily ranking at 10:00 AM UTC
    scheduler.add_job(
        daily_ranking_job,
        "cron",
        hour=10,
        minute=0,
        id="daily_ranking_job",
        replace_existing=True,
    )

    # Lock checker every 15 minutes
    scheduler.add_job(
        lock_checker_job,
        "interval",
        minutes=15,
        id="lock_checker_job",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started with 3 jobs.")


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped.")
