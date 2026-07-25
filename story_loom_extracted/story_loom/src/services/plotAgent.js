import { api, ensureProject } from './apiClient.js';

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

