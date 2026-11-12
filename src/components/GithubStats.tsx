import { useEffect, useState } from 'react';

type Repo = { fork: boolean; language: string | null };
type PushEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { head?: string; commits?: { sha: string; message: string }[] };
};
type Commit = { message: string; repo: string; at: string; url: string };
type Stats = { languages: { name: string; pct: number }[]; commit: Commit | null };

const REFRESH_MS = 5 * 60 * 1000; // GitHub's public API allows 60 unauthenticated requests an hour

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  return (await res.json()) as T;
}

async function loadStats(user: string): Promise<Stats> {
  const [repos, events] = await Promise.all([
    getJson<Repo[]>(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`),
    getJson<PushEvent[]>(`https://api.github.com/users/${user}/events/public?per_page=50`),
  ]);

  // Languages across my own repos (forks excluded), counted by repo rather than lines of code
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (!r.fork && r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  const languages = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, n]) => ({ name, pct: total ? Math.round((n / total) * 100) : 0 }));

  // Newest push that has commits in it
  let commit: Commit | null = null;
  const push = events.find((e) => e.type === 'PushEvent' && (e.payload.commits?.length ?? 0) > 0);
  if (push?.payload.commits) {
    const list = push.payload.commits;
    const c = list.find((x) => x.sha === push.payload.head) ?? list[list.length - 1];
    commit = {
      message: c.message.split('\n')[0],
      repo: push.repo.name.split('/')[1] ?? push.repo.name,
      at: push.created_at,
      url: `https://github.com/${push.repo.name}/commit/${c.sha}`,
    };
  }
  return { languages, commit };
}

function timeAgo(iso: string) {
  const mins = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${Math.floor(mins)}m ago`;
  const hours = mins / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 30) return `${Math.floor(days)}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Top languages and latest pushed commit, pulled from the public GitHub API and refreshed every 5 minutes.
// Hidden if GitHub can't be reached or the rate limit is hit.
export default function GithubStats({ user }: { user: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () =>
      loadStats(user)
        .then((s) => {
          if (!cancelled) {
            setStats(s);
            setFailed(false);
          }
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    run();
    const id = window.setInterval(run, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user]);

  if (!stats) {
    return failed ? null : <p className="mt-6 text-xs text-neutral-400 dark:text-neutral-500">loading live activity…</p>;
  }

  const label = 'mb-4 text-xs uppercase text-neutral-400 dark:text-neutral-500';

  return (
    <div className="mt-6 grid gap-8 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 sm:grid-cols-2 sm:p-6">
      <div>
        <p className={label}>top languages (by repo)</p>
        {stats.languages.length === 0 ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">no languages yet</p>
        ) : (
          <ul className="space-y-3">
            {stats.languages.map((l) => (
              <li key={l.name} className="group">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral-700 dark:text-neutral-300 transition-colors group-hover:text-accent">{l.name}</span>
                  <span className="text-neutral-400 dark:text-neutral-500">{l.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-neutral-900 dark:bg-neutral-100 transition-[opacity,transform,width,background-color] duration-500 group-hover:bg-accent"
                    style={{ width: `${l.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className={label}>latest commit</p>
        {stats.commit ? (
          <a href={stats.commit.url} target="_blank" rel="noreferrer" className="group block">
            <p className="break-words font-bold transition-colors group-hover:text-accent">
              {stats.commit.message} <span className="font-normal text-neutral-400">↗</span>
            </p>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {stats.commit.repo} · {timeAgo(stats.commit.at)}
            </p>
          </a>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">no recent public commits</p>
        )}
        <p className="mt-6 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-900 dark:bg-neutral-100 motion-reduce:animate-none" />
          live · refreshes every 5 min
        </p>
      </div>
    </div>
  );
}
