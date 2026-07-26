# Storyloom

React + Vite port of the Storyloom application — an AI copilot for content creators, with two personas: **Creator Studio** (new project wizard, story editor, knowledge graph, review agent) and **Director Room** (greenlight rankings, script detail + funding decision).

## Setup

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview the production build
```

## Structure

- `src/components/creator/` — Creator Studio views (New Project, Story Editor, Knowledge Graph, Review Agent)
- `src/components/director/` — Director Room views (Rankings, Script Detail)
- `src/data/mockData.js` — all placeholder content (story template, scenes, characters, feedback, rankings)
- `src/services/` — **integration seams for the backend/agent work**. Every function here is currently mocked (returns local data after a short delay) but is where real API/agent calls should go:
  - `plotAgent.js` — opening plot generation
  - `sceneAgent.js` — next-scene generation
  - `reviewAgent.js` — story feedback + impact-of-removal checks
  - `rankingAgent.js` — greenlight rankings + audience simulation
- `src/styles/` — global CSS carried over from the prototype (theme variables, layout, per-persona styles)

To wire up a backend, replace the body of the functions in `src/services/*.js` with real `fetch()` calls — the components that call them already handle loading/async state, so no UI changes should be needed.
