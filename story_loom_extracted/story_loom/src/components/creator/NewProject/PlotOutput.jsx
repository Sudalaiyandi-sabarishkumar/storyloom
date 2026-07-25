export default function PlotOutput({ show, displayed, isTyping }) {
  return (
    <div className={`plot-output card ${show ? 'show' : ''}`}>
      <div className="section-label" style={{ fontSize: '15px' }}>Draft opening plot</div>
      <p>
        {displayed}
        {isTyping && <span className="typing-cursor"></span>}
      </p>
    </div>
  );
}
