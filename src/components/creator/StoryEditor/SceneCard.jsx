export default function SceneCard({ scene, isNew }) {
  return (
    <div className={`scene-card ${isNew ? 'new' : ''}`}>
      <div className="scene-top">
        <span className="scene-title">{scene.title}</span>
        <span className="scene-tone">{scene.tone}</span>
      </div>
      <div className="scene-text">{scene.text}</div>
      <div className="scene-actions">
        <button>Edit</button>
        <button>Regenerate</button>
        <button>Delete</button>
      </div>
    </div>
  );
}
