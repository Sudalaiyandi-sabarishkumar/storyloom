import { createPortal } from 'react-dom';

// Portalled to document.body — the New Project view animates its own
// transform on mount (see .view's fadeUp keyframes in layout.css), and a
// CSS transform on an ancestor hijacks position:fixed's containing block.
// Rendering outside that subtree keeps the toast pinned to the real viewport.
export default function Toast({ message, show }) {
  return createPortal(
    <div className={`creator-toast ${show ? 'show' : ''}`}>{message}</div>,
    document.body
  );
}
