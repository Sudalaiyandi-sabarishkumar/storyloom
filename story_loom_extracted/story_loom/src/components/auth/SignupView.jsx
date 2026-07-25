import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCardTilt } from './useCardTilt.js';
import AuthBackdrop from './AuthBackdrop.jsx';

export default function SignupView({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const { ref, handleMove, handleLeave } = useCardTilt();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(username, password, displayName);
    } catch (err) {
      setError(err.message || 'Could not create your account — try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <AuthBackdrop />
      <div className="auth-card-wrap dir-right" ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <form className="card auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-sheen" />
          <div className="brand auth-brand"><div className="mark"></div>Storyloom</div>
          <div className="section-label">Create a creator account</div>
          <div className="section-hint">Every signup is a Creator Studio account — Director access is provisioned separately.</div>

          <label className="field-label">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            required
          />

          <label className="field-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            minLength={3}
            required
          />

          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}

          <button type="submit" className="primary-btn auth-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <div className="auth-switch">
            Already have an account? <button type="button" className="link-btn" onClick={onSwitchToLogin}>Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
