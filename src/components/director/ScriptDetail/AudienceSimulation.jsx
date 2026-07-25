export default function AudienceSimulation({ demographics }) {
  return (
    <div className="card">
      <div className="detail-title" style={{ fontSize: '18px' }}>Audience simulation — 500 viewers</div>
      <div className="section-hint">Databricks-modeled response across demographic and behavioral signals.</div>
      <div style={{ marginTop: '12px' }}>
        {demographics.map((d) => (
          <div className="demo-bar-row" key={d.label}>
            <span className="demo-label">{d.label}</span>
            <div className="demo-track"><div className="demo-fill" style={{ width: `${d.value}%` }}></div></div>
            <span className="demo-val">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
