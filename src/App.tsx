import { useEffect, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import Reveal from './components/Reveal';
import Background from './components/Background';
import Tour from './components/Tour';
import MiniGame, { TapToPlay } from './components/MiniGame';
import TwistPhoto from './components/TwistPhoto';
import Typewriter from './components/Typewriter';
import QuoteBuilder from './components/QuoteBuilder';
import JourneyTimeline from './components/JourneyTimeline';

const EMAIL = 'almojuelajaymark0@gmail.com'; // TODO: put your real email here

// Formspree endpoint, e.g. 'https://formspree.io/f/xxxxxxxx'. Leave '' to hide the form.
const FORM_ENDPOINT = 'https://formspree.io/f/mqpeoqpl';

const LINKS = {
  github: 'https://github.com/exosennnn',
  linkedin: 'https://www.linkedin.com/in/jay-mark-almojuela-408587427/',
  instagram: 'https://www.instagram.com/exosennn',
  resume: '', // TODO: e.g. '/resume.pdf' (put the file in /public). Leave '' to hide the link.
};

// Fill these in. Empty values hide their block on the site.
const AVAILABILITY = 'Open to freelance';
const STATUS = '3rd-year BSIT student at NCST';
const BASED_IN = 'Based in Philippines'; // change to a city if you prefer
const LOOKING_FOR = 'Freelance projects with clients';
const RESPONSE_TIME = 'Usually replies within 24 hours';
const LAST_UPDATED = 'October 2026'; // update this by hand when you change the site
const CURRENTLY_BUILDING = {
  title: 'SafeRoute Hub',
  note: 'A PWA for disaster management and emergency response coordination.',
  url: 'https://github.com/exosennnn/SafeRoute-Hub',
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
    tags: ['Vue.js', 'Tailwind CSS', 'Vite'],
    url: 'https://github.com/exosennnn/FinMetrics',
  },
  {
    title: 'SafeRoute Hub',
    language: 'JavaScript',
    description:
      'SafeRoute Hub is an innovative, production-grade Progressive Web App (PWA) designed to serve as a centralized platform for disaster management, emergency response, and crisis coordination within communities.',
    tags: ['React.js', 'Tailwind CSS', 'Supabase', 'Vite'],
    url: 'https://github.com/exosennnn/SafeRoute-Hub',
  },
];

// Shown under the services list on the Services page. Leave empty to hide it
const PRICING_NOTE = 'Pricing depends on scope. Send me your requirements and I will send you a quote.';

// timeline is a typical estimate; example is optional (add { label, url } to show a "see example" link)
const SERVICES: {
  title: string;
  description: string;
  timeline: string;
  tags: string[];
  example?: { label: string; url: string };
}[] = [
  {
    title: 'Landing pages & business sites',
    description:
      'Fast-loading, mobile-friendly sites for small businesses, events, and personal portfolios. Clear layouts that help visitors find what they need and get in touch.',
    timeline: 'Typical timeline: 1 to 2 weeks',
    tags: ['Vue.js', 'React', 'Tailwind CSS'],
  },
  {
    title: 'Web apps & dashboards',
    description:
      'Booking and reservation systems, admin dashboards, and internal tools that replace spreadsheets and manual tracking, with an interface your staff can use right away.',
    timeline: 'Typical timeline: 3 to 6 weeks',
    tags: ['Vue.js', 'React', 'Laravel', 'MySQL'],
  },
  {
    title: 'Database-backed systems',
    description:
      'Organized database design and back-end logic for queues, inventory, and record keeping, so your data stays accurate and easy to retrieve.',
    timeline: 'Typical timeline: 2 to 4 weeks',
    tags: ['MySQL', 'PostgreSQL', 'Supabase', 'PHP'],
  },
  {
    title: 'Fixes & improvements',
    description:
      'Fixing bugs, adding features, or cleaning up an existing project so it runs reliably and is easier to maintain.',
    timeline: 'Timeline depends on the size of the change',
    tags: ['JavaScript', 'Vue.js', 'React', 'PHP'],
  },
];

const PROCESS = [
  'Send me a short message with your goals, your timeline, and any examples you like.',
  'I reply with the scope and an estimate, and we agree on it before any work starts.',
  'I build it in stages and share a preview link so you can see progress and give feedback.',
  'You get the finished source code, plus a short walkthrough of how to run and update it.',
];

// TODO: replace the placeholder post with your own. Add a url to link to a full post.
const BLOG_POSTS: { title: string; date: string; excerpt: string; url?: string; body?: string[] }[] = [
  {
    title: 'What I learned building my portfolio with React, Vite, and Tailwind',
    date: 'October 2026',
    excerpt:
      'Dark mode without a flash, animations that respect reduced motion, and a contact form without a backend.',
    // url: 'https://dev.to/your-username/your-post-slug', // uncomment once the full post is published
    body: [
      "This portfolio is a single React app built with Vite and styled with Tailwind CSS. It is a small project, but it made me deal with a few things I had to learn properly, and those are the parts worth writing down.",
      "Dark mode without a flash. Tailwind is set to darkMode 'class', so a dark class on the html element controls every color. The tricky part is the first paint. If React decides the theme after it mounts, the page flashes light and then switches to dark. To avoid this, a small script in index.html reads the saved theme from localStorage, or the system preference if nothing is saved, and adds the class before React renders. The theme toggle saves the visitor's choice back to localStorage.",
      "Animations that respect reduced motion. The circular theme switch uses the View Transitions API when the browser supports it, and falls back to a short color fade when it does not. The scroll reveal uses IntersectionObserver, and if that API is missing, the content simply shows. Every animation is wrapped in a prefers-reduced-motion query, so people who ask their device to limit motion get a static page. This is the part I would most want other beginners to copy, because it is easy to skip.",
      "Routes that survive a refresh. The sections switch with the sidebar using window.history.pushState, not a router library. This works until you refresh a page like /projects, because the server looks for a file at that path and finds none. The fix is a rewrite in vercel.json that sends every path to index.html, and then React reads the path and shows the right section.",
      "A contact form without a backend. The form posts to Formspree using fetch and FormData. The component tracks four states: idle, sending, sent, and error. The button is disabled while the message is sending, and an error message points the visitor to my email as a fallback. Formspree handles delivery, so there is no server to maintain.",
      "Titles and link previews. The browser tab title changes on each page through document.title. Link previews are a different story. Messenger and LinkedIn read the Open Graph tags without running JavaScript, so those tags live in index.html and stay the same on every route. If the domain changes, those URLs need updating too.",
      "What I would do next. I want a real screenshot for each project instead of plain text, and I want the project data moved into its own file once there are more entries. For now, the site does what I need, and the code is simple enough to change quickly.",
    ],
  },

  {
    title: 'Setting up React with Vite, and what the config actually does',
    date: 'October 2026',
    excerpt:
      'A look at the small amount of configuration a Vite and React project needs, and why it stays simple.',
    body: [
      "Vite is a development server and build tool. In this project, npm run dev starts a local server with fast reloading, and npm run build bundles the app into plain static files in a dist folder.",
      "React support comes from @vitejs/plugin-react, which is listed as a plugin in vite.config.js. The whole config is a few lines: import the plugin, then call it inside defineConfig. There is no extra setup for JSX, because the plugin handles it.",
      "The entry point is main.jsx. It creates the root with createRoot and renders App inside StrictMode. StrictMode runs some extra checks during development only, so it does not change how the production build behaves.",
      "Because the output is static files, the site can be deployed to Vercel without a server. The one thing that needs configuring is routing, which is covered in the post about refresh-safe routes.",
      "My tip is to keep the number of dependencies small. This project has four runtime packages. Every extra package is one more thing to update and one more possible point of failure, so add a package only when you actually need it.",
    ],
  },
  {
    title: 'Linting with oxlint: a small rule set that catches real bugs',
    date: 'October 2026',
    excerpt:
      'Why a short list of lint rules is more useful than a long one you end up ignoring.',
    body: [
      "oxlint is a fast linter written in Rust. In this project it runs with npm run lint, and the rules live in a single .oxlintrc.json file.",
      "The config turns on react/rules-of-hooks, which flags hooks that are called conditionally or inside loops. That is one of the most common beginner bugs in React, and the rule catches it before the page breaks in a way that is hard to trace.",
      "It also turns on react/only-export-components as a warning. It helps keep component files structured so fast refresh works reliably while you edit.",
      "Start with a few rules, not all of them. A long list of rules that you silence one by one is worse than a short list you actually follow. You can always add more later.",
      "Run the linter before every push. It takes seconds, and it is much easier to fix a warning now than to debug it after a deploy.",
    ],
  },
  {
    title: 'Tailwind CSS: dark mode and a custom font in one config',
    date: 'October 2026',
    excerpt:
      'How darkMode set to class, a custom font stack, and a small palette keep a Tailwind site consistent.',
    body: [
      "tailwind.config.js sets darkMode to 'class'. That means dark: styles apply when a dark class is on the html element, which the theme toggle controls, instead of following the system setting alone.",
      "The font is extended under fontFamily for both sans and mono, using JetBrains Mono with fallbacks like Menlo and monospace in case the font has not loaded yet.",
      "The font files come from the @fontsource/jetbrains-mono package, imported in main.jsx. That keeps the font inside the project, so the site does not depend on an external font service at runtime.",
      "Write both colors on each element, like text-neutral-900 dark:text-neutral-100. It is more verbose, but you never end up with dark text on a dark background because you forgot one case.",
      "Keep a short list of colors you use. This site uses only neutral grays, and that single choice makes every page look like part of the same design.",
    ],
  },
];

// Rough reading time, about 200 words per minute
const readTime = (paras: string[]) => Math.max(1, Math.round(paras.join(' ').split(/\s+/).length / 200));

// TODO: update these to what you are working on right now
const NOW_UPDATED = 'October 2026';
const NOW_ITEMS = [
  'Building SafeRoute Hub, a PWA for disaster response.',
  'Getting deeper into React and Tailwind.',
];

const HERO_ROLES = ['Web Developer', 'Vue & React builder', 'IT student'];

const STACK = [
  { label: 'Languages', items: ['Python', 'JavaScript', 'C++', 'HTML', 'CSS', 'PHP', 'Java', 'CSharp'] },
  { label: 'Frameworks', items: ['Vue.js', 'React', 'Tailwind CSS', 'Vite', 'BootStrap5', 'Laravel', 'Node.js', 'TypeScript'] },
  { label: 'Databases', items: ['MySQL', 'PostgreSQL', 'Supabase'] },
  { label: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'npm', 'figma', 'XAMPP'] },
];

type Milestone = {
  title: string;
  description: string;
  sem?: string;
  current?: boolean;
};

const JOURNEY: { phase: string; items: Milestone[] }[] = [
  {
    phase: 'Year 1',
    items: [
      {
        title: 'C++ Programming',
        description: 'Programming fundamentals and the first steps into writing real code.',
        sem: 'Sem 1',
      },
      {
        title: 'Web Development Basics',
        description: 'Building web pages with HTML and styling them with CSS.',
        sem: 'Sem 2',
      },
    ],
  },
  {
    phase: 'Year 2',
    items: [
      {
        title: 'PHP, Bootstrap & JavaScript',
        description: 'Server-side scripting with PHP, responsive layouts with Bootstrap, and interactivity with JavaScript.',
        sem: 'Sem 1'
      },
      {
        title: 'MySQL Databases',
        description: 'Designing and querying relational databases to store and retrieve application data.',
        sem: 'Sem 1'
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Core data structures and algorithmic problem-solving for writing efficient code.',
        sem: 'Sem 1'
      },
      {
        title: 'Java OOP & Python',
        description: 'Object-oriented principles in Java, along with programming in Python.',
        sem: 'Sem 2',
      },
    ],
  },
  {
    phase: 'Year 3',
    items: [
      {
        title: 'System Integration',
        description: 'Learning how separate systems and components are connected so they work together as one.',
        current: true,
        status: 'done',
      },
      {
        title: 'Vue.js & Tailwind CSS',
        description: 'Building modern front-end interfaces with a component framework and utility-first styling.',
        current: true,
        status: 'done',
      },
      {
        title: 'NodeJS',
        description: 'Learning to build server-side applications with Node.js and JavaScript.',
        current: true,
        status: 'done',
      },
    ],
  },
  {
    phase: 'Self-study',
    items: [
      {
        title: 'Laravel',
        description: 'Building back-end applications with the Laravel PHP framework.',
        sem: 'Vacation',
        status: 'done',
      },
      {
        title: 'React',
        description: 'Building component-based user interfaces with React and JavaScript.',
        sem: 'Vacation',
        status: 'done',
      },
      {
        title: 'PostgreSQL',
        description: 'Working with PostgreSQL, a relational database system, beyond MySQL.',
        sem: 'Vacation',
        status: 'done',
      },
      {
        title: 'C#',
        description: 'Learning the C# language and its use for building applications.',
        sem: 'Vacation',
        status: 'done',
      },
    ],
  },
  {
    phase: 'Currently learning',
    items: [
      {
        title: 'React.js',
        description: 'Deepening my understanding of React, from component patterns and state management to performance.',
        current: true,
        status: 'now',
      },
      {
        title: 'Node.js',
        description: 'Going deeper into server-side JavaScript, including APIs, modules, and building back-end services.',
        current: true,
        status: 'now',
      },
      {
        title: 'TypeScript',
        description: 'Adding static typing to JavaScript projects to catch errors early and write more maintainable code.',
        current: true,
        status: 'now',
      },
    ],
  },
];

const FILTERS = ['All', 'Python', 'JavaScript', 'C++'];

const normalizePath = (p: string) => p.replace(/\/+$/, '') || '/';

const FAQ_DATA = [
  {
    id: 'about',
    q: 'Who is Jay Mark?',
    a: "He's a third-year BS Information Technology student at the National College of Science and Technology (NCST), and an aspiring web developer. He enjoys building functional, user-focused apps — from a cinema booking system to task and reservation apps.",
  },
  {
    id: 'stack',
    q: "What's his tech stack?",
    a: 'Languages: Python, JavaScript, C++, HTML, CSS, PHP, Java. Frameworks: Vue.js, React, Tailwind CSS, Vite. Database: MySQL. Tools: Git, GitHub, VS Code, npm, Figma, XAMPP.',
  },
  {
    id: 'projects',
    q: 'What projects has he worked on?',
    a: 'A few highlights: CineStream (a Python cinema ticketing system), FinMetrics (a Vue 3 expense tracker), Taskify (a Vue 3 task manager), and Campus Reservation System (vanilla JS). The full list is in the Projects section above.',
  },
  {
    id: 'contact',
    q: 'How can I contact him?',
    a: `Email is fastest: ${EMAIL}. His GitHub, LinkedIn, and Instagram are also in the Contact section.`,
  },
  {
    id: 'freelance',
    q: 'Is he available for freelance work?',
    a: "Yes, he's open to freelance projects. The Services page lists what he can help with, and email is the best way to start a conversation.",
  },
];

const NAV = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'stack', label: 'Stack', to: '/stack' },
  { id: 'projects', label: 'Projects', to: '/projects' },
  { id: 'services', label: 'Services', to: '/services' },
  { id: 'journey', label: 'Journey', to: '/journey' },
  { id: 'blog', label: 'Blog', to: '/blog' },
  { id: 'contact', label: 'Contact', to: '/contact' },
];

// Sidebar groups: Home on its own, then the work pages, then everything else
const NAV_GROUPS = [NAV.slice(0, 1), NAV.slice(1, 4), NAV.slice(4)];

const GITHUB_USER = 'exosennnn';

type ContributionDay = { date: string; count: number; level: number };

// Dot size as a percentage of its cell, for contribution levels 0-4
const DOT_SIZE = [20, 40, 60, 80, 100];

function GithubSection() {
  const [days, setDays] = useState<ContributionDay[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Third-party API that reads the public GitHub contribution calendar
    fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response');
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setDays(data.contributions as ContributionDay[]);
        setTotal(data.total?.lastYear ?? null);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed || !days) return null;

  // Pad the start so the first column begins on Sunday, then fill 7-row columns
  const lead = new Date(days[0].date + 'T00:00:00').getDay();
  const cells: (ContributionDay | null)[] = [...Array(lead).fill(null), ...days];
  const cols = Math.ceil(cells.length / 7);

  return (
    <Reveal as="section" id="github" className="py-20">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-xl font-bold tracking-tight">
          <span className="text-neutral-400 dark:text-neutral-500 font-normal">06 —</span> github
        </h2>
        <ExtLink href={`https://github.com/${GITHUB_USER}`}>@{GITHUB_USER} ↗</ExtLink>
      </div>
    <div
      className="grid gap-[4px]"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: 'repeat(7, auto)',
        gridAutoFlow: 'column',
      }}
    >
      {cells.map((d, i) => {
        const level = d ? d.level : 0;
        return (
          <div key={i} className="aspect-square flex items-center justify-center">
            <span
              title={d ? `${d.count} on ${d.date}` : undefined}
              style={{ width: `${DOT_SIZE[level]}%`, aspectRatio: '1 / 1' }}
              className={`rounded-full ${
                level === 0
                  ? 'bg-neutral-200 dark:bg-neutral-800'
                  : 'bg-neutral-900 dark:bg-neutral-100'
              }`}
            />
          </div>
        );
      })}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-neutral-400 dark:text-neutral-500">
      {total !== null ? (
        <p className="uppercase">{total.toLocaleString()} contributions in the last year</p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2" aria-hidden="true">
        <span>less</span>
        {DOT_SIZE.map((size, level) => (
          <span key={level} className="inline-flex h-2.5 w-2.5 items-center justify-center">
            <span
              style={{ width: `${size / 10}px`, height: `${size / 10}px` }}
              className={`rounded-full ${
                level === 0 ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-neutral-900 dark:bg-neutral-100'
              }`}
            />
          </span>
        ))}
        <span>more</span>
      </div>
    </div>
    </Reveal>
  );
}

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

const PAGE_META: Record<string, string> = {
  '/': 'Jay Mark Almojuela — Developer',
  '/stack': 'Stack — Jay Mark Almojuela',
  '/projects': 'Projects — Jay Mark Almojuela',
  '/services': 'Services — Jay Mark Almojuela',
  '/contact': 'Contact — Jay Mark Almojuela',
  '/blog': 'Blog — Jay Mark Almojuela',
  '/journey': 'Journey — Jay Mark Almojuela',
};

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // capture before the await
    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('send failed');
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const field =
    'w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100';

  return (
    <form onSubmit={onSubmit} className="mb-10 space-y-3 max-w-lg">
      <label className="sr-only" htmlFor="cf-name">Name</label>
      <input id="cf-name" name="name" required placeholder="name" className={field} />
      <label className="sr-only" htmlFor="cf-email">Email</label>
      <input id="cf-email" name="email" type="email" required placeholder="email" className={field} />
      <label className="sr-only" htmlFor="cf-message">Message</label>
      <textarea id="cf-message" name="message" required rows={5} placeholder="what do you want to build?" className={field} />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 px-3 py-1.5 rounded hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? 'sending…' : 'send message'}
      </button>
      <p role="status" aria-live="polite" className="text-xs text-neutral-500 dark:text-neutral-400">
        {status === 'sent' && 'Thanks! Your message was sent. I will reply soon.'}
        {status === 'error' && `Something went wrong. You can email me directly at ${EMAIL}.`}
      </p>
    </form>
  );
}

export default function App() {
  const [filter, setFilter] = useState('All');
  const [copied, setCopied] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.title = PAGE_META[path] ?? PAGE_META['/'];
  }, [path]);

  const navigate = (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const [pathOnly, hash] = to.split('#');
    window.history.pushState({}, '', to);
    setPath(normalizePath(pathOnly));
    setMenuOpen(false);
    if (hash) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 0);
    } else {
      window.scrollTo(0, 0);
    }
  };
  const onHome = path === '/';

  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const localTime = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(clock);

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
  const listed = onHome ? PROJECTS.slice(0, 3) : shown;

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
    <div className="isolate min-h-screen text-neutral-900 dark:text-neutral-100 font-mono text-sm leading-relaxed selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-neutral-900">
      <Background />

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 w-56 flex-col justify-between border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-8 py-10 z-10">
        <div>
          <a href="/" onClick={navigate('/')} className={`font-bold ${focusRing}`}>Jay Mark.</a>
          <nav aria-label="Main" className="mt-10 flex flex-col gap-5">
            {NAV_GROUPS.map((group, gi) => (
              <div
                key={gi}
                className={`flex flex-col gap-3 text-neutral-500 dark:text-neutral-400 ${
                  gi > 0 ? 'pt-5 border-t border-neutral-200 dark:border-neutral-800' : ''
                }`}
              >
                {group.map((n) => (
                  <a
                    key={n.id}
                    href={n.to}
                    onClick={navigate(n.to)}
                    aria-current={path === n.to ? 'true' : undefined}
                    className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${focusRing} ${
                      path === n.to ? 'text-neutral-900 dark:text-neutral-100 font-bold' : ''
                    }`}
                  >
                    {path === n.to ? '› ' : ''}{n.label}
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          {/* Social icons and theme toggle share one row */}
          <div className="flex items-center gap-4 text-neutral-500 dark:text-neutral-400">
            <a href={LINKS.github} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub" className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}>
              <Icon name="github" />
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn" className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}>
              <Icon name="linkedin" />
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}>
              <Icon name="instagram" />
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="Email" title="Email" className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}>
              <Icon name="mail" />
            </a>
            <button
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
              className={`ml-auto hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
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
          </div>

          {LINKS.resume && (
            <a href={LINKS.resume} target="_blank" rel="noreferrer" className={`text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}>resume ↗</a>
          )}
          <p className="text-xs text-neutral-400 dark:text-neutral-500"><TapToPlay>updated {LAST_UPDATED}</TapToPlay></p>
        </div>
      </aside>

      <div className="sm:pl-56 pb-24 sm:pb-0">
        <div className="max-w-2xl mx-auto px-6">
        {/* Nav */}
        <header className="flex items-center justify-between py-8 relative sm:hidden">
          <a href="/" onClick={navigate('/')} className={`font-bold ${focusRing}`}>Jay Mark.</a>

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
                  href={n.to}
                  onClick={navigate(n.to)}
                  aria-current={path === n.to ? 'true' : undefined}
                  className={`px-4 py-2 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${focusRing} ${
                    path === n.to
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
        <div key={path} className="page-enter">

        {/* Hero */}
        {onHome && (
        <section id="top" className="pt-12 pb-20">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-8 sm:gap-10">
            {/* Photo: halftone portrait at /public/profile.png (white bg blends into the page) */}
            <div className="fx-rise shrink-0 w-44 sm:w-52 aspect-[4/5] bg-white rounded border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              {photoOk ? (
                <TwistPhoto onError={() => setPhotoOk(false)} />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-300 dark:text-neutral-700 rounded border border-neutral-200 dark:border-neutral-800"
                >
                  JM
                </div>
              )}
            </div>

            <div className="fx-rise fx-delay-1">
              {AVAILABILITY && (
                <span className="inline-flex items-center gap-2 mb-4 px-3 py-1 text-xs rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                  {AVAILABILITY}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Jay Mark Almojuela</h1>
              <p className="mt-2 h-6 text-sm text-neutral-500 dark:text-neutral-400">
                <Typewriter words={HERO_ROLES} />
              </p>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto sm:mx-0">
                Third-year BS Information Technology student and aspiring Web Developer. I enjoy turning ideas into functional, user-focused applications and continuously improving my skills through real-world projects.
              </p>
          {/* Who you are */}
          <div className="mt-6 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {STATUS && <p>{STATUS}</p>}
            {BASED_IN && <p>{BASED_IN}</p>}
          </div>

            </div>
          </div>
        </section>

        )}
        {/* About */}
        {onHome && (
        <Reveal as="section" id="about" className="py-20">
          <h2 className="text-xl font-bold tracking-tight mb-8"><span className="text-neutral-400 dark:text-neutral-500 font-normal">01 —</span> about</h2>
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

          {CURRENTLY_BUILDING.title && (
            <p className="mt-8 text-xs text-neutral-500 dark:text-neutral-400">
              building{' '}
              {CURRENTLY_BUILDING.url ? (
                <a href={CURRENTLY_BUILDING.url} target="_blank" rel="noreferrer" className={`font-bold hover:underline underline-offset-4 ${focusRing}`}>
                  {CURRENTLY_BUILDING.title} ↗
                </a>
              ) : (
                <span className="font-bold">{CURRENTLY_BUILDING.title}</span>
              )}
            </p>
          )}
        </Reveal>

        )}
        {/* Stack */}
        {(onHome || path === '/stack') && (
          <Reveal as="section" id="stack" className="py-20">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">
                {onHome && <span className="text-neutral-400 dark:text-neutral-500 font-normal">02 — </span>}stack
              </h2>
              {onHome && <a href="/stack" onClick={navigate('/stack')} className={`underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors ${focusRing}`}>all →</a>}
            </div>
            {onHome ? (
              <div className="flex flex-wrap gap-2">
                {STACK.flatMap((g) => g.items)
                  .slice(0, 10)
                  .map((t) => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {t}
                    </span>
                  ))}
                <a
                  href="/stack"
                  onClick={navigate('/stack')}
                  className={`px-2 py-0.5 text-xs rounded border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${focusRing}`}
                >
                  + more
                </a>
              </div>
            ) : (
            <ul className="space-y-4">
              {STACK.map((g) => (
                <li key={g.label} className="sm:flex sm:items-baseline">
                  <span className="block sm:inline-block sm:w-28 shrink-0 mb-2 sm:mb-0 text-neutral-400 dark:text-neutral-500">
                    {g.label}
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {(onHome ? g.items.slice(0, 3) : g.items).map((t) => (
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
            )}
          </Reveal>
        )}

        {/* Projects */}
        {(onHome || path === '/projects') && (
          <Reveal as="section" id="projects" className="py-20">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">
                {onHome && <span className="text-neutral-400 dark:text-neutral-500 font-normal">03 — </span>}projects
              </h2>
              {onHome ? (
                <a href="/projects" onClick={navigate('/projects')} className={`underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors ${focusRing}`}>all →</a>
              ) : (
                <span className="text-xs text-neutral-400 dark:text-neutral-500">{shown.length} / {PROJECTS.length}</span>
              )}
            </div>

            {!onHome && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-neutral-400 dark:text-neutral-500">
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
            )}

            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {listed.map((p) => (
                <li key={p.title} className="py-6">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`font-bold hover:underline underline-offset-4 ${focusRing}`}
                  >
                    {p.title} <span className="text-neutral-400 font-normal">↗</span>
                  </a>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">{p.description}</p>
                  <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400 dark:text-neutral-500">
                    {p.tags.map((t) => (
                      <span key={t}>#{t.toLowerCase().replace(/\s+/g, '-')}</span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>

            {!onHome && (
              <p className="mt-4 text-neutral-500 dark:text-neutral-400">
                More on <ExtLink href={LINKS.github + '?tab=repositories'}>GitHub</ExtLink>.
              </p>
            )}
          </Reveal>
        )}

        {(onHome || path === '/services') && (
          <Reveal as="section" id="services" className="py-20">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">services</h2>
              {onHome && <a href="/services" onClick={navigate('/services')} className={`underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors ${focusRing}`}>all →</a>}
            </div>
            {!onHome && (
              <p className="text-neutral-500 dark:text-neutral-400 mb-10">
                Freelance web development for small businesses, startups, and organizations.
              </p>
            )}

            <div className="space-y-10">
              {SERVICES.map((svc, i) => (
                <div key={svc.title} className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                  <h3 className="font-bold">
                    <span className="text-neutral-400 dark:text-neutral-500 mr-3 font-normal">0{i + 1}</span>
                    {svc.title}
                  </h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">{svc.description}</p>
                  {!onHome && <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{svc.timeline}</p>}
                  <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                    {svc.tags.map((t) => (
                      <span key={t}>#{t.toLowerCase().replace(/\s+/g, '-')}</span>
                    ))}
                  </p>
                  {svc.example && (
                    <a
                      href={svc.example.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-4 inline-block text-sm underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors ${focusRing}`}
                    >
                      {svc.example.label} →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {!onHome && (
              <>
                <div className="mt-16">
                  <h3 className="font-bold mb-6">How it works</h3>
                  <ol className="border-l border-neutral-200 dark:border-neutral-800 space-y-6">
                    {PROCESS.map((step, i) => (
                      <li key={i} className="relative pl-6">
                        <span
                          aria-hidden="true"
                          className="absolute -left-[4px] top-[7px] h-2 w-2 rounded-full bg-white dark:bg-neutral-950 border border-neutral-400 dark:border-neutral-600"
                        />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          <span className="text-neutral-400 dark:text-neutral-500 mr-2">0{i + 1}</span>
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
                {PRICING_NOTE && <p className="mt-12 text-neutral-500 dark:text-neutral-400">{PRICING_NOTE}</p>}
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-8">
                  <p className="text-neutral-700 dark:text-neutral-300">Have a project in mind? Send me a message.</p>
                  <a
                    href={`mailto:${EMAIL}`}
                    className={`inline-block rounded-md bg-neutral-900 dark:bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 hover:opacity-90 transition-opacity ${focusRing}`}
                  >
                    Send me a message →
                  </a>
                </div>
              </>
            )}
            {!onHome && <QuoteBuilder email={EMAIL} serviceTitles={SERVICES.map((svc) => svc.title)} />}
          </Reveal>
        )}

        {/* Journey preview (home) */}
        {onHome && (
          <Reveal as="section" id="journey" className="py-20">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">04 — </span>journey
              </h2>
              <a href="/journey" onClick={navigate('/journey')} className={`underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors ${focusRing}`}>all →</a>
            </div>
            <ol className="border-l border-neutral-200 dark:border-neutral-800 space-y-6">
              {JOURNEY.filter((g) => g.phase === 'Year 3')
                .flatMap((g) => g.items)
                .map((m) => (
                  <li key={m.title} className="relative pl-6">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[4px] top-[7px] h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100"
                    />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-bold">{m.title}</h3>
                      <span className="text-xs text-neutral-900 dark:text-neutral-100">● now</span>
                    </div>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{m.description}</p>
                  </li>
                ))}
            </ol>
          </Reveal>
        )}

        {(onHome || path === '/blog') && (
          <Reveal as="section" id="blog" className="py-20">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">blog</h2>
              {onHome && <a href="/blog" onClick={navigate('/blog')} className={`underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors ${focusRing}`}>all →</a>}
            </div>
            {!onHome && (
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Notes from building and learning in public: what worked, what broke, and what I would do differently next time.
              </p>
            )}
            <ul className={onHome ? 'divide-y divide-neutral-200 dark:divide-neutral-800' : 'space-y-14'}>
              {(onHome ? BLOG_POSTS.slice(0, 2) : BLOG_POSTS).map((post) => (
                <li
                  key={post.title}
                  className={onHome ? 'py-6' : 'border-t border-neutral-200 dark:border-neutral-800 pt-8'}
                >
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {post.date}
                    {!onHome && post.body && <span> · {readTime(post.body)} min read</span>}
                  </p>
                  <h3 className={`mt-2 font-bold leading-snug ${onHome ? '' : 'text-lg'}`}>
                    {post.url ? <ExtLink href={post.url}>{post.title}</ExtLink> : post.title}
                  </h3>
                  <p className="mt-3 text-neutral-600 dark:text-neutral-400">{post.excerpt}</p>
                  {!onHome && post.body && (
                    <div className="mt-6 space-y-4 leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {post.body.map((para, i) => (
                        <p key={i} className={i === 0 ? 'text-neutral-900 dark:text-neutral-100 font-medium' : ''}>
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {!onHome && (
              <p className="mt-16 text-neutral-500 dark:text-neutral-400">More notes coming as I keep learning.</p>
            )}
          </Reveal>
        )}

      

        {(onHome || path === '/contact') && (
          <Reveal as="section" id="contact" className="py-20">
            <h2 className="text-xl font-bold tracking-tight mb-2">
              {onHome && <span className="text-neutral-400 dark:text-neutral-500 font-normal">05 — </span>}contact
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Want to work together or just say hi? Email is the fastest way to reach me.
            </p>
            <div className="mb-6 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              {LOOKING_FOR && <p>looking for: {LOOKING_FOR}</p>}
              {RESPONSE_TIME && <p>{RESPONSE_TIME}</p>}
              <p>local time {localTime} (PHT)</p>
            </div>

            {FORM_ENDPOINT && !onHome && <ContactForm />}

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
        )}

        {/* GitHub */}
        {onHome && <GithubSection />}

        {path === '/journey' && <JourneyTimeline groups={JOURNEY} />}

        </div>

        <footer className="py-10 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400 dark:text-neutral-500">
          <TapToPlay>© {new Date().getFullYear()} Jay Mark Almojuela</TapToPlay>
        </footer>

        {onHome && <MiniGame />}
        {onHome && <Tour />}

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
          className={`chat-fab fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 p-3 sm:pl-4 sm:pr-5 sm:py-3 shadow-lg hover:scale-105 active:scale-95 transition-transform ${focusRing}`}
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
          <span className="hidden sm:inline text-sm font-bold">{chatOpen ? 'Close' : 'Chat with me'}</span>
        </button>
        </div>
      </div>
    </div>
  );
}