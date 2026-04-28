"use client";

import { useEffect, useState } from "react";
import { ParticleField } from "./ParticleField";

export const HeroParticleField = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowCoreDevice = (navigator.hardwareConcurrency ?? 4) <= 4;
    const smallScreen = window.innerWidth < 1024;
    if (reducedMotion || lowCoreDevice || smallScreen) return;

    let idleId: number | undefined;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(() => setEnabled(true));
      return () => {
        if (idleId !== undefined && idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => setEnabled(true), 900);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!enabled) return null;
  return <ParticleField className="opacity-55" density={20} />;
};
