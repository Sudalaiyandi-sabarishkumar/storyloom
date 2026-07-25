export default function ResolutionSection({ resolution, onResolutionChange }) {
  return (
    <div className="card section-card">
      <div className="section-label">Resolution</div>
      <div className="section-hint">How each conflict above gets addressed — Storyloom links these back automatically.</div>
      <textarea rows={3} value={resolution} onChange={(e) => onResolutionChange(e.target.value)} />
    </div>
  );
}

