"use client";

import { useState } from "react";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

type HashChipProps = {
  value: string;
  truncate?: number;
  display?: boolean;
  showCopy?: boolean;
  label?: string;
  className?: string;
};

/**
 * HashChip — celebratory display of a hash.
 * In `display` mode, treats the hash as a typographic feature.
 */
export const HashChip = ({
  value,
  truncate = 6,
  display = false,
  showCopy = true,
  label,
  className,
}: HashChipProps) => {
  const [copied, setCopied] = useState(false);

  const truncated =
    value.length > truncate * 2 + 2 ? `${value.slice(0, truncate + 2)}…${value.slice(-truncate)}` : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1100);
    } catch {
      /* ignore */
    }
  };

  return (
    <span className={`${display ? "hash-cell-display" : "hash-cell"} ${className ?? ""}`} title={value}>
      {label ? <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper-3">{label}</span> : null}
      <span className="text-paper">{truncated}</span>
      {showCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          className="text-paper-3 transition hover:text-leaf"
          aria-label="Copy hash"
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5 text-proof" /> : <ClipboardIcon className="h-3.5 w-3.5" />}
        </button>
      ) : null}
    </span>
  );
};
