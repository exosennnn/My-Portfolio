import { useEffect, useState } from 'react';

// Each step scrolls to a section on the home page. Ids must match the ids in App.tsx.
const STEPS: { id: string | null; title: string; body: string }[] = [
  { id: null, title: 'Welcome', body: "Hi! I'm your guide. What's your name?" },
  { id: 'about', title: 'About', body: 'Who I am and what I am working on right now.' },
  { id: 'stack', title: 'Stack', body: 'The languages, frameworks, and tools I use.' },
  { id: 'projects', title: 'Projects', body: 'Things I have built, from console apps to web apps.' },
  { id: 'services', title: 'Services', body: 'What I can help build for you as a freelancer.' },
  { id: 'journey', title: 'Journey', body: 'My learning path so far, from C++ to React.' },
  { id: 'blog', title: 'Blog', body: 'Short notes on what I am learning.' },
  { id: 'contact', title: 'Contact', body: 'Send me an email or a message.' },
  { id: null, title: 'That is the tour', body: 'Thanks for stopping by. Feel free to play the mini game above.' },
];

const AUTO_MS = 6000; // time each step stays on screen during auto-play

export default function Tour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [auto, setAuto] = useState(false);
  const last = STEPS.length - 1;
  const current = STEPS[step];

  // Scroll to the section for the current step
  useEffect(() => {
    if (!open || !current.id) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(current.id)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [open, step, current.id]);

  // Auto-play: advance a step every few seconds, stop at the last step
  useEffect(() => {
    if (!open || !auto) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s >= last) {
          setAuto(false);
          return s;
        }
        return s + 1;
      });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [open, auto, last]);

  // If the visitor scrolls or touches the page themselves, auto-play gives control back to them
  useEffect(() => {
    if (!open || !auto) return;
    const stop = () => setAuto(false);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
  }, [open, auto]);

  // Escape closes the tour
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const openTour = () => {
    setStep(0);
    setAuto(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
    setOpen(true);
  };

  const close = () => {
    setAuto(false);
    setOpen(false);
  };

  const next = () => {
    setAuto(false);
    if (step === last) close();
    else setStep((s) => s + 1);
  };

  const back = () => {
    setAuto(false);
    setStep((s) => Math.max(0, s - 1));
  };

  const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100 rounded-sm';

  const bodyText =
    step === 0 && name.trim() ? `Nice to meet you, ${name.trim()}! Let's take a look around.` : current.body;

  if (!open) {
    return (
      <button
        onClick={openTour}
        className={`fixed bottom-6 left-6 sm:left-60 z-20 text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors ${focusRing}`}
      >
        take the tour
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Site tour"
      className="fixed bottom-20 left-6 sm:left-60 z-30 w-[calc(100vw-3rem)] max-w-[320px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl p-4"
    >
      <div className="flex items-center justify-between mb-3 text-xs text-neutral-400 dark:text-neutral-500">
        <span>
          {step + 1} / {STEPS.length}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAuto((a) => !a)}
            aria-pressed={auto}
            className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
          >
            {auto ? 'pause' : 'auto'}
          </button>
          <button onClick={close} aria-label="Close tour" className={`hover:text-neutral-900 dark:hover:text-neutral-100 ${focusRing}`}>
            ✕
          </button>
        </div>
      </div>

      <p className="font-bold">{current.title}</p>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{bodyText}</p>

      {step === 0 && (
        <>
          <label htmlFor="tour-name" className="sr-only">Your name</label>
          <input
            id="tour-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            className={`mt-3 w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 ${focusRing}`}
          />
        </>
      )}

      <div className="mt-4 flex justify-between gap-2">
        <button
          onClick={back}
          disabled={step === 0}
          className={`text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 transition-colors ${focusRing}`}
        >
          ← back
        </button>
        <button
          onClick={next}
          className={`text-xs px-3 py-1.5 rounded border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors ${focusRing}`}
        >
          {step === last ? 'finish' : 'next →'}
        </button>
      </div>
    </div>
  );
}
