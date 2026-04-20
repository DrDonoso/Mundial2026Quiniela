# Project Context

- **Owner:** DrDonoso
- **Project:** Mundial2026Quiniela — Web app for a World Cup 2026 betting pool among friends
- **Stack:** TBD frontend (visually attractive), backend with auth, PostgreSQL, Telegram bot, Docker, CI/CD to DockerHub
- **Features:** Invitation-based auth, predictions (champion, most goals for/against, most red cards, group stage order, knockout picks), live World Cup API integration, Telegram bot daily rankings, Docker Compose (build + run), open source friendly
- **Created:** 2026-04-16

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-04-16 — Initial Architecture Design
- **Stack decided:** React 18 + Vite + TailwindCSS + shadcn/ui (frontend), FastAPI Python 3.12 (backend), PostgreSQL 16 (db)
- **Three containers only:** frontend (Nginx), backend (FastAPI + APScheduler), db (PostgreSQL). No Redis, no Celery, no message queues.
- **Auth:** JWT access (15min) + refresh (7d httpOnly cookie) + bcrypt. Invite tokens are single-use, 32-byte URL-safe, 7-day expiry.
- **Football API:** football-data.org free tier (10 req/min). Poll every 5min on active matchdays.
- **Telegram:** Outbound-only bot via python-telegram-bot. Daily rankings + matchday-end notifications + lock warnings.
- **Scoring system:** 424 max points — Pre-tournament 140 (33%), Group stage 120 (28%), Knockout 164 (39%). Partial credit for group stage (2pts team right/position wrong). Escalating knockout values (3→5→8→12→5→15).
- **2026 format:** 48 teams, 12 groups of 4, top 2 advance + 8 best 3rd → Round of 32 knockout.
- **Docker:** Two compose files — build (dev with hot-reload) and run (pulls from DockerHub). CI/CD via GitHub Actions.
- **Key files:** `.squad/decisions/inbox/danny-architecture.md`, `.squad/decisions/inbox/danny-scoring-system.md`
- **Monorepo:** `frontend/` and `backend/` at root level, `docker/` for compose files.
- **Security:** UUID PKs everywhere, Pydantic validation on all endpoints, CORS restricted, rate limiting on auth, no raw SQL.
