export default function ClimaxBar({ progress }) {
  return (
    <div className="climax-bar-wrap">
      <div className="climax-bar-track">
        <div className="climax-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="climax-labels">
        <span>Opening</span>
        <span>Rising action</span>
        <span>{progress}% to climax</span>
        <span>Climax</span>
      </div>
    </div>
  );
}
