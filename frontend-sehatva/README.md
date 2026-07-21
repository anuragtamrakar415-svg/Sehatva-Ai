# Sehatva AI — Frontend

A Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for **Sehatva AI**, a smart recovery and medicine-management companion, built to match the provided Dashboard and Recovery Roadmap designs.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

## What's included

- **Dashboard** (`/dashboard`) — recovery progress hero, stat cards, roadmap teaser, AI health summary, caregiver update, quick actions, recent activity, hydration tracker.
- **Recovery Roadmap** (`/recovery`) — overall progress bar, phase timeline, milestone badges, today's tasks checklist, AI motivation card.
- **Medicines** (`/medicines`) — schedule with take/mark-taken toggling and stock levels.
- **AI Scan & Analyze** (`/scan`) — mock prescription scan flow.
- **Health Reports** (`/reports`) — paste report text, get an AI-style summary, save/delete reports.
- **AI Assistant** (`/ai-chat`) — chat UI with a mocked assistant reply.
- **Insurance Helper** (`/insurance`) — claim tracking cards.
- **Caregiver** (`/caregiver`) — caregiver list plus a hold-to-activate **SOS Emergency** dialog.
- **Profile** / **Settings** — account details and app preferences (theme, language, text size, reminders).
- **Auth** — `/login`, `/signup`, `/forgot-password` with a shared branded layout.

## Project structure

Follows the requested layout:

```
src/
  app/            Next.js routes (App Router), grouped (auth) route for login/signup/forgot-password
  components/     Reusable UI grouped by domain (ui, layout, dashboard, medicine, recovery, ...)
  features/       Domain module barrels for future feature-specific logic
  services/       Typed API client stubs (auth, medicine, report, recovery, insurance, caregiver, ai, notification)
  hooks/          Shared hooks (useMediaQuery, useLocalStorage)
  store/          App-wide client state (React context) for demo data
  context/        Cross-cutting UI context (toast notifications)
  types/          Shared TypeScript interfaces
  constants/      Nav config and mock/demo data
  lib/            Small utilities (cn, formatTime, formatDate)
  utils/          Formatting helpers (currency, truncate)
  validations/    Form validation helpers
  styles/         Tailwind globals
  middleware.ts   Route-guard placeholder
```

## Notes

- All data is currently **mock data** (`src/constants/mock-data.ts`) wired through a lightweight React Context store (`src/store/app-store.tsx`) — no backend is required to run the UI.
- `src/services/*.service.ts` are typed stubs against a `/api/*` base (`NEXT_PUBLIC_API_BASE_URL`) — swap these for real endpoints when a backend is ready.
- Design tokens (colors, radii, shadows) live in `tailwind.config.ts` under the `brand`, `accent`, `ink`, and `surface` palettes, matching the provided dashboard/roadmap screens.
- The SOS dialog uses a controlled `open` state and plain buttons (not a fragile trigger/render composition) so hold-to-activate works reliably with both mouse and touch.
