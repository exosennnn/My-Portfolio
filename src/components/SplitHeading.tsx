import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = { children: string; num?: string; className?: string };

// Heading whose letters rise into place one by one as it scrolls into view.
// The full text stays available to screen readers; the animated letters are hidden from them.
export default function SplitHeading({ children, num, className = '' }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  // Without IntersectionObserver the letters just show, so there is nothing to wait for
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const numNode: ReactNode = num ? (
    <span className="text-neutral-400 dark:text-neutral-500 font-normal mr-1">{num} </span>
  ) : null;

  return (
    <h2 ref={ref} className={`text-xl font-bold tracking-tight ${className}`}>
      {numNode}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className={`split ${visible ? 'is-in' : ''}`}>
        {children.split('').map((ch, i) => (
          <span key={i} className="split-char">
            <span className="split-letter" style={{ transitionDelay: `${i * 28}ms` }}>
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          </span>
        ))}
      </span>
    </h2>
  );
}
