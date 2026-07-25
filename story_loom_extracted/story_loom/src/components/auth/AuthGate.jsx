import { useState } from 'react';
import LoginView from './LoginView.jsx';
import SignupView from './SignupView.jsx';

export default function AuthGate() {
  const [mode, setMode] = useState('login');
  return mode === 'login'
    ? <LoginView onSwitchToSignup={() => setMode('signup')} />
    : <SignupView onSwitchToLogin={() => setMode('login')} />;
}
