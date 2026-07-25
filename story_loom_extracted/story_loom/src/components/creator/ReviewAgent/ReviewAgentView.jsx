import { useEffect, useState } from 'react';
import FeedbackList from './FeedbackList.jsx';
import ImpactModal from './ImpactModal.jsx';
import { getFeedback, checkImpact } from '../../../services/reviewAgent.js';

export default function ReviewAgentView({ active }) {
  const [feedback, setFeedback] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [impactResult, setImpactResult] = useState(null);

  useEffect(() => {
    getFeedback().then(setFeedback);
  }, []);

  async function openImpactModal() {
    setModalOpen(true);
    setScanning(true);
    setImpactResult(null);
    const result = await checkImpact('Aunty Leela');
    setImpactResult(result);
    setScanning(false);
  }

  const critCount = feedback.filter((f) => f.severity === 'crit').length;
  const warnCount = feedback.filter((f) => f.severity === 'warn').length;
  const infoCount = feedback.filter((f) => f.severity === 'info').length;

  return (
    <div id="c-review" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Review agent</div>
        <div className="page-title">Feedback &amp; impact check</div>
        <div className="page-sub">Story-wide review, plus a safety check before you remove or change anything.</div>
      </div>
      <div className="wizard-grid">
        <div>
          <FeedbackList items={feedback} />

          <div className="card section-card impact-trigger" style={{ marginTop: '20px' }}>
            <div className="section-label" style={{ fontSize: '15px' }}>Try the impact checker</div>
            <div className="section-hint">See what happens before you remove a character or scene.</div>
            <button className="ghost-btn" onClick={openImpactModal}>🗑 Remove "Aunty Leela"</button>
          </div>
        </div>
        <div className="copilot-panel card">
          <div className="copilot-head">
            <span className="pulse-dot"></span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Review summary</span>
          </div>
          <div className="suggestion-line">
            {feedback.length} feedback items · {critCount} critical, {warnCount} warning, {infoCount} informational.
          </div>
          <div className="suggestion-line">
            Overall story health: <b>Strong</b> — main conflict/resolution pairs are tracked and mostly on schedule.
          </div>
          <div className="suggestion-line">
            Recommended next step: add a setup beat for the corporate buyout before writing the climax.
          </div>
        </div>
      </div>

      <ImpactModal
        open={modalOpen}
        scanning={scanning}
        result={impactResult}
        target="Aunty Leela"
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
