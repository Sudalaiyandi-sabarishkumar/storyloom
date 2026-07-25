import { useCallback, useEffect, useRef, useState } from 'react';
import ClimaxBar from './ClimaxBar.jsx';
import MiniCast from './MiniCast.jsx';
import Storyboard from './Storyboard.jsx';
import NextSceneAgentPanel from './NextSceneAgentPanel.jsx';
import { generateNextScene, getSceneSuggestions, listScenes } from '../../../services/sceneAgent.js';
import { useProject } from '../../../context/ProjectContext.jsx';

// Climax bar is a simple heuristic (not backed by its own endpoint yet):
// each accepted scene nudges it forward, capped short of 100% until an
// explicit climax scene lands.
const CLIMAX_BASE = 10;
const CLIMAX_PER_SCENE = 14;
const CLIMAX_CAP = 92;

function numberScenes(rawScenes) {
  return rawScenes.map((s, i) => ({ ...s, title: `${i + 1}. ${s.title.replace(/^\d+\.\s*/, '')}` }));
}

export default function StoryEditorView({ active }) {
  const { projectId, projectTitle, hasPlot, storyVersion, bumpStoryVersion, isSubmitted } = useProject();

  const [scenes, setScenes] = useState([]);
  const [options, setOptions] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newestIndex, setNewestIndex] = useState(null);
  const boardEndRef = useRef(null);

  const climaxProgress = Math.min(CLIMAX_BASE + scenes.length * CLIMAX_PER_SCENE, CLIMAX_CAP);

  const refreshSuggestions = useCallback(async () => {
    if (!projectId) return;
    setLoadingOptions(true);
    try {
      setOptions(await getSceneSuggestions(projectId));
    } catch (err) {
      setError(err.message || 'Could not load scene suggestions.');
    } finally {
      setLoadingOptions(false);
    }
  }, [projectId]);

  // Whenever the active project (or its story) changes — a fresh plot
  // generated, or a scene just got accepted — reload the storyboard and
  // ask the Next Scene Agent for fresh, story-grounded suggestions.
  useEffect(() => {
    if (!active || !projectId) return;
    let cancelled = false;

    (async () => {
      setLoadingBoard(true);
      setError('');
      try {
        const persisted = await listScenes(projectId);
        if (cancelled) return;
        setScenes(numberScenes(persisted));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load the storyboard.');
      } finally {
        if (!cancelled) setLoadingBoard(false);
      }
      refreshSuggestions();
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, projectId, storyVersion]);

  async function pickScene(option) {
    setGenerating(true);
    setError('');
    try {
      const scene = await generateNextScene(option, { scenes });
      setScenes((prev) => {
        const next = [...prev, { ...scene, title: `${prev.length + 1}. ${scene.title}` }];
        setNewestIndex(next.length - 1);
        return next;
      });
      boardEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      bumpStoryVersion(); // lets Knowledge Graph / Review Agent know the story grew
      refreshSuggestions(); // next directions should account for the new scene
    } catch (err) {
      setError(err.message || 'Could not generate that scene.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div id="c-editor" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Story editor</div>
        <div className="page-title">{projectTitle || 'Your story'}</div>
        <div className="page-sub">Choose a branch and the AI agent writes the next scene straight into your storyboard.</div>
      </div>

      {!hasPlot ? (
        <div className="card drawer-empty" style={{ padding: '60px 24px' }}>
          Generate a starting plot in the New Project tab first — Story Editor builds on it.
        </div>
      ) : (
        <div className="editor-grid">
          <ClimaxBar progress={climaxProgress} />
          <MiniCast />
          {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}
          {loadingBoard ? (
            <div className="card drawer-empty">Loading storyboard…</div>
          ) : (
            <Storyboard scenes={scenes} newestIndex={newestIndex} endRef={boardEndRef} />
          )}
          {isSubmitted ? (
            <div className="card drawer-empty" style={{ padding: '40px 24px' }}>
              This story has been submitted for review and is read-only.
            </div>
          ) : (
            <NextSceneAgentPanel options={options} onPick={pickScene} generating={generating} loading={loadingOptions} />
          )}
        </div>
      )}
    </div>
  );
}
