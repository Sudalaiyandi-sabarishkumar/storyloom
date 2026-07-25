import { MINI_CAST } from '../../../data/mockData.js';

export default function MiniCast() {
  return (
    <div className="mini-cast card">
      <div className="section-label" style={{ fontSize: '14px', marginBottom: '10px' }}>Cast</div>
      {MINI_CAST.map((m, i) => (
        <div className="mini-cast-item" key={i}>
          <span className="mini-avatar">{m.initials}</span> {m.name}
          <span style={{ marginLeft: 'auto', color: 'var(--c-text-dim)', fontSize: '10px' }}>{m.tag}</span>
        </div>
      ))}
    </div>
  );
}
