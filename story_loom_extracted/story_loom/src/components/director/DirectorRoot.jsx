import { useRef, useState } from 'react';
import Tabbar from '../layout/Tabbar.jsx';
import RankingsView from './Rankings/RankingsView.jsx';
import ScriptDetailView from './ScriptDetail/ScriptDetailView.jsx';
import DecisionToast from './DecisionToast.jsx';
import { PROJECTS } from '../../data/mockData.js';

const TABS = [
  { id: 'd-rank', label: 'Rankings' },
  { id: 'd-detail', label: 'Script Detail' },
];

export default function DirectorRoot({ isActive }) {
  const [activeView, setActiveView] = useState('d-rank');
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0].title);
  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef(null);

  function openProject(title) {
    setSelectedProject(title);
    setActiveView('d-detail');
  }

  function decide(msg) {
    clearTimeout(toastTimer.current);
    setToastMessage(`${msg} — "${selectedProject}"`);
    setToastShow(true);
    toastTimer.current = setTimeout(() => setToastShow(false), 2600);
  }

  return (
    <div id="director-root" className={isActive ? 'active' : ''}>
      <Tabbar tabs={TABS} activeView={activeView} onChange={setActiveView} />
      <RankingsView active={activeView === 'd-rank'} onOpenProject={openProject} />
      <ScriptDetailView active={activeView === 'd-detail'} projectTitle={selectedProject} onDecide={decide} />
      <DecisionToast message={toastMessage} show={toastShow} />
    </div>
  );
}
