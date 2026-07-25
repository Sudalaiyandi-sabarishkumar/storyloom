import { useState } from 'react';
import Tabbar from '../layout/Tabbar.jsx';
import NewProjectView from './NewProject/NewProjectView.jsx';
import StoryEditorView from './StoryEditor/StoryEditorView.jsx';
import KnowledgeGraphView from './KnowledgeGraph/KnowledgeGraphView.jsx';
import ReviewAgentView from './ReviewAgent/ReviewAgentView.jsx';
import { ProjectProvider } from '../../context/ProjectContext.jsx';

const TABS = [
  { id: 'c-new', label: 'New Project' },
  { id: 'c-editor', label: 'Story Editor' },
  { id: 'c-graph', label: 'Knowledge Graph' },
  { id: 'c-review', label: 'Review Agent' },
];

export default function CreatorRoot({ isActive }) {
  const [activeView, setActiveView] = useState('c-new');

  return (
    <div id="creator-root" className={isActive ? 'active' : ''}>
      <ProjectProvider>
        <Tabbar tabs={TABS} activeView={activeView} onChange={setActiveView} />
        <NewProjectView active={activeView === 'c-new'} />
        <StoryEditorView active={activeView === 'c-editor'} />
        <KnowledgeGraphView active={activeView === 'c-graph'} />
        <ReviewAgentView active={activeView === 'c-review'} />
      </ProjectProvider>
    </div>
  );
}
