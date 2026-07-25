import { useState } from 'react';
import GraphCanvas from './GraphCanvas.jsx';
import CharacterDrawer from './CharacterDrawer.jsx';
import { CHARACTER_PROFILES } from '../../../data/mockData.js';

export default function KnowledgeGraphView({ active }) {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div id="c-graph" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Knowledge graph</div>
        <div className="page-title">Characters &amp; relationships</div>
        <div className="page-sub">Generated with RAG over your full story and template. Click a node for details.</div>
      </div>
      <div className="graph-wrap">
        <div>
          <GraphCanvas onSelect={setSelectedId} />
        </div>
        <CharacterDrawer character={selectedId ? CHARACTER_PROFILES[selectedId] : null} />
      </div>
    </div>
  );
}
