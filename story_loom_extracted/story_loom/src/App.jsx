import { useEffect } from 'react';
import Topbar from './components/layout/Topbar.jsx';
import CreatorRoot from './components/creator/CreatorRoot.jsx';
import DirectorRoot from './components/director/DirectorRoot.jsx';
import AuthGate from './components/auth/AuthGate.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    document.body.classList.toggle('director-mode', user?.role === 'director');
  }, [user?.role]);

  if (loading) {
    return <div className="auth-splash">Loading Storyloom…</div>;
  }

  if (!user) {
    return <AuthGate />;
  }

  return (
    <>
      <Topbar user={user} onLogout={logout} />
      {user.role === 'creator' && <CreatorRoot isActive />}
      {user.role === 'director' && <DirectorRoot isActive />}
    </>
  );
}
