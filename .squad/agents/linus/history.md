# Project Context

- **Owner:** DrDonoso
- **Project:** Mundial2026Over9000 — Web app for a World Cup 2026 betting pool among friends
- **Stack:** TBD frontend (visually attractive), backend with auth, PostgreSQL, Telegram bot, Docker, CI/CD to DockerHub
- **Features:** Invitation-based auth, predictions (champion, most goals for/against, most red cards, group stage order, knockout picks), live World Cup API integration, Telegram bot daily rankings, Docker Compose (build + run), open source friendly
- **Created:** 2026-04-16

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-04-16 — Initial Backend Scaffold
- Created complete `backend/` directory with 40 files following Danny's architecture decision
- **Stack:** FastAPI + SQLAlchemy 2.0 async + PostgreSQL (asyncpg) + Alembic + APScheduler
- **Models:** User, InviteToken, Team, Group, GroupTeam, Match, PreTournamentPrediction, GroupStagePrediction, KnockoutPrediction, UserScore — all with UUID PKs, proper FKs, and unique constraints
- **Scoring engine** (`core/scoring.py`): Full implementation of 3-phase scoring (pre-tournament 140pts, group 120pts, knockout 164pts = 424 max), tiebreakers (knockout correct > exact groups > earliest registration), idempotent `recalculate_all_scores()`
- **Auth:** JWT access (15min) + refresh (7 days), bcrypt (work factor 12), invite tokens stored as SHA-256 hashes
- **API routes:** auth (rate-limited 5/min), admin (invite CRUD, manual sync/recalc), predictions (GET/PUT with lock checking), tournament (teams/groups/matches with filters), leaderboard (ranking, /me, /history)
- **Services:** football-data.org client (sync teams, matches, standings + prediction locking), Telegram outbound bot (daily ranking, matchday notifications, reminders), APScheduler (sync every 6h/5min, daily ranking 10AM UTC, lock checker every 15min)
- **Alembic:** Async-compatible env.py, script.mako template, empty versions dir
- **Security:** CORS from env, slowapi rate limiting, all Pydantic-validated inputs, parameterized queries only
- Prediction lock logic: pre-tournament locks 1h before first match, groups lock 1h before first match of that group, knockout locks 1h before each match
