import { useState } from 'react';

export type Milestone = {
  title: string;
  description: string;
  sem?: string;
  current?: boolean;
  // Optional override: 'done' | 'now' | 'next'. If omitted, it is derived from `current`
  // and the order of the list (items before the first current one count as done).
  status?: 'done' | 'now' | 'next';
};

export type JourneyGroup = { phase: string; items: Milestone[] };

const LABEL = { done: 'done', now: 'now', next: 'next' } as const;

export default function JourneyTimeline({ groups }: { groups: JourneyGroup[] }) {
  const flat = groups.flatMap((g) => g.items);
  const firstCurrent = flat.findIndex((m) => m.current);

  // Resolve each milestone's status once, so the progress bar and the dots agree
  const statusOf = (m: Milestone, i: number): 'done' | 'now' | 'next' =>
    m.status ?? (m.current ? 'now' : firstCurrent !== -1 && i < firstCurrent ? 'done' : 'next');

  const statuses = flat.map(statusOf);
  const nowTitles = flat.filter((_, i) => statuses[i] === 'now').map((m) => m.title);

  // Current stages start open so the page shows something useful right away
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(flat.filter((m) => m.current).map((m) => m.title)),
  );

  const toggle = (title: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100 rounded-sm';

  let index = -1;

  return (
    <section className="py-20">
      <div className="mt-14">
        <h3 className="font-bold mb-2">Development Journey</h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          Key technical milestones and skills developed over time. Click a milestone to see more.
        </p>

        {/* Progress: one segment per milestone, plus where you are right now */}
        <div className="mb-12">
          <div className="flex gap-1" role="img" aria-label={`${flat.length} milestones. Now: ${nowTitles.join(', ') || 'none'}`}>
            {statuses.map((st, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  st === 'done'
                    ? 'bg-neutral-900 dark:bg-neutral-100'
                    : st === 'now'
                      ? 'bg-neutral-900/40 dark:bg-neutral-100/40 animate-pulse motion-reduce:animate-none'
                      : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              />
            ))}
          </div>
          {nowTitles.length > 0 && (
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="text-neutral-900 dark:text-neutral-100">● now:</span> {nowTitles.join(' · ')}
            </p>
          )}
        </div>

        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.phase}>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">// {group.phase.toLowerCase()}</p>
              <ol className="border-l border-neutral-200 dark:border-neutral-800 space-y-4">
                {group.items.map((m) => {
                  index += 1;
                  const status = statuses[index];
                  const isOpen = open.has(m.title);
                  const panelId = `journey-${index}`;
                  return (
                    <li key={m.title} className="relative pl-6">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[4px] top-[9px] h-2 w-2 rounded-full ${
                          status === 'done'
                            ? 'bg-neutral-900 dark:bg-neutral-100'
                            : status === 'now'
                              ? 'bg-neutral-900 dark:bg-neutral-100 ring-4 ring-neutral-200 dark:ring-neutral-800'
                              : 'bg-white dark:bg-neutral-950 border border-neutral-400 dark:border-neutral-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => toggle(m.title)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className={`w-full text-left py-1 group ${focusRing}`}
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h4 className="font-bold group-hover:underline underline-offset-4">{m.title}</h4>
                          {m.sem && <span className="text-xs text-neutral-400 dark:text-neutral-500">{m.sem}</span>}
                          <span
                            className={`text-xs ${
                              status === 'now'
                                ? 'text-neutral-900 dark:text-neutral-100'
                                : 'text-neutral-400 dark:text-neutral-500'
                            }`}
                          >
                            {status === 'now' ? '● now' : LABEL[status]}
                          </span>
                          <span aria-hidden="true" className="ml-auto text-neutral-400">
                            {isOpen ? '−' : '+'}
                          </span>
                        </div>
                      </button>
                      <div
                        id={panelId}
                        hidden={!isOpen}
                        className="mt-1 text-neutral-600 dark:text-neutral-400"
                      >
                        {m.description}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
