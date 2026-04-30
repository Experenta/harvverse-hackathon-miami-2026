"use client";

import { useState } from "react";
import { ArrowPathIcon, BoltIcon, CheckCircleIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { StatusPill } from "~~/components/harvverse/StatusPill";
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
    <Panel padding="md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center border border-leaf/30 bg-leaf/8 font-mono text-xs text-leaf"
            style={{ borderRadius: 1 }}
          >
            M{template.number}
          </div>
          <div>
            <div className="text-base text-paper">{template.label}</div>
            <div className="font-mono mt-0.5 text-[10px] uppercase tracking-[0.18em] text-paper-3">
              {partnershipLabel}
            </div>
          </div>
        </div>
        <StatusPill status={state.status} />
      </div>

      <p className="mt-3 text-xs text-paper-2">{template.description}</p>

      <textarea
        className="mt-3 w-full border border-rule bg-ink-2 px-3 py-2 font-mono text-xs text-paper placeholder:text-paper-3 focus:border-leaf focus:outline-none"
        style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
        rows={2}
        value={state.notes}
        onChange={e => setState(s => ({ ...s, notes: e.target.value }))}
        placeholder="Notes for the demo fixture"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {template.evidenceRequired.map(key => (
          <span
            key={key}
            className="border border-rule bg-ink-2 px-2 py-0.5 font-mono text-[10px] text-paper-2"
            style={{ borderRadius: 1, backgroundColor: "var(--color-ink-2)" }}
          >
            {key}
          </span>
        ))}
      </div>

      {(state.artifactHash || state.registryTxHash) && (
        <div className="mt-4 grid gap-2">
          {state.artifactHash ? <MonoHash label="ARTIFACT" value={state.artifactHash} truncate={6} /> : null}
          {state.registryTxHash ? <MonoHash label="REGISTRY TX" value={state.registryTxHash} truncate={6} /> : null}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onRecord}
          disabled={state.recording || state.status !== "pending"}
          className="inline-flex items-center justify-center gap-1.5 border border-rule bg-ink-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper transition hover:border-leaf hover:text-leaf disabled:opacity-40"
          style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
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
          className="inline-flex items-center justify-center gap-1.5 border border-leaf/30 bg-leaf/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-leaf transition hover:bg-leaf/20 disabled:opacity-40"
          style={{ borderRadius: 2 }}
        >
          {state.attesting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BoltIcon className="h-4 w-4" />}
          Attest evidence
        </button>
      </div>

      {state.status === "attested" ? (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-leaf">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          EvidenceAttested event reconciled (mock)
        </div>
      ) : null}
    </Panel>
  );
};
