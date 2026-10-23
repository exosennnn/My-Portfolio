import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const W = 320;
const H = 200;
const PLAYER = 14;
const DOT = 6;
const SPEED = 170; // pixels per second
const ROUND_SECONDS = 20;
const GLITCH_EVERY = 6; // seconds between glitches
const GLITCH_LEN = 3; // how long the controls stay flipped

type Kind = 'normal' | 'gold' | 'bad';
const VALUE: Record<Kind, number> = { normal: 1, gold: 5, bad: -2 };
const COLOR: Record<Kind, string> = { normal: '#a3a3a3', gold: '#eab308', bad: '#ef4444' };

const MOVE: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
  ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
  ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
};

type Dot = { x: number; y: number; kind: Kind };

// Mostly normal dots, sometimes gold (rare, good) and sometimes red (avoid)
const randomDot = (): Dot => {
  const r = Math.random();
  const kind: Kind = r < 0.12 ? 'gold' : r < 0.35 ? 'bad' : 'normal';
  return {
    x: 12 + Math.random() * (W - 24),
    y: 12 + Math.random() * (H - 24),
    kind,
  };
};

// On-screen arrow button. Holding it presses the key in the shared set.
function PadButton({ k, label, pressed }: { k: string; label: string; pressed: { current: Set<string> } }) {
  const release = () => pressed.current.delete(k);
  return (
    <button
      type="button"
      aria-label={k}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        pressed.current.add(k);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      className="h-11 w-11 touch-none select-none rounded border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 active:bg-neutral-900 active:text-white dark:active:bg-neutral-100 dark:active:text-neutral-900"
    >
      {label}
    </button>
  );
}

function Game({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pressed = useRef(new Set<string>());
  const targetRef = useRef<{ x: number; y: number } | null>(null); // drag target on the board
  const draggingRef = useRef(false);
  const sim = useRef({
    x: W / 2,
    y: H / 2,
    dots: [] as Dot[],
    score: 0,
    time: ROUND_SECONDS,
    glitchAt: GLITCH_EVERY, // elapsed second when the next glitch starts
    glitchUntil: 0, // elapsed second when the current glitch ends
  });
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [glitching, setGlitching] = useState(false);

  const start = () => {
    pressed.current.clear();
    targetRef.current = null;
    sim.current = {
      x: W / 2,
      y: H / 2,
      dots: [randomDot(), randomDot(), randomDot()],
      score: 0,
      time: ROUND_SECONDS,
      glitchAt: GLITCH_EVERY,
      glitchUntil: 0,
    };
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setGlitching(false);
    setPhase('playing');
  };

  // Only runs during a round
  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const fg = getComputedStyle(canvas).color; // follows light/dark theme
    const onDown = (e: KeyboardEvent) => {
      if (!MOVE[e.key]) return;
      e.preventDefault();
      pressed.current.add(e.key);
    };
    const onUp = (e: KeyboardEvent) => pressed.current.delete(e.key);
    const onBlur = () => pressed.current.clear();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = sim.current;

      // Glitch: controls flip for a few seconds, on a timer
      const elapsed = ROUND_SECONDS - s.time;
      if (elapsed >= s.glitchAt) {
        s.glitchUntil = elapsed + GLITCH_LEN;
        s.glitchAt = elapsed + GLITCH_EVERY;
      }
      const isGlitch = elapsed < s.glitchUntil;
      const sign = isGlitch ? -1 : 1;
      setGlitching(isGlitch);

      // Movement from keys / d-pad
      let dx = 0;
      let dy = 0;
      pressed.current.forEach((k) => {
        const m = MOVE[k];
        if (m) {
          dx += m[0];
          dy += m[1];
        }
      });
      if (dx || dy) {
        const len = Math.hypot(dx, dy);
        s.x += sign * (dx / len) * SPEED * dt;
        s.y += sign * (dy / len) * SPEED * dt;
      } else if (targetRef.current) {
        // Drag toward finger / pointer
        const ddx = targetRef.current.x - s.x;
        const ddy = targetRef.current.y - s.y;
        const dist = Math.hypot(ddx, ddy);
        if (dist > 2) {
          const step = Math.min(dist, SPEED * dt);
          s.x += sign * (ddx / dist) * step;
          s.y += sign * (ddy / dist) * step;
        }
      }
      s.x = Math.min(W - PLAYER / 2, Math.max(PLAYER / 2, s.x));
      s.y = Math.min(H - PLAYER / 2, Math.max(PLAYER / 2, s.y));

      // Collect dots: each kind has its own value, then respawn the same number
      const reach = PLAYER / 2 + DOT / 2 + 2;
      const kept: Dot[] = [];
      let delta = 0;
      let hits = 0;
      for (const d of s.dots) {
        if (Math.hypot(d.x - s.x, d.y - s.y) < reach) {
          delta += VALUE[d.kind];
          hits++;
        } else {
          kept.push(d);
        }
      }
      for (let i = 0; i < hits; i++) kept.push(randomDot());
      if (hits) {
        s.score = Math.max(0, s.score + delta);
        setScore(s.score);
      }
      s.dots = kept;

      s.time = Math.max(0, s.time - dt);
      setTimeLeft(Math.ceil(s.time));

      // Draw
      ctx.clearRect(0, 0, W, H);
      if (isGlitch) {
        ctx.strokeStyle = COLOR.bad;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, W - 2, H - 2);
        ctx.fillStyle = COLOR.bad;
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('glitch', W - 8, 16);
      }
      for (const d of s.dots) {
        ctx.fillStyle = COLOR[d.kind];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.kind === 'gold' ? DOT * 0.8 : DOT / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = fg;
      ctx.fillRect(s.x - PLAYER / 2, s.y - PLAYER / 2, PLAYER, PLAYER);

      if (s.time <= 0) {
        setPhase('done');
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [phase]);

  const toBoard = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const btn =
    'border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 px-3 py-1.5 rounded hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100';

  return (
    // Centered modal: clicking the backdrop closes it, and the panel scrolls if the window is short
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-neutral-900/20 dark:bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Mini game"
        onClick={(e) => e.stopPropagation()}
        className="w-[calc(100vw-3rem)] max-w-[360px] max-h-[90vh] overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl p-4"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-bold tracking-tight">play</h2>
          <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
            {phase === 'playing' && <span>{timeLeft}s</span>}
            <button
              onClick={onClose}
              aria-label="Close game"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100 rounded-sm"
            >
              ✕
            </button>
          </div>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          Gold dots are worth 5, red dots cost 2, and every few seconds the controls flip. Use WASD or the arrow keys, the buttons below, or drag on the board.
        </p>

        <div className="relative border border-neutral-200 dark:border-neutral-800 rounded">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            aria-label="Dot collecting mini game"
            className="block max-w-full h-auto touch-none text-neutral-900 dark:text-neutral-100"
            style={{ width: W }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              draggingRef.current = true;
              targetRef.current = toBoard(e);
            }}
            onPointerMove={(e) => {
              if (draggingRef.current) targetRef.current = toBoard(e);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
              targetRef.current = null;
            }}
            onPointerCancel={() => {
              draggingRef.current = false;
              targetRef.current = null;
            }}
          />

          {phase !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {phase === 'done' && <p className="text-sm">score: {score}</p>}
              <button onClick={start} className={btn}>
                {phase === 'done' ? 'play again' : 'start'}
              </button>
            </div>
          )}
        </div>

        {phase === 'playing' && (
          <div className="mt-3 flex justify-center">
            <div className="grid grid-cols-3 gap-1">
              <span />
              <PadButton k="ArrowUp" label="▲" pressed={pressed} />
              <span />
              <PadButton k="ArrowLeft" label="◀" pressed={pressed} />
              <span />
              <PadButton k="ArrowRight" label="▶" pressed={pressed} />
              <span />
              <PadButton k="ArrowDown" label="▼" pressed={pressed} />
              <span />
            </div>
          </div>
        )}

        {phase === 'playing' && (
          <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
            score: {score}
            {glitching && <span className="ml-3 text-red-500">glitch! controls flipped</span>}
          </p>
        )}
      </div>
    </div>
  );
}

// The game stays hidden until someone types "play" anywhere on the page
// (not while typing in a form field). Escape, ✕, or a backdrop click closes it.
const SECRET = 'play';

export default function MiniGame() {
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
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Phones have no keyboard, so TapToPlay dispatches this event after three quick taps
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-play', onOpen);
    return () => window.removeEventListener('open-play', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  if (!open) return null;
  return <Game onClose={() => setOpen(false)} />;
}

// Wrap any text with this and three quick taps (or clicks) open the game.
// Works on phones, where there is no keyboard.
const TAP_WINDOW_MS = 700;
export function TapToPlay({ children }: { children: ReactNode }) {
  const taps = useRef<number[]>([]);
  const onClick = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < TAP_WINDOW_MS), now];
    if (taps.current.length >= 3) {
      taps.current = [];
      window.dispatchEvent(new Event('open-play'));
    }
  };
  return (
    <span onClick={onClick} className="select-none cursor-default">
      {children}
    </span>
  );
}
