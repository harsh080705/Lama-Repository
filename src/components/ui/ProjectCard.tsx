"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { useCursorHover } from "@/hooks/useCursorHover";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const hoverHandlers = useCursorHover({
    mode: "hover-project",
    text: "View",
  });

  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 18,
  });

  const shineX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const shineBackground = useMotionTemplate`radial-gradient(600px circle at ${shineX} ${shineY}, rgba(255,255,255,0.18), transparent 50%)`;

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={onOpen}
      onPointerMove={onMove}
      onPointerLeave={() => {
        onLeave();
        hoverHandlers.onPointerLeave();
      }}
      onPointerEnter={hoverHandlers.onPointerEnter}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileTap={{ scale: 0.98 }}
      className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-surface text-left will-change-transform"
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ transform: "translateZ(20px)" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ background: project.image }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-foreground/90 backdrop-blur-md">
          {project.category}
        </span>

        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: shineBackground,
            mixBlendMode: "screen",
          }}
        />
      </div>

      <div
        className="flex items-end justify-between gap-6 p-6 md:p-8"
        style={{ transform: "translateZ(40px)" }}
      >
        <div>
          <h3 className="font-display text-3xl md:text-5xl font-medium uppercase tracking-tight leading-none">
            {project.title}
          </h3>
          <p className="mt-2 text-sm md:text-base text-muted">{project.subtitle}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground/80">
          View case study
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.button>
  );
}
