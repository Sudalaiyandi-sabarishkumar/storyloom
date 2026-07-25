export default function ConflictsSection({ conflicts, onAddConflict, onConflictChange, onRemoveConflict }) {
  return (
    <div className="card section-card">
      <div className="section-label">Conflicts &amp; hooks</div>
      <div className="section-hint">
        Pair each conflict with a hook so the story never goes flat — a romance needs comedy or action beats to stay alive.
      </div>
      {conflicts.map((pair, i) => (
        <div className="conflict-pair" key={i}>
          <input
            type="text"
            value={pair.conflict}
            placeholder="New conflict"
            onChange={(e) => onConflictChange(i, 'conflict', e.target.value)}
          />
          <span className="conflict-arrow">→</span>
          <input
            type="text"
            value={pair.hook}
            placeholder="Hook to offset it"
            onChange={(e) => onConflictChange(i, 'hook', e.target.value)}
          />
          <button
            type="button"
            className="ghost-btn conflict-remove-btn"
            aria-label="Remove conflict pair"
            onClick={() => onRemoveConflict(i)}
          >
            ×
          </button>
        </div>
      ))}
      <button className="ghost-btn" onClick={onAddConflict}>+ Add conflict / hook pair</button>
    </div>
  );
}

