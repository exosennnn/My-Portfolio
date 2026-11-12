import { useEffect, useState } from 'react';

const NAME = 'Jay Mark Almojuela';
const SEEN = 'intro-seen';

// Typing intro on the first visit of a browser session. Click or press any key to skip.
// With reduced motion there is no intro at all.
export default function Intro() {
  const [show, setShow] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return sessionStorage.getItem(SEEN) !== '1';
    } catch {
      return true;
    }
  });
  const [text, setText] = useState('');
  const [leaving, setLeaving] = useState(false);

  const finish = () => {
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      /* storage unavailable, the intro may show again */
    }
    setLeaving(true);
  };

  // Type the name one letter at a time, then leave after a short pause
  useEffect(() => {
    if (!show || leaving) return;
    if (text.length < NAME.length) {
      const t = window.setTimeout(() => setText(NAME.slice(0, text.length + 1)), 70);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(finish, 700);
    return () => window.clearTimeout(t);
  }, [show, leaving, text]);

  // Remove the overlay once the fade-out is done
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setShow(false), 550);
    return () => window.clearTimeout(t);
  }, [leaving]);

  // Any key skips the intro
  useEffect(() => {
    if (!show || leaving) return;
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, leaving]);

  if (!show) return null;

  return (
    <div
      role="status"
      onClick={finish}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-6 bg-white dark:bg-neutral-950 px-6 font-mono transition-opacity duration-500 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <p className="sr-only">{NAME}</p>
      <p aria-hidden="true" className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        {text}
        <span className="ml-1 inline-block text-accent animate-pulse motion-reduce:animate-none">_</span>
      </p>
      <p aria-hidden="true" className="text-xs text-neutral-400 dark:text-neutral-500">click or press any key to skip</p>
    </div>
  );
}
