// Talks to the storyloom-backend. In dev, Vite proxies /api -> http://localhost:8080
// (see vite.config.js), so this works with no CORS setup out of the box.
// In production, set VITE_API_BASE_URL to your deployed backend's origin.

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const PROJECT_ID_KEY = 'storyloom:currentProjectId';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${options.method || 'GET'} ${path} failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
};

export function getCurrentProjectId() {
  return localStorage.getItem(PROJECT_ID_KEY);
}

export function setCurrentProjectId(id) {
  localStorage.setItem(PROJECT_ID_KEY, id);
}

export function clearCurrentProjectId() {
  localStorage.removeItem(PROJECT_ID_KEY);
}

/**
 * The prototype UI has no project-switcher — it edits "the current project"
 * in place. This creates the project on first use and updates it on every
 * later call, so wizard edits before you hit "Generate" are reflected.
 */
export async function ensureProject(payload) {
  const existingId = getCurrentProjectId();
  if (existingId) {
    try {
      await api.patch(`/projects/${existingId}`, payload);
      return existingId;
    } catch {
      // Fall through and create a fresh one if the stored id is stale
      // (e.g. pointing at a wiped dev database).
    }
  }
  const project = await api.post('/projects', payload);
  setCurrentProjectId(project.id);
  return project.id;
}
