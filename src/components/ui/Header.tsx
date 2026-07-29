"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/context/SmoothScrollProvider";
import { useCursorHover } from "@/hooks/useCursorHover";
import { cn } from "@/lib/cn";

interface NavLink {
  id: string;
  label: string;
}

const LINKS: NavLink[] = [
  { id: "about", label: "About" },
  { id: "projects", label: "Work" },
  { id: "contact", label: "Contact" },
];

interface NavButtonProps {
  link: NavLink;
  active: boolean;
  onClick: () => void;
}

function NavButton({ link, active, onClick }: NavButtonProps) {
  const hover = useCursorHover({ mode: "hover-button", text: link.label });
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={hover.onPointerEnter}
      onPointerLeave={hover.onPointerLeave}
      className={cn(
        "relative rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] transition-colors",
        active ? "text-background" : "text-foreground/70 hover:text-foreground",
      )}
    >
      {active && (
        <span className="absolute inset-0 -z-10 rounded-full bg-foreground" />
      )}
      {link.label}
    </button>
  );
}

export default function Header() {
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!lenis) return;

    const update = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      const p = limit > 0 ? Math.min(1, Math.max(0, window.scrollY / limit)) : 0;
      setProgress(p);

      const mid = window.scrollY + window.innerHeight * 0.4;
      let current = "";
      for (const link of LINKS) {
        const el = document.getElementById(link.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= mid) current = link.id;
      }
      setActive(current);
    };

    const onLenisScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    lenis.on("scroll", onLenisScroll);
    update();

    return () => {
      lenis.off("scroll", onLenisScroll);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [lenis]);

  const goTo = (id: string) => {
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: -20, duration: 1.2 });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-xl">
        {LINKS.map((link) => (
          <NavButton
            key={link.id}
            link={link}
            active={active === link.id}
            onClick={() => goTo(link.id)}
          />
        ))}
        <span className="ml-2 hidden font-mono text-[11px] uppercase tracking-[0.25em] text-muted sm:inline">
          {Math.round(progress * 100).toString().padStart(2, "0")}%
        </span>
      </nav>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/5">
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </header>
  );
}
