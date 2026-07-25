export default function CharactersSection({ characters, onAddCharacter }) {
  return (
    <div className="card section-card">
      <div className="section-label">Characters &amp; relationships</div>
      <div className="section-hint">Add your cast. Relationships feed the knowledge graph later.</div>
      <div>
        {characters.map((char, i) => (
          <div className="char-card" key={i}>
            <div className="char-card-head">
              <span className="char-name">{char.name}</span>
              <span className="role-tag">{char.role}</span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--c-text-dim)' }}>{char.bio}</div>
            <div className="rel-row">
              •{' '}
              {char.relationships.map((rel, j) => (
                <span className="rel-tag" key={j}>{rel}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="ghost-btn" onClick={onAddCharacter}>+ Add character</button>
    </div>
  );
}
