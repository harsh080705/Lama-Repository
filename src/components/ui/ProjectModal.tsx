"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Pause, Play, X } from "lucide-react";
import { useLenis } from "@/context/SmoothScrollProvider";
import type { Project } from "@/data/projects";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2.01-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

/**
 * Video block with skeleton + play/pause control overlay. Muted + looping +
 * playsInline so mobile browsers don't hijack fullscreen or audio.
 */
function VideoShowcase({ src, poster }: { src: string; poster?: string }) {
  return (
    <div className="group/video relative overflow-hidden rounded-2xl border border-white/10 bg-surface">
      <video
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        className="aspect-video w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur-md">
        <Play className="h-3 w-3 fill-accent text-accent" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/90">
          Live preview
        </span>
      </div>
    </div>
  );
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-surface">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={80}
        className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const lenis = useLenis();

  useEffect(() => {
    if (!project) return;

    if (lenis) lenis.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      if (lenis) lenis.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [project, lenis, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex justify-end"
          aria-modal
          role="dialog"
        >
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative h-full w-full md:max-w-2xl overflow-y-auto bg-background border-l border-white/10"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-background/80 px-6 py-4 backdrop-blur-md md:px-10">
              <span className="text-[11px] uppercase tracking-[0.3em] text-muted">
                Case study / {project.year}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-white/15 p-2 text-foreground/80 transition-colors hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="px-6 py-10 md:px-10 md:py-14">
              {/* Hero cover image */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface">
                <Image
                  src={project.coverImage}
                  alt={`${project.title} hero`}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 768px) 100vw, 640px"
                  quality={85}
                  priority
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>

              <span className="mt-8 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em]">
                {project.category}
              </span>

              <h2 className="mt-6 font-display font-medium uppercase leading-[0.85] tracking-tight text-balance text-[clamp(2.25rem,7vw,5rem)]">
                {project.title}
              </h2>
              <p className="mt-3 text-lg md:text-xl text-muted">{project.subtitle}</p>

              <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-white/10 bg-surface p-4"
                  >
                    <div className="font-display text-2xl md:text-3xl font-medium text-accent">
                      {m.value}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              <section className="mt-12">
                <h3 className="text-xs uppercase tracking-[0.3em] text-muted">
                  The problem
                </h3>
                <p className="mt-3 text-base md:text-lg leading-relaxed text-foreground/90">
                  {project.problem}
                </p>
              </section>

              <section className="mt-10">
                <h3 className="text-xs uppercase tracking-[0.3em] text-muted">
                  Engineering highlights
                </h3>
                <ul className="mt-4 space-y-3">
                  {project.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex gap-3 border-b border-white/10 pb-3 text-base text-foreground/90"
                    >
                      <span className="font-mono text-xs text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-10">
                <h3 className="text-xs uppercase tracking-[0.3em] text-muted">
                  Stack
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>

              {/* ── Media showcase ────────────────────────────────────── */}
              <section className="mt-12">
                <h3 className="text-xs uppercase tracking-[0.3em] text-muted">
                  Media
                </h3>

                {project.videoPreview && (
                  <div className="mt-4">
                    <VideoShowcase src={project.videoPreview} poster={project.coverImage} />
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {project.gallery.map((src, i) => (
                    <GalleryImage
                      key={src}
                      src={src}
                      alt={`${project.title} screenshot ${i + 1}`}
                    />
                  ))}
                </div>
              </section>

              <div className="mt-12 flex flex-wrap items-center gap-3">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs uppercase tracking-[0.25em] text-background transition-colors hover:bg-accent"
                >
                  Live demo
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.25em] text-foreground/90 transition-colors hover:bg-white/10"
                >
                  <GithubMark className="h-4 w-4" />
                  Repository
                </a>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
