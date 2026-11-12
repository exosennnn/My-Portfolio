import { useEffect, useRef, useState } from 'react';

export type Milestone = {
  title: string;
  description: string;
  sem?: string;
  current?: boolean;
  // Optional override: 'done' | 'now' | 'next'. If omitted, it is derived from `current`
  // and the order of the list (items before the first current one count as done).
  status?: 'done' | 'now' | 'next';
};

// A chapter of the story. `title` and `intro` are optional; without them the chapter shows only its milestones.
export type JourneyGroup = { phase: string; short?: string; title?: string; intro?: string; items: Milestone[] };

// Closing section: where the story goes next
export type JourneyNext = { title: string; intro: string; goals: string[] };

// Reads as a story: each phase is a chapter with a heading and a short intro, and every milestone is a beat in it.
// A thin progress bar at the top shows how far through the story you are.
export default function JourneyTimeline({ groups, next }: { groups: JourneyGroup[]; next?: JourneyNext }) {
  const flat = groups.flatMap((g) => g.items);
  const firstCurrent = flat.findIndex((m) => m.current);

  // Resolve each milestone's status once, so the progress bar and the beats agree
  const statusOf = (m: Milestone, i: number): 'done' | 'now' | 'next' =>
    m.status ?? (m.current ? 'now' : firstCurrent !== -1 && i < firstCurrent ? 'done' : 'next');

  const statuses = flat.map(statusOf);
  const nowTitles = flat.filter((_, i) => statuses[i] === 'now').map((m) => m.title);

  // Where each chapter's milestones start in the flat list, so the progress bar can group them
  const starts: number[] = [];
  groups.reduce((acc, g) => {
    starts.push(acc);
    return acc + g.items.length;
  }, 0);

  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  // Reading progress across the whole section
  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)) : 1);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Beats fade in as they scroll into view
  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll<HTMLElement>('[data-idx]');
    if (!items) return;
    if (!('IntersectionObserver' in window)) {
      setRevealed(new Set(Array.from(items, (el) => Number(el.dataset.idx))));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setRevealed((prev) => {
          const next = new Set(prev);
          entries.forEach((e) => {
            if (e.isIntersecting) next.add(Number((e.target as HTMLElement).dataset.idx));
          });
          return next;
        });
      },
      { threshold: 0.2 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  let index = -1;

  return (
    <section ref={sectionRef} className="pt-2 pb-20">
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-0.5 z-50 origin-left bg-neutral-900 dark:bg-neutral-100"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div>
        <h2 className="font-bold mb-10">Development Journey</h2>

        {/* Progress: one segment per milestone, grouped by chapter and labeled underneath */}
        <div className="mb-16">
          <div className="flex gap-3" role="img" aria-label={`${flat.length} milestones. Now: ${nowTitles.join(', ') || 'none'}`}>
            {groups.map((g, gi) => (
              <div key={g.phase} className="flex flex-col min-w-0" style={{ flex: g.items.length }}>
                <div className="flex gap-1">
                  {g.items.map((_, j) => {
                    const st = statuses[starts[gi] + j];
                    return (
                      <span
                        key={j}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                          st === 'done'
                            ? 'bg-neutral-900 dark:bg-neutral-100'
                            : st === 'now'
                              ? 'bg-neutral-900/40 dark:bg-neutral-100/40 animate-pulse motion-reduce:animate-none'
                              : 'bg-neutral-200 dark:bg-neutral-800'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="mt-2 text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 truncate">
                  {g.short ?? g.phase}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-20">
          {groups.map((group, gi) => (
            <article key={group.phase}>
              <header className="mb-10">
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Chapter {gi + 1} · {group.phase}
                </p>
                {group.title && <h3 className="mt-2 text-xl font-bold">{group.title}</h3>}
                {group.intro && (
                  <p className="mt-4 text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-xl">{group.intro}</p>
                )}
              </header>

              <ol className="border-l border-neutral-200 dark:border-neutral-800 space-y-10">
                {group.items.map((m) => {
                  index += 1;
                  const status = statuses[index];
                  const idx = index;
                  return (
                    <li
                      key={m.title}
                      data-idx={idx}
                      className={`relative pl-6 transition-all duration-700 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                        revealed.has(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                      }`}
                    >
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
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h4 className="font-bold">{m.title}</h4>
                        {m.sem && <span className="text-xs text-neutral-400 dark:text-neutral-500">{m.sem}</span>}
                        {status === 'now' && (
                          <span className="text-xs text-neutral-900 dark:text-neutral-100">● now</span>
                        )}
                      </div>
                      <p className="mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">{m.description}</p>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </div>

        {next && (
          <article className="mt-20 border-t border-neutral-200 dark:border-neutral-800 pt-12">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">Next</p>
            <h3 className="mt-2 text-xl font-bold">{next.title}</h3>
            <p className="mt-4 text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-xl">{next.intro}</p>
            <ul className="mt-6 space-y-3 text-neutral-600 dark:text-neutral-400">
              {next.goals.map((g) => (
                <li key={g} className="flex gap-3">
                  <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-500">→</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </section>
  );
}
