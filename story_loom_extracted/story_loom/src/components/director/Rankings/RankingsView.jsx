import { useEffect, useState } from 'react';
import RankCard from './RankCard.jsx';
import { getRankings } from '../../../services/rankingAgent.js';

export default function RankingsView({ active, onOpenProject }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getRankings().then(setProjects);
  }, []);

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
          <button>Audience fit</button>
          <button>Genre demand</button>
          <button>Completion</button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--d-text-dim)' }}>{projects.length} projects · updated just now</div>
      </div>
      <div className="rank-grid">
        {projects.map((p, i) => (
          <RankCard key={p.title} project={p} rank={i + 1} onOpen={onOpenProject} />
        ))}
      </div>
    </div>
  );
}
