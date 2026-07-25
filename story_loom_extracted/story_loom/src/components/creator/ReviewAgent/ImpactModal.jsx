const RISK_CLASS = { safe: 'risk-safe', review: 'risk-review', high: 'risk-high' };
const RISK_LABEL = { safe: 'Safe to remove', review: 'Needs review', high: 'High risk' };

export default function ImpactModal({ open, scanning, result, target, onClose }) {
  return (
    <div className={`modal-overlay ${open ? 'show' : ''}`}>
      <div className="modal-box">
        <div className="section-label" style={{ fontSize: '16px' }}>Checking impact of removing "{target}"</div>
        <div className="section-hint">Scanning story for dependencies before you confirm.</div>

        {scanning && (
          <div className="scan-line-wrap"><div className="scan-bar"></div></div>
        )}

        {!scanning && result && (
          <div className="impact-result" style={{ display: 'block' }}>
            <div className={`impact-badge ${RISK_CLASS[result.risk]}`}>{RISK_LABEL[result.risk]}</div>
            <p style={{ fontSize: '12.5px', color: 'var(--c-text-dim)', margin: '10px 0 6px' }}>{result.summary}</p>
            {result.scenes.map((s, i) => (
              <div className="affected-scene" key={i}>
                <span>{s.label}</span><span>{s.status}</span>
              </div>
            ))}
            <div className="modal-actions">
              <button className="secondary-btn" onClick={onClose}>Cancel</button>
              <button className="primary-btn" style={{ flex: 1 }} onClick={onClose}>Remove anyway</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
