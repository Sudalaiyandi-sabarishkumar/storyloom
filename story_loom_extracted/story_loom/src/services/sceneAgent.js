import { api, getCurrentProjectId } from './apiClient.js';

// Called by StoryEditorView on load / whenever the shared project context
// changes, so the storyboard always reflects what's actually been accepted
// on the backend rather than a fixed set of mock scenes.
export async function listScenes(storyId) {
  const projectId = storyId || getCurrentProjectId();
  if (!projectId) return [];
  return api.get(`/projects/${projectId}/scenes`);
}

// Called by StoryEditorView's Next Scene Agent panel to get fresh directions
// grounded in the project's generated opening plot + cast + scenes so far.
export async function getSceneSuggestions(storyId) {
  const projectId = storyId || getCurrentProjectId();
  if (!projectId) return [];
  const { options } = await api.get(`/projects/${projectId}/scenes/suggestions`);
  return options;
}

// Called as generateNextScene(option, { scenes }) by StoryEditorView.
// storyContext.scenes isn't actually needed in the request body — the
// backend rebuilds prior-scene context itself from the project's saved
// timeline — but we accept it to keep the existing call signature intact.
export async function generateNextScene(option, storyContext, { regenerate = false } = {}) {
  const projectId = getCurrentProjectId();
  if (!projectId) {
    throw new Error('No active project yet — generate an opening plot first.');
  }

  const generation = await api.post(`/projects/${projectId}/scenes`, { option, regenerate });

  // StoryEditorView expects the scene to land straight in the storyboard
  // (there's no separate "accept" step in this UI), so we commit it
  // immediately after generating.
  const accepted = await api.post(`/projects/${projectId}/scenes/generations/${generation.id}/accept`, {});

  return { title: accepted.title, tone: accepted.tone, text: accepted.text };
}
