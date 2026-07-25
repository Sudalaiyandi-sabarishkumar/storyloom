import { DEFAULT_TIMELINE, DEFAULT_CORE_STORY, DEFAULT_BACKGROUND } from '../../../data/mockData.js';

export default function CommonElementsSection({ themes, onAddTheme }) {
  return (
    <div className="card section-card">
      <div className="section-label">Common elements</div>
      <div className="section-hint">The backbone facts your AI copilot will keep consistent across every scene.</div>

      <label className="field-label">Timeline</label>
      <input type="text" defaultValue={DEFAULT_TIMELINE} />

      <label className="field-label">Core story</label>
      <textarea rows={3} defaultValue={DEFAULT_CORE_STORY} />

      <label className="field-label">Main themes</label>
      <div className="chip-row">
        {themes.map((theme, i) => (
          <span key={i} className="chip selected" style={{ cursor: 'default' }}>
            {theme}
          </span>
        ))}
        <button className="ghost-btn" onClick={onAddTheme}>+ Add theme</button>
      </div>

      <label className="field-label">Story background</label>
      <textarea rows={2} defaultValue={DEFAULT_BACKGROUND} />
    </div>
  );
}
