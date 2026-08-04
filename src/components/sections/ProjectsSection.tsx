"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import ProjectCard from "@/components/ui/ProjectCard";
import ProjectModal from "@/components/ui/ProjectModal";
import ProjectList from "@/components/sections/ProjectList";
import { useGSAPScroll } from "@/hooks/useGSAPScroll";
import { projects, projectCategories, type Project } from "@/data/projects";
import { useCursor } from "@/context/CursorContext";
import { cn } from "@/lib/cn";

const HEADING = "Featured Work";
const SUBHEAD = "A small selection of recent builds — picked for craft, not volume.";

export default function ProjectsSection() {
  useGSAPScroll();
  const { setCursorMode } = useCursor();

  const [filter, setFilter] = useState<(typeof projectCategories)[number]>("All");
  const [active, setActive] = useState<Project | null>(null);

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
          (04) Featured Work
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

        {/* Project cards grid — single hover owner. The outer wrapper
            receives the cursor mode change so internal sub-elements can't
            fire intermediate mouseleave events. The motion.div still owns
            the entrance / exit animations via AnimatePresence + layout. */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
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
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
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
        </div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
