export default function CharactersSection({ characters, onAddCharacter, onCharacterChange, onRemoveCharacter }) {
  return (
    <div className="card section-card">
      <div className="section-label">Characters &amp; relationships</div>
      <div className="section-hint">Add your cast. Relationships feed the knowledge graph later.</div>
      <div>
        {characters.map((char, i) => (
          <div className="char-card" key={i}>
            <div className="char-card-head">
              <input
                className="char-name-input"
                type="text"
                value={char.name}
                placeholder="Character name"
                onChange={(e) => onCharacterChange(i, 'name', e.target.value)}
              />
              <input
                className="role-tag-input"
                type="text"
                value={char.role}
                placeholder="Role"
                onChange={(e) => onCharacterChange(i, 'role', e.target.value)}
              />
              <button
                type="button"
                className="ghost-btn char-remove-btn"
                aria-label={`Remove ${char.name || 'character'}`}
                onClick={() => onRemoveCharacter(i)}
              >
                ×
              </button>
            </div>
            <textarea
              className="char-bio-input"
              rows={2}
              value={char.bio}
              placeholder="Add a short description…"
              onChange={(e) => onCharacterChange(i, 'bio', e.target.value)}
            />
            <div className="rel-row">
              •{' '}
              <input
                className="rel-input"
                type="text"
                value={char.relationships.join(', ')}
                placeholder="Add relationship, comma separated"
                onChange={(e) =>
                  onCharacterChange(
                    i,
                    'relationships',
                    e.target.value.split(',').map((r) => r.trim()).filter(Boolean)
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
      <button className="ghost-btn" onClick={onAddCharacter}>+ Add character</button>
    </div>
  );
}
