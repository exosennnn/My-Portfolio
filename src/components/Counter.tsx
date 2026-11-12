import { useEffect, useRef, useState } from 'react';

// Counts up to `to` once the number scrolls into view. Reduced motion shows the final number straight away.
export default function Counter({ to, label }: { to: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [value, setValue] = useState(
    () => (reduce || !('IntersectionObserver' in window) ? to : 0),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (!('IntersectionObserver' in window)) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 900;
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, reduce]);

  return (
    <span className="flex flex-col">
      <span ref={ref} className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs uppercase text-neutral-500 dark:text-neutral-400">{label}</span>
    </span>
  );
}
