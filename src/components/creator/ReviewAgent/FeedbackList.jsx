const SEV_CLASS = { info: 'sev-info', warn: 'sev-warn', crit: 'sev-crit' };

export default function FeedbackList({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <div className="feedback-item" key={i}>
          <span className={`sev-dot ${SEV_CLASS[item.severity]}`}></span>
          <div>
            <div className="fb-cat">{item.category}</div>
            <div className="fb-text">{item.text}</div>
            {item.jump && <a className="fb-jump">{item.jump}</a>}
          </div>
        </div>
      ))}
    </>
  );
}
