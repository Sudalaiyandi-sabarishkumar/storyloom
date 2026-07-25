import { api } from './apiClient.js';

// Called as getRankings() by RankingsView.
export async function getRankings({ refresh = false } = {}) {
  return api.get(`/rankings?refresh=${refresh}`);
}

// Called as getAudienceSimulation(projectTitle) by ScriptDetailView.
export async function getAudienceSimulation(projectTitle, { refresh = false } = {}) {
  return api.get(`/projects/by-title/${encodeURIComponent(projectTitle)}/audience-simulation?refresh=${refresh}`);
}
