"use client";

import { useState } from "react";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

type MonoHashProps = {
  value: string;
  label?: string;
  truncate?: number;
  className?: string;
  showCopy?: boolean;
};

const truncateHash = (value: string, length: number) => {
  if (!value) return "";
  if (value.length <= length * 2 + 3) return value;
  return `${value.slice(0, length + 2)}…${value.slice(-length)}`;
};

export const MonoHash = ({ value, label, truncate = 6, className, showCopy = true }: MonoHashProps) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {label ? <span className="eyebrow shrink-0">{label}</span> : null}
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        title={expanded ? "Collapse" : "Expand"}
        className="mono-hash min-w-0 max-w-full grow truncate rounded border border-white/5 bg-white/5 px-2 py-1 text-left text-xs text-harv-text transition hover:border-[color:var(--color-harv-mint)]/30 hover:text-[color:var(--color-harv-mint)]"
      >
        <span className={expanded ? "break-all" : "truncate inline-block max-w-full align-middle"}>
          {expanded ? value : truncateHash(value, truncate)}
        </span>
      </button>
      {showCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy hash"
          className="shrink-0 rounded border border-white/5 p-1.5 text-muted-harv transition hover:border-[color:var(--color-harv-mint)]/30 hover:text-[color:var(--color-harv-mint)]"
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <ClipboardIcon className="h-3.5 w-3.5" />}
        </button>
      ) : null}
    </div>
  );
};
