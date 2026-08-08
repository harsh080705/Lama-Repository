"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import ProjectCard from "@/components/ui/ProjectCard";
import ProjectModal from "@/components/ui/ProjectModal";
import ProjectList from "@/components/sections/ProjectList";
import MagicBlendCursor from "@/components/ui/MagicBlendCursor";
import { useGSAPScroll } from "@/hooks/useGSAPScroll";
import { projects, projectCategories, type Project } from "@/data/projects";
import { useCursor } from "@/context/CursorContext";
import { cn } from "@/lib/cn";
import ScrambleText from "@/components/ui/ScrambleText";

const HEADING = "Featured Work";
const SUBHEAD = "A small selection of recent builds — picked for craft, not volume.";

export default function ProjectsSection() {
  useGSAPScroll();
  const { setCursorMode } = useCursor();

  const [filter, setFilter] = useState<(typeof projectCategories)[number]>("All");
  const [active, setActive] = useState<Project | null>(null);
  // MagicBlendCursor is gated to the project grid wrapper. The cursor
  // only renders while `isGridHovered` is true, so users browsing the
  // rest of the section see the default cursor.
  const [isGridHovered, setIsGridHovered] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "All") return projects;
    return projects.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <section
      id="projects"
      className="relative z-10 w-full px-6 md:px-12 py-24 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 md:mb-20 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-muted">
          <span className="h-px w-10 bg-white/30" />
          <ScrambleText text="(04) Featured Work" speed={45} scrambleSpeed={24} />
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-8">
            <SplitTextReveal
              text={HEADING}
              mode="chars"
              className="font-display font-medium uppercase leading-[0.85] tracking-tight text-balance text-[clamp(2.5rem,8vw,7rem)]"
            />
          </div>
          <div className="col-span-12 md:col-span-4 md:pt-3">
            <SplitTextReveal
              text={SUBHEAD}
              mode="words"
              className="text-base md:text-lg text-muted leading-relaxed"
            />
          </div>
        </div>

        {/* Quick-links accordion — hover to expand; click to scroll/open */}
        <ProjectList onSelectProject={setActive} />

        <div className="mt-12 md:mt-16 flex flex-wrap items-center gap-2">
          {projectCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.25em] transition-colors",
                filter === cat
                  ? "border-foreground bg-foreground text-background"
                  : "border-white/15 text-foreground/70 hover:border-white/40 hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project cards grid — MagicBlendCursor scope. The grid wrapper
            is the single hover owner: when the pointer enters it, the
            MagicBlendCursor mounts with mix-blend-mode: difference. When
            it leaves, the cursor unmounts and the native cursor returns. */}
        <div
          className="relative mt-10"
          onMouseEnter={() => setIsGridHovered(true)}
          onMouseLeave={() => setIsGridHovered(false)}
        >
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <div
                  key={project.id}
                  id={`project-${project.id}`}
                  onMouseEnter={() => setCursorMode("hover-project")}
                  onMouseLeave={() => setCursorMode("default")}
                  className="group relative cursor-none"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                    className="h-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-900"
                  >
                    <ProjectCard
                      project={project}
                      onOpen={() => setActive(project)}
                      priority={i === 0}
                    />
                  </motion.div>
                </div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* MagicBlendCursor — portal-mounted. mix-blend-mode: difference
              (a.k.a. "Original Invert") inverts whatever sits behind the
              dot, producing the seamless light/dark flip across card
              surfaces. Hidden on touch + reduced-motion via the internal
              useCursorEnabled hook. */}
          {isGridHovered && (
            <MagicBlendCursor
              active={isGridHovered}
              damping={30}
              mixBlendMode="difference"
              stiffness={400}
              theme="Original Invert"
            />
          )}
        </div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
