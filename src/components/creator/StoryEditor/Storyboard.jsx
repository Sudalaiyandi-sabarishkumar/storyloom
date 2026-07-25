import SceneCard from './SceneCard.jsx';

export default function Storyboard({ scenes, newestIndex, endRef }) {
  return (
    <div className="storyboard-col">
      {scenes.map((scene, i) => (
        <SceneCard key={i} scene={scene} isNew={i === newestIndex} />
      ))}
      <div ref={endRef}></div>
    </div>
  );
}
