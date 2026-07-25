export default function CommonElementsSection({
  timeline,
  onTimelineChange,
  coreStory,
  onCoreStoryChange,
  background,
  onBackgroundChange,
  themes,
  onAddTheme,
  onThemeChange,
  onRemoveTheme,
}) {
  return (
    <div className="card section-card">
      <div className="section-label">Common elements</div>
      <div className="section-hint">The backbone facts your AI copilot will keep consistent across every scene.</div>

      <label className="field-label">Timeline</label>
      <input type="text" value={timeline} onChange={(e) => onTimelineChange(e.target.value)} />

      <label className="field-label">Core story</label>
      <textarea rows={3} value={coreStory} onChange={(e) => onCoreStoryChange(e.target.value)} />

      <label className="field-label">Main themes</label>
      <div className="chip-row">
        {themes.map((theme, i) => (
          <span className="chip selected theme-chip" key={i}>
            <input
              className="theme-chip-input"
              type="text"
              value={theme}
              placeholder="New theme"
              onChange={(e) => onThemeChange(i, e.target.value)}
            />
            <button
              type="button"
              className="theme-chip-remove"
              aria-label={`Remove ${theme || 'theme'}`}
              onClick={() => onRemoveTheme(i)}
            >
              ×
            </button>
          </span>
        ))}
        <button className="ghost-btn" onClick={onAddTheme}>+ Add theme</button>
      </div>

      <label className="field-label">Story background</label>
      <textarea rows={2} value={background} onChange={(e) => onBackgroundChange(e.target.value)} />
    </div>
  );
}

