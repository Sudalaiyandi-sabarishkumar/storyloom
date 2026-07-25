import { useRef, useState } from 'react';
import GenreSection from './GenreSection.jsx';
import CommonElementsSection from './CommonElementsSection.jsx';
import CharactersSection from './CharactersSection.jsx';
import ConflictsSection from './ConflictsSection.jsx';
import ResolutionSection from './ResolutionSection.jsx';
import CopilotPanel from './CopilotPanel.jsx';
import PlotOutput from './PlotOutput.jsx';
import Toast from '../Toast.jsx';
import { useTypingEffect } from '../../../hooks/useTypingEffect.js';
import { generateOpeningPlot } from '../../../services/plotAgent.js';
import { useProject } from '../../../context/ProjectContext.jsx';

export default function NewProjectView({ active }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [themes, setThemes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [timeline, setTimeline] = useState('');
  const [coreStory, setCoreStory] = useState('');
  const [background, setBackground] = useState('');
  const [resolution, setResolution] = useState('');
  const [showPlot, setShowPlot] = useState(false);
  const [genError, setGenError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef(null);
  const { displayed, isTyping, start } = useTypingEffect(14);
  const plotRef = useRef(null);
  const { notifyPlotGenerated } = useProject();

  function showToast(message) {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    setToastShow(true);
    toastTimer.current = setTimeout(() => setToastShow(false), 2600);
  }

  function toggleGenre(genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function addTheme() {
    setThemes((prev) => [...prev, '']);
  }

  function updateTheme(index, value) {
    setThemes((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function removeTheme(index) {
    setThemes((prev) => prev.filter((_, i) => i !== index));
  }

  function addCharacter() {
    setCharacters((prev) => [
      ...prev,
      { name: '', role: '', bio: '', relationships: [] },
    ]);
  }

  function updateCharacter(index, field, value) {
    setCharacters((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function removeCharacter(index) {
    setCharacters((prev) => prev.filter((_, i) => i !== index));
  }

  function addConflict() {
    setConflicts((prev) => [...prev, { conflict: '', hook: '' }]);
  }

  function updateConflict(index, field, value) {
    setConflicts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function removeConflict(index) {
    setConflicts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGeneratePlot() {
    if (selectedGenres.length === 0) {
      showToast('Pick at least one genre before generating.');
      return;
    }
    setShowPlot(true);
    setGenError('');
    plotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    try {
      const result = await generateOpeningPlot({
        selectedGenres,
        themes,
        characters,
        conflicts,
        timeline,
        coreStory,
        background,
        resolution,
      });
      start(result.text);
      // Everything downstream (Story Editor's scenes/suggestions, the
      // Knowledge Graph, and Review Agent's feedback) keys off this.
      notifyPlotGenerated(result);
    } catch (err) {
      setGenError(err.message || 'Could not generate a plot — try again.');
    }
  }

  return (
    <div id="c-new" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">New project</div>
        <div className="page-title">Set up your story</div>
        <div className="page-sub">
          Genre is the only required field — everything else is optional and only sharpens the draft.
        </div>
      </div>
      <div className="wizard-grid">
        <div>
          <GenreSection selectedGenres={selectedGenres} onToggle={toggleGenre} />
          <CommonElementsSection
            timeline={timeline}
            onTimelineChange={setTimeline}
            coreStory={coreStory}
            onCoreStoryChange={setCoreStory}
            background={background}
            onBackgroundChange={setBackground}
            themes={themes}
            onAddTheme={addTheme}
            onThemeChange={updateTheme}
            onRemoveTheme={removeTheme}
          />
          <CharactersSection
            characters={characters}
            onAddCharacter={addCharacter}
            onCharacterChange={updateCharacter}
            onRemoveCharacter={removeCharacter}
          />
          <ConflictsSection
            conflicts={conflicts}
            onAddConflict={addConflict}
            onConflictChange={updateConflict}
            onRemoveConflict={removeConflict}
          />
          <ResolutionSection resolution={resolution} onResolutionChange={setResolution} />

          <button className="primary-btn" onClick={handleGeneratePlot}>
            ✨ Generate starting plot
          </button>

          <div ref={plotRef}>
            {genError && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{genError}</div>}
            <PlotOutput show={showPlot} displayed={displayed} isTyping={isTyping} />
          </div>
        </div>

        <CopilotPanel />
      </div>

      <Toast message={toastMessage} show={toastShow} />
    </div>
  );
}

