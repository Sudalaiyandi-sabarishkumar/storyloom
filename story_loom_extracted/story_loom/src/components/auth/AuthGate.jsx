import { useMemo, useState } from 'react';
import LoginView from './LoginView.jsx';
import SignupView from './SignupView.jsx';
import bgImage from '../../images/bg.jpeg';

function randomParticles(count) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    top: `${60 + Math.random() * 35}%`,
    size: 3 + Math.random() * 6,
    duration: 7 + Math.random() * 7,
    delay: Math.random() * 6,
    px: `${(Math.random() - 0.5) * 60}px`,
    py: `${-(120 + Math.random() * 100)}px`,
  }));
}

export default function AuthGate() {
  const [mode, setMode] = useState('login');
  const particles = useMemo(() => randomParticles(18), []);

  return (
    <div className="auth-page">
      <div className="auth-form-pane">
        {mode === 'login'
          ? <LoginView onSwitchToSignup={() => setMode('signup')} />
          : <SignupView onSwitchToLogin={() => setMode('login')} />}
      </div>

      <div className="auth-visual" aria-hidden="true">
        <div className="auth-particles">
          {particles.map((p) => (
            <span
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--px': p.px,
                '--py': p.py,
              }}
            />
          ))}
        </div>
        <div className="auth-glow-ring" />
        <img className="auth-visual-img" src={bgImage} alt="" />
      </div>
    </div>
  );
}
