import { api, ensureProject, getCurrentProjectId } from './apiClient.js';

// storyContext is whatever NewProjectView passes: the live, edited state of
// { selectedGenres, themes, characters, conflicts, timeline, coreStory,
// background, resolution }. All fields are now controlled inputs lifted
// into NewProjectView state, so this reflects exactly what the user typed.
export async function generateOpeningPlot(storyContext, { regenerate = false } = {}) {
  const title = storyContext.characters?.[0]?.name
    ? `${storyContext.characters[0].name}'s story`
    : 'Untitled project';

  const projectId = await ensureProject({
    title,
    genres: storyContext.selectedGenres || [],
    themes: storyContext.themes || [],
    characters: storyContext.characters || [],
    conflicts: storyContext.conflicts || [],
    coreStory: storyContext.coreStory || '',
    background: storyContext.background || '',
    timeline: storyContext.timeline || '',
    resolution: storyContext.resolution || '',
  });

  const { text } = await api.post(`/projects/${projectId}/opening-plot`, { regenerate });
  // Return everything StoryEditor/KnowledgeGraph/ReviewAgent need to sync up
  // to this project, so the caller can push one update into shared context.
  return { id: projectId, title, text, characters: storyContext.characters || [] };
}

// Called by the opening-plot card's "Edit" (Save) action in Story Editor.
// Hits the route directly (no ensureProject/PATCH) — Story Editor doesn't
// have the wizard's full storyContext, so we must not overwrite project
// fields like genres/themes/conflicts with empty data here.
export async function updateOpeningPlotText(text) {
  const projectId = getCurrentProjectId();
  if (!projectId) throw new Error('No active project.');
  return api.patch(`/projects/${projectId}/opening-plot`, { text });
}

// Called by the opening-plot card's "Regenerate" action in Story Editor.
export async function regenerateOpeningPlot() {
  const projectId = getCurrentProjectId();
  if (!projectId) throw new Error('No active project.');
  return api.post(`/projects/${projectId}/opening-plot`, { regenerate: true });
}

// Called by the opening-plot card's "Delete" action in Story Editor —
// deselects the plot (history stays recoverable server-side).
export async function clearOpeningPlot() {
  const projectId = getCurrentProjectId();
  if (!projectId) throw new Error('No active project.');
  return api.post(`/projects/${projectId}/opening-plot/clear`, {});
}

