import { useEffect, useState } from 'react';
import FeedbackList from './FeedbackList.jsx';
import ImpactModal from './ImpactModal.jsx';
import { getFeedback, checkImpact } from '../../../services/reviewAgent.js';
import { submitProject } from '../../../services/projectsService.js';
import { useProject } from '../../../context/ProjectContext.jsx';

export default function ReviewAgentView({ active }) {
  const { projectId, hasPlot, storyVersion, isSubmitted, markSubmitted } = useProject();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [impactResult, setImpactResult] = useState(null);
  const [entityName, setEntityName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const impactTarget = entityName.trim();

  useEffect(() => {
    if (!active || !projectId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        // refresh: true re-runs the AI review over the latest story context
        // (fresh plot, new scenes) rather than serving a stale cached pass.
        const items = await getFeedback(projectId, { refresh: true });
        if (!cancelled) setFeedback(items);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load feedback.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [active, projectId, storyVersion]);

  async function openImpactModal() {
    if (!impactTarget) return;
    setModalOpen(true);
    setScanning(true);
    setImpactResult(null);
    try {
      const result = await checkImpact(impactTarget, projectId);
      setImpactResult(result);
    } catch (err) {
      setImpactResult({ risk: 'review', summary: err.message || 'Could not run the impact check.', scenes: [] });
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitProject(projectId);
      markSubmitted();
    } catch (err) {
      setSubmitError(err.message || 'Could not submit this story — try again.');
    } finally {
      setSubmitting(false);
    }
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

      {!hasPlot ? (
        <div className="card drawer-empty" style={{ padding: '60px 24px' }}>
          Generate a starting plot in the New Project tab first — Review Agent analyzes your actual story.
        </div>
      ) : (
        <div className="wizard-grid">
          <div>
            {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}
            {loading ? (
              <div className="card drawer-empty">Reviewing your story…</div>
            ) : (
              <FeedbackList items={feedback} />
            )}

            <div className="card section-card impact-trigger" style={{ marginTop: '20px' }}>
              <div className="section-label" style={{ fontSize: '15px' }}>Try the impact checker</div>
              <div className="section-hint">Enter the exact name of a character or scene to see what depends on it before you remove it.</div>
              <input
                className="rel-input"
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Character or scene name"
                style={{ marginBottom: '10px' }}
              />
              <button className="ghost-btn" onClick={openImpactModal} disabled={!impactTarget}>
                🗑 Check "{impactTarget || '…'}"
              </button>
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
              Overall story health: <b>{critCount === 0 ? 'Strong' : 'Needs attention'}</b> — based on the latest AI review pass.
            </div>

            <div className="copilot-head" style={{ marginTop: '20px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Submit to Director's Room</span>
            </div>
            {isSubmitted ? (
              <div className="suggestion-line">✓ Submitted — this story is now read-only in Creator Studio.</div>
            ) : (
              <>
                <div className="suggestion-line">Once you submit, this story locks and appears in Director's Room for greenlight review.</div>
                {submitError && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{submitError}</div>}
                <button className="primary-btn" onClick={handleSubmit} disabled={submitting} style={{ marginTop: '10px' }}>
                  {submitting ? 'Submitting…' : 'Submit for review'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <ImpactModal
        open={modalOpen}
        scanning={scanning}
        result={impactResult}
        target={impactTarget}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
