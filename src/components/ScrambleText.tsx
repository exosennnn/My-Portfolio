import { useEffect, useRef, useState } from 'react';

const CHARS = '!<>-_\\/[]{}=+*^?#abcdefghijklmnopqrstuvwxyz';

// Hover (or keyboard focus) scrambles the letters, then they settle one by one into the real text.
// The real text is kept in a screen-reader-only span, so the noise is never announced.
export default function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const run = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.clearTimeout(timer.current);
    let frame = 0;

    const tick = () => {
      const settled = Math.floor(frame / 2); // one letter locks in every two frames
      if (settled >= text.length) {
        setDisplay(text);
        return;
      }
      setDisplay(
        text
          .split('')
          .map((ch, i) => (ch === ' ' || i < settled ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join(''),
      );
      frame++;
      timer.current = window.setTimeout(tick, 28);
    };
    tick();
  };

  return (
    <span className={`block ${className}`} onMouseEnter={run} onFocus={run}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
