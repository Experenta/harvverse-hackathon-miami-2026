"use client";

import { useState } from "react";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

type MonoHashProps = {
  value: string;
  label?: string;
  truncate?: number;
  showCopy?: boolean;
  className?: string;
  display?: boolean;
};

const truncateHash = (value: string, length: number) => {
  if (!value) return "";
  if (value.length <= length * 2 + 3) return value;
  return `${value.slice(0, length + 2)}…${value.slice(-length)}`;
};

/**
 * MonoHash — line rendering of a hash with copy.
 * Defaults to terminal-style monospace; in `display` mode the hash is treated
 * as typographic feature (larger size, calmer surface).
 */
export const MonoHash = ({
  value,
  label,
  truncate = 6,
  showCopy = true,
  className,
  display = false,
}: MonoHashProps) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {label ? (
        <span className="eyebrow shrink-0" aria-hidden>
          {label}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        title={expanded ? "Collapse" : "Expand"}
        className={`mono-hash min-w-0 max-w-full grow truncate border border-rule bg-ink-2 ${
          display ? "px-3 py-2 text-[15px]" : "px-2 py-1 text-xs"
        } text-left text-paper transition hover:border-leaf hover:text-leaf`}
        style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
      >
        <span className={expanded ? "break-all" : "inline-block max-w-full truncate align-middle"}>
          {expanded ? value : truncateHash(value, truncate)}
        </span>
      </button>
      {showCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy hash"
          className="shrink-0 border border-rule p-1.5 text-paper-3 transition hover:border-leaf hover:text-leaf"
          style={{ borderRadius: 2 }}
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5 text-proof" /> : <ClipboardIcon className="h-3.5 w-3.5" />}
        </button>
      ) : null}
    </div>
  );
};
