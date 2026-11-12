import { useState, type FormEvent } from 'react';

type Props = { email: string; about: string; projects: { title: string }[] };
type Line = { kind: 'in' | 'out'; text: string };

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100 rounded-sm';

export default function Terminal({ email, about, projects }: Props) {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: "type 'help' to see what you can run" }]);

  const run = (cmd: string): string[] | 'clear' => {
    switch (cmd) {
      case 'help':
        return ['available commands: help, about, projects, hire me, clear'];
      case 'about':
        return [about];
      case 'projects':
        return projects.map((p, i) => `${i + 1}. ${p.title}`);
      case 'hire me':
        window.location.href = `mailto:${email}?subject=${encodeURIComponent('Project inquiry')}`;
        return ['opening your mail app...'];
      case 'clear':
        return 'clear';
      default:
        return [`command not found: ${cmd}. type 'help' to see commands`];
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setInput('');
    if (!cmd) return;
    const out = run(cmd);
    if (out === 'clear') {
      setLines([]);
      return;
    }
    setLines((prev) => [
      ...prev,
      { kind: 'in', text: cmd },
      ...out.map((t) => ({ kind: 'out' as const, text: t })),
    ]);
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 font-mono text-xs">
      <div aria-live="polite" className="space-y-1 max-h-48 overflow-y-auto">
        {lines.map((l, i) => (
          <p
            key={i}
            className={l.kind === 'in' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}
          >
            {l.kind === 'in' && <span className="mr-2 text-neutral-400">$</span>}
            {l.text}
          </p>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
        <label htmlFor="terminal-input" className="text-neutral-400">
          $
        </label>
        <input
          id="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="help"
          aria-label="terminal command"
          className={`flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none ${focusRing}`}
        />
      </form>
    </div>
  );
}
