# TactIQ — Football Tactics Platform

A full-stack football tactics and coaching platform for grassroots and semi-pro coaches. Features an interactive drag-and-drop tactics board, AI match simulator, squad workspace, AI match brain insights, and a community explore page.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/tactiq run dev` — run the frontend (port varies, see workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `GEMINI_API_KEY` — Google Gemini API key for AI features

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4
- API: Express 5 at `artifacts/api-server`
- AI: Google Gemini 2.5 Flash via `@google/genai` SDK
- No database — app uses `localStorage` for all persistence

## Where things live

- `artifacts/tactiq/src/App.tsx` — root app state, routing, localStorage management
- `artifacts/tactiq/src/types.ts` — all shared TypeScript types
- `artifacts/tactiq/src/components/` — all 6 page components (Sidebar, HomeDashboard, TacticsBoard, MatchSimulator, TeamWorkspace, ExploreCommunity)
- `artifacts/api-server/src/routes/gemini.ts` — all 4 Gemini AI routes
- `artifacts/api-server/src/routes/index.ts` — route mounting

## Architecture decisions

- **localStorage-only persistence** — No DB needed; all state (tactics, players, matches, sessions) stored in browser localStorage with seed data on first load.
- **Gemini 2.5 Flash** — All AI routes use `gemini-2.5-flash` model (NOT gemini-3.5 which doesn't exist).
- **`motion/react` aliased to `framer-motion`** — The source code used `motion/react` imports; Vite alias in `vite.config.ts` maps this to `framer-motion` which is installed.
- **AI route fallbacks** — All 4 Gemini routes have rich local fallback logic so the app works gracefully even if AI fails or the key is missing.
- **FORMATION_COORDINATES exported** — `TacticsBoard.tsx` exports `FORMATION_COORDINATES` so `App.tsx` can use it for seeding new tactics.

## Product

- **Home Dashboard** — Daily Match Brain AI insights from logged match history; streak + tactical rating gamification; quick access to recent tactics.
- **Tactics Board** — Interactive drag-and-drop pitch with 4 formations (4-3-3, 3-5-2, 4-4-2, 4-2-3-1), press zones, defensive lines, text labels, tactical arrows, and AI Coach chat.
- **Match Simulator** — Tactical matchup simulator with AI narrative analysis comparing two formations and play styles.
- **Team Workspace** — Squad roster management with player attribute radar charts, match log history with AI debrief, and AI training session builder.
- **Explore Community** — Community tactics feed, weekly challenges, and formation templates.

## User preferences

- AI uses GEMINI_API_KEY directly (not Replit AI Integration proxy)
- No external DB — localStorage only

## Gotchas

- Do NOT add `@workspace/db` dependency to `api-server` Gemini routes — no DB is used.
- The `motion/react` Vite alias must stay in `vite.config.ts` or motion animations will break.
- Always use `gemini-2.5-flash` model name — other model strings will error.
- API server must be rebuilt (`pnpm run build`) when routes change — dev script does this automatically.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
