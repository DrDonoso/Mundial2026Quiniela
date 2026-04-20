# ⚽ Mundial2026Quiniela

[![CI](https://github.com/DrDonoso/Mundial2026Quiniela/actions/workflows/ci.yml/badge.svg)](https://github.com/DrDonoso/Mundial2026Quiniela/actions/workflows/ci.yml)
[![Deploy](https://github.com/DrDonoso/Mundial2026Quiniela/actions/workflows/deploy.yml/badge.svg)](https://github.com/DrDonoso/Mundial2026Quiniela/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](docker/docker-compose.run.yml)

> 🏆 The **over-engineered** World Cup 2026 betting pool for you and your friends.

Predict the champion, group stage outcomes, and knockout results. Compete on a live leaderboard. Get daily Telegram updates. Self-host the whole thing with a single `docker compose up`.

---

## ✨ Features

- 🎯 **Pre-tournament predictions** — Champion, most goals scored/conceded, most red cards
- 📊 **Group stage picks** — Predict the top 2 teams in each of the 12 groups
- ⚔️ **Knockout bracket** — Call every match from Round of 32 to the Final
- 🏅 **Live leaderboard** — Real-time rankings with detailed score breakdowns
- 📡 **Football Data API** — Automatic match result syncing from [football-data.org](https://www.football-data.org/)
- 🤖 **Telegram bot** — Daily rankings, matchday reminders, and score updates
- 🔒 **Invite-only access** — Admin generates invite links, no open registration
- 🐳 **Fully Dockerized** — One command to run everything

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

### Run with pre-built images

```bash
# 1. Clone the repo
git clone https://github.com/DrDonoso/Mundial2026Quiniela.git
cd Mundial2026Quiniela

# 2. Create your environment file
cp docker/.env.example docker/.env
# Edit docker/.env with your real values (see Environment Variables below)

# 3. Launch everything
docker compose -f docker/docker-compose.run.yml up -d
```

Open **http://localhost** and you're in. 🎉

---

## 🛠️ Development Setup

### Run locally with hot-reload

```bash
# 1. Clone and set up env
git clone https://github.com/DrDonoso/Mundial2026Quiniela.git
cd Mundial2026Quiniela
cp .env.example .env
# Edit .env with your values

# 2. Start dev environment (builds from source, hot-reload enabled)
docker compose -f docker/docker-compose.build.yml up --build
```

| Service   | URL                     | Mode              |
|-----------|-------------------------|-------------------|
| Frontend  | http://localhost:3000    | Vite dev server   |
| Backend   | http://localhost:8000    | Uvicorn + reload  |
| API Docs  | http://localhost:8000/docs | Swagger UI      |
| Database  | localhost:5432          | PostgreSQL 16     |

### Without Docker

<details>
<summary>Backend</summary>

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

</details>

<details>
<summary>Frontend</summary>

```bash
cd frontend
npm install
npm run dev
```

</details>

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_USER` | PostgreSQL username | ✅ |
| `POSTGRES_PASSWORD` | PostgreSQL password | ✅ |
| `POSTGRES_DB` | Database name | ✅ |
| `DATABASE_URL` | Full async DB connection string | ✅ |
| `JWT_SECRET` | Secret for JWT token signing (min 32 chars) | ✅ |
| `ADMIN_USERNAME` | Initial admin username | ✅ |
| `ADMIN_PASSWORD` | Initial admin password | ✅ |
| `FOOTBALL_API_KEY` | API key from [football-data.org](https://www.football-data.org/) | ✅ |
| `FOOTBALL_API_BASE_URL` | Football data API base URL | ✅ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from [@BotFather](https://t.me/BotFather) | ⚡ |
| `TELEGRAM_CHANNEL_ID` | Telegram channel/group ID for notifications | ⚡ |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | ✅ |
| `APP_ENV` | Environment: `production`, `development`, `test` | ✅ |

⚡ = Optional but recommended for full experience

---

## 🏅 Scoring System

| Category | Max Points | How |
|----------|-----------|-----|
| **Pre-tournament** | 140 pts | Champion, most goals for/against, most red cards |
| **Group stage** | 120 pts | Top 2 in each of the 12 groups |
| **Knockout** | 164 pts | Escalating points per round |
| **Total possible** | **424 pts** | 🏆 |

See the full scoring breakdown in the app's leaderboard page.

---

## 🏗️ Architecture

```
┌──────────┐    ┌──────────┐    ┌──────────────┐
│ Frontend  │    │ Backend  │    │  PostgreSQL   │
│ (Nginx)  │───▶│ (FastAPI)│───▶│              │
│ :80      │    │ :8000    │    │  :5432       │
└──────────┘    └────┬─────┘    └──────────────┘
                     │
                     ├──▶ football-data.org API
                     └──▶ Telegram Bot API
```

- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui, served by Nginx
- **Backend:** FastAPI (Python 3.12) with SQLAlchemy 2.0 + Alembic
- **Database:** PostgreSQL 16 with persistent Docker volumes
- **Scheduler:** APScheduler for automated syncs and notifications

---

## 🤝 Contributing

Contributions welcome! This is an open-source project built for fun.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code passes CI (lint, type-check, tests) before submitting.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for the World Cup 2026 🇺🇸🇲🇽🇨🇦
</p>
