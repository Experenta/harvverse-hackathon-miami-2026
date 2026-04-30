"use client";

import { useEffect, useRef } from "react";

type ParticleFieldProps = {
  className?: string;
  density?: number;
  color?: string;
};

/**
 * ParticleField — drifting dots on a canvas.  Soft, never the focal point.
 */
export const ParticleField = ({ className, density = 32, color = "#9bc26c" }: ParticleFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const particles = Array.from({ length: density }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.04,
      vy: -0.02 - Math.random() * 0.04,
      a: 0.18 + Math.random() * 0.45,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx / 100;
          p.y += p.vy / 100;
          if (p.y < -0.05) {
            p.y = 1.05;
            p.x = Math.random();
          }
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;
        }
        const cx = p.x * width;
        const cy = p.y * height;
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.a;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
};
