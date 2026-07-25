function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export default function Topbar({ user, onLogout }) {
  const isDirector = user.role === 'director';

  return (
    <div className="topbar">
      <div className="brand">
        <div className="mark"></div>Storyloom
      </div>
      <div className="persona-switch">
        <button className="active">
          {isDirector ? '🎬 Director Room' : '🎨 Creator Studio'}
        </button>
      </div>
      <div className="topbar-right">
        <div style={{ fontSize: '12px' }}>
          Signed in as {user.displayName} ({isDirector ? 'Director' : 'Creator'})
        </div>
        <button type="button" className="ghost-btn" onClick={onLogout}>Log out</button>
        <div className="avatar">{initials(user.displayName)}</div>
      </div>
    </div>
  );
}
