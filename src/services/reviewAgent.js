import { FEEDBACK_ITEMS, IMPACT_RESULT } from '../data/mockData.js';

// TODO(backend): replace with GET /api/projects/:id/feedback
export async function getFeedback(storyId) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return FEEDBACK_ITEMS;
}

// TODO(backend): replace with POST /api/projects/:id/impact-check { entityName }
export async function checkImpact(entityName, storyId) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return IMPACT_RESULT;
}
