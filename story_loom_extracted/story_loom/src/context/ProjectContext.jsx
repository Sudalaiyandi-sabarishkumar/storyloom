import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearCurrentProjectId, getCurrentProjectId, setCurrentProjectId } from '../services/apiClient.js';

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
  // 'draft' | 'in_review' | 'ranked' | 'greenlit' — anything past 'draft'
  // means the story has been submitted and is read-only in Creator Studio.
  const [status, setStatus] = useState('draft');
  // Bumped any time the backend's view of the story changes (new plot, new
  // accepted scene, edited cast, etc.) so dependent tabs know to refetch.
  const [storyVersion, setStoryVersion] = useState(0);

  const isSubmitted = status !== 'draft';

  const bumpStoryVersion = useCallback(() => setStoryVersion((v) => v + 1), []);

  const notifyPlotGenerated = useCallback(({ id, title, text, characters: chars }) => {
    setProjectId(id);
    if (title) setProjectTitle(title);
    if (Array.isArray(chars)) setCharacters(chars);
    setOpeningPlot(text || '');
    setHasPlot(Boolean(text));
    setStatus('draft');
    bumpStoryVersion();
  }, [bumpStoryVersion]);

  // Hydrates context from a full GET /projects/:id result — used when a
  // story is opened from the "My Stories" list.
  const loadProject = useCallback((project) => {
    setCurrentProjectId(project.id);
    setProjectId(project.id);
    setProjectTitle(project.title || '');
    setOpeningPlot(project.openingPlot || '');
    setHasPlot(Boolean(project.openingPlot));
    setCharacters(Array.isArray(project.characters) ? project.characters : []);
    setStatus(project.status || 'draft');
    bumpStoryVersion();
  }, [bumpStoryVersion]);

  // Called by the "+ New Project" action — clears the implicit "current
  // project" pointer so the next plot generation creates a fresh project
  // instead of silently overwriting whichever one was open before.
  const startNewProject = useCallback(() => {
    clearCurrentProjectId();
    setProjectId(null);
    setProjectTitle('');
    setOpeningPlot('');
    setHasPlot(false);
    setCharacters([]);
    setStatus('draft');
  }, []);

  const markSubmitted = useCallback(() => setStatus('in_review'), []);

  const value = useMemo(() => ({
    projectId,
    projectTitle,
    hasPlot,
    openingPlot,
    characters,
    status,
    isSubmitted,
    storyVersion,
    notifyPlotGenerated,
    bumpStoryVersion,
    loadProject,
    startNewProject,
    markSubmitted,
  }), [projectId, projectTitle, hasPlot, openingPlot, characters, status, isSubmitted, storyVersion, notifyPlotGenerated, bumpStoryVersion, loadProject, startNewProject, markSubmitted]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider');
  return ctx;
}
