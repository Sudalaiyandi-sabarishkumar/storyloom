import { api, ensureProject } from './apiClient.js';
import {
  DEFAULT_CORE_STORY, DEFAULT_BACKGROUND, DEFAULT_TIMELINE, DEFAULT_RESOLUTION,
} from '../data/mockData.js';

// storyContext here is whatever NewProjectView passes today:
// { selectedGenres, themes, characters, conflicts }.
// Note: Timeline/Core story/Background/Resolution are still *uncontrolled*
// textareas in CommonElementsSection/ResolutionSection (defaultValue only,
// not lifted into React state) — so live edits to those specific fields
// aren't sent yet. Lift them into NewProjectView state and add them to this
// payload if you want them to affect generation.
export async function generateOpeningPlot(storyContext, { regenerate = false } = {}) {
  const projectId = await ensureProject({
    title: storyContext.characters?.[0]?.name
      ? `${storyContext.characters[0].name}'s story`
      : 'Untitled project',
    genres: storyContext.selectedGenres || [],
    themes: storyContext.themes || [],
    characters: storyContext.characters || [],
    conflicts: storyContext.conflicts || [],
    coreStory: DEFAULT_CORE_STORY,
    background: DEFAULT_BACKGROUND,
    timeline: DEFAULT_TIMELINE,
    resolution: DEFAULT_RESOLUTION,
  });

  const { text } = await api.post(`/projects/${projectId}/opening-plot`, { regenerate });
  return text;
}
