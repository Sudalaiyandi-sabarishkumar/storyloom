import SceneCard from './SceneCard.jsx';

export default function Storyboard({ scenes, newestIndex, endRef, readOnly, onEditScene, onDeleteScene, onRegenerateScene }) {
  return (
    <div className="storyboard-col">
      {scenes.map((scene, i) => (
        <SceneCard
          key={scene.id || `plot-${i}`}
          scene={scene}
          isNew={i === newestIndex}
          readOnly={readOnly}
          onEdit={(patch) => onEditScene(scene, patch)}
          onDelete={() => onDeleteScene(scene)}
          onRegenerate={() => onRegenerateScene(scene)}
        />
      ))}
      <div ref={endRef}></div>
    </div>
  );
}
