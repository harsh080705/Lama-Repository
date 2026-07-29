"use client";

import {
  Atom,
  Code2,
  Cpu,
  Zap,
} from "lucide-react";
import {
  siReact,
  siTypescript,
  siNextdotjs,
  siThreedotjs,
  siTailwindcss,
  siGsap,
  siNodedotjs,
  siPostgresql,
  siMongodb,
  siStripe,
  siRedis,
  siPrisma,
  siSocketdotio,
  siVercel,
} from "simple-icons";

import type { Project } from "@/data/projects";

/**
 * Map a free-form project tag (e.g. "React", "Next.js") to a small
 * monochrome icon. Falls back to a Lucide generic icon if the tag isn't
 * recognised. Both sources ship only inline-friendly assets so the
 * accordion stays icon-light — no extra HTTP requests.
 */
type IconSource =
  | { kind: "lucide"; Icon: typeof Atom }
  | { kind: "si"; svg: string };

const LUCIDE_MAP: Record<string, typeof Atom> = {
  Rust: Cpu,
  D3: Code2,
  "Yjs": Atom,
  CRDT: Atom,
  "Edge Functions": Zap,
};

const SI_MAP: Record<string, string> = {
  React: siReact.svg,
  TypeScript: siTypescript.svg,
  "Next.js": siNextdotjs.svg,
  "Three.js": siThreedotjs.svg,
  Threejs: siThreedotjs.svg,
  Tailwind: siTailwindcss.svg,
  GSAP: siGsap.svg,
  "Node.js": siNodedotjs.svg,
  Nodejs: siNodedotjs.svg,
  PostgreSQL: siPostgresql.svg,
  MongoDB: siMongodb.svg,
  Stripe: siStripe.svg,
  Redis: siRedis.svg,
  Prisma: siPrisma.svg,
  WebSockets: siSocketdotio.svg,
  Vercel: siVercel.svg,
};

function resolveIcon(tag: string): IconSource | null {
  if (SI_MAP[tag]) return { kind: "si", svg: SI_MAP[tag] };
  if (LUCIDE_MAP[tag]) return { kind: "lucide", Icon: LUCIDE_MAP[tag] };
  return null;
}

function SimpleIcon({
  svg,
  className,
}: {
  svg: string;
  className?: string;
}) {
  // simple-icons ships `<svg role="img" viewBox="0 0 24 24"><title>…</title><path d="…"/></svg>`
  // Pull the first `<path d="…"/>` regardless of surrounding attributes.
  const pathMatch = svg.match(/<path\s[^>]*d="([^"]+)"[^>]*\/>/);
  if (!pathMatch) return null;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d={pathMatch[1]} />
    </svg>
  );
}

/**
 * Tech stack badge — monochrome by default, fades to 80% opacity on
 * hover of the surrounding row. Renders an inline icon + uppercase
 * label inside a subtle bordered pill.
 */
export default function TechBadge({
  tag,
  hovered,
}: {
  tag: string;
  hovered: boolean;
}) {
  const icon = resolveIcon(tag);
  if (!icon) return null;

  return (
    <span
      className={`flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 transition-opacity duration-300 ${
        hovered ? "opacity-100" : "opacity-40"
      }`}
      title={tag}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center">
        {icon.kind === "lucide" ? (
          <icon.Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        ) : (
          <SimpleIcon svg={icon.svg} className="h-3.5 w-3.5" />
        )}
      </span>
      <span>{tag}</span>
    </span>
  );
}

/**
 * Convenience: render a row of badges for a project's tags list. Skips
 * any tag that didn't resolve to an icon.
 */
export function TechStackRow({
  project,
  hovered,
}: {
  project: Project;
  hovered: boolean;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {project.tags.map((t) => (
        <TechBadge key={t} tag={t} hovered={hovered} />
      ))}
    </div>
  );
}
