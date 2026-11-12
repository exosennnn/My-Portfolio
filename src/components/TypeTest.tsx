import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { blip } from '../lib/sound';

const ROUND_SECONDS = 20;
const SECRET = 'wpm'; // typed anywhere on the page (outside form fields) to open the test
const LIST_LENGTH = 60;

const pick = (pool: string[], n: number) =>
  Array.from({ length: n }, () => pool[Math.floor(Math.random() * pool.length)]);

type Phase = 'idle' | 'running' | 'done';

const btn =
  'border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 px-3 py-1.5 rounded hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100';

// Words come from the tech stack list, so the test is made of the tools I actually use.
function Test({ words, onClose }: { words: string[]; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [list, setList] = useState<string[]>(() => pick(words, LIST_LENGTH));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'running') inputRef.current?.focus();
  }, [phase]);

  // Count down once a second while a round runs
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && timeLeft === 0) setPhase('done');
  }, [phase, timeLeft]);

  // Escape closes the test
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const start = () => {
    setList(pick(words, LIST_LENGTH));
    setIndex(0);
    setTyped('');
    setCorrect(0);
    setWrong(0);
    setTimeLeft(ROUND_SECONDS);
    setPhase('running');
  };

  const commit = (guess: string) => {
    if (!guess) return;
    const target = list[index];
    if (guess.toLowerCase() === target.toLowerCase()) {
      setCorrect((c) => c + 1);
      blip(880, 0.04);
    } else {
      setWrong((w) => w + 1);
      blip(220, 0.08, 'square', 0.03);
    }
    setIndex((i) => i + 1);
    setTyped('');
    // Keep the list ahead of the player
    if (index + 10 >= list.length) setList((l) => [...l, ...pick(words, 30)]);
  };

  // A space submits the word, so the player never has to press Enter
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (phase !== 'running') return;
    const v = e.target.value;
    if (v.endsWith(' ')) commit(v.trim());
    else setTyped(v);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(typed.trim());
    }
  };

  const target = list[index];
  const total = correct + wrong;
  const wpm = Math.round(correct * (60 / ROUND_SECONDS));
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  // Color each letter of the current word: accent when right, red when wrong
  const charClass = (i: number) => {
    if (i >= typed.length) return 'text-neutral-900 dark:text-neutral-100';
    return typed[i].toLowerCase() === target[i].toLowerCase() ? 'text-accent' : 'text-red-500';
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-neutral-900/20 dark:bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Typing test"
        onClick={(e) => e.stopPropagation()}
        className="w-[calc(100vw-3rem)] max-w-[420px] max-h-[90vh] overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl p-5"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-bold tracking-tight">typing test</h2>
          <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
            {phase === 'running' && <span>{timeLeft}s</span>}
            <button
              onClick={onClose}
              aria-label="Close typing test"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100 rounded-sm"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Type each word and press space. The words are from my tech stack. You get {ROUND_SECONDS} seconds.
        </p>

        <div
          onClick={() => inputRef.current?.focus()}
          className="my-4 min-h-[112px] rounded border border-neutral-200 dark:border-neutral-800 p-4 font-mono"
        >
          {phase === 'running' && target && (
            <>
              <p className="break-words text-lg">
                {target.split('').map((ch, i) => (
                  <span key={i} className={charClass(i)}>
                    {ch}
                  </span>
                ))}
              </p>
              <p className="mt-3 truncate text-xs text-neutral-400 dark:text-neutral-500">
                {list.slice(index + 1, index + 6).join(' ')}
              </p>
            </>
          )}
          {phase === 'idle' && <p className="text-sm text-neutral-500 dark:text-neutral-400">ready when you are</p>}
          {phase === 'done' && (
            <p role="status" className="text-sm">
              <span className="text-lg font-bold">{wpm} wpm</span>
              <span className="ml-3 text-neutral-500 dark:text-neutral-400">{accuracy}% accuracy</span>
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          value={typed}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={phase !== 'running'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Type the highlighted word, then press space"
          placeholder={phase === 'running' ? 'type here' : ''}
          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 disabled:opacity-40 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100"
        />

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-neutral-400 dark:text-neutral-500">
          <span>
            {correct} correct · {wrong} wrong
          </span>
          <button onClick={start} className={btn}>
            {phase === 'idle' ? 'start' : 'play again'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Opens with the secret word "wpm" typed on the page, or with the "typing test" link in the footer.
export default function TypeTest({ words }: { words: string[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer === SECRET) {
        buffer = '';
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-typetest', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-typetest', onOpen);
    };
  }, []);

  if (!open) return null;
  return <Test words={words} onClose={() => setOpen(false)} />;
}
