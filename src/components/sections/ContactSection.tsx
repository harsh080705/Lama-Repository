"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import type { Project } from "@/data/projects";
import { useGSAPScroll } from "@/hooks/useGSAPScroll";
import { useCursorHover } from "@/hooks/useCursorHover";
import ScrambleText from "@/components/ui/ScrambleText";

interface MagneticLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

function MagneticLink({ href, label, external }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.25);
    y.set(dy * 0.25);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const hover = useCursorHover({ mode: "hover-button" });

  return (
    <motion.a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerEnter={hover.onPointerEnter}
      onPointerLeave={() => {
        onLeave();
        hover.onPointerLeave();
      }}
      className="group inline-flex items-center gap-2 text-2xl md:text-3xl font-display font-medium uppercase tracking-tight"
    >
      <span>{label}</span>
      <ArrowUpRight
        className="h-5 w-5 -translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-2"
        strokeWidth={1.5}
      />
    </motion.a>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const email = "hello@example.com";
  const hover = useCursorHover({ mode: "hover-button" });

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      onPointerEnter={hover.onPointerEnter}
      onPointerLeave={hover.onPointerLeave}
      className="group relative inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 backdrop-blur-md transition-colors hover:bg-white/10"
    >
      <span className="font-mono text-sm md:text-base text-foreground/90">
        {email}
      </span>
      <span className="relative h-4 w-4">
        <motion.span
          initial={false}
          animate={{
            opacity: copied ? 0 : 1,
            scale: copied ? 0.6 : 1,
          }}
          className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-muted"
        >
          copy
        </motion.span>
        <motion.span
          initial={false}
          animate={{
            opacity: copied ? 1 : 0,
            scale: copied ? 1 : 0.6,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Check className="h-4 w-4 text-accent" strokeWidth={2} />
        </motion.span>
      </span>

      <motion.span
        initial={false}
        animate={{
          opacity: copied ? 1 : 0,
          y: copied ? 0 : 6,
        }}
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-background"
      >
        Email copied
      </motion.span>
    </button>
  );
}

export default function ContactSection() {
  useGSAPScroll();
  const [time, setTime] = useState<string>("--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      });
      setTime(fmt.format(now));
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer
      id="contact"
      className="relative z-10 w-full px-6 md:px-12 pt-24 md:pt-40 pb-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 md:mb-20 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-muted">
          <span className="h-px w-10 bg-white/30" />
          Contact
        </div>

        <h2 className="font-display font-medium uppercase leading-[0.85] tracking-tight text-balance text-[clamp(2.5rem,9vw,8rem)]">
          Let&apos;s build
          <br />
          <span className="text-foreground/45">something</span>{" "}
          <span className="text-accent">together.</span>
        </h2>

        <div className="mt-16 md:mt-24 grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-6">
            <p className="max-w-md text-base md:text-lg text-muted leading-relaxed">
              Have an ambitious brief, an interesting problem, or just want to
              talk shop about WebGL & interface craft? My inbox is open.
            </p>

            <div className="mt-8">
              <CopyEmail />
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 flex flex-col gap-6 md:items-end">
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[11px] uppercase tracking-[0.3em] text-muted">
                Local time
              </span>
              <span className="font-mono text-2xl md:text-3xl">
                <ScrambleText text="PUNE, IN —" speed={45} scrambleSpeed={24} />{" "}
                <span className="text-accent">{time}</span>{" "}
                <ScrambleText text="IST" speed={45} scrambleSpeed={24} />
              </span>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <span className="text-[11px] uppercase tracking-[0.3em] text-muted">
                Find me online
              </span>
              <MagneticLink
                href="https://github.com/example"
                label="GitHub"
                external
              />
              <MagneticLink
                href="https://linkedin.com/in/example"
                label="LinkedIn"
                external
              />
              <MagneticLink
                href="https://x.com/example"
                label="Twitter / X"
                external
              />
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.25em] text-muted md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Harsh — All rights reserved.</span>
          <span>Designed & built in-house.</span>
        </div>
      </div>
    </footer>
  );
}
