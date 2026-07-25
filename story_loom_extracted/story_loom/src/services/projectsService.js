import { api } from './apiClient.js';

// Called by StoriesListView to render the "My Stories" landing page.
export function listProjects() {
  return api.get('/projects');
}

// Called when opening a story from the list — full hydrate for ProjectContext.
export function getProjectDetail(id) {
  return api.get(`/projects/${id}`);
}

// Called from Review Agent's "Submit for Review" button.
export function submitProject(id) {
  return api.post(`/projects/${id}/submit`, {});
}
