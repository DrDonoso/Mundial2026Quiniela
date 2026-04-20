"""
Scoring engine for Mundial 2026 Quiniela.

Single source of truth for all scoring logic.
Max theoretical score: 424 points.

Pre-tournament: 140 pts max
  - champion: 50, most_goals_scored: 30, most_goals_conceded: 30, most_red_cards: 30

Group stage: 120 pts max (12 groups × 10 pts)
  - exact position: 5 per team, right team wrong pos: 2 per team

Knockout: 164 pts max
  - round_of_32: 3, round_of_16: 5, quarter_final: 8,
    semi_final: 12, third_place: 5, final: 15

Tiebreakers:
  1. Most correct knockout predictions
  2. Most exact group stage positions
  3. Earliest registration date
"""

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match, MatchStage, MatchStatus
from app.models.group import GroupTeam
from app.models.prediction import (
    GroupStagePrediction,
    KnockoutPrediction,
    PreTournamentPrediction,
    PreTournamentType,
)
from app.models.score import UserScore
from app.models.user import User

logger = logging.getLogger(__name__)

PRE_TOURNAMENT_POINTS: dict[PreTournamentType, int] = {
    PreTournamentType.CHAMPION: 50,
    PreTournamentType.MOST_GOALS_SCORED: 30,
    PreTournamentType.MOST_GOALS_CONCEDED: 30,
    PreTournamentType.MOST_RED_CARDS: 30,
}

KNOCKOUT_POINTS: dict[MatchStage, int] = {
    MatchStage.ROUND_OF_32: 3,
    MatchStage.ROUND_OF_16: 5,
    MatchStage.QUARTER_FINAL: 8,
    MatchStage.SEMI_FINAL: 12,
    MatchStage.THIRD_PLACE: 5,
    MatchStage.FINAL: 15,
}

GROUP_EXACT_POSITION_POINTS = 5
GROUP_RIGHT_TEAM_WRONG_POS_POINTS = 2


# ---------------------------------------------------------------------------
# Pre-tournament scoring
# ---------------------------------------------------------------------------

async def _compute_pre_tournament_points(
    session: AsyncSession,
    user_id: uuid.UUID,
    tournament_results: dict[PreTournamentType, set[uuid.UUID]],
) -> int:
    """
    tournament_results maps prediction_type -> set of team IDs that match
    (set because ties in stats mean multiple teams can be correct).
    """
    if not tournament_results:
        return 0

    result = await session.execute(
        select(PreTournamentPrediction).where(
            PreTournamentPrediction.user_id == user_id
        )
    )
    predictions = result.scalars().all()

    total = 0
    for pred in predictions:
        correct_teams = tournament_results.get(pred.prediction_type, set())
        if pred.team_id in correct_teams:
            total += PRE_TOURNAMENT_POINTS[pred.prediction_type]
    return total


# ---------------------------------------------------------------------------
# Group stage scoring
# ---------------------------------------------------------------------------

async def _compute_group_stage_points(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> tuple[int, int]:
    """
    Returns (total_group_points, exact_position_count).
    exact_position_count is used for tiebreaker #2.
    """
    # Fetch actual final positions (only groups that are finalized)
    result = await session.execute(
        select(GroupTeam).where(GroupTeam.final_position.isnot(None))
    )
    actuals = result.scalars().all()

    if not actuals:
        return 0, 0

    # Build lookup: (group_id, team_id) -> final_position
    actual_map: dict[tuple[uuid.UUID, uuid.UUID], int] = {}
    # Build lookup: group_id -> set of team_ids that finished in top 2
    group_top2: dict[uuid.UUID, set[uuid.UUID]] = {}
    # Build lookup: (group_id, position) -> team_id
    actual_pos_map: dict[tuple[uuid.UUID, int], uuid.UUID] = {}

    for gt in actuals:
        actual_map[(gt.group_id, gt.team_id)] = gt.final_position
        if gt.final_position in (1, 2):
            group_top2.setdefault(gt.group_id, set()).add(gt.team_id)
            actual_pos_map[(gt.group_id, gt.final_position)] = gt.team_id

    # Fetch user's group predictions
    result = await session.execute(
        select(GroupStagePrediction).where(
            GroupStagePrediction.user_id == user_id
        )
    )
    predictions = result.scalars().all()

    total = 0
    exact_count = 0

    for pred in predictions:
        top2 = group_top2.get(pred.group_id, set())
        if pred.team_id not in top2:
            continue  # team didn't finish in top 2
        actual_pos = actual_map.get((pred.group_id, pred.team_id))
        if actual_pos == pred.predicted_position:
            total += GROUP_EXACT_POSITION_POINTS
            exact_count += 1
        else:
            total += GROUP_RIGHT_TEAM_WRONG_POS_POINTS

    return total, exact_count


# ---------------------------------------------------------------------------
# Knockout stage scoring
# ---------------------------------------------------------------------------

async def _compute_knockout_points(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> tuple[int, int]:
    """
    Returns (total_knockout_points, correct_knockout_count).
    correct_knockout_count is used for tiebreaker #1.
    """
    # Fetch finished knockout matches
    result = await session.execute(
        select(Match).where(
            Match.stage != MatchStage.GROUP,
            Match.status == MatchStatus.FINISHED,
            Match.winner_team_id.isnot(None),
        )
    )
    finished_matches = result.scalars().all()

    if not finished_matches:
        return 0, 0

    match_map: dict[uuid.UUID, Match] = {m.id: m for m in finished_matches}

    # Fetch user's knockout predictions for these matches
    result = await session.execute(
        select(KnockoutPrediction).where(
            KnockoutPrediction.user_id == user_id,
            KnockoutPrediction.match_id.in_(list(match_map.keys())),
        )
    )
    predictions = result.scalars().all()

    total = 0
    correct_count = 0

    for pred in predictions:
        match = match_map.get(pred.match_id)
        if match is None:
            continue
        if pred.predicted_winner_team_id == match.winner_team_id:
            total += KNOCKOUT_POINTS.get(match.stage, 0)
            correct_count += 1

    return total, correct_count


# ---------------------------------------------------------------------------
# Calculate for a single user
# ---------------------------------------------------------------------------

async def calculate_user_score(
    session: AsyncSession,
    user_id: uuid.UUID,
    tournament_results: dict[PreTournamentType, set[uuid.UUID]] | None = None,
) -> UserScore:
    """
    Calculate and persist the score for a single user.
    tournament_results is needed for pre-tournament scoring; pass None if
    tournament has not concluded yet (pre-tournament points stay 0).
    Returns the UserScore row (upserted).
    """
    pre_pts = 0
    if tournament_results:
        pre_pts = await _compute_pre_tournament_points(session, user_id, tournament_results)

    group_pts, _exact_groups = await _compute_group_stage_points(session, user_id)
    knockout_pts, _correct_ko = await _compute_knockout_points(session, user_id)
    total = pre_pts + group_pts + knockout_pts

    # Upsert
    result = await session.execute(
        select(UserScore).where(UserScore.user_id == user_id)
    )
    score_row = result.scalar_one_or_none()
    if score_row is None:
        score_row = UserScore(user_id=user_id)
        session.add(score_row)

    score_row.pre_tournament_points = pre_pts
    score_row.group_stage_points = group_pts
    score_row.knockout_points = knockout_pts
    score_row.total_points = total
    score_row.last_calculated_at = datetime.now(timezone.utc)

    await session.flush()
    return score_row


# ---------------------------------------------------------------------------
# Recalculate all scores + assign ranks with tiebreakers
# ---------------------------------------------------------------------------

async def recalculate_all_scores(
    session: AsyncSession,
    tournament_results: dict[PreTournamentType, set[uuid.UUID]] | None = None,
) -> list[UserScore]:
    """
    Recalculate scores for every user, assign ranks with tiebreakers, commit.
    Idempotent — safe to call repeatedly.
    """
    result = await session.execute(select(User.id, User.created_at))
    users = result.all()

    if not users:
        return []

    # Calculate each user's score
    score_rows: list[UserScore] = []
    user_meta: dict[uuid.UUID, dict] = {}

    for user_id, created_at in users:
        score_row = await calculate_user_score(session, user_id, tournament_results)
        score_rows.append(score_row)

        # Gather tiebreaker data
        _, exact_groups = await _compute_group_stage_points(session, user_id)
        _, correct_ko = await _compute_knockout_points(session, user_id)

        user_meta[user_id] = {
            "correct_knockout": correct_ko,
            "exact_groups": exact_groups,
            "created_at": created_at,
        }

    # Sort by: total_points DESC, correct_knockout DESC, exact_groups DESC, created_at ASC
    score_rows.sort(
        key=lambda s: (
            -s.total_points,
            -user_meta[s.user_id]["correct_knockout"],
            -user_meta[s.user_id]["exact_groups"],
            user_meta[s.user_id]["created_at"],
        )
    )

    for rank_index, row in enumerate(score_rows, start=1):
        row.rank = rank_index

    await session.commit()
    logger.info("Recalculated scores for %d users.", len(score_rows))
    return score_rows
