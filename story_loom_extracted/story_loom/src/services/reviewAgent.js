import { api, getCurrentProjectId } from './apiClient.js';

// Called as getFeedback() (no args) by ReviewAgentView.
export async function getFeedback(storyId, { refresh = true } = {}) {
  const projectId = storyId || getCurrentProjectId();
  if (!projectId) return [];
  return api.get(`/projects/${projectId}/feedback?refresh=${refresh}`);
}

// Called as checkImpact('Aunty Leela') by ReviewAgentView.
export async function checkImpact(entityName, storyId) {
  const projectId = storyId || getCurrentProjectId();
  if (!projectId) throw new Error('No active project yet.');
  return api.post(`/projects/${projectId}/impact-check`, { entityName });
}
