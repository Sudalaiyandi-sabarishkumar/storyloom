import { useRef, useState } from 'react';
import ClimaxBar from './ClimaxBar.jsx';
import MiniCast from './MiniCast.jsx';
import Storyboard from './Storyboard.jsx';
import NextSceneAgentPanel from './NextSceneAgentPanel.jsx';
import { generateNextScene } from '../../../services/sceneAgent.js';
import { INITIAL_SCENES } from '../../../data/mockData.js';

export default function StoryEditorView({ active }) {
  const [scenes, setScenes] = useState(INITIAL_SCENES);
  const [climaxProgress, setClimaxProgress] = useState(38);
  const [generating, setGenerating] = useState(false);
  const [newestIndex, setNewestIndex] = useState(null);
  const boardEndRef = useRef(null);

  async function pickScene(option) {
    setGenerating(true);
    const scene = await generateNextScene(option, { scenes });
    setScenes((prev) => {
      const next = [...prev, { ...scene, title: `${prev.length + 1}. ${scene.title}` }];
      setNewestIndex(next.length - 1);
      return next;
    });
    setGenerating(false);
    setClimaxProgress((prev) => Math.min(prev + 14, 92));
    boardEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div id="c-editor" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Story editor</div>
        <div className="page-title">Coastal Curry &amp; Fusion Wheels</div>
        <div className="page-sub">Choose a branch and the AI agent writes the next scene straight into your storyboard.</div>
      </div>

      <div className="editor-grid">
        <ClimaxBar progress={climaxProgress} />
        <MiniCast />
        <Storyboard scenes={scenes} newestIndex={newestIndex} endRef={boardEndRef} />
        <NextSceneAgentPanel onPick={pickScene} generating={generating} />
      </div>
    </div>
  );
}
