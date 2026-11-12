import { useEffect, useRef, type ReactNode } from 'react';

const CHIP =
  'px-2 py-0.5 text-xs rounded border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 text-neutral-700 dark:text-neutral-300 shadow-sm whitespace-nowrap';

// Each chip drifts toward or away from the cursor at its own depth. Mouse only; still for reduced motion.
function Chip({ depth, className, children }: { depth: number; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${nx * depth * 40}px, ${ny * depth * 40}px, 0)`;
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [depth]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute hidden md:block transition-transform duration-500 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

// Decorative pieces in the hero's empty bottom and top padding, so they never cover the text.
export default function FloatingChips() {
  return (
    <>
      <Chip depth={1.4} className="top-1 right-0">
        <span className={CHIP}>$ npm run dev</span>
      </Chip>
      <Chip depth={1} className="top-1 left-2">
        <span className={CHIP}>php</span>
      </Chip>
      <Chip depth={0.7} className="bottom-6 left-10">
        <span className={CHIP}>&lt;Vue /&gt;</span>
      </Chip>
      <Chip depth={0.5} className="bottom-3 right-6">
        <span className={CHIP}>React</span>
      </Chip>
    </>
  );
}
