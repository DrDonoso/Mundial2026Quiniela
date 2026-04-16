# Squad Decisions

## Active Decisions

### ADR-001: Architecture & Tech Stack
- **Author:** Danny (Lead) | **Date:** 2026-04-16 | **Status:** Proposed
- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui, Zustand state management
- **Backend:** FastAPI (Python 3.12), SQLAlchemy 2.0 + Alembic, PostgreSQL 16
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Scheduler:** APScheduler (in-process, no extra service)
- **Telegram:** python-telegram-bot (async)
- **Infra:** 3 containers (frontend/nginx, backend/FastAPI, PostgreSQL), Nginx reverse proxy
- **Rationale:** Simple stack for a friends betting pool. No SSR, no message queues, no Redis. Python ecosystem gives best Telegram/scheduling support.

### ADR-002: Scoring System
- **Author:** Danny (Lead) | **Date:** 2026-04-16 | **Status:** Proposed
- **Phase 1 — Pre-Tournament (140 pts max):** Champion (50), Most goals scored (30), Most goals conceded (30), Most red cards (30). Locks 1h before first match.
- **Phase 2 — Group Stage (120 pts max):** Predict 1st & 2nd in each of 12 groups. Exact position = 5pts, correct team wrong position = 2pts. Locks per group 1h before first group match.
- **Phase 3 — Knockout (164 pts max):** R32 (3pts × 16), R16 (5pts × 8), QF (8pts × 4), SF (12pts × 2), 3rd place (5pts), Final (15pts). Locks per match 1h before kickoff.
- **Total max: 424 points.** Realistic top range: 180–250.

### ADR-003: Frontend Component Architecture
- **Author:** Rusty (Frontend) | **Date:** 2026-04-16 | **Status:** Implemented
- Dark theme with World Cup gold (#d4a017) / pitch green (#1a472a) palette
- Glassmorphism cards, mobile-first (320px+), country flags via backend `flag_url`
- 14 UI primitives, 6 layout, 8 pages, 5 prediction, 3 leaderboard, 2 admin components
- Axios with JWT interceptor (auto-refresh on 401), React Router v6 lazy-loaded pages
- All service modules align with backend API at `/api/v1`

### ADR-004: Docker & CI/CD Conventions
- **Author:** Basher (DevOps) | **Date:** 2026-04-16 | **Status:** Proposed
- Two Compose files: `docker-compose.build.yml` (dev, builds from source) and `docker-compose.run.yml` (prod, pre-built DockerHub images)
- Dev frontend runs Vite dev server (port 3000); prod uses nginx (port 80)
- DockerHub images: `drdonoso/mundial-frontend`, `drdonoso/mundial-backend` (tagged `latest` + semver)
- All containers run as non-root users
- Secrets via `.env` files + GitHub Actions secrets; `.env.example` is source of truth
- CI on every PR/push to main: pytest, lint, type-check, Docker build. Deploy on `v*` tags only.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
