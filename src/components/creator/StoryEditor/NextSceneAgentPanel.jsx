import { NEXT_SCENE_OPTIONS } from '../../../data/mockData.js';

export default function NextSceneAgentPanel({ onPick, generating }) {
  return (
    <div className="agent-panel card">
      <div className="copilot-head">
        <span className="pulse-dot"></span>
        <span className="agent-title">Next Scene Agent</span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--c-text-dim)', marginBottom: '4px' }}>
        Pick a direction — I'll write it into the storyboard.
      </div>

      {NEXT_SCENE_OPTIONS.map((opt) => (
        <div
          className="opt-card"
          key={opt.id}
          style={generating ? { pointerEvents: 'none' } : undefined}
          onClick={() => onPick(opt)}
        >
          <div className="opt-hook">{opt.hook}</div>
          <div className="opt-title">{opt.title}</div>
          <div className="opt-desc">{opt.desc}</div>
        </div>
      ))}

      {generating && (
        <div className="generating-line">
          <div className="dot-flash"><span></span><span></span><span></span></div>
          Writing scene into storyboard…
        </div>
      )}
    </div>
  );
}
