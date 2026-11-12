import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const TILT = -8; // degrees, so the ring is seen slightly from above
const AUTO_SPEED = 14; // degrees per second while idle
const DRAG_FACTOR = 0.35; // degrees of turn per pixel of drag
const TIERS = 5; // names sit on five heights; 5 keeps neighbors from ever sharing one
const TIER_GAP = 36; // px between heights, taller than a tag so stacked tags never touch

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Monochrome logos from Simple Icons (solid single-color SVGs, so they fit the black-and-white design).
// Each name lists slugs to try in order; if one is missing, the next is used, and if none load the
// name shows as text only. Check slugs at https://simpleicons.org
const ICON_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons';
const ICONS: Record<string, string[]> = {
  'Python': ['python'],
  'JavaScript': ['javascript'],
  'C++': ['cplusplus'],
  'C#': ['csharp', 'dotnet'],
  'HTML': ['html5'],
  'CSS': ['css', 'css3'],
  'PHP': ['php'],
  'Java': ['openjdk', 'java'],
  'Vue.js': ['vuedotjs', 'vue'],
  'React': ['react'],
  'Tailwind CSS': ['tailwindcss'],
  'Vite': ['vite'],
  'Bootstrap 5': ['bootstrap'],
  'Laravel': ['laravel'],
  'Node.js': ['nodedotjs'],
  'TypeScript': ['typescript'],
  'MySQL': ['mysql'],
  'PostgreSQL': ['postgresql'],
  'Supabase': ['supabase'],
  'Git': ['git'],
  'GitHub': ['github'],
  'VS Code': ['visualstudiocode', 'vscode'],
  'npm': ['npm'],
  'Figma': ['figma'],
  'XAMPP': ['xampp'],
};

// Gives each name a height so that no two names within two steps on the ring share one.
// With 26 names and 5 heights this has no clashes; the greedy pick falls back if it ever can't.
function assignTiers(n: number): number[] {
  const t: number[] = [];
  for (let i = 0; i < n; i++) {
    const taken = new Set<number>();
    for (const d of [-2, -1, 1, 2]) {
      const j = (i + d + n) % n;
      if (j < i) taken.add(t[j]);
    }
    let pick = -1;
    for (let k = 0; k < TIERS; k++) {
      if (!taken.has(k)) {
        pick = k;
        break;
      }
    }
    t.push(pick === -1 ? i % TIERS : pick);
  }
  return t;
}

function TechIcon({ name }: { name: string }) {
  const slugs = ICONS[name];
  const [idx, setIdx] = useState(0);
  if (!slugs || idx >= slugs.length) return null;
  return (
    <img
      key={slugs[idx]}
      src={`${ICON_CDN}/${slugs[idx]}.svg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setIdx((i) => i + 1)}
      className="mr-1.5 inline-block h-3 w-3 align-[-1px] dark:invert"
    />
  );
}

// A 3D ring of tech names. It turns on its own, pauses while the mouse is over it so names can be read,
// and can be dragged (or swiped on touch) to turn it. Names facing you are fully visible; the back ones fade.
// It only animates while it is on screen. Reduced motion: no auto-turn, but dragging still works.
export default function StackOrbit({ items }: { items: string[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const state = useRef({ rot: 0, vel: 0, hover: false, drag: false, lastX: 0, lastT: 0 });
  const [radius, setRadius] = useState(180);
  const [front, setFront] = useState('');
  const step = 360 / items.length;
  const tiers = useRef<number[]>([]);
  if (tiers.current.length !== items.length) tiers.current = assignTiers(items.length);

  // Size the ring to the container so it fits on phones too
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setRadius(clamp(entry.contentRect.width * 0.42, 120, 200));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One animation loop, started only while the ring is on screen.
  // Velocity eases toward the idle speed (or zero while hovered), so a flick from dragging slows down smoothly.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = state.current;
    let raf = 0;
    let last = 0;
    let frontIdx = -1;
    let visible = false;
    const shown = new Array<number>(items.length).fill(-1);

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      if (!s.drag) {
        const target = s.hover || reduce ? 0 : AUTO_SPEED;
        s.vel += (target - s.vel) * Math.min(1, dt * 2.5);
        s.rot += s.vel * dt;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `rotateX(${TILT}deg) rotateY(${s.rot}deg)`;
      }

      // Fade names by how far they face away from the viewer; find the one facing front.
      // Only write an opacity when it actually changed, so idle frames do almost no work.
      let best = -2;
      let bestIdx = 0;
      itemRefs.current.forEach((node, i) => {
        if (!node) return;
        const z = Math.cos(((i * step + s.rot) * Math.PI) / 180); // 1 = front, -1 = back
        const o = Math.round((0.15 + (0.85 * (z + 1)) / 2) * 100) / 100;
        if (o !== shown[i]) {
          shown[i] = o;
          node.style.opacity = String(o);
        }
        if (z > best) {
          best = z;
          bestIdx = i;
        }
      });
      if (bestIdx !== frontIdx) {
        frontIdx = bestIdx;
        setFront(items[bestIdx]);
      }

      if (visible) raf = requestAnimationFrame(frame);
    };

    // Stop the loop when scrolled away, and resume when it comes back into view
    const io = new IntersectionObserver(([entry]) => {
      const nowVisible = entry.isIntersecting;
      if (nowVisible === visible) return;
      visible = nowVisible;
      if (visible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [items, step]);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = state.current;
    s.drag = true;
    s.vel = 0;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = state.current;
    if (!s.drag) return;
    const dx = e.clientX - s.lastX;
    const now = performance.now();
    const dt = Math.max(1, now - s.lastT) / 1000;
    s.lastX = e.clientX;
    s.lastT = now;
    s.rot += dx * DRAG_FACTOR;
    s.vel = clamp((dx * DRAG_FACTOR) / dt, -300, 300); // keeps the last speed for a flick
  };

  const onUp = () => {
    state.current.drag = false;
  };

  return (
    <div className="mb-10">
      <div
        ref={wrapRef}
        role="group"
        aria-label="Tech stack ring. Drag to turn it."
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') state.current.hover = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') state.current.hover = false;
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative h-[260px] select-none touch-pan-y cursor-grab active:cursor-grabbing overflow-hidden [perspective:900px]"
      >
        <div ref={ringRef} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
          {items.map((name, i) => {
            const tier = tiers.current[i] - Math.floor(TIERS / 2); // centered: -2..2
            return (
              <span
                key={name}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="absolute left-1/2 top-1/2 whitespace-nowrap rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 py-0.5 text-xs text-neutral-700 dark:text-neutral-300 [backface-visibility:hidden]"
                style={{
                  transform: `translate(-50%, calc(-50% + ${tier * TIER_GAP}px)) rotateY(${i * step}deg) translateZ(${radius}px)`,
                }}
              >
                <TechIcon name={name} />
                {name}
              </span>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
        facing you: <span className="font-bold text-accent">{front}</span> · drag to turn
      </p>
    </div>
  );
}
