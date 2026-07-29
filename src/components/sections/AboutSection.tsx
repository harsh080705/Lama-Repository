"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAPScroll } from "@/hooks/useGSAPScroll";
import SplitTextReveal from "@/components/ui/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

const BIO = `Full-stack engineer building high-performance web applications and creative interactive experiences. I care about the details — typography that breathes, motion that feels physical, and interfaces that respond instantly.`;

const SKILLS: { label: string; value: string }[] = [
  { label: "Languages", value: "TypeScript · Rust · Go" },
  { label: "Frontend", value: "Next.js · React · Three.js · GSAP" },
  { label: "Backend", value: "Node · Postgres · Redis · Edge" },
  { label: "Craft", value: "WebGL · Shaders · Motion · 3D" },
];

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 4, suffix: "+", label: "Years shipping" },
  { value: 30, suffix: "+", label: "Projects shipped" },
  { value: 60, suffix: "fps", label: "Target framerate" },
  { value: 100, suffix: "%", label: "Pixel perfect" },
];

function StatCounter({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = numRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = `${value}${suffix}`;
      return;
    }

    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        v: value,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          el.textContent = `${Math.round(counter.v)}${suffix}`;
        },
      });
    });

    return () => ctx.revert();
  }, [value, suffix]);

  return (
    <div className="border-t border-white/10 pt-4">
      <span ref={numRef} className="block text-5xl md:text-6xl font-display font-medium tracking-tight">
        0{suffix}
      </span>
      <span className="mt-2 block text-xs uppercase tracking-[0.25em] text-muted">
        {label}
      </span>
    </div>
  );
}

export default function AboutSection() {
  useGSAPScroll();

  return (
    <section
      id="about"
      className="relative z-10 w-full px-6 md:px-12 py-24 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 md:mb-20 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-muted">
          <span className="h-px w-10 bg-white/30" />
          About
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <h2 className="col-span-12 md:col-span-4 font-display text-sm uppercase tracking-[0.25em] text-muted">
            (01) <br /> Who I am
          </h2>

          <div className="col-span-12 md:col-span-8">
            <SplitTextReveal
              text={BIO}
              mode="lines"
              className="text-2xl md:text-4xl lg:text-5xl font-display font-medium leading-[1.05] tracking-tight text-balance"
            />
          </div>
        </div>

        <div className="mt-24 md:mt-40 grid grid-cols-12 gap-6 md:gap-10">
          <h2 className="col-span-12 md:col-span-4 font-display text-sm uppercase tracking-[0.25em] text-muted">
            (02) <br /> Stack
          </h2>

          <ul className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
            {SKILLS.map((s) => (
              <li
                key={s.label}
                className="flex items-baseline justify-between border-b border-white/10 pb-4"
              >
                <span className="text-xs uppercase tracking-[0.25em] text-muted">
                  {s.label}
                </span>
                <span className="text-sm md:text-base font-mono text-foreground/90 text-right">
                  {s.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-24 md:mt-40 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {STATS.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
