"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  /** First card in the grid gets `priority` for LCP. */
  priority?: boolean;
}

export default function ProjectCard({ project, onOpen, priority }: ProjectCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);

  // Preload every gallery URL as soon as the card mounts so the card
  // hover preview is decoded by the time the user actually hovers.
  // image preview is decoded by the time the user actually hovers.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urls = [project.coverImage, ...project.gallery].filter(Boolean);
    for (const url of urls) {
      const img = new window.Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = url;
    }
  }, [project.coverImage, project.gallery]);

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
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileTap={{ scale: 0.98 }}
      className="group block w-full overflow-hidden rounded-2xl border border-white/10 bg-surface text-left will-change-transform"
    >
      <div className="relative overflow-hidden bg-surface">
        <div
          className="pointer-events-none relative aspect-[4/3] w-full overflow-hidden"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="absolute inset-0 bg-surface" style={{ background: project.image }} />
          <Image
            src={project.coverImage}
            alt={`${project.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
            priority={priority}
            className="pointer-events-none h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-foreground/90 backdrop-blur-md">
              {project.category}
            </span>
            {project.videoPreview && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-foreground/90 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Video
              </span>
            )}
          </div>

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
          className="pointer-events-none flex items-end justify-between gap-6 p-6 md:p-8"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="pointer-events-none font-display text-3xl font-medium uppercase leading-none tracking-tight md:text-5xl">
              {project.title}
            </h3>
            <p className="pointer-events-none mt-2 text-sm text-muted md:text-base">
              {project.subtitle}
            </p>

            <div className="pointer-events-none mt-4 flex flex-wrap gap-2">
              {project.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="pointer-events-none rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground/80"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <span className="pointer-events-none flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground/80">
            View case study
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
