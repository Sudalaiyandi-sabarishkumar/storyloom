import { COPILOT_SUGGESTIONS } from '../../../data/mockData.js';

export default function CopilotPanel() {
  return (
    <div className="copilot-panel card">
      <div className="copilot-head">
        <span className="pulse-dot"></span>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>AI Copilot</span>
      </div>
      {COPILOT_SUGGESTIONS.map((s, i) => (
        <div className="suggestion-line" key={i}>
          <b>{s.label}:</b> {s.text}
        </div>
      ))}
    </div>
  );
}
