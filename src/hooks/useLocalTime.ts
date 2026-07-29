"use client";

import { useEffect, useState } from "react";

export interface LocalTimeOptions {
  /** IANA timezone, e.g. "Asia/Kolkata". */
  timeZone: string;
  /** City label shown next to the time. */
  label: string;
}

export interface LocalTime {
  time: string;
  tzAbbr: string;
}

/**
 * Returns the live HH:MM (24h) clock for a given timezone, refreshed once
 * per minute. Pure derived state — no timers leak.
 */
export function useLocalTime({
  timeZone,
  label: _label,
}: LocalTimeOptions): LocalTime {
  const [state, setState] = useState<LocalTime>(() => format(new Date(), timeZone));

  useEffect(() => {
    const update = () => setState(format(new Date(), timeZone));
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, [timeZone]);

  return state;
}

function format(date: Date, timeZone: string): LocalTime {
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);

  const tzAbbr = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value ?? "";

  return { time, tzAbbr };
}
