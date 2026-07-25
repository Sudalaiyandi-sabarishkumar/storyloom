export default function RankCard({ project, rank, onOpen }) {
  const bars = project.spark.map((v, i) => <div key={i} style={{ height: `${v}%` }}></div>);
  const dashArray = `${project.score * 1.885} 188.5`;

  return (
    <div className={`card rank-card ${rank === 1 ? 'top' : ''}`} onClick={() => onOpen(project.title)}>
      <div className="rank-top-strip"></div>
      <div className="rank-body">
        <div className="rank-head">
          <div>
            <div className="rank-num">RANK #{rank}</div>
            <div className="rank-title">{project.title}</div>
            <div className="rank-genres">
              {project.genres.map((g) => <span className="d-tag" key={g}>{g}</span>)}
            </div>
          </div>
          <div className="gauge-wrap">
            <svg viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="30" fill="none" stroke="#2E1E22" strokeWidth="6" />
              <circle
                cx="35" cy="35" r="30" fill="none" stroke="#E0263D" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={dashArray} transform="rotate(-90 35 35)"
              />
            </svg>
            <div className="gauge-num">{project.score}</div>
          </div>
        </div>
        <div className="spark">{bars}</div>
        <div className="fit-badge"><span>Audience fit</span><span className="fit-pct">{project.fit}%</span></div>
      </div>
    </div>
  );
}
