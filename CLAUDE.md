# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo holds two separate Node projects that together make up Storyloom, an AI copilot for content creators:

- `story_loom_extracted/story_loom/` — React + Vite frontend
- `storyloom-backend/` — Node/Express backend (Databricks + Claude/OpenAI)

They are developed and run independently (separate `package.json`, separate `npm install`), connected only by the Vite dev proxy and a shared REST contract.

## Commands

### Frontend (`story_loom_extracted/story_loom/`)

```bash
npm install
npm run dev       # start Vite dev server (proxies /api/* -> localhost:8080)
npm run build     # production build
npm run preview   # preview the production build
```

### Backend (`storyloom-backend/`)

```bash
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY (or OPENAI_API_KEY) + DATABRICKS_* values
npm run db:migrate     # creates catalog/schema + Delta tables from src/db/schema.sql
npm run dev             # node --watch src/server.js -> http://localhost:8080
npm run start            # node src/server.js (no watch)
```

There is no test suite or lint config in either project currently.

## Architecture

### Frontend: two personas, one shared project context

`App.jsx` renders both persona roots simultaneously and toggles visibility/CSS class, rather than routing between them:

- **Creator Studio** (`src/components/creator/`) — New Project wizard, Story Editor, Knowledge Graph, Review Agent
- **Director Room** (`src/components/director/`) — Rankings, Script Detail / funding decision

`src/context/ProjectContext.jsx` holds the single source of truth for "which project is active" (`projectId`, `openingPlot`, `characters`, etc.) plus a `storyVersion` counter. Every tab depends on `projectId`/`storyVersion` in its own effects; `notifyPlotGenerated()` (called once a plot comes back) and `bumpStoryVersion()` (called after a scene is accepted) are the only two places that mutate it. When adding a feature that changes server-side story state, call `bumpStoryVersion()` (or `notifyPlotGenerated`) so other tabs refetch — don't add ad-hoc refetch triggers.

`src/services/*.js` (`plotAgent`, `sceneAgent`, `reviewAgent`, `rankingAgent`) are the integration seams to the backend — one file per backend agent of the same name. They currently mock their responses (local data + delay); wiring the backend means replacing each function body with a `fetch()` to the matching route in `storyloom-backend`, keeping the same signature — components already handle the loading/async state.

`src/data/mockData.js` is the single place all placeholder content lives.

### Backend: layered, one folder per concern

```
src/
  config/            env loading (config/index.js)
  ai/
    anthropicClient.js / openaiClient.js   provider-specific generateText()/generateJSON()
    index.js                                picks the active provider from config.ai.provider
    prompts.js                               versioned prompt templates, one per agent
  agents/            plotAgent, sceneAgent, reviewAgent, rankingAgent — business logic, call ai/ and db/
  db/
    databricksClient.js   connection + esc()/escArray() SQL-safety helpers (no bind-param support, always escape)
    schema.sql              Delta DDL, source of truth for tables
    migrate.js                npm run db:migrate
    repositories/projectRepo.js   CRUD + assembles storyContext fed into agent prompts
  routes/            thin HTTP layer, mapped ~1:1 to frontend service files
  middleware/errorHandler.js   asyncHandler wrapper + centralized error handler
  app.js             express app wiring (helmet, cors, rate limiting, route mounting)
  server.js            entrypoint, just listens
```

`AI_PROVIDER` env var (`anthropic` default, or `openai`) selects the client in `ai/index.js` — both expose the same `generateText`/`generateJSON` interface, so agents never import a provider client directly. Adding a third provider means adding a client module with that same interface and registering it in `ai/index.js`'s `providers` map.

### Regeneration model (backend)

AI generations are append-only, never overwritten in place — this is the pattern to follow for any new AI-backed feature:

- **Opening plot** (`plot_generations` table): each regenerate inserts a new row and flips `is_selected`; history is listable and revertible via `.../opening-plot/history` and `.../opening-plot/:id/select`.
- **Next scene** (`scene_generations`): generating/regenerating never touches the canonical `scenes` table — only `.../generations/:id/accept` commits it, mirroring the UI's "pick" action.
- **Feedback**: cheap to recompute, so it just replaces the set unless refresh is suppressed.
- **Rankings / audience simulation**: cached by default, recomputed via `?refresh=true` or an explicit `/recompute` route.

Regeneration nudges `temperature` up slightly and reuses the same prompt, resending genres/characters/prior scenes as grounding context so re-rolls don't contradict established story facts.

### Persistence

Databricks SQL Warehouse (Delta tables) is the only datastore — no separate relational DB. `databricksClient.js` lazily opens and caches a single Thrift/HTTP session. Because the driver's bind-param support is version-dependent, all interpolated values go through `esc()`/`escArray()` rather than raw string concatenation — always use these helpers when building queries in `repositories/`.

## Known gaps (per backend README)

- No auth — API is currently open.
- No caching layer in front of Databricks; consider Redis if Director Room read traffic grows.
