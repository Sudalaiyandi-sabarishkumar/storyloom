import { PROJECTS, SCRIPT_DETAIL } from '../data/mockData.js';

// TODO(backend): replace with GET /api/rankings (Databricks audience simulation results)
export async function getRankings() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return PROJECTS;
}

// TODO(backend): replace with GET /api/projects/:id/audience-simulation
export async function getAudienceSimulation(projectTitle) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return SCRIPT_DETAIL;
}
