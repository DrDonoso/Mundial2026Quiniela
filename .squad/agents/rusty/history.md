# Project Context

- **Owner:** DrDonoso
- **Project:** Mundial2026Over9000 — Web app for a World Cup 2026 betting pool among friends
- **Stack:** TBD frontend (visually attractive), backend with auth, PostgreSQL, Telegram bot, Docker, CI/CD to DockerHub
- **Features:** Invitation-based auth, predictions (champion, most goals for/against, most red cards, group stage order, knockout picks), live World Cup API integration, Telegram bot daily rankings, Docker Compose (build + run), open source friendly
- **Created:** 2026-04-16

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- **2026-04-16:** Scaffolded the complete `frontend/` directory. Stack: React 18 + Vite + TypeScript (strict) + TailwindCSS + shadcn/ui-style components. Dark theme with World Cup gold/green accents, glassmorphism cards, pitch pattern background.
- **Structure:** 50+ files created — 14 UI components, 6 layout components, 8 pages (lazy-loaded), 5 prediction components, 3 leaderboard components, 2 admin components, 6 API services, 2 Zustand stores, full TypeScript types matching backend schemas.
- **Design decisions:** Custom toast system (no Radix dependency), native HTML select wrapper, custom dialog/tabs/badge/avatar components. Zustand for auth + tournament state. Axios interceptor handles JWT auto-refresh on 401. All pages lazy-loaded via React.lazy.
- **Build verified:** `tsc --noEmit` and `vite build` both pass cleanly. Production bundle ~277kB main + ~395kB recharts chunk (gzipped: ~90kB + ~108kB).
