"use client";

import { useEffect, useRef, useState } from "react";

type MonoTickerProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  className?: string;
  format?: (n: number) => string;
};

/**
 * MonoTicker — animated count-up of a numeric value.
 * Used for ROI / dollars during AI Agent and settlement animations.
 * Honors prefers-reduced-motion via instant snap.
 */
export const MonoTicker = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1100,
  delay = 0,
  className,
  format,
}: MonoTickerProps) => {
  const [shown, setShown] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      return;
    }
    let raf: number;
    const start = performance.now() + delay;
    const tick = (t: number) => {
      const elapsed = Math.max(0, t - start);
      const progress = Math.min(1, elapsed / duration);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);

  const display = format
    ? format(shown)
    : shown.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span className={`font-mono tabular-nums ${className ?? ""}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};
