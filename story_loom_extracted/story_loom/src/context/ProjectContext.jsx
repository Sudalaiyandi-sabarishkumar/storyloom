import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getCurrentProjectId } from '../services/apiClient.js';

// Shared "current project" state for the Creator Studio.
//
// The New Project tab is where a project + its opening plot get generated.
// Story Editor / Knowledge Graph / Review Agent all need to know (a) which
// project is active and (b) when something about it just changed, so they
// can (re)fetch from the backend instead of showing static mock content.
//
// Rather than every tab guessing when to refetch, NewProjectView calls
// `notifyPlotGenerated(...)` once the opening plot comes back from the API,
// and StoryEditorView calls `bumpStoryVersion()` after a scene is accepted.
// Every other tab depends on `projectId`/`storyVersion` in its own effects,
// so a bump anywhere causes a live refetch everywhere.
const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projectId, setProjectId] = useState(() => getCurrentProjectId());
  const [projectTitle, setProjectTitle] = useState('');
  const [hasPlot, setHasPlot] = useState(false);
  const [openingPlot, setOpeningPlot] = useState('');
  const [characters, setCharacters] = useState([]);
  // Bumped any time the backend's view of the story changes (new plot, new
  // accepted scene, edited cast, etc.) so dependent tabs know to refetch.
  const [storyVersion, setStoryVersion] = useState(0);

  const bumpStoryVersion = useCallback(() => setStoryVersion((v) => v + 1), []);

  const notifyPlotGenerated = useCallback(({ id, title, text, characters: chars }) => {
    setProjectId(id);
    if (title) setProjectTitle(title);
    if (Array.isArray(chars)) setCharacters(chars);
    setOpeningPlot(text || '');
    setHasPlot(Boolean(text));
    bumpStoryVersion();
  }, [bumpStoryVersion]);

  const value = useMemo(() => ({
    projectId,
    projectTitle,
    hasPlot,
    openingPlot,
    characters,
    storyVersion,
    notifyPlotGenerated,
    bumpStoryVersion,
  }), [projectId, projectTitle, hasPlot, openingPlot, characters, storyVersion, notifyPlotGenerated, bumpStoryVersion]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider');
  return ctx;
}
