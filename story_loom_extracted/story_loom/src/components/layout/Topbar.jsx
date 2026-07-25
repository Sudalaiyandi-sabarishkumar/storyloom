export default function Topbar({ persona, onPersonaChange }) {
  const isDirector = persona === 'director';

  return (
    <div className="topbar">
      <div className="brand">
        <div className="mark"></div>Storyloom
      </div>
      <div className="persona-switch">
        <button className={!isDirector ? 'active' : ''} onClick={() => onPersonaChange('creator')}>
          🎨 Creator Studio
        </button>
        <button className={isDirector ? 'active' : ''} onClick={() => onPersonaChange('director')}>
          🎬 Director Room
        </button>
      </div>
      <div className="topbar-right">
        <div style={{ fontSize: '12px' }}>{isDirector ? 'Signed in as Director' : 'Signed in as Creator'}</div>
        <div className="avatar">SK</div>
      </div>
    </div>
  );
}
