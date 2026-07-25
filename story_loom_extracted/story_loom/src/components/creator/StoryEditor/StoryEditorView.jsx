import { useCallback, useEffect, useRef, useState } from 'react';
import ClimaxBar from './ClimaxBar.jsx';
import MiniCast from './MiniCast.jsx';
import Storyboard from './Storyboard.jsx';
import NextSceneAgentPanel from './NextSceneAgentPanel.jsx';
import {
  generateNextScene, getSceneSuggestions, listScenes,
  updateScene, deleteScene, regenerateScene,
} from '../../../services/sceneAgent.js';
import { updateOpeningPlotText, regenerateOpeningPlot, clearOpeningPlot } from '../../../services/plotAgent.js';
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
  const { projectId, projectTitle, hasPlot, openingPlot, storyVersion, bumpStoryVersion, isSubmitted, notifyPlotGenerated } = useProject();

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
        // Stored raw (no display numbering baked in) — numbering is derived
        // at render time in `displayScenes` so Edit never persists a "2. "
        // prefix back into the title.
        setScenes(persisted);
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
        const next = [...prev, scene];
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

  // Scene-card actions route to either the plot endpoints (for the pseudo
  // "Opening Plot" card) or the scene endpoints, based on scene.kind.
  async function handleEditScene(scene, patch) {
    if (scene.kind === 'plot') {
      const result = await updateOpeningPlotText(patch.text);
      notifyPlotGenerated({ id: projectId, title: projectTitle, text: result.text });
      return;
    }
    const updated = await updateScene(scene.id, patch);
    setScenes((prev) => prev.map((s) => (s.id === scene.id ? { ...s, ...updated } : s)));
    bumpStoryVersion();
  }

  async function handleDeleteScene(scene) {
    if (scene.kind === 'plot') {
      await clearOpeningPlot();
      notifyPlotGenerated({ id: projectId, title: projectTitle, text: '' });
      return;
    }
    await deleteScene(scene.id);
    setScenes((prev) => prev.filter((s) => s.id !== scene.id));
    bumpStoryVersion();
    refreshSuggestions();
  }

  async function handleRegenerateScene(scene) {
    if (scene.kind === 'plot') {
      const result = await regenerateOpeningPlot();
      notifyPlotGenerated({ id: projectId, title: projectTitle, text: result.text });
      return;
    }
    const updated = await regenerateScene(scene.id);
    setScenes((prev) => prev.map((s) => (s.id === scene.id ? { ...s, ...updated } : s)));
    bumpStoryVersion();
  }

  // The opening plot isn't a real "scene" in the backend — it's grafted on
  // as a pinned first card so the storyboard reads start-to-finish.
  const openingPseudoScene = hasPlot ? { kind: 'plot', title: 'Opening Plot', tone: 'Origin', text: openingPlot } : null;
  const displayScenes = numberScenes(
    openingPseudoScene ? [openingPseudoScene, ...scenes] : scenes
  );
  const displayNewestIndex = newestIndex === null ? null : newestIndex + (openingPseudoScene ? 1 : 0);

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
            <Storyboard
              scenes={displayScenes}
              newestIndex={displayNewestIndex}
              endRef={boardEndRef}
              readOnly={isSubmitted}
              onEditScene={handleEditScene}
              onDeleteScene={handleDeleteScene}
              onRegenerateScene={handleRegenerateScene}
            />
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
