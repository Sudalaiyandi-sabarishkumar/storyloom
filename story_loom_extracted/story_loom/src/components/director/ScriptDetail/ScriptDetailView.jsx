import { useEffect, useState } from 'react';
import AudienceSimulation from './AudienceSimulation.jsx';
import DecisionBar from './DecisionBar.jsx';
import { getAudienceSimulation } from '../../../services/rankingAgent.js';

export default function ScriptDetailView({ active, projectTitle, onDecide }) {
  const [detail, setDetail] = useState(null);
  const [compareOn, setCompareOn] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    if (!projectTitle) return;
    getAudienceSimulation(projectTitle).then(setDetail);
  }, [projectTitle]);

  if (!detail) {
    return <div id="d-detail" className={`view ${active ? 'active' : ''}`}></div>;
  }

  return (
    <div id="d-detail" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Script detail</div>
        <div className="page-title">{projectTitle}</div>
        <div className="page-sub">Full breakdown, audience simulation, and funding decision.</div>
      </div>
      <div className="detail-grid">
        <div className="detail-left">
          <div className="card">
            <div className="detail-title" style={{ fontSize: '20px' }}>Logline &amp; cast</div>
            <div className="logline">{detail.logline}</div>
            <div className="chip-row" style={{ marginTop: '14px' }}>
              {detail.tags.map((t) => <span className="d-tag" key={t}>{t}</span>)}
            </div>
            <div className="section-hint" style={{ marginTop: '16px' }}>Storyboard preview</div>
            <div className="scene-thumb-row">
              {detail.sceneThumbs.map((s) => <div className="scene-thumb" key={s}>{s}</div>)}
            </div>
          </div>
          <AudienceSimulation demographics={detail.demographics} />
        </div>
        <div>
          <div className="card hero-score">
            <div className="hero-num">{detail.heroScore}</div>
            <div className="hero-label">Potential score / 100</div>
            <div className="compare-toggle">
              <span>Compare to current #1 ranked</span>
              <div className={`switch ${compareOn ? 'on' : ''}`} onClick={() => setCompareOn((v) => !v)}></div>
            </div>
            <a className="why-toggle" onClick={() => setWhyOpen((v) => !v)}>Why this score? ▾</a>
            <div className={`why-box ${whyOpen ? 'show' : ''}`}>{detail.whyText}</div>

            <DecisionBar onDecide={onDecide} />
          </div>
        </div>
      </div>
    </div>
  );
}
