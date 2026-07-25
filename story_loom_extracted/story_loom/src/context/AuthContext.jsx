import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAuthToken, setAuthToken, clearAuthToken } from '../services/apiClient.js';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restores a session from a stored token on first load (page refresh).
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authService.me()
      .then(setUser)
      .catch(() => clearAuthToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, user: loggedInUser } = await authService.login({ username, password });
    setAuthToken(token);
    setUser(loggedInUser);
  }, []);

  const signup = useCallback(async (username, password, displayName) => {
    const { token, user: newUser } = await authService.signup({ username, password, displayName });
    setAuthToken(token);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
