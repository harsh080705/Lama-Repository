# Harsh — Creative Developer Portfolio

An agency-grade 3D portfolio inspired by [Lama Lama](https://lama-lama.com), built as a single immersive scroll-driven experience. The 3D WebGL hero, kinetic cursor, buttery Lenis scroll, GSAP-driven reveals and case-study modal all share a single requestAnimationFrame loop — no stutter, no jank.

> **Live demo:** _coming soon_

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (`@theme` driven, no `tailwind.config.js`) |
| 3D | [Three.js](https://threejs.org) + [`@react-three/fiber`](https://r3f.docs.pmnd.rs) + [`@react-three/drei`](https://github.com/pmndrs/drei) |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering) |
| Scroll-driven animation | [GSAP](https://gsap.com) + `ScrollTrigger` |
| UI motion | [Framer Motion](https://www.framer.com/motion) |
| Icons | [Lucide](https://lucide.dev) |
| Class merging | `clsx` + `tailwind-merge` |

### Architecture highlights

- **Single shared RAF loop** — `gsap.ticker` drives Lenis, which in turn re-measures every `ScrollTrigger`. Zero drift.
- **Capability-tier WebGL** — `useCapabilityTier()` detects mobile / DPR / hardware concurrency and tunes `MeshTransmissionMaterial.samples`, geometry density and IBL on the fly. Mid-range phones get `samples: 3, resolution: 256`; high-end desktops get full glass.
- **WebGL context-loss recovery** — `webglcontextlost` / `webglcontextrestored` listeners attached in `Canvas onCreated` so a GPU reset never freezes the canvas.
- **Kinetic cursor** — `CursorContext` + Framer Motion springs; auto-disables on touch devices and under `prefers-reduced-motion`.
- **Section composition** — fixed `<HeroCanvas />` pinned to the viewport, content layers (`HeroSection`, `AboutSection`, `ProjectsSection`, `ContactSection`) scroll above it.
- **ErrorBoundary-wrapped scene** — every `<Suspense>` falls back to a static wireframe torus if `<Environment preset="city">` fails to fetch.

---

## Folder structure

```
src/
├── app/                     ← Next.js App Router entry
│   ├── globals.css          ← Tailwind v4 @theme + Lenis hooks
│   ├── layout.tsx           ← CursorProvider → SmoothScrollProvider → CustomCursor
│   └── page.tsx             ← Page composition
├── components/
│   ├── canvas/              ← R3F <Canvas> wrappers + 3D objects
│   │   ├── HeroCanvas.tsx
│   │   ├── GlassKnot.tsx
│   │   └── WebGLErrorBoundary.tsx
│   ├── sections/            ← Composed page sections
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   └── ContactSection.tsx
│   └── ui/                  ← Reusable HTML primitives
│       ├── CustomCursor.tsx
│       ├── Header.tsx
│       ├── ProjectCard.tsx
│       ├── ProjectModal.tsx
│       └── SplitTextReveal.tsx
├── context/
│   ├── CursorContext.tsx
│   └── SmoothScrollProvider.tsx
├── data/
│   └── projects.ts          ← Typed project data (cover images, gallery, video clips)
├── hooks/
│   ├── useCapabilityTier.ts
│   ├── useCursorHover.ts
│   ├── useGSAPScroll.ts
│   ├── useMediaQuery.ts
│   └── useMouseParallax.ts
└── lib/
    └── cn.ts
```

---

## Getting started

### Prerequisites

- Node.js **20.x** or newer (Next.js 16 requires `>=20.18`)
- npm, pnpm, or yarn

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (Turbopack)
npm run dev
# → http://localhost:3000

# 3. Production build
npm run build
npm run start
```

### Environment

No environment variables are required for local development. If you later add analytics or a CMS, drop them into `.env.local` (already git-ignored):

```bash
# .env.local — never commit this file
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server with Turbopack + HMR |
| `npm run build` | Production build into `.next/` |
| `npm run start` | Serve the production build |
| `npm run lint` | (When configured) ESLint check |

---

## Deployment

The project is a standard Next.js App Router build and deploys out-of-the-box to:

- [Vercel](https://vercel.com) — recommended, zero config
- [Netlify](https://www.netlify.com) — adapter required
- Any Node.js host — `npm run build && npm run start`

Make sure `next.config.ts` image `remotePatterns` includes any CDN you point the `<Image>` components at.

---

## Accessibility

- `prefers-reduced-motion` respected end-to-end — kinetic cursor, ScrollTriggers, parallax and reveals all short-circuit to a static final state.
- Kinetic cursor auto-disables on touch / coarse pointers.
- Native focus styles preserved (no global `outline: none`).

---

## License

MIT — see `LICENSE` if present. All third-party assets (Unsplash thumbnails, demo videos) are placeholder content and must be replaced before shipping to production.
