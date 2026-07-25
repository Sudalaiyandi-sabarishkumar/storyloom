import { useProject } from '../../../context/ProjectContext.jsx';

function initialsOf(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export default function MiniCast() {
  const { characters } = useProject();

  return (
    <div className="mini-cast card">
      <div className="section-label" style={{ fontSize: '14px', marginBottom: '10px' }}>Cast</div>
      {characters.length === 0 && (
        <div style={{ fontSize: '12px', color: 'var(--c-text-dim)' }}>No cast yet.</div>
      )}
      {characters.map((m, i) => (
        <div className="mini-cast-item" key={i}>
          <span className="mini-avatar">{initialsOf(m.name)}</span> {m.name}
          <span style={{ marginLeft: 'auto', color: 'var(--c-text-dim)', fontSize: '10px' }}>{m.role}</span>
        </div>
      ))}
    </div>
  );
}
