import { useEffect, useRef } from 'react';

type Mode = '' | 'link' | 'label' | 'text';

// Replaces the native cursor with a dot and a ring on pointer devices.
// - Over links and buttons the ring grows.
// - Over an element with data-cursor="..." the ring grows and shows that word.
// - Over text fields the native cursor comes back, so typing still looks right.
// Only runs with a fine pointer (mouse or trackpad). Touch screens keep their normal behavior.
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('custom-cursor');

    let x = -100;
    let y = -100;
    let rx = -100; // ring position, lags behind the dot
    let ry = -100;
    let raf = 0;
    let mode: Mode = '';

    const setMode = (next: Mode, text = '') => {
      if (next === mode && text === label.textContent) return;
      mode = next;
      if (next) root.dataset.cursorMode = next;
      else delete root.dataset.cursorMode;
      label.textContent = next === 'label' ? text : '';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      delete root.dataset.cursorHidden;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (reduce) ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest('input, textarea, select')) return setMode('text');
      const tagged = t.closest<HTMLElement>('[data-cursor]');
      if (tagged) return setMode('label', tagged.dataset.cursor ?? '');
      if (t.closest('a, button, [role="button"], label, summary')) return setMode('link');
      setMode('');
    };

    const onLeave = () => root.setAttribute('data-cursor-hidden', '');

    // The ring eases toward the pointer; with reduced motion it simply follows the pointer.
    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    // A small ring expands from every mouse click
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || reduce) return;
      const ripple = document.createElement('span');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerover', onOver);
    root.addEventListener('mouseleave', onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerover', onOver);
      root.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
      root.classList.remove('custom-cursor');
      delete root.dataset.cursorMode;
      delete root.dataset.cursorHidden;
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
      <div ref={ringRef} aria-hidden="true" className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  );
}
