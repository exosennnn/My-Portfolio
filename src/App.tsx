import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import Reveal from './components/Reveal';

const EMAIL = 'almojuelajaymark0@gmail.com'; // TODO: put your real email here

const LINKS = {
  github: 'https://github.com/exosennnn',
  linkedin: 'https://www.linkedin.com/in/jay-mark-almojuela-408587427/',
  instagram: 'https://www.instagram.com/exosennn',
  resume: '', // TODO: e.g. '/resume.pdf' (put the file in /public). Leave '' to hide the link.
};

type Project = {
  title: string;
  language: string;
  description: string;
  tags: string[];
  url: string;
  demo?: string; // add a live link here when you deploy one
};

const PROJECTS: Project[] = [
  {
    title: 'CineStream',
    language: 'Python',
    description:
      'Desktop cinema ticketing and management system. Modules cover login and sign-up, movies, halls, schedules, seat map, pricing and promos, payments, QR tickets, sales reports, an audit log, and customer profiles with booking history.',
    tags: ['Python', 'Desktop app', 'QR tickets'],
    url: 'https://github.com/exosennnn/CineStream-Project',
  },
  {
    title: 'Campus Reservation System',
    language: 'JavaScript',
    description:
      'A web app for reserving campus spaces and resources, so requests are tracked in one place instead of on paper or chat. Built with plain HTML, CSS, and JavaScript, no framework.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://github.com/exosennnn/Campus-Reservation-System',
  },
  {
    title: 'Taskify',
    language: 'JavaScript',
    description:
      'A task manager for adding, tracking, and finishing to-dos, built with the Vue 3 Composition API and Vite.',
    tags: ['Vue 3', 'Vite'],
    url: 'https://github.com/exosennnn/Taskify',
  },
  {
    title: 'Payroll System',
    language: 'C++',
    description:
      'A console-based payroll program in C++ that handles employee pay computation.',
    tags: ['C++', 'Console app'],
    url: 'https://github.com/exosennnn/PayrollSystem',
  },
  {
    title: 'Rock, Paper and Scissors Game',
    language: 'C++',
    description:
      'A console-based implementation of the classic Rock-Paper-Scissors game developed in C++. This project serves as an interactive application demonstrating core programming logic, modular design, and user input handling in C++..',
    tags: ['C++', 'Console app'],
    url: 'https://github.com/exosennnn/Rock-Paper-Scissors-Game',
  },
    {
    title: 'FinMetrics Expense Tracker',
    language: 'JavaScript',
    description:
      'FinMetrics is a responsive, client-side personal finance manager built with Vue 3 and Tailwind CSS for multi-wallet tracking, monthly budgeting, visual analytics, and savings goal management.',
    tags: ['Vue.js', 'Tailwind CSS'],
    url: 'https://github.com/exosennnn/FinMetrics',
  },
];

const STACK = [
  { label: 'Languages', items: ['Python', 'JavaScript', 'C++', 'HTML', 'CSS', 'PHP', 'Java'] },
  { label: 'Frameworks', items: ['Vue.js', 'React', 'Tailwind CSS', 'Vite'] },
  { label: 'Databases', items: ['MySQL'] },
  { label: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'npm', 'figma'] },
];

const FILTERS = ['All', 'Python', 'JavaScript', 'Vue', 'C++'];

const FAQ_DATA = [
  {
    id: 'about',
    q: 'Who is Jay Mark?',
    a: "He's a third-year BS Information Technology student at the National College of Science and Technology (NCST), and an aspiring web developer. He enjoys building functional, user-focused apps — from a cinema booking system to task and reservation apps.",
  },
  {
    id: 'stack',
    q: "What's his tech stack?",
    a: 'Languages: Python, JavaScript, C++, HTML, CSS, PHP, Java. Frameworks: Vue.js, React, Tailwind CSS, Vite. Database: MySQL. Tools: Git, GitHub, VS Code, npm, Figma.',
  },
  {
    id: 'projects',
    q: 'What projects has he worked on?',
    a: 'A few highlights: CineStream (a Python cinema ticketing system), FinMetrics (a Vue 3 expense tracker), Taskify (a Vue 3 task manager), and Campus Reservation System (vanilla JS). The full list is in the Projects section above.',
  },
  {
    id: 'contact',
    q: 'How can I contact him?',
    a: `Email is fastest: ${EMAIL}. His GitHub, LinkedIn, and Instagram are also in the Contact section below.`,
  },
];

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100"
    >
      {children}
    </a>
  );
}

type IconName = 'mail' | 'github' | 'linkedin' | 'instagram';

const ICON_PATHS: Record<IconName, ReactNode> = {
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  github: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </>
  ),
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function ContactLabel({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 w-28 text-neutral-400 dark:text-neutral-500">
      <Icon name={icon} />
      {children}
    </span>
  );
}

export default function App() {
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState('');
  const [copied, setCopied] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Mount before opening, unmount after closing, so both transitions can play
  useEffect(() => {
    if (menuOpen) {
      setMenuMounted(true);
    } else {
      setMenuVisible(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (menuMounted && menuOpen) {
      const id = requestAnimationFrame(() => setMenuVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [menuMounted, menuOpen]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([
    { from: 'bot', text: "Hi! I'm Jay Mark's FAQ bot 🙂 What would you like to know?" },
  ]);
  const [askedIds, setAskedIds] = useState<string[]>([]);

  useEffect(() => {
    if (chatOpen) {
      setChatMounted(true);
    } else {
      setChatVisible(false);
    }
  }, [chatOpen]);

  useEffect(() => {
    if (chatMounted && chatOpen) {
      const id = requestAnimationFrame(() => setChatVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [chatMounted, chatOpen]);

  const askFaq = (id: string) => {
    const item = FAQ_DATA.find((f) => f.id === id);
    if (!item) return;
    setChatMessages((m) => [...m, { from: 'user', text: item.q }, { from: 'bot', text: item.a }]);
    setAskedIds((a) => (a.includes(id) ? a : [...a, id]));
  };

  const resetChat = () => {
    setChatMessages([{ from: 'bot', text: "Hi! I'm Jay Mark's FAQ bot 🙂 What would you like to know?" }]);
    setAskedIds([]);
  };
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  const shown = filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.language === filter);

  // Highlight the nav item for the section currently in view
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    const onTop = () => window.scrollY < 200 && setActive('');
    window.addEventListener('scroll', onTop, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onTop);
    };
  }, []);

  const toggleTheme = (e: MouseEvent<HTMLButtonElement>) => {
    const next = !dark;
    const root = document.documentElement;
    const apply = () => {
      root.classList.toggle('dark', next);
      setDark(next);
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
      } catch {
        /* storage unavailable, ignore */
      }
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const start = (document as any).startViewTransition?.bind(document);

    if (reduce) return apply();

    if (!start) {
      root.classList.add('theme-fade');
      apply();
      setTimeout(() => root.classList.remove('theme-fade'), 400);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = start(apply);
    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        { duration: 550, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  const closeMenu = () => setMenuOpen(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100 rounded-sm';

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono text-sm leading-relaxed selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-neutral-900">
      <div className="max-w-2xl mx-auto px-6">
        {/* Nav */}
        <header className="flex items-center justify-between py-8 relative">
          <a href="#top" className={`font-bold ${focusRing}`} onClick={closeMenu}>Jay Mark.</a>

          {/* Inline nav: sm and up */}
          <nav className="hidden sm:flex items-center gap-6 text-neutral-500 dark:text-neutral-400">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                aria-current={active === n.id ? 'true' : undefined}
                className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${focusRing} ${
                  active === n.id
                    ? 'text-neutral-900 dark:text-neutral-100 underline underline-offset-8 decoration-2'
                    : ''
                }`}
              >
                {n.label}
              </a>
            ))}
            <button
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
              className={`text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-4 sm:hidden">
            <button
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
              className={`text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className={`relative w-5 h-5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
            >
              <span
                className={`menu-line absolute left-0 top-[3px] h-0.5 w-5 bg-current ${
                  menuOpen ? 'translate-y-[6px] rotate-45' : ''
                }`}
              />
              <span
                className={`menu-line absolute left-0 top-[9px] h-0.5 w-5 bg-current ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`menu-line absolute left-0 top-[15px] h-0.5 w-5 bg-current ${
                  menuOpen ? '-translate-y-[6px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>

          {/* Mobile dropdown panel */}
          {menuMounted && (
            <nav
              onTransitionEnd={() => {
                if (!menuOpen) setMenuMounted(false);
              }}
              className={`menu-panel sm:hidden absolute top-full left-0 right-0 mt-1 py-3 flex flex-col gap-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded shadow-lg z-10 ${
                menuVisible
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
              }`}
            >
              {NAV.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={closeMenu}
                  aria-current={active === n.id ? 'true' : undefined}
                  className={`px-4 py-2 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${focusRing} ${
                    active === n.id
                      ? 'text-neutral-900 dark:text-neutral-100 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {n.label}
                </a>
              ))}
            </nav>
          )}
        </header>

        {/* Hero */}
        <section id="top" className="pt-12 pb-20">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-8 sm:gap-10">
            {/* Photo: halftone portrait at /public/profile.png (white bg blends into the page) */}
            <div className="shrink-0 w-44 sm:w-52 aspect-[4/5] bg-white rounded border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              {photoOk ? (
                <img
                  src="/profile.png"
                  alt="Portrait of Jay Mark Almojuela"
                  width={416}
                  height={520}
                  onError={() => setPhotoOk(false)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-300 dark:text-neutral-700 rounded border border-neutral-200 dark:border-neutral-800"
                >
                  JM
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Jay Mark Almojuela</h1>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto sm:mx-0">
                Third-year BS Information Technology student and aspiring Web Developer. I enjoy turning ideas into functional, user-focused applications and continuously improving my skills through real-world projects.
              </p>
              <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2">
                <ExtLink href={LINKS.github}>GitHub</ExtLink>
                <ExtLink href={LINKS.linkedin}>LinkedIn</ExtLink>
                <ExtLink href={LINKS.instagram}>Instagram</ExtLink>
                {LINKS.resume && <ExtLink href={LINKS.resume}>Resume</ExtLink>}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <Reveal as="section" id="about" className="py-16 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold mb-6">About</h2>
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>
              I'm a Third-year BS Information Technology student at the National College of Science and Technology (NCST).
              and an aspiring Web Developer. I like turning ideas into functional software, from a cinema booking system to task and reservation apps.
            </p>
            <p>
              Right now, I'm getting deeper into React and Tailwind (this site is built with them) and while exploring new technologies and building real-world projects. 
              I'm looking for opportunities to collaborate with others, gain practical experience, and continue growing as a developer.
            </p>
          </div>
        </Reveal>

        {/* Stack */}
        <Reveal as="section" id="stack" className="py-16 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold mb-6">Tech Stack</h2>
          <ul className="space-y-4">
            {STACK.map((g) => (
              <li key={g.label} className="sm:flex sm:items-baseline">
                <span className="block sm:inline-block sm:w-28 shrink-0 mb-2 sm:mb-0 text-neutral-400 dark:text-neutral-500">
                  {g.label}
                </span>
                <span className="flex flex-wrap gap-2">
                  {g.items.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-xs rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      {t}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Projects */}
        <Reveal as="section" id="projects" className="py-16 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold">Projects</h2>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{shown.length} / {PROJECTS.length}</span>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-2 text-neutral-400 dark:text-neutral-500">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`transition-colors ${focusRing} ${
                  filter === f
                    ? 'text-neutral-900 dark:text-neutral-100 underline underline-offset-8 decoration-2'
                    : 'hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {shown.map((p) => (
              <li key={p.title} className="py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`font-bold hover:underline underline-offset-4 ${focusRing}`}
                  >
                    {p.title} <span className="text-neutral-400 font-normal">↗</span>
                  </a>
                  {p.demo && (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-xs shrink-0 underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 ${focusRing}`}
                    >
                      live demo ↗
                    </a>
                  )}
                </div>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">{p.description}</p>
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400 dark:text-neutral-500">
                  {p.tags.map((t) => (
                    <span key={t}>#{t.toLowerCase().replace(/\s+/g, '-')}</span>
                  ))}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-neutral-500 dark:text-neutral-400">
            More on <ExtLink href={LINKS.github + '?tab=repositories'}>GitHub</ExtLink>.
          </p>
        </Reveal>

        {/* Contact */}
        <Reveal as="section" id="contact" className="py-16 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold mb-6">Contact</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Want to work together or just say hi? Email is the fastest way to reach me.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center flex-wrap">
              <ContactLabel icon="mail">Email</ContactLabel>
              <a
                href={`mailto:${EMAIL}`}
                className={`underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 ${focusRing}`}
              >
                {EMAIL}
              </a>
              <button
                onClick={copyEmail}
                className={`ml-3 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
              >
                {copied ? 'copied ✓' : '[copy]'}
              </button>
            </li>
            <li className="flex items-center flex-wrap"><ContactLabel icon="github">GitHub</ContactLabel><ExtLink href={LINKS.github}>@exosennnn</ExtLink></li>
            <li className="flex items-center flex-wrap"><ContactLabel icon="linkedin">LinkedIn</ContactLabel><ExtLink href={LINKS.linkedin}>jay-mark-almojuela</ExtLink></li>
            <li className="flex items-center flex-wrap"><ContactLabel icon="instagram">Instagram</ContactLabel><ExtLink href={LINKS.instagram}>@exosennn</ExtLink></li>
          </ul>
        </Reveal>

        <footer className="py-10 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400 dark:text-neutral-500">
          © {new Date().getFullYear()} Jay Mark Almojuela
        </footer>

        {/* Floating FAQ chatbot */}
        {chatMounted && (
          <div
            onTransitionEnd={() => {
              if (!chatOpen) setChatMounted(false);
            }}
            className={`chat-window fixed bottom-24 right-6 z-20 w-[calc(100vw-3rem)] max-w-[320px] max-h-[70vh] flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl overflow-hidden ${
              chatVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-bold text-sm">Jay Mark — FAQ</span>
              <button
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
                className={`text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`max-w-[85%] rounded-lg px-3 py-2 leading-relaxed ${
                      m.from === 'user'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 px-3 py-3 flex flex-wrap gap-2">
              {FAQ_DATA.filter((f) => !askedIds.includes(f.id)).map((f) => (
                <button
                  key={f.id}
                  onClick={() => askFaq(f.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors ${focusRing}`}
                >
                  {f.q}
                </button>
              ))}
              {askedIds.length === FAQ_DATA.length && (
                <button
                  onClick={resetChat}
                  className={`text-xs px-3 py-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
                >
                  ↺ ask again
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setChatOpen((v) => !v)}
          aria-label={chatOpen ? 'Close chat' : 'Chat with me'}
          title={chatOpen ? 'Close chat' : 'Chat with me'}
          className={`chat-fab fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 pl-4 pr-5 py-3 shadow-lg hover:scale-105 active:scale-95 transition-transform ${focusRing}`}
        >
          <span className="relative w-[18px] h-[18px] shrink-0">
            <svg
              className={`fab-icon absolute inset-0 ${chatOpen ? 'opacity-0' : 'opacity-100'}`}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <svg
              className={`fab-icon absolute inset-0 ${chatOpen ? 'opacity-100' : 'opacity-0'}`}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </span>
          <span className="text-sm font-bold">{chatOpen ? 'Close' : 'Chat with me'}</span>
        </button>
      </div>
    </div>
  );
}