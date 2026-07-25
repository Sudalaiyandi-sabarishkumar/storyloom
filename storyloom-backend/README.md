# Storyloom Backend

Node.js/Express backend for the Storyloom React app. Implements the four AI
agents the frontend already expects (`plotAgent`, `sceneAgent`, `reviewAgent`,
`rankingAgent`), backed by **Databricks** for persistence and **Claude**
(Anthropic API) for content generation — including regenerate/versioning.

## Stack

- **Node.js 18+ / Express** — REST API
- **Databricks SQL Warehouse** (`@databricks/sql`) — Delta tables for
  projects, scenes, characters, feedback, rankings, generation history
- **Anthropic Claude API** (`@anthropic-ai/sdk`) — plot/scene prose + JSON
  review/ranking generation
- Optional: **Databricks Model Serving** — swap in a trained ranking model
  instead of the LLM heuristic (see `rankingAgent.js`)

## Why Databricks here

- Delta tables give you ACID writes + time travel over every AI generation
  (useful for audit/rollback of regenerated content).
- The same warehouse can later host notebooks that batch-recompute rankings,
  fine-tune a greenlight model on accumulated `rankings`/`audience_simulations`
  data, and serve it back via Model Serving — no separate data store needed.

## Setup

```bash
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY + DATABRICKS_* values
npm run db:migrate     # creates catalog/schema + Delta tables
npm run dev            # http://localhost:8080
```

Databricks values come from: **SQL Warehouse → Connection details** (server
hostname + HTTP path) and a **personal access token** (or better, a
service-principal token) under **User Settings → Developer → Access tokens**.

## Architecture

```
src/
  config/            env loading
  ai/
    anthropicClient.js   generic generateText()/generateJSON() over Claude
    prompts.js            versioned prompt templates, one per agent
  agents/
    plotAgent.js       opening plot generate + regenerate + version history
    sceneAgent.js       next-scene generate + regenerate + accept-into-timeline
    reviewAgent.js      pacing/consistency feedback + "remove this?" impact check
    rankingAgent.js      greenlight scoring + audience simulation
                          (LLM by default, Model Serving adapter included)
  db/
    databricksClient.js  connection + esc()/escArray() SQL-safety helpers
    schema.sql            Delta DDL
    migrate.js             npm run db:migrate
    repositories/
      projectRepo.js       CRUD + assembles storyContext for the agents
  routes/               thin HTTP layer mapped 1:1 to the frontend's TODOs
  middleware/           asyncHandler + centralized error handler
  app.js / server.js
```

## Regeneration model

Every AI call is append-only in its `*_generations` / `*_checks` table rather
than overwriting in place:

- **Opening plot** (`plot_generations`): each regenerate inserts a new row and
  flips `is_selected`. `GET .../opening-plot/history` lists all past attempts;
  `POST .../opening-plot/:id/select` reverts to an older one.
- **Next scene** (`scene_generations`): generating (or regenerating) an option
  never touches the canonical `scenes` table — it only commits once the writer
  calls `.../generations/:id/accept`, which mirrors the UI's "pick" action.
- **Feedback**: cheap to recompute, so `getFeedback` just replaces the set
  unless `?refresh=false`-style caching is requested.
- **Rankings / audience simulation**: cached by default (`GET /api/rankings`),
  recomputed on `?refresh=true` or the explicit `/recompute` route — keeps the
  Director Room fast while still supporting "regenerate this score".

Regeneration nudges `temperature` up slightly and reuses the exact same
prompt, so re-rolls feel different without contradicting established story
facts (genres/characters/prior scenes are always re-sent as grounding
context).

## API reference

| Method | Path | Maps to frontend seam |
|---|---|---|
| `POST` | `/api/projects` | (new) create project from the New Project wizard |
| `GET` | `/api/projects/:id` | (new) full project + characters + conflicts + scenes |
| `POST` | `/api/projects/:id/opening-plot` `{regenerate?}` | `plotAgent.generateOpeningPlot` |
| `GET` | `/api/projects/:id/opening-plot/history` | (new) version history |
| `POST` | `/api/projects/:id/opening-plot/:genId/select` | (new) revert to a version |
| `POST` | `/api/projects/:id/scenes` `{option, regenerate?}` | `sceneAgent.generateNextScene` |
| `GET` | `/api/projects/:id/scenes/generations?optionId=` | (new) candidates for a direction |
| `POST` | `/api/projects/:id/scenes/generations/:genId/accept` | (new) commit into timeline |
| `GET` | `/api/projects/:id/feedback?refresh=true` | `reviewAgent.getFeedback` |
| `POST` | `/api/projects/:id/impact-check` `{entityName}` | `reviewAgent.checkImpact` |
| `GET` | `/api/rankings?refresh=true` | `rankingAgent.getRankings` |
| `GET` | `/api/projects/by-title/:title/audience-simulation?refresh=true` | `rankingAgent.getAudienceSimulation` |

## Wiring the frontend

Replace each mocked function body in `src/services/*.js` with a `fetch()` to
the matching route above — component loading/async state is already handled,
so no UI changes needed (per the frontend README). E.g.:

```js
// src/services/plotAgent.js
export async function generateOpeningPlot(storyContext, { projectId, regenerate } = {}) {
  const res = await fetch(`/api/projects/${projectId}/opening-plot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regenerate }),
  });
  if (!res.ok) throw new Error('Failed to generate plot');
  const { text } = await res.json();
  return text;
}
```

## Notes / production hardening TODO

- Add auth (JWT or Databricks OAuth passthrough) — currently open.
- `@databricks/sql` string-escapes values (`esc()`/`escArray()`) rather than
  using bind parameters, since driver-level param binding support varies by
  version — swap to bind params if you pin a version that supports them.
- Consider moving hot-path reads (rankings, feedback) to a small cache
  (Redis) in front of the warehouse if Director Room traffic grows.
