import { useEffect, useState } from 'react';
import RankCard from './RankCard.jsx';
import { getRankings } from '../../../services/rankingAgent.js';
import { getProjectDetail } from '../../../services/projectsService.js';
import { downloadStoryDocument } from '../../../utils/exportStory.js';

export default function RankingsView({ active, onOpenProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    setLoading(true);
    getRankings().then(setProjects).finally(() => setLoading(false));
  }, []);

  async function handleDownload(project) {
    setDownloadingId(project.id);
    setDownloadError('');
    try {
      const detail = await getProjectDetail(project.id);
      downloadStoryDocument(detail);
    } catch (err) {
      setDownloadError(err.message || 'Could not download that story — try again.');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div id="d-rank" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Greenlight board</div>
        <div className="page-title">Story rankings</div>
        <div className="page-sub">
          Ranked against a 500-viewer audience simulation (age, country, language, personality, genre affinity, patience, listening speed) run in Databricks.
        </div>
      </div>
      <div className="d-toolbar">
        <div className="d-sort">
          <button className="active">Potential score</button>
        
        </div>
        <div style={{ fontSize: '12px', color: 'var(--d-text-dim)' }}>
          {loading ? 'Scoring in progress…' : `${projects.length} projects · updated just now`}
        </div>
      </div>
      {downloadError && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{downloadError}</div>}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '60px 0', color: 'var(--d-text-dim)', fontSize: '13px' }}>
          <span className="spinner"></span> Running the audience simulation…
        </div>
      ) : (
        <div className="rank-grid">
          {projects.map((p, i) => (
            <RankCard
              key={p.id || p.title}
              project={p}
              rank={i + 1}
              onOpen={onOpenProject}
              onDownload={handleDownload}
              downloading={downloadingId === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
