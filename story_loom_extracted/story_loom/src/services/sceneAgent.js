import { api, getCurrentProjectId } from './apiClient.js';

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
