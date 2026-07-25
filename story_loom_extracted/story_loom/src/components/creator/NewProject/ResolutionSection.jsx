import { DEFAULT_RESOLUTION } from '../../../data/mockData.js';

export default function ResolutionSection() {
  return (
    <div className="card section-card">
      <div className="section-label">Resolution</div>
      <div className="section-hint">How each conflict above gets addressed — Storyloom links these back automatically.</div>
      <textarea rows={3} defaultValue={DEFAULT_RESOLUTION} />
    </div>
  );
}
