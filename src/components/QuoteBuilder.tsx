import { useState, type ReactNode } from 'react';

const BUDGETS = ['Under ₱10,000', '₱10,000 – ₱30,000', '₱30,000 – ₱80,000', '₱80,000+', 'Not sure yet'];
const DEADLINES = ['Within 2 weeks', 'About 1 month', '2–3 months', 'Flexible', 'Not sure yet'];
const STEP_TITLES = ['Project type', 'Goal & audience', 'Budget & deadline', 'Your name & send'];

type Props = { email: string; serviceTitles: string[] };

const input =
  'w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100';
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100 rounded-sm';

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left px-3 py-1.5 text-xs rounded-full border transition-colors ${focusRing} ${
        selected
          ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
          : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function QuoteBuilder({ email, serviceTitles }: Props) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState(serviceTitles[0] ?? '');
  const [audience, setAudience] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  const subject = `Project inquiry: ${service}`;
  const body = [
    'Hi Jay Mark,',
    '',
    "I'd like to talk about a project.",
    '',
    `Type of project: ${service}`,
    `Who will use it: ${audience.trim() || 'Not specified'}`,
    `Budget: ${budget || 'Not sure yet'}`,
    `Deadline: ${deadline || 'Not sure yet'}`,
    '',
    `Name: ${name.trim() || '-'}`,
    '',
    'Could we talk about the scope and an estimate?',
  ].join('\n');
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const copyBody = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable, the mailto link still works */
    }
  };

  const last = STEP_TITLES.length - 1;

  return (
    <div className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-8">
      <h3 className="font-bold">Quote builder</h3>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400 text-xs mb-6">
        Answer a few quick questions and I get a clear first message. Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}
      </p>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8" aria-hidden="true">
        {STEP_TITLES.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-800'
            }`}
          />
        ))}
      </div>

      <div className="max-w-lg min-h-[11rem]">
        {step === 0 && (
          <div className="flex flex-wrap gap-2">
            {serviceTitles.map((t) => (
              <Chip key={t} selected={service === t} onClick={() => setService(t)}>
                {t}
              </Chip>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <label htmlFor="qb-audience" className="block text-xs text-neutral-500 dark:text-neutral-400">
              Who will use it, and what should it help them do?
            </label>
            <textarea
              id="qb-audience"
              rows={4}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. customers booking a table, staff tracking inventory"
              className={input}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Budget range</p>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip key={b} selected={budget === b} onClick={() => setBudget(b)}>
                    {b}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">When do you need it?</p>
              <div className="flex flex-wrap gap-2">
                {DEADLINES.map((d) => (
                  <Chip key={d} selected={deadline === d} onClick={() => setDeadline(d)}>
                    {d}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label htmlFor="qb-name" className="block text-xs text-neutral-500 dark:text-neutral-400">
              Your name (optional)
            </label>
            <input id="qb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" className={input} />
            <pre className="whitespace-pre-wrap text-xs text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded p-3 font-mono">
              {`Subject: ${subject}\n\n${body}`}
            </pre>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={mailto}
                className={`border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 px-3 py-1.5 rounded hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors ${focusRing}`}
              >
                open in email →
              </a>
              <button
                type="button"
                onClick={copyBody}
                className={`text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
              >
                {copied ? 'copied ✓' : '[copy message]'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className={`text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 transition-colors ${focusRing}`}
        >
          ← back
        </button>
        {step < last && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(last, s + 1))}
            className={`border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 px-3 py-1.5 rounded text-xs hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors ${focusRing}`}
          >
            next →
          </button>
        )}
      </div>
    </div>
  );
}
