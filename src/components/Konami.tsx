import { useEffect, useRef, useState } from 'react';
import { blip } from '../lib/sound';

// ↑ ↑ ↓ ↓ ← → ← → B A
const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const RAINBOW_MS = 8000;

// Reward: the accent color cycles through the rainbow for 8 seconds, the dot sphere spins faster,
// and a short fanfare plays if sound is on. (The mini game still opens with the word "play".)
export default function Konami() {
  const [msg, setMsg] = useState('');
  const timers = useRef<{ msg?: number; rainbow?: number; hue?: number }>({});

  useEffect(() => {
    let pos = 0;
    const root = document.documentElement;

    const rainbow = () => {
      // Color cycling is motion-like, so reduced-motion visitors get the message only
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let hue = 0;
      window.clearInterval(timers.current.hue);
      timers.current.hue = window.setInterval(() => {
        hue = (hue + 8) % 360;
        root.style.setProperty('--accent', `hsl(${hue} 85% 58%)`);
      }, 60);
      window.clearTimeout(timers.current.rainbow);
      timers.current.rainbow = window.setTimeout(() => {
        window.clearInterval(timers.current.hue);
        root.style.removeProperty('--accent');
      }, RAINBOW_MS);
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[pos]) {
        pos += 1;
        if (pos === CODE.length) {
          pos = 0;
          window.dispatchEvent(new Event('konami'));
          rainbow();
          [660, 880, 1320].forEach((f, i) => window.setTimeout(() => blip(f, 0.12), i * 90));
          setMsg('cheat code accepted. rainbow accent for 8 seconds');
          window.clearTimeout(timers.current.msg);
          timers.current.msg = window.setTimeout(() => setMsg(''), 3000);
        }
      } else {
        pos = key === CODE[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    const t = timers.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t.msg);
      window.clearTimeout(t.rainbow);
      window.clearInterval(t.hue);
      root.style.removeProperty('--accent');
    };
  }, []);

  if (!msg) return null;
  return (
    <p
      role="status"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-40 text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 shadow"
    >
      {msg}
    </p>
  );
}
