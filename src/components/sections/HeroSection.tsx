"use client";

import { ArrowDown, Circle } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.9, ease },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between px-6 md:px-12 py-10 md:py-14">
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Portfolio / 2026
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <Circle className="relative h-2 w-2 fill-accent text-accent" />
          </span>
          <span className="text-[11px] tracking-[0.2em] text-foreground/80">
            Available — Summer / Fall 2026
          </span>
        </motion.div>
      </header>

      <div className="flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-10 lg:col-span-9">
            <motion.h1
              custom={0}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="font-display font-medium uppercase leading-[0.85] tracking-tight text-balance text-[clamp(2.75rem,9vw,9rem)]"
            >
              Harsh
            </motion.h1>

            <motion.h2
              custom={1}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="mt-2 font-display font-medium uppercase leading-[0.85] tracking-tight text-balance text-[clamp(1.5rem,4.5vw,4.5rem)] text-foreground/55"
            >
              Full Stack
              <span className="text-accent"> & </span>
              Creative Developer
            </motion.h2>
          </div>
        </div>
      </div>

      <footer className="flex items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="max-w-sm text-sm md:text-base text-muted leading-relaxed"
        >
          Independent developer building high-end websites, immersive 3D and
          interactive interfaces for ambitious teams.
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="hidden md:flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted"
          aria-hidden
        >
          <span>Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-4 w-4" strokeWidth={1.25} />
          </motion.span>
        </motion.div>
      </footer>
    </section>
  );
}
