export default function CharacterDrawer({ character }) {
  if (!character) {
    return (
      <div className="char-drawer card">
        <div className="drawer-empty">
          Select a character node<br />to see their full profile, arc, and scene appearances.
        </div>
      </div>
    );
  }

  return (
    <div className="char-drawer card">
      <div className="section-label">{character.name}</div>
      <div className="role-tag" style={{ marginTop: '6px', display: 'inline-block' }}>{character.role}</div>
      <p style={{ fontSize: '12.5px', color: 'var(--c-text-dim)', lineHeight: 1.6, marginTop: '12px' }}>
        {character.bio}
      </p>
      <div className="field-label" style={{ marginTop: '18px' }}>Relationships</div>
      {character.rels.map((r, i) => (
        <div className="rel-row" key={i}>
          • <span className="rel-tag">{r[0]}: {r[1]}</span>
        </div>
      ))}
      <div className="field-label" style={{ marginTop: '18px' }}>Appears in</div>
      {character.scenes.map((s, i) => (
        <div key={i} style={{ fontSize: '12px', color: 'var(--c-text-dim)', padding: '6px 0', borderBottom: '1px solid var(--c-border)' }}>
          {s}
        </div>
      ))}
    </div>
  );
}
