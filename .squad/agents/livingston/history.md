# Project Context

- **Owner:** DrDonoso
- **Project:** Mundial2026Over9000 — Web app for a World Cup 2026 betting pool among friends
- **Stack:** TBD frontend (visually attractive), backend with auth, PostgreSQL, Telegram bot, Docker, CI/CD to DockerHub
- **Features:** Invitation-based auth, predictions (champion, most goals for/against, most red cards, group stage order, knockout picks), live World Cup API integration, Telegram bot daily rankings, Docker Compose (build + run), open source friendly
- **Created:** 2026-04-16

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Playwright E2E tests set up in `frontend/e2e/`. Config at `frontend/playwright.config.ts`. Tests run against `http://localhost` (Docker).
- Login form selectors: `#username` and `#password` (by id). Submit via `button[type="submit"]`.
- Admin page shows "Admin Panel" heading; invite creation uses a dialog with `[role="dialog"]` and "Create Invite" button inside.
- Available invites are labeled with a "Available" badge in the invite list.
- Playwright scripts: `npm run test:e2e` and `npm run test:e2e:ui` in the frontend package.json.
