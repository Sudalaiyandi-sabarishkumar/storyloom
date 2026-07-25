import { api, getCurrentProjectId } from './apiClient.js';

// Called by KnowledgeGraphView. Returns { nodes, edges, edgeLabels, profiles }
// derived live from the current project's cast, relationships, and scenes.
export async function getKnowledgeGraph(storyId) {
  const projectId = storyId || getCurrentProjectId();
  if (!projectId) return { nodes: [], edges: [], edgeLabels: [], profiles: {} };
  return api.get(`/projects/${projectId}/knowledge-graph`);
}
