import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { JourneyGroup, JourneyNext, Milestone } from './JourneyTimeline';

type Status = 'done' | 'now' | 'next';
type Slide =
  | { kind: 'cover' }
  | { kind: 'chapter'; group: JourneyGroup; index: number }
  | { kind: 'next'; next: JourneyNext };

type Props = { groups: JourneyGroup[]; next?: JourneyNext; intro: string };

// Code that gets "typed" on each chapter slide, one language after another.
// Keyed by the chapter's `phase` from App.tsx. Short illustrative snippets, not your real project code.
type Snippet = { file: string; code: string };
const SNIPPETS: Record<string, Snippet[]> = {
  'Year 1': [
    {
      file: 'hello.cpp',
      code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}`,
    },
    {
      file: 'index.html',
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, web!</h1>
  </body>
</html>`,
    },
  ],
  'Year 2': [
    {
      file: 'student.php',
      code: `<?php
$stmt = $pdo->prepare("SELECT name FROM students WHERE id = ?");
$stmt->execute([$id]);
echo $stmt->fetchColumn();`,
    },
    {
      file: 'query.sql',
      code: `SELECT name, course
FROM students
WHERE year_level = 2
ORDER BY name;`,
    },
    {
      file: 'index.html',
      code: `<button class="btn btn-primary" onclick="save()">
  Save
</button>`,
    },
  ],
  'Year 3': [
    {
      file: 'Counter.vue',
      code: `<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Clicked {{ count }} times</button>
</template>`,
    },
    {
      file: 'style.css',
      code: `.card {
  display: flex;
  gap: 1rem;
  border-radius: 8px;
}`,
    },
  ],
  'Self-study': [
    {
      file: 'Counter.jsx',
      code: `export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
    },
    {
      file: 'web.php',
      code: `Route::get('/projects', [ProjectController::class, 'index']);`,
    },
    {
      file: 'Program.cs',
      code: `using System;

Console.WriteLine("Hello from C#");`,
    },
  ],
  'Currently learning': [
    {
      file: 'projects.ts',
      code: `type Project = { title: string; done: boolean };

const projects: Project[] = [
  { title: 'SafeRoute Hub', done: false },
];`,
    },
    {
      file: 'server.js',
      code: `import express from 'express';
const app = express();
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.listen(3000);`,
    },
  ],
};

// Rough typing time for a snippet, in ms, matching the speed used by TypedCode
const typeTime = (code: string) => {
  const breaks = code.split('\n').length - 1;
  return code.length * 38 + breaks * 150;
};

// How long each slide stays on screen during autoplay, in ms
const DURATION: Record<Exclude<Slide['kind'], 'chapter'>, number> = { cover: 7000, next: 8000 };

// A chapter stays long enough for its beats and every snippet to finish typing
const durationOf = (slide: Slide): number => {
  if (slide.kind !== 'chapter') return DURATION[slide.kind];
  const snips = SNIPPETS[slide.group.phase] ?? [];
  const longest = Math.max(0, ...snips.map((sn) => typeTime(sn.code)));
  const stagger = snips.length * 250;
  return Math.max(12000, (slide.group.items.length + 3) * 110 + 180 + stagger + longest + 2500);
};

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The journey as a slideshow: a cover, one slide per chapter, then where it goes next.
// It plays on its own (pauses while the pointer is over it), and can also be driven by the
// arrow keys, the buttons, the dots, or a swipe. Each slide animates in, its milestones arrive
// one after another, and each chapter types out a short code snippet.
export default function JourneyStory({ groups, next, intro }: Props) {
  const slides: Slide[] = useMemo(
    () => [
      { kind: 'cover' },
      ...groups.map((group, index): Slide => ({ kind: 'chapter', group, index })),
      ...(next ? [{ kind: 'next', next } as Slide] : []),
    ],
    [groups, next],
  );
  const total = slides.length;

  // Status of each milestone: explicit, or derived from its position relative to the first "current" one
  const statusMap = useMemo(() => {
    const flat = groups.flatMap((g) => g.items);
    const firstCurrent = flat.findIndex((m) => m.current);
    const map = new Map<Milestone, Status>();
    flat.forEach((m, i) => {
      map.set(m, m.status ?? (m.current ? 'now' : firstCurrent !== -1 && i < firstCurrent ? 'done' : 'next'));
    });
    return map;
  }, [groups]);

  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const currentRef = useRef(0);

  const [auto, setAuto] = useState(() => !prefersReduced());
  const [hover, setHover] = useState(false);

  const go = useCallback(
    (to: number) => {
      const from = currentRef.current;
      const clamped = Math.max(0, Math.min(total - 1, to));
      if (clamped === from) return;
      currentRef.current = clamped;
      setDir(clamped > from ? 1 : -1);
      setCurrent(clamped);
    },
    [total],
  );

  const slide = slides[current];

  // Autoplay: move on after the slide's time is up. Manual moves restart the timer.
  useEffect(() => {
    if (!auto || hover) return;
    if (current >= total - 1) {
      setAuto(false); // the last slide is the end of the story
      return;
    }
    const t = window.setTimeout(() => go(currentRef.current + 1), durationOf(slide));
    return () => window.clearTimeout(t);
  }, [auto, hover, current, total, slide.kind, go]);

  // Keyboard navigation, skipped while typing or while a button or link has focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        go(currentRef.current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(currentRef.current - 1);
      } else if (e.key === 'Home') {
        go(0);
      } else if (e.key === 'End') {
        go(total - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, total]);

  // Swipe on touch screens
  const touchStart = useRef<number | null>(null);
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    touchStart.current = e.clientX;
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return;
    const dx = e.clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) > 50) go(currentRef.current + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="pb-24 select-none">
      {/* Counter, dots, and autoplay */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500">
          {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Journey slides">
          {slides.map((s, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={slideLabel(s)}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-500 ${
                i === current
                  ? 'w-6 bg-neutral-900 dark:bg-neutral-100'
                  : i < current
                    ? 'w-1.5 bg-neutral-900/60 dark:bg-neutral-100/60'
                    : 'w-1.5 bg-neutral-300 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stage: pauses autoplay while hovered. The slide re-mounts on every change, which replays its entrance. */}
      <div
        className="relative min-h-[460px] touch-pan-y"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        {auto && (
          <div className="absolute -top-3 left-0 right-0 h-px bg-neutral-200 dark:bg-neutral-800 overflow-hidden" aria-hidden="true">
            <div
              key={current}
              className="journey-timer h-full bg-neutral-900 dark:bg-neutral-100"
              style={{
                animationDuration: `${durationOf(slide)}ms`,
                animationPlayState: hover ? 'paused' : 'running',
              }}
            />
          </div>
        )}
        <div
          key={current}
          className="journey-slide"
          style={{ ['--dir' as string]: dir } as CSSProperties}
          aria-live="polite"
        >
          {slide.kind === 'cover' && <Cover intro={intro} />}
          {slide.kind === 'chapter' && <Chapter group={slide.group} index={slide.index} statusOf={statusMap} />}
          {slide.kind === 'next' && <Next next={slide.next} />}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 0}
          className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          ← back
        </button>
        <button
          type="button"
          aria-pressed={auto}
          onClick={() => setAuto((v) => !v)}
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          {auto ? '❚❚ pause' : '▶ autoplay'}
        </button>
        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current === total - 1}
          className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-semibold text-white dark:text-neutral-900 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:pointer-events-none"
        >
          next →
        </button>
      </div>
    </section>
  );
}

function slideLabel(s: Slide) {
  if (s.kind === 'cover') return 'Prologue';
  if (s.kind === 'chapter') return s.group.short ?? s.group.phase;
  return 'What comes next';
}

// One "compiler window". Every snippet on a chapter runs at the same time, each started a little after the last.
function TypedCode({ file, code, delay }: { file: string; code: string; delay: number }) {
  const reduce = prefersReduced();
  const [n, setN] = useState(() => (reduce ? code.length : 0));

  useEffect(() => {
    if (reduce) return;
    let t = 0;
    let i = 0;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < code.length) {
        // Pauses a little longer at line breaks, and varies a bit so it looks typed by hand
        t = window.setTimeout(tick, code[i - 1] === '\n' ? 150 : 22 + Math.random() * 30);
      }
    };
    t = window.setTimeout(tick, delay);
    return () => window.clearTimeout(t);
  }, [code, delay, reduce]);

  const started = n > 0;
  const done = n >= code.length;

  return (
    <div className="journey-beat flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-100">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2 text-[11px] text-neutral-400">
        <span className="h-2 w-2 rounded-full bg-neutral-600" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-neutral-600" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-neutral-600" aria-hidden="true" />
        <span className="ml-2 truncate">{file}</span>
        <span className="ml-auto whitespace-nowrap">
          {done ? '✓ done' : started ? '● running' : 'queued'}
        </span>
      </div>
      <pre className="min-h-[9rem] flex-1 overflow-x-auto p-4 text-xs leading-relaxed whitespace-pre" aria-label={`${file} code example`}>
        <code>
          {code.slice(0, n)}
          {started && !done && <span className="journey-caret" aria-hidden="true">▍</span>}
        </code>
      </pre>
    </div>
  );
}

function Cover({ intro }: { intro: string }) {
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="journey-beat vt-profile w-28 sm:w-32 aspect-[4/5] bg-white rounded border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={{ ['--i' as string]: 0 } as CSSProperties}>
        <img src="/profile.png" alt="" className="w-full h-full object-cover" />
      </div>
      <p className="journey-beat text-xs text-neutral-400 dark:text-neutral-500" style={{ ['--i' as string]: 1 } as CSSProperties}>
        Prologue
      </p>
      <h2 className="journey-beat text-3xl sm:text-4xl font-bold tracking-tight leading-tight" style={{ ['--i' as string]: 2 } as CSSProperties}>
        Everything started with a first C++ program.
      </h2>
      <p className="journey-beat max-w-md text-neutral-600 dark:text-neutral-400 leading-relaxed" style={{ ['--i' as string]: 3 } as CSSProperties}>
        {intro}
      </p>
      <p className="journey-beat text-xs text-neutral-400 dark:text-neutral-500" style={{ ['--i' as string]: 4 } as CSSProperties}>
        press → to begin
      </p>
    </div>
  );
}

function Chapter({ group, index, statusOf }: { group: JourneyGroup; index: number; statusOf: Map<Milestone, Status> }) {
  const snippets = SNIPPETS[group.phase] ?? [];
  // Typing starts after the chapter's own beats have arrived
  const beatsDone = (group.items.length + 3) * 110 + 180;

  return (
    <div>
      <p className="journey-beat text-xs text-neutral-400 dark:text-neutral-500" style={{ ['--i' as string]: 0 } as CSSProperties}>
        Chapter {index + 1} · {group.phase}
      </p>
      {group.title && (
        <h2 className="journey-beat mt-2 text-2xl sm:text-3xl font-bold tracking-tight" style={{ ['--i' as string]: 1 } as CSSProperties}>
          {group.title}
        </h2>
      )}
      {group.intro && (
        <p className="journey-beat mt-4 max-w-xl text-neutral-700 dark:text-neutral-300 leading-relaxed" style={{ ['--i' as string]: 2 } as CSSProperties}>
          {group.intro}
        </p>
      )}

      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
        {group.items.map((m, i) => {
          const status = statusOf.get(m) ?? 'next';
          return (
            <li
              key={m.title}
              className="journey-beat relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 p-5"
              style={{ ['--i' as string]: i + 3 } as CSSProperties}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                  {status === 'now' && (
                    <span className="journey-now absolute inset-0 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                  )}
                  <span
                    className={`relative h-2.5 w-2.5 rounded-full ${
                      status === 'next'
                        ? 'border border-neutral-400 dark:border-neutral-600'
                        : 'bg-neutral-900 dark:bg-neutral-100'
                    }`}
                  />
                </span>
                <h3 className="font-bold">{m.title}</h3>
                {status === 'now' && <span className="text-xs text-neutral-900 dark:text-neutral-100">● now</span>}
              </div>
              {m.sem && <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{m.sem}</p>}
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{m.description}</p>
            </li>
          );
        })}
      </ol>

      {snippets.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {snippets.map((sn, i) => (
            <TypedCode key={sn.file + i} file={sn.file} code={sn.code} delay={beatsDone + 300 + i * 250} />
          ))}
        </div>
      )}
    </div>
  );
}

function Next({ next }: { next: JourneyNext }) {
  return (
    <div>
      <p className="journey-beat text-xs text-neutral-400 dark:text-neutral-500" style={{ ['--i' as string]: 0 } as CSSProperties}>
        The end, for now
      </p>
      <h2 className="journey-beat mt-2 text-2xl sm:text-3xl font-bold tracking-tight" style={{ ['--i' as string]: 1 } as CSSProperties}>
        {next.title}
      </h2>
      <p className="journey-beat mt-4 max-w-xl text-neutral-700 dark:text-neutral-300 leading-relaxed" style={{ ['--i' as string]: 2 } as CSSProperties}>
        {next.intro}
      </p>
      <ul className="mt-8 space-y-4 text-neutral-600 dark:text-neutral-400">
        {next.goals.map((g, i) => (
          <li key={g} className="journey-beat flex gap-3" style={{ ['--i' as string]: i + 3 } as CSSProperties}>
            <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-500">→</span>
            <span>{g}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
