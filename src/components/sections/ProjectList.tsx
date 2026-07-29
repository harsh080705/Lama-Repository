"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLenis } from "@/context/SmoothScrollProvider";
import { useCursor } from "@/context/CursorContext";
import { TechStackRow } from "@/components/ui/TechBadge";
import { projects, type Project } from "@/data/projects";

/**
 * Accordion-style quick-links list. Each row:
 *   - default:  title left, year/category right, dark surface
 *   - hover:    smoothly expands via Framer Motion height auto,
 *               reveals a two-column layout:
 *                 [Left]  description + inline tech stack badges
 *                 [Right] animated progress-fill action button
 *               lifts up 2px, surface highlight + accent top border.
 *
 * Clicking a row opens the modal; clicking the action bar scrolls to
 * the matching card via Lenis.
 */

const SCROLL_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
const PROGRESS_FILL_MS = 700;

function ActionBar({
  project,
  hovered,
  onAction,
}: {
  project: Project;
  hovered: boolean;
  onAction: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onAction();
      }}
      className="group/bar relative w-full overflow-hidden rounded-full border border-white/15 px-5 py-3 text-left transition-colors hover:border-white/30"
    >
      {/* Progress fill — animates 0 → 100% on hover. */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: PROGRESS_FILL_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left center" }}
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-accent/40 via-accent/20 to-accent/5"
      />

      {/* Static base so the text stays legible before the fill completes */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-white/[0.04]"
      />

      {/* Text sits above the fill */}
      <span className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground">
          Explore {project.title}
        </span>
        <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground">
          View case study
          <ArrowRight className="h-4 w-4 transition-transform group-hover/bar:translate-x-1" />
        </span>
      </span>
    </button>
  );
}

function ProjectRow({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (project: Project) => void;
}) {
  const lenis = useLenis();
  const { setCursorMode, setCursorText } = useCursor();
  const [hovered, setHovered] = useState(false);

  const goToProject = useCallback(() => {
    const target = `#project-${project.id}`;
    if (lenis) {
      lenis.scrollTo(target, { offset: -80, duration: 1.2, easing: SCROLL_EASING });
      return;
    }
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [lenis, project.id]);

  const onEnter = () => {
    setHovered(true);
    setCursorMode("hover-button");
    setCursorText("Open");
  };

  const onLeave = () => {
    setHovered(false);
    setCursorMode("default");
    setCursorText("");
  };

  return (
    <motion.li
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      animate={{ y: hovered ? -2 : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group relative overflow-hidden border-b border-white/10"
    >
      {/* Hover surface highlight — subtle accent wash */}
      <motion.span
        aria-hidden
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent/[0.06] via-white/[0.02] to-transparent"
      />

      {/* Border glow on hover */}
      <motion.span
        aria-hidden
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent/60"
      />

      <button
        type="button"
        onClick={() => onSelect(project)}
        className="relative block w-full px-1 py-5 text-left md:px-2 md:py-6"
        aria-expanded={hovered}
      >
        {/* Header row */}
        <div className="flex w-full items-baseline justify-between gap-6">
          <span
            className={`font-display text-2xl md:text-4xl font-medium uppercase tracking-tight transition-colors ${
              hovered ? "text-accent" : "text-foreground"
            }`}
          >
            {project.title}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {project.year} / {project.category}
          </span>
        </div>

        {/* Accordion expansion — text + tech badges left, action bar right */}
        <motion.div
          initial={false}
          animate={{
            height: hovered ? "auto" : 0,
            opacity: hovered ? 1 : 0,
          }}
          transition={{
            height: { type: "spring", stiffness: 240, damping: 26, mass: 0.6 },
            opacity: { duration: 0.2, delay: hovered ? 0.05 : 0 },
          }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-12 gap-6 pt-5 md:gap-10">
            {/* Left column — description + inline tech stack */}
            <div className="col-span-12 md:col-span-7">
              <p className="text-base md:text-lg text-muted leading-relaxed">
                {project.description}
              </p>
              <TechStackRow project={project} hovered={hovered} />
            </div>

            {/* Right column — action bar with animated progress fill */}
            <div className="col-span-12 md:col-span-5 md:pt-1">
              <ActionBar
                project={project}
                hovered={hovered}
                onAction={goToProject}
              />
            </div>
          </div>
        </motion.div>
      </button>
    </motion.li>
  );
}

export default function ProjectList({
  onSelectProject,
}: {
  onSelectProject: (project: Project) => void;
}) {
  return (
    <ul className="mt-10 md:mt-14 rounded-2xl border border-white/10 bg-surface/60 p-2 md:p-4 backdrop-blur-sm">
      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          onSelect={onSelectProject}
        />
      ))}
    </ul>
  );
}
