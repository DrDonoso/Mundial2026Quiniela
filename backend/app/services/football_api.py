"""
Client for football-data.org v4 API.
Handles syncing teams, matches, and standings into our database.
"""

import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.group import Group, GroupTeam
from app.models.match import Match, MatchStage, MatchStatus
from app.models.team import Team

logger = logging.getLogger(__name__)

COMPETITION_CODE = "WC"

STAGE_MAP: dict[str, MatchStage] = {
    "GROUP_STAGE": MatchStage.GROUP,
    "ROUND_OF_32": MatchStage.ROUND_OF_32,
    "LAST_16": MatchStage.ROUND_OF_16,
    "QUARTER_FINALS": MatchStage.QUARTER_FINAL,
    "SEMI_FINALS": MatchStage.SEMI_FINAL,
    "THIRD_PLACE": MatchStage.THIRD_PLACE,
    "FINAL": MatchStage.FINAL,
}

STATUS_MAP: dict[str, MatchStatus] = {
    "SCHEDULED": MatchStatus.SCHEDULED,
    "TIMED": MatchStatus.SCHEDULED,
    "IN_PLAY": MatchStatus.LIVE,
    "PAUSED": MatchStatus.LIVE,
    "FINISHED": MatchStatus.FINISHED,
}


def _get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=settings.FOOTBALL_API_BASE_URL,
        headers={"X-Auth-Token": settings.FOOTBALL_API_KEY},
        timeout=30.0,
        verify=settings.FOOTBALL_API_VERIFY_SSL,
    )


# ---------------------------------------------------------------------------
# Team sync
# ---------------------------------------------------------------------------

async def sync_teams(session: AsyncSession) -> None:
    async with _get_client() as client:
        resp = await client.get(f"/competitions/{COMPETITION_CODE}/teams")
        resp.raise_for_status()
        data = resp.json()

    for team_data in data.get("teams", []):
        ext_id = team_data["id"]
        result = await session.execute(
            select(Team).where(Team.api_external_id == ext_id)
        )
        team = result.scalar_one_or_none()
        if team is None:
            team = Team(
                name=team_data.get("name", ""),
                code=team_data.get("tla", "")[:3],
                flag_url=team_data.get("crest", ""),
                api_external_id=ext_id,
            )
            session.add(team)
        else:
            team.name = team_data.get("name", team.name)
            team.code = team_data.get("tla", team.code)[:3]
            team.flag_url = team_data.get("crest", team.flag_url)

    await session.commit()
    logger.info("Teams synced.")


# ---------------------------------------------------------------------------
# Match sync
# ---------------------------------------------------------------------------

async def sync_matches(session: AsyncSession) -> None:
    async with _get_client() as client:
        resp = await client.get(f"/competitions/{COMPETITION_CODE}/matches")
        resp.raise_for_status()
        data = resp.json()

    for m in data.get("matches", []):
        ext_id = m["id"]
        stage_str = m.get("stage", "")
        stage = STAGE_MAP.get(stage_str)
        if stage is None:
            continue

        status_str = m.get("status", "SCHEDULED")
        match_status = STATUS_MAP.get(status_str, MatchStatus.SCHEDULED)

        # Resolve team IDs
        home_ext = m.get("homeTeam", {}).get("id")
        away_ext = m.get("awayTeam", {}).get("id")

        home_team_id = None
        away_team_id = None
        if home_ext:
            r = await session.execute(select(Team.id).where(Team.api_external_id == home_ext))
            row = r.first()
            if row:
                home_team_id = row[0]
        if away_ext:
            r = await session.execute(select(Team.id).where(Team.api_external_id == away_ext))
            row = r.first()
            if row:
                away_team_id = row[0]

        # Resolve group
        group_letter = m.get("group", "")
        group_id = None
        if group_letter and stage == MatchStage.GROUP:
            letter = group_letter.replace("GROUP_", "")[-1]
            r = await session.execute(select(Group).where(Group.letter == letter))
            grp = r.scalar_one_or_none()
            if grp is None:
                grp = Group(letter=letter)
                session.add(grp)
                await session.flush()
            group_id = grp.id

        # Scores
        score_data = m.get("score", {}).get("fullTime", {})
        home_score = score_data.get("home")
        away_score = score_data.get("away")

        # Winner
        winner_str = m.get("score", {}).get("winner")
        winner_team_id = None
        if winner_str == "HOME_TEAM":
            winner_team_id = home_team_id
        elif winner_str == "AWAY_TEAM":
            winner_team_id = away_team_id

        match_dt_str = m.get("utcDate", "")
        try:
            match_dt = datetime.fromisoformat(match_dt_str.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            match_dt = datetime.now(timezone.utc)

        # Upsert
        result = await session.execute(
            select(Match).where(Match.api_external_id == ext_id)
        )
        match = result.scalar_one_or_none()
        if match is None:
            match = Match(
                stage=stage,
                group_id=group_id,
                matchday=m.get("matchday", 1),
                home_team_id=home_team_id,
                away_team_id=away_team_id,
                home_score=home_score,
                away_score=away_score,
                winner_team_id=winner_team_id,
                match_datetime=match_dt,
                status=match_status,
                api_external_id=ext_id,
            )
            session.add(match)
        else:
            match.home_team_id = home_team_id
            match.away_team_id = away_team_id
            match.home_score = home_score
            match.away_score = away_score
            match.winner_team_id = winner_team_id
            match.match_datetime = match_dt
            match.status = match_status

    await session.commit()
    logger.info("Matches synced.")


# ---------------------------------------------------------------------------
# Standings sync (group final positions)
# ---------------------------------------------------------------------------

async def sync_standings(session: AsyncSession) -> None:
    async with _get_client() as client:
        resp = await client.get(f"/competitions/{COMPETITION_CODE}/standings")
        resp.raise_for_status()
        data = resp.json()

    for standing in data.get("standings", []):
        if standing.get("type") != "TOTAL":
            continue
        group_letter = standing.get("group", "")
        letter = group_letter.replace("GROUP_", "")[-1] if group_letter else ""
        if not letter:
            continue

        r = await session.execute(select(Group).where(Group.letter == letter))
        grp = r.scalar_one_or_none()
        if grp is None:
            continue

        for entry in standing.get("table", []):
            position = entry.get("position")
            team_ext_id = entry.get("team", {}).get("id")
            if team_ext_id is None:
                continue

            r = await session.execute(select(Team).where(Team.api_external_id == team_ext_id))
            team = r.scalar_one_or_none()
            if team is None:
                continue

            # Upsert GroupTeam
            r = await session.execute(
                select(GroupTeam).where(
                    GroupTeam.group_id == grp.id,
                    GroupTeam.team_id == team.id,
                )
            )
            gt = r.scalar_one_or_none()
            if gt is None:
                gt = GroupTeam(group_id=grp.id, team_id=team.id, final_position=position)
                session.add(gt)
            else:
                gt.final_position = position

    await session.commit()
    logger.info("Standings synced.")


# ---------------------------------------------------------------------------
# Prediction locking
# ---------------------------------------------------------------------------

async def check_and_lock_predictions(session: AsyncSession) -> None:
    """Lock predictions whose associated matches start within 1 hour."""
    from datetime import timedelta
    from app.models.prediction import (
        GroupStagePrediction,
        KnockoutPrediction,
        PreTournamentPrediction,
    )

    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(hours=1)

    # Lock pre-tournament if the very first match is within 1 hour
    result = await session.execute(
        select(Match.match_datetime).order_by(Match.match_datetime.asc()).limit(1)
    )
    first_match_dt = result.scalar_one_or_none()
    if first_match_dt and first_match_dt <= cutoff:
        await session.execute(
            PreTournamentPrediction.__table__.update()
            .where(PreTournamentPrediction.locked.is_(False))
            .values(locked=True)
        )
        logger.info("Pre-tournament predictions locked.")

    # Lock group predictions per group (first match of that group within 1 hour)
    groups_result = await session.execute(select(Group))
    groups = groups_result.scalars().all()
    for grp in groups:
        r = await session.execute(
            select(Match.match_datetime)
            .where(Match.group_id == grp.id)
            .order_by(Match.match_datetime.asc())
            .limit(1)
        )
        first_group_match = r.scalar_one_or_none()
        if first_group_match and first_group_match <= cutoff:
            await session.execute(
                GroupStagePrediction.__table__.update()
                .where(
                    GroupStagePrediction.group_id == grp.id,
                    GroupStagePrediction.locked.is_(False),
                )
                .values(locked=True)
            )
            logger.info("Group %s predictions locked.", grp.letter)

    # Lock knockout predictions per match (match within 1 hour)
    result = await session.execute(
        select(Match).where(
            Match.stage != MatchStage.GROUP,
            Match.match_datetime <= cutoff,
        )
    )
    soon_matches = result.scalars().all()
    for m in soon_matches:
        await session.execute(
            KnockoutPrediction.__table__.update()
            .where(
                KnockoutPrediction.match_id == m.id,
                KnockoutPrediction.locked.is_(False),
            )
            .values(locked=True)
        )

    await session.commit()
    logger.info("Prediction lock check complete.")


# ---------------------------------------------------------------------------
# Full sync orchestrator
# ---------------------------------------------------------------------------

async def sync_all(session: AsyncSession) -> None:
    if not settings.FOOTBALL_API_KEY:
        logger.warning("FOOTBALL_API_KEY not set — skipping sync.")
        return
    await sync_teams(session)
    await sync_matches(session)
    await sync_standings(session)
    await check_and_lock_predictions(session)
