export default function ConflictsSection({ conflicts, onAddConflict }) {
  return (
    <div className="card section-card">
      <div className="section-label">Conflicts &amp; hooks</div>
      <div className="section-hint">
        Pair each conflict with a hook so the story never goes flat — a romance needs comedy or action beats to stay alive.
      </div>
      {conflicts.map((pair, i) => (
        <div className="conflict-pair" key={i}>
          <input type="text" defaultValue={pair.conflict} placeholder={pair.conflict ? undefined : 'New conflict'} />
          <span className="conflict-arrow">→</span>
          <input type="text" defaultValue={pair.hook} placeholder={pair.hook ? undefined : 'Hook to offset it'} />
        </div>
      ))}
      <button className="ghost-btn" onClick={onAddConflict}>+ Add conflict / hook pair</button>
    </div>
  );
}
