export type ProjectCategory = "Full Stack" | "Creative WebGL" | "Web App";

export interface Metric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  tags: string[];
  description: string;
  problem: string;
  highlights: string[];
  metrics: Metric[];
  year: number;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  /** A solid colour used as the card surface — drop in image URLs later. */
  image: string;
}

export const projects: Project[] = [
  {
    id: "lumen-data-dashboard",
    title: "Lumen",
    subtitle: "Dynamic React Data Dashboard",
    category: "Full Stack",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "D3"],
    description:
      "Real-time analytics dashboard streaming 50k+ events/sec with virtualised tables and custom D3 visualisations.",
    problem:
      "Enterprise clients needed to interrogate a streaming event pipeline without a 3-second TTI penalty. Off-the-shelf BI tools choked past 10k rows and offered no sane API for custom widgets.",
    highlights: [
      "Virtualised table handling 250k rows at 60fps via react-window + custom memo cache",
      "Server-Sent Events bridge with backpressure-aware reconnection",
      "D3 chart layer composed declaratively; each visualisation is a typed React component",
      "Postgres row-level-security so a single dashboard backend serves multi-tenant data",
    ],
    metrics: [
      { label: "Time-to-interactive", value: "−62%" },
      { label: "Bundle size", value: "−38%" },
      { label: "Events / sec", value: "50k+" },
    ],
    year: 2025,
    githubUrl: "https://github.com/example/lumen",
    liveUrl: "https://lumen.example.com",
    featured: true,
    image: "#1a1a1a",
  },
  {
    id: "atlas-logic-engine",
    title: "Atlas",
    subtitle: "Interactive Logic Engine",
    category: "Web App",
    tags: ["Next.js", "Prisma", "WebSockets", "Redis", "Tailwind"],
    description:
      "Multiplayer logic puzzle sandbox with a CRDT-backed live collaboration layer and a typed rule DSL.",
    problem:
      "Education teams wanted a sandbox where students could co-author finite-state machines in real time, with deterministic replay. Existing collab tools gave presence but no semantic merge.",
    highlights: [
      "Yjs-backed CRDT for conflict-free multi-cursor editing of typed AST nodes",
      "Custom DSL compiles to a deterministic reducer — every replay is bit-identical",
      "Redis pub/sub fan-out keeps presence + history consistent across regions",
      "Full keyboard-driven editor with Vim and accessibility-first focus model",
    ],
    metrics: [
      { label: "P95 sync latency", value: "84ms" },
      { label: "Concurrent editors", value: "120+" },
      { label: "Test coverage", value: "94%" },
    ],
    year: 2024,
    githubUrl: "https://github.com/example/atlas",
    liveUrl: "https://atlas.example.com",
    featured: true,
    image: "#0f1f1a",
  },
  {
    id: "obsidian-portfolio",
    title: "Obsidian",
    subtitle: "Creative WebGL Portfolio",
    category: "Creative WebGL",
    tags: ["Next.js", "Three.js", "GSAP", "Lenis", "WebGL"],
    description:
      "Agency-grade interactive portfolio with a GPU-driven glass hero, scroll-linked shader uniforms, and Lenis-driven smoothness.",
    problem:
      "Portfolio sites ship as slideshows. To stand out, the experience itself had to be the work — buttery 60fps, scroll-linked physics, and zero jank on mid-tier hardware.",
    highlights: [
      "Custom MeshTransmissionMaterial with chromatic aberration driven by scroll velocity",
      "GSAP ScrollTrigger + Lenis share a single RAF ticker — zero desync",
      "Reduced-motion media query respected end-to-end (no fade-in flicker)",
      "All 3D work is type-safe via @react-three/fiber and drei primitives only",
    ],
    metrics: [
      { label: "FPS (M2 Air)", value: "120" },
      { label: "Lighthouse perf", value: "98" },
      { label: "JS shipped", value: "92kb" },
    ],
    year: 2026,
    githubUrl: "https://github.com/example/obsidian",
    liveUrl: "https://obsidian.example.com",
    featured: true,
    image: "#0a0a0a",
  },
  {
    id: "magnet-commerce",
    title: "Magnet",
    subtitle: "Headless Commerce Platform",
    category: "Full Stack",
    tags: ["Next.js", "Stripe", "MongoDB", "Edge Functions", "TypeScript"],
    description:
      "Edge-rendered storefront with Stripe Checkout, headless CMS, and a typed webhook pipeline.",
    problem:
      "A boutique retailer needed a storefront that felt editorial, loaded instantly, and never lost a checkout to a cold start on the edge.",
    highlights: [
      "Edge-rendered product pages with ISR + on-demand revalidation",
      "Typed Stripe webhook pipeline with idempotent retry and replay",
      "Headless CMS schema validated at build time with Zod",
      "100/100 Lighthouse across mobile and desktop",
    ],
    metrics: [
      { label: "LCP (p75)", value: "0.9s" },
      { label: "Conversion lift", value: "+18%" },
      { label: "Uptime", value: "99.99%" },
    ],
    year: 2025,
    githubUrl: "https://github.com/example/magnet",
    liveUrl: "https://magnet.example.com",
    featured: false,
    image: "#1a0f1a",
  },
];

export const projectCategories: ("All" | ProjectCategory)[] = [
  "All",
  "Full Stack",
  "Creative WebGL",
  "Web App",
];
