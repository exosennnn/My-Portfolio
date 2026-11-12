import { useEffect, useRef } from 'react';

const SPACING = 24; // distance between dots, px
const INFLUENCE = 150; // how far the cursor reaches, px
const PUSH = 6; // how far dots near the cursor get pushed away, px

// Canvas dot grid. Dots near the cursor grow, brighten, and move slightly away from it.
// Redraws only when the pointer or the theme changes. Stays still for reduced motion.
export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: -9999, y: -9999 };
    let width = 0;
    let height = 0;
    let frame = 0;

    const draw = () => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      const dark = document.documentElement.classList.contains('dark');
      const rgb = dark ? '255,255,255' : '0,0,0';
      const baseAlpha = dark ? 0.1 : 0.14;

      // Far dots all share one color and size, so they go into a single path and one fill call
      ctx.fillStyle = `rgba(${rgb},${baseAlpha})`;
      ctx.beginPath();
      for (let gx = SPACING / 2; gx < width; gx += SPACING) {
        for (let gy = SPACING / 2; gy < height; gy += SPACING) {
          const dist = Math.hypot(gx - pointer.x, gy - pointer.y);
          if (dist < INFLUENCE) continue;
          ctx.moveTo(gx + 1, gy);
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // Only the dots near the cursor need their own size, position, and brightness
      for (let gx = SPACING / 2; gx < width; gx += SPACING) {
        for (let gy = SPACING / 2; gy < height; gy += SPACING) {
          const dx = gx - pointer.x;
          const dy = gy - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= INFLUENCE) continue;
          const near = 1 - dist / INFLUENCE;
          const ease = near * near;
          const push = ease * PUSH;
          const x = dist ? gx + (dx / dist) * push : gx;
          const y = dist ? gy + (dy / dist) * push : gy;

          ctx.beginPath();
          ctx.arc(x, y, 1 + ease * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${baseAlpha + ease * 0.75})`;
          ctx.fill();
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    resize();
    window.addEventListener('resize', resize);

    if (reduce) {
      return () => window.removeEventListener('resize', resize);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      schedule();
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return; // only when the pointer leaves the window
      pointer.x = -9999;
      pointer.y = -9999;
      schedule();
    };
    const theme = new MutationObserver(schedule);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerout', onOut);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onOut);
      theme.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="dot-grid absolute inset-0 h-full w-full" />;
}
