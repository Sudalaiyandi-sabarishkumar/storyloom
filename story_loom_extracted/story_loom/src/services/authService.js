import { api } from './apiClient.js';

// Always creates role: 'creator' — there is no public way to sign up as director.
export function signup({ username, password, displayName }) {
  return api.post('/auth/signup', { username, password, displayName });
}

export function login({ username, password }) {
  return api.post('/auth/login', { username, password });
}

// Used to restore a session from a stored token on page load.
export function me() {
  return api.get('/auth/me');
}
