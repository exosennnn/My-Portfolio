import { useEffect, useState } from 'react';

type Props = {
  words: string[];
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
};

// Types out each word, holds, deletes, then moves to the next.
// With prefers-reduced-motion, it shows only the first word, still.
export default function Typewriter({ words, typeMs = 90, deleteMs = 45, holdMs = 1500 }: Props) {
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [wi, setWi] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const word = words[wi];
    let t: number;

    if (!deleting && text === word) {
      t = window.setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && text === '') {
      t = window.setTimeout(() => {
        setDeleting(false);
        setWi((i) => (i + 1) % words.length);
      }, 300);
    } else {
      t = window.setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? deleteMs : typeMs,
      );
    }
    return () => window.clearTimeout(t);
  }, [text, deleting, wi, reduce, words, typeMs, deleteMs, holdMs]);

  if (reduce) return <span>{words[0]}</span>;

  return (
    <span aria-label={words.join(', ')}>
      <span aria-hidden="true">{text}</span>
      <span aria-hidden="true" className="inline-block w-[0.6ch] animate-pulse motion-reduce:animate-none">
        |
      </span>
    </span>
  );
}
