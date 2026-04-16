# Project Context

- **Owner:** DrDonoso
- **Project:** Mundial2026Over9000 — Web app for a World Cup 2026 betting pool among friends
- **Stack:** TBD frontend (visually attractive), backend with auth, PostgreSQL, Telegram bot, Docker, CI/CD to DockerHub
- **Features:** Invitation-based auth, predictions (champion, most goals for/against, most red cards, group stage order, knockout picks), live World Cup API integration, Telegram bot daily rankings, Docker Compose (build + run), open source friendly
- **Created:** 2026-04-16

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-04-16 — Initial Docker & CI/CD Infrastructure

**Created all infrastructure files:**
- `backend/Dockerfile` — Multi-stage Python 3.12-slim build, non-root user, healthcheck
- `frontend/Dockerfile` — Multi-stage Node 20 build → Nginx alpine, non-root user, healthcheck
- `frontend/nginx.conf` — Gzip, security headers, API proxy to backend:8000, SPA fallback, 1-year static cache
- `docker/docker-compose.build.yml` — Dev compose with hot-reload (Vite dev server + uvicorn --reload), PostgreSQL with healthcheck
- `docker/docker-compose.run.yml` — Production compose pulling from DockerHub `drdonoso/mundial-*` images
- `.env.example` + `docker/.env.example` — Full env var template
- `.github/workflows/ci.yml` — Backend pytest with PG service container, frontend lint + type-check, Docker build test
- `.github/workflows/deploy.yml` — Tag-triggered build+push to DockerHub + GitHub Release
- `.gitignore` — Extended with Python, Node, Docker, IDE, env entries
- `backend/.dockerignore` + `frontend/.dockerignore` — Lean build contexts
- `README.md` — Full docs with quick start, dev setup, env vars, architecture, scoring

**Key decisions:**
- Dev compose uses Vite dev server on :3000, NOT nginx (for HMR)
- Production compose uses nginx on :80 with API proxy
- DockerHub images: `drdonoso/mundial-frontend` and `drdonoso/mundial-backend`
- All containers run as non-root users
- Named volume `pgdata` for DB persistence
- GitHub Actions uses `docker/build-push-action@v6` with GHA cache
