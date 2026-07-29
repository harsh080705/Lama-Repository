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
  /** Legacy solid-colour fallback used while a real image is loading. */
  image: string;
  /** Hero / card thumbnail — must be a high-res JPG/PNG. */
  coverImage: string;
  /** Optional short looping clip rendered in the modal media showcase. */
  videoPreview?: string;
  /** Case study gallery — modal renders every URL in a responsive grid. */
  gallery: string[];
}

/**
 * Centralised query helpers so the gallery URLs stay readable. Unsplash's
 * `w=` controls intrinsic width; we request 1600w and let Next.js resize.
 */
const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

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
    coverImage: unsplash("photo-1551288049-bebda4e38f71"),
    videoPreview:
      "https://cdn.coverr.co/videos/coverr-data-analytics-dashboard-7842/1080p.mp4",
    gallery: [
      unsplash("photo-1551288049-bebda4e38f71"),
      unsplash("photo-1551434678-e076c223a692"),
      unsplash("photo-1460925895917-afdab827c52f"),
      unsplash("photo-1504868584819-f8e8b4b6d7e3"),
    ],
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
    coverImage: unsplash("photo-1555066931-4365d14bab8c"),
    gallery: [
      unsplash("photo-1555066931-4365d14bab8c"),
      unsplash("photo-1517694712202-14dd9538aa97"),
      unsplash("photo-1542831371-29b0f74f9713"),
      unsplash("photo-1551033406-611cf9a28f67"),
    ],
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
    coverImage: unsplash("photo-1518770660439-4636190af475"),
    videoPreview:
      "https://cdn.coverr.co/videos/coverr-abstract-3d-render-7257/1080p.mp4",
    gallery: [
      unsplash("photo-1518770660439-4636190af475"),
      unsplash("photo-1526374965328-7f61d4dc18c5"),
      unsplash("photo-1633356122544-f134324a6cee"),
      unsplash("photo-1620712943543-bcc4688e7485"),
    ],
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
    coverImage: unsplash("photo-1483985988355-763728e1935b"),
    gallery: [
      unsplash("photo-1483985988355-763728e1935b"),
      unsplash("photo-1460353581641-37baddab0fa2"),
      unsplash("photo-1487412720507-e7ab37603c6f"),
      unsplash("photo-1490481651871-ab68de25d43d"),
    ],
  },
];

export const projectCategories: ("All" | ProjectCategory)[] = [
  "All",
  "Full Stack",
  "Creative WebGL",
  "Web App",
];
