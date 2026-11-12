import { useRef, type ReactNode, type PointerEvent } from 'react';

// Wraps a button or link so it leans toward the cursor while the pointer is over it.
// The outer span's padding widens the area that reacts without changing the layout.
// Mouse only, and no movement for reduced motion.
export default function Magnetic({
  children,
  strength = 0.3,
  max = 10,
}: {
  children: ReactNode;
  strength?: number;
  max?: number;
}) {
  const inner = useRef<HTMLSpanElement>(null);

  const clamp = (v: number) => Math.max(-max, Math.min(max, v));

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== 'mouse' || !inner.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = clamp((e.clientX - (r.left + r.width / 2)) * strength);
    const dy = clamp((e.clientY - (r.top + r.height / 2)) * strength);
    inner.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const reset = () => {
    if (inner.current) inner.current.style.transform = '';
  };

  return (
    <span onPointerMove={onMove} onPointerLeave={reset} className="inline-block p-3 -m-3">
      <span ref={inner} className="inline-block transition-transform duration-300 ease-out">
        {children}
      </span>
    </span>
  );
}
