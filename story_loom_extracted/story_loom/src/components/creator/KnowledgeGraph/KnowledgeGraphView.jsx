import { useEffect, useState } from 'react';
import GraphCanvas from './GraphCanvas.jsx';
import CharacterDrawer from './CharacterDrawer.jsx';
import { getKnowledgeGraph } from '../../../services/graphAgent.js';
import { useProject } from '../../../context/ProjectContext.jsx';

const EMPTY_GRAPH = { nodes: [], edges: [], edgeLabels: [], profiles: {} };

export default function KnowledgeGraphView({ active }) {
  const { projectId, hasPlot, storyVersion } = useProject();
  const [selectedId, setSelectedId] = useState(null);
  const [graph, setGraph] = useState(EMPTY_GRAPH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active || !projectId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getKnowledgeGraph(projectId);
        if (!cancelled) {
          setGraph(data);
          setSelectedId(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load the knowledge graph.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [active, projectId, storyVersion]);

  return (
    <div id="c-graph" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Knowledge graph</div>
        <div className="page-title">Characters &amp; relationships</div>
        <div className="page-sub">Built live from your cast, relationships, and scenes. Click a node for details.</div>
      </div>

      {!hasPlot ? (
        <div className="card drawer-empty" style={{ padding: '60px 24px' }}>
          Generate a starting plot in the New Project tab first — the graph builds from your cast and story.
        </div>
      ) : loading ? (
        <div className="card drawer-empty">Building the graph…</div>
      ) : (
        <div className="graph-wrap">
          <div>
            {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}
            <GraphCanvas nodes={graph.nodes} edges={graph.edges} edgeLabels={graph.edgeLabels} onSelect={setSelectedId} />
          </div>
          <CharacterDrawer character={selectedId ? graph.profiles[selectedId] : null} />
        </div>
      )}
    </div>
  );
}
