# 🚀 Harsh — Creative Developer Portfolio

An agency-grade 3D portfolio built as an immersive, single scroll-driven WebGL experience. Featuring an interactive 3D hero 🎨, kinetic cursor 🎯, buttery Lenis smooth scroll ⚡, and GSAP reveal animations.

> 🌐 **Live Demo:** [https://harsh080705.github.io/Lama-Repository/](https://harsh080705.github.io/Lama-Repository/)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (`@theme` driven) |
| 3D | [Three.js](https://threejs.org) + [`@react-three/fiber`](https://r3f.docs.pmnd.rs) + [`@react-three/drei`](https://github.com/pmndrs/drei) |
| Smooth Scroll | [Lenis](https://lenis.darkroom.engineering) |
| Animations | [GSAP](https://gsap.com) + `ScrollTrigger` + [Framer Motion](https://www.framer.com/motion) |
| Icons | [Lucide](https://lucide.dev) |

### Key Features

- **Single RAF loop** — `gsap.ticker` syncs Lenis + ScrollTrigger. Zero drift.
- **Adaptive WebGL** — Auto-detects device capability and tunes performance (samples, geometry density, IBL)
- **Context-loss recovery** — GPU reset never freezes the canvas
- **Kinetic cursor** — Spring physics with touch auto-disable and `prefers-reduced-motion` support
- **Accessibility-first** — Full keyboard navigation, focus styles, motion preferences respected

---

## Folder Structure

```
src/
├── app/
│   ├── globals.css          ← Tailwind v4 @theme + Lenis hooks
│   ├── layout.tsx           ← Providers (Cursor, SmoothScroll)
│   └── page.tsx
├── components/
│   ├── canvas/              ← R3F Canvas + 3D objects
│   ├── sections/            ← Page sections
│   └── ui/                  ← Reusable components
├── context/
├── data/
├── hooks/
└── lib/
```

---

## Quick Start

### Requirements
- Node.js **20.x+** (Next.js 16 requires `>=20.18`)

### Setup
```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Production build
npm run start        # Serve production
```

### Environment (Optional)
```bash
# .env.local — git-ignored
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Deploy

- **Vercel** — Zero config (recommended)
- **Netlify** — Requires adapter
- **Node.js host** — `npm run build && npm run start`

---

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+ (iOS 15+)
- Modern WebGL 2.0 browsers

---

## Troubleshooting

**WebGL context lost?** → Auto-recovery built-in (`WebGLErrorBoundary`)  
**Scroll stuttering?** → Check `SmoothScrollProvider` in `layout.tsx`  
**Slow on mobile?** → Capability detection auto-optimizes; check DevTools

---

## License

MIT — See `LICENSE`. Demo assets (Unsplash images, videos) are placeholders; replace before production.
