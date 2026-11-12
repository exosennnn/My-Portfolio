import { useEffect, useState } from 'react';
import { blip, isSoundOn, onSoundChange, setSoundOn } from '../lib/sound';

// Speaker button. Sound is off until the visitor turns it on.
export default function SoundToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(isSoundOn);

  useEffect(() => onSoundChange(() => setOn(isSoundOn())), []);

  const toggle = () => {
    const next = !on;
    setSoundOn(next);
    if (next) blip(660, 0.08); // short confirmation tone
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? 'Sound on, click to mute' : 'Sound off, click to turn on'}
      title={on ? 'Sound on' : 'Sound off'}
      className={className}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        {on ? (
          <>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <path d="M22 9l-6 6M16 9l6 6" />
        )}
      </svg>
    </button>
  );
}
