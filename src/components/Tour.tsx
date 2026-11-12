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

const CHAR_MS = 26; // how fast the narration types
const HOLD_MS = 3000; // pause after the narration finishes, before the next step
// Reduced motion: the narration appears at once and scrolling jumps instead of animating
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Each step stays long enough for its narration to finish typing, plus a short pause
const dwellFor = (text: string) => Math.max(6000, text.length * CHAR_MS + HOLD_MS);

// The narration types itself out. It is keyed by step, so every step starts from empty.
function Narration({ text }: { text: string }) {
  const reduce = prefersReduced();
  const [n, setN] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) return;
    let t = 0;
    let i = 0;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < text.length) t = window.setTimeout(tick, CHAR_MS);
    };
    t = window.setTimeout(tick, 150);
    return () => window.clearTimeout(t);
  }, [text, reduce]);

  return (
    <span>
      {text.slice(0, n)}
      {n < text.length && <span className="animate-pulse motion-reduce:animate-none">▍</span>}
    </span>
  );
}

// A guided tour that starts on its own whenever the home page opens (after the intro, if it is showing),
// types out each step, and scrolls to each section. It pauses while the pointer is over it,
// and gives control back to the visitor as soon as they scroll or touch the page.
export default function Tour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [auto, setAuto] = useState(false);
  const [hover, setHover] = useState(false);
  const last = STEPS.length - 1;
  const current = STEPS[step];

  // Start by itself every time the home page opens: right after the intro if it is showing, otherwise after a second.
  useEffect(() => {
    let introShowing = false;
    try {
      introShowing = sessionStorage.getItem('intro-seen') !== '1';
    } catch {
      /* storage unavailable: start without the intro check */
    }

    let timer = 0;
    const start = () => {
      setStep(0);
      setAuto(true);
      setOpen(true);
    };
    const onIntroDone = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(start, 500);
    };

    if (introShowing) {
      window.addEventListener('intro-done', onIntroDone);
      timer = window.setTimeout(start, 6000); // safety net in case the intro never reports back
    } else {
      timer = window.setTimeout(start, 1000);
    }
    return () => {
      window.removeEventListener('intro-done', onIntroDone);
      window.clearTimeout(timer);
    };
  }, []);

  // Scroll to the section for the current step
  useEffect(() => {
    if (!open || !current.id) return;
    const reduce = prefersReduced();
    document.getElementById(current.id)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [open, step, current.id]);

  // Auto-play: move on once the narration has been read. Paused while hovered.
  useEffect(() => {
    if (!open || !auto || hover) return;
    if (step >= last) {
      setAuto(false); // the last step stays open with its finish button
      return;
    }
    const t = window.setTimeout(() => setStep((s) => Math.min(last, s + 1)), dwellFor(current.body));
    return () => window.clearTimeout(t);
  }, [open, auto, hover, step, last, current.body]);

  // Scrolling or touching gives control back to the visitor
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
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="fixed bottom-20 left-6 sm:left-60 z-30 w-[calc(100vw-3rem)] max-w-[320px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl p-4"
    >
      <div className="flex items-center justify-between mb-3 text-xs text-neutral-400 dark:text-neutral-500">
        <span className="tabular-nums">
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

      <div className="mb-4 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" aria-hidden="true">
        <div
          className="h-1 rounded-full bg-neutral-900 dark:bg-neutral-100 transition-[opacity,transform,width,background-color] duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <p className="font-bold">{current.title}</p>
      <div className="mt-2 min-h-[3rem] text-sm text-neutral-600 dark:text-neutral-400" aria-live="polite">
        <Narration key={step} text={current.body} />
      </div>
      {step === 0 && name.trim() && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Nice to meet you, {name.trim()}! Let's take a look around.
        </p>
      )}

      {step === last && (
        <button
          onClick={() => {
            close();
            window.dispatchEvent(new Event('open-chat'));
          }}
          className={`mt-3 text-xs px-3 py-1.5 rounded border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors ${focusRing}`}
        >
          Want to talk? Open the chat →
        </button>
      )}

      {step === 0 && (
        <>
          <label htmlFor="tour-name" className="sr-only">
            Your name
          </label>
          <input
            id="tour-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setAuto(false); // typing a name means the visitor is here, so hold on this step
            }}
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
