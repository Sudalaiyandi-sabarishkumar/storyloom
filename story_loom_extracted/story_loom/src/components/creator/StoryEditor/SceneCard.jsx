import { useState } from 'react';

export default function SceneCard({ scene, isNew, readOnly, onEdit, onDelete, onRegenerate }) {
  const isPlot = scene.kind === 'plot';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: scene.title, tone: scene.tone, text: scene.text });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function startEdit() {
    // scene.title here is the display-numbered version (e.g. "2. Sabotage")
    // — strip the prefix so we don't persist it back into the stored title.
    setDraft({ title: scene.title.replace(/^\d+\.\s*/, ''), tone: scene.tone, text: scene.text });
    setError('');
    setEditing(true);
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      // The opening-plot card has no title/tone in the backend — only its
      // text can be edited there.
      await onEdit(isPlot ? { text: draft.text } : { title: draft.title, tone: draft.tone, text: draft.text });
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Could not save this edit.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const label = isPlot ? 'the opening plot' : `"${scene.title}"`;
    if (!window.confirm(`Remove ${label}? This can't be undone from here.`)) return;
    setBusy(true);
    setError('');
    try {
      await onDelete();
    } catch (err) {
      setError(err.message || 'Could not delete this.');
      setBusy(false);
    }
  }

  async function handleRegenerate() {
    setBusy(true);
    setError('');
    try {
      await onRegenerate();
    } catch (err) {
      setError(err.message || 'Could not regenerate this.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`scene-card ${isNew ? 'new' : ''}`}>
      <div className="scene-top">
        {editing && !isPlot ? (
          <input
            className="char-name-input"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        ) : (
          <span className="scene-title">{scene.title}</span>
        )}
        {editing && !isPlot ? (
          <input
            className="role-tag-input"
            value={draft.tone}
            onChange={(e) => setDraft((d) => ({ ...d, tone: e.target.value }))}
          />
        ) : (
          <span className="scene-tone">{scene.tone}</span>
        )}
      </div>

      {editing ? (
        <textarea
          className="char-bio-input"
          rows={6}
          value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
        />
      ) : (
        <div className="scene-text">{scene.text}</div>
      )}

      {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}

      {!readOnly && (
        <div className="scene-actions">
          {editing ? (
            <>
              <button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
              <button onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={startEdit} disabled={busy}>Edit</button>
              <button onClick={handleRegenerate} disabled={busy}>{busy ? 'Working…' : 'Regenerate'}</button>
              <button onClick={handleDelete} disabled={busy}>Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
