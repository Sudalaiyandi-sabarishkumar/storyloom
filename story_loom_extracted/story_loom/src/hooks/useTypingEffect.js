import { useEffect, useRef, useState } from 'react';

// Reveals `text` one character at a time whenever `trigger` changes (and is truthy).
export function useTypingEffect(speed = 14) {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function start(text) {
    clearInterval(intervalRef.current);
    setDisplayed('');
    setIsTyping(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, speed);
  }

  return { displayed, isTyping, start };
}
