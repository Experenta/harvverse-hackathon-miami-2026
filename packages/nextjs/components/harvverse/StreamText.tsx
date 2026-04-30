"use client";

import { useEffect, useRef, useState } from "react";

type StreamTextProps = {
  text: string;
  speed?: number; // ms per character
  startDelay?: number;
  cursor?: boolean;
  onDone?: () => void;
  className?: string;
};

/**
 * StreamText — token-by-token streaming with terminal cursor.
 * Used for the AI Agent layer narration on Screens 3–5.
 */
export const StreamText = ({ text, speed = 14, startDelay = 0, cursor = true, onDone, className }: StreamTextProps) => {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setOutput("");
    setDone(false);
    let i = 0;
    let tickHandle: ReturnType<typeof setTimeout> | null = null;
    let startHandle: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      i += 1;
      setOutput(text.slice(0, i));
      if (i < text.length) {
        // slight rhythmic variation for naturalism
        const jitter = text[i - 1] === "," || text[i - 1] === "." ? 90 : speed + Math.random() * 8;
        tickHandle = setTimeout(tick, jitter);
      } else {
        setDone(true);
        onDoneRef.current?.();
      }
    };

    startHandle = setTimeout(tick, startDelay);

    return () => {
      if (tickHandle) clearTimeout(tickHandle);
      if (startHandle) clearTimeout(startHandle);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={`whitespace-pre-wrap ${done ? "" : cursor ? "cursor-blink" : ""} ${className ?? ""}`}>
      {output}
    </span>
  );
};
