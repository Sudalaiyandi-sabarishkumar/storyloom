import { useState } from 'react';
import Tabbar from '../layout/Tabbar.jsx';
import StoriesListView from './Stories/StoriesListView.jsx';
import NewProjectView from './NewProject/NewProjectView.jsx';
import StoryEditorView from './StoryEditor/StoryEditorView.jsx';
import KnowledgeGraphView from './KnowledgeGraph/KnowledgeGraphView.jsx';
import ReviewAgentView from './ReviewAgent/ReviewAgentView.jsx';
import { ProjectProvider, useProject } from '../../context/ProjectContext.jsx';
import { getProjectDetail } from '../../services/projectsService.js';

const NEW_PROJECT_TABS = [
  { id: 'c-new', label: 'New Project' },
  { id: 'c-editor', label: 'Story Editor' },
  { id: 'c-graph', label: 'Knowledge Graph' },
  { id: 'c-review', label: 'Review Agent' },
];

const EXISTING_STORY_TABS = NEW_PROJECT_TABS.filter((t) => t.id !== 'c-new');

function CreatorRootInner({ isActive }) {
  // 'list' = My Stories landing page, 'new' = wizard for a fresh project,
  // 'story' = editing (or, once submitted, viewing) an existing story.
  const [mode, setMode] = useState('list');
  const [activeView, setActiveView] = useState('c-new');
  const [openingStoryId, setOpeningStoryId] = useState(null);
  const [openError, setOpenError] = useState('');
  const { loadProject, startNewProject } = useProject();

  async function openStory(story) {
    setOpeningStoryId(story.id);
    setOpenError('');
    try {
      const detail = await getProjectDetail(story.id);
      loadProject(detail);
      setActiveView('c-editor');
      setMode('story');
    } catch (err) {
      setOpenError(err.message || 'Could not open that story — try again.');
    } finally {
      setOpeningStoryId(null);
    }
  }

  function newProject() {
    startNewProject();
    setActiveView('c-new');
    setMode('new');
  }

  function backToList() {
    setMode('list');
  }

  const tabs = mode === 'story' ? EXISTING_STORY_TABS : NEW_PROJECT_TABS;

  return (
    <div id="creator-root" className={isActive ? 'active' : ''}>
      {mode === 'list' ? (
        <StoriesListView
          active
          onOpenStory={openStory}
          onNewProject={newProject}
          openingStoryId={openingStoryId}
          openError={openError}
        />
      ) : (
        <>
          <button type="button" className="ghost-btn back-to-stories" onClick={backToList}>
            ← My Stories
          </button>
          <Tabbar tabs={tabs} activeView={activeView} onChange={setActiveView} />
          {mode === 'new' && <NewProjectView active={activeView === 'c-new'} />}
          <StoryEditorView active={activeView === 'c-editor'} />
          <KnowledgeGraphView active={activeView === 'c-graph'} />
          <ReviewAgentView active={activeView === 'c-review'} />
        </>
      )}
    </div>
  );
}

export default function CreatorRoot({ isActive }) {
  return (
    <ProjectProvider>
      <CreatorRootInner isActive={isActive} />
    </ProjectProvider>
  );
}
