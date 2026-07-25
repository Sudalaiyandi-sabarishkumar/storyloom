import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCardTilt } from './useCardTilt.js';
import AuthBackdrop from './AuthBackdrop.jsx';

export default function LoginView({ onSwitchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { ref, handleMove, handleLeave } = useCardTilt();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Could not log in — try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <AuthBackdrop />
      <div className="auth-card-wrap dir-left" ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <form className="card auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-sheen" />
          <div className="brand auth-brand"><div className="mark"></div>Storyloom</div>
          <div className="section-label">Log in</div>
          <div className="section-hint">Creators and the director both sign in here — each lands in their own room.</div>

          <label className="field-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}

          <button type="submit" className="primary-btn auth-submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>

          <div className="auth-switch">
            New creator? <button type="button" className="link-btn" onClick={onSwitchToSignup}>Create an account</button>
          </div>
        </form>
      </div>
    </div>
  );
}
