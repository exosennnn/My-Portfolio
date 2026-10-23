import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

// Each tap or click cycles through these looks, applied to the same photo
const LOOKS = [
  'none',
  'invert(1)',
  'hue-rotate(200deg) saturate(2.5)',
  'contrast(1.7) brightness(1.1)',
];

// Profile photo is a side view, so instead of tilting it, it turns to face the mouse:
// cursor on the left flips the photo so the face points left, and it drifts toward the cursor.
// Mouse only, and skipped when the user prefers reduced motion. Tap or click changes the look.
export default function TwistPhoto({ onError }: { onError: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [look, setLook] = useState(0);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !wrapRef.current || !imgRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 (left edge) to 0.5 (right edge)
    const flip = px < 0 ? -1 : 1; // the photo faces right by default
    imgRef.current.style.transform = `translateX(${px * 14}px) scale(${flip * 1.05}, 1.05)`;
  };

  const onLeave = () => {
    if (imgRef.current) imgRef.current.style.transform = '';
  };

  return (
    <div
      ref={wrapRef}
      role="button"
      tabIndex={0}
      aria-label="Change photo style"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={() => setLook((l) => (l + 1) % LOOKS.length)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setLook((l) => (l + 1) % LOOKS.length);
      }}
      className="w-full h-full cursor-pointer select-none overflow-hidden rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100"
    >
      <img
        ref={imgRef}
        src="/profile.png"
        alt="Portrait of Jay Mark Almojuela"
        width={416}
        height={520}
        onError={onError}
        draggable={false}
        className="w-full h-full object-cover transition-[transform,filter] duration-300 ease-out"
        style={{ filter: LOOKS[look] }}
      />
    </div>
  );
}
