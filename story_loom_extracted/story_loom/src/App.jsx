import { useEffect, useState } from 'react';
import Topbar from './components/layout/Topbar.jsx';
import CreatorRoot from './components/creator/CreatorRoot.jsx';
import DirectorRoot from './components/director/DirectorRoot.jsx';

export default function App() {
  const [persona, setPersona] = useState('creator');

  useEffect(() => {
    document.body.classList.toggle('director-mode', persona === 'director');
  }, [persona]);

  return (
    <>
      <Topbar persona={persona} onPersonaChange={setPersona} />
      <CreatorRoot isActive={persona === 'creator'} />
      <DirectorRoot isActive={persona === 'director'} />
    </>
  );
}
