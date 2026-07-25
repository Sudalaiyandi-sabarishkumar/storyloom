import { useRef, useState } from 'react';
import GenreSection from './GenreSection.jsx';
import CommonElementsSection from './CommonElementsSection.jsx';
import CharactersSection from './CharactersSection.jsx';
import ConflictsSection from './ConflictsSection.jsx';
import ResolutionSection from './ResolutionSection.jsx';
import CopilotPanel from './CopilotPanel.jsx';
import PlotOutput from './PlotOutput.jsx';
import { useTypingEffect } from '../../../hooks/useTypingEffect.js';
import { generateOpeningPlot } from '../../../services/plotAgent.js';
import {
  DEFAULT_SELECTED_GENRES,
  DEFAULT_THEMES,
  INITIAL_CHARACTERS,
  INITIAL_CONFLICTS,
} from '../../../data/mockData.js';

export default function NewProjectView({ active }) {
  const [selectedGenres, setSelectedGenres] = useState(DEFAULT_SELECTED_GENRES);
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [characters, setCharacters] = useState(INITIAL_CHARACTERS);
  const [conflicts, setConflicts] = useState(INITIAL_CONFLICTS);
  const [showPlot, setShowPlot] = useState(false);
  const { displayed, isTyping, start } = useTypingEffect(14);
  const plotRef = useRef(null);

  function toggleGenre(genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function addTheme() {
    setThemes((prev) => [...prev, 'New theme']);
  }

  function addCharacter() {
    setCharacters((prev) => [
      ...prev,
      { name: 'New Character', role: 'Supporting', bio: 'Add a short description…', relationships: ['Add relationship'] },
    ]);
  }

  function addConflict() {
    setConflicts((prev) => [...prev, { conflict: '', hook: '' }]);
  }

  async function handleGeneratePlot() {
    setShowPlot(true);
    plotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const text = await generateOpeningPlot({ selectedGenres, themes, characters, conflicts });
    start(text);
  }

  return (
    <div id="c-new" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">New project</div>
        <div className="page-title">Set up your story</div>
        <div className="page-sub">
          Fill in the template below. Storyloom uses every field here — genre, cast, conflicts — to draft your opening plot.
        </div>
      </div>
      <div className="wizard-grid">
        <div>
          <GenreSection selectedGenres={selectedGenres} onToggle={toggleGenre} />
          <CommonElementsSection themes={themes} onAddTheme={addTheme} />
          <CharactersSection characters={characters} onAddCharacter={addCharacter} />
          <ConflictsSection conflicts={conflicts} onAddConflict={addConflict} />
          <ResolutionSection />

          <button className="primary-btn" onClick={handleGeneratePlot}>✨ Generate starting plot</button>

          <div ref={plotRef}>
            <PlotOutput show={showPlot} displayed={displayed} isTyping={isTyping} />
          </div>
        </div>

        <CopilotPanel />
      </div>
    </div>
  );
}
