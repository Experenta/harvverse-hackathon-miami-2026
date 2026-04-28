"use client";

import { useState } from "react";
import { ArrowPathIcon, BoltIcon, CheckCircleIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { GlassCard, MonoHash, StatusPill } from "~~/components/harvverse";
import type { EvidenceRecord, MilestoneTemplate } from "~~/lib/mock/types";

type MilestoneActionsProps = {
  template: MilestoneTemplate;
  initialRecord?: EvidenceRecord;
  partnershipLabel: string;
};

type LocalState = {
  status: "pending" | "recorded" | "attested";
  artifactHash?: string;
  registryTxHash?: string;
  notes: string;
  recording: boolean;
  attesting: boolean;
};

const fakeHash = (seed: number) => {
  const hex = "0123456789abcdef";
  let out = "0x";
  let v = (seed * 9301 + 49297) % 233280;
  for (let i = 0; i < 64; i++) {
    v = (v * 9301 + 49297) % 233280;
    out += hex[Math.floor((v / 233280) * 16)];
  }
  return out;
};

export const MilestoneActions = ({ template, initialRecord, partnershipLabel }: MilestoneActionsProps) => {
  const [state, setState] = useState<LocalState>({
    status: initialRecord?.status ?? "pending",
    artifactHash: initialRecord?.artifactHash,
    registryTxHash: initialRecord?.registryTxHash,
    notes: initialRecord?.notes ?? `Compressed demo evidence for milestone ${template.number}.`,
    recording: false,
    attesting: false,
  });

  const onRecord = () => {
    setState(s => ({ ...s, recording: true }));
    setTimeout(() => {
      setState(s => ({
        ...s,
        recording: false,
        status: "recorded",
        artifactHash: fakeHash(template.number * 7 + Date.now()),
      }));
    }, 800);
  };

  const onAttest = () => {
    setState(s => ({ ...s, attesting: true }));
    setTimeout(() => {
      setState(s => ({
        ...s,
        attesting: false,
        status: "attested",
        registryTxHash: fakeHash(template.number * 11 + Date.now()),
      }));
    }, 1100);
  };

  return (
    <GlassCard padding="md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-harv-mint)]/30 bg-[color:var(--color-harv-mint)]/8 font-mono text-sm text-[color:var(--color-harv-mint)]">
            M{template.number}
          </div>
          <div>
            <div className="text-base font-medium text-harv-text">{template.label}</div>
            <div className="eyebrow mt-1">{partnershipLabel}</div>
          </div>
        </div>
        <StatusPill status={state.status} />
      </div>

      <p className="mt-3 text-xs text-muted-harv">{template.description}</p>

      <textarea
        className="mt-3 w-full rounded-lg border border-white/8 bg-white/3 px-3 py-2 font-mono text-xs text-harv-text placeholder:text-muted-harv/60 focus:border-[color:var(--color-harv-mint)]/40 focus:outline-none"
        rows={2}
        value={state.notes}
        onChange={e => setState(s => ({ ...s, notes: e.target.value }))}
        placeholder="Notes for the demo fixture"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {template.evidenceRequired.map(key => (
          <span
            key={key}
            className="rounded-md border border-white/8 bg-white/3 px-2 py-0.5 font-mono text-[10px] text-muted-harv"
          >
            {key}
          </span>
        ))}
      </div>

      {(state.artifactHash || state.registryTxHash) && (
        <div className="mt-4 grid gap-2">
          {state.artifactHash ? <MonoHash label="ARTIFACT" value={state.artifactHash} /> : null}
          {state.registryTxHash ? <MonoHash label="REGISTRY TX" value={state.registryTxHash} /> : null}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onRecord}
          disabled={state.recording || state.status !== "pending"}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-harv-text/90 transition hover:border-[color:var(--color-harv-mint)]/30 hover:text-[color:var(--color-harv-mint)] disabled:opacity-40"
        >
          {state.recording ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <DocumentPlusIcon className="h-4 w-4" />
          )}
          Record fixture
        </button>
        <button
          type="button"
          onClick={onAttest}
          disabled={state.attesting || state.status !== "recorded"}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[color:var(--color-harv-mint)]/30 bg-[color:var(--color-harv-mint)]/10 px-3 py-2 text-xs text-[color:var(--color-harv-mint)] transition hover:bg-[color:var(--color-harv-mint)]/20 disabled:opacity-40"
        >
          {state.attesting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BoltIcon className="h-4 w-4" />}
          Attest evidence
        </button>
      </div>

      {state.status === "attested" ? (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-harv-mint)]">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          EvidenceAttested event reconciled (mock)
        </div>
      ) : null}
    </GlassCard>
  );
};
