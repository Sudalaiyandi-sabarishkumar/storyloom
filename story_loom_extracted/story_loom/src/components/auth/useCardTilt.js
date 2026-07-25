import { useCallback, useRef } from 'react';

const MAX_TILT_DEG = 9;

/**
 * Cursor-tracked 3D tilt for the auth card. Sets CSS custom properties on the
 * wrapper (--rx/--ry/--mx/--my) rather than React state, since this fires on
 * every mousemove and a re-render per pixel would be wasteful — the card's
 * own transform/sheen just read these vars in auth.css.
 */
export function useCardTilt() {
  const ref = useRef(null);
  const reduceMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el || reduceMotion.current) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT_DEG * 2}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT_DEG * 2}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
  }, []);

  return { ref, handleMove, handleLeave };
}
