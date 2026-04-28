"use client";

import { useState } from "react";
import { ArrowPathIcon, BoltIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { GlassCard, MonoHash, StatusPill } from "~~/components/harvverse";
import type { Settlement } from "~~/lib/mock/types";

const fakeHash = (seed: number) => {
  const hex = "0123456789abcdef";
  let v = (seed * 9301 + 49297) % 233280;
  let out = "0x";
  for (let i = 0; i < 64; i++) {
    v = (v * 9301 + 49297) % 233280;
    out += hex[Math.floor((v / 233280) * 16)];
  }
  return out;
};

type SettleActionsProps = {
  settlement: Settlement;
  isUnderfunded: boolean;
};

export const SettleActions = ({ settlement, isUnderfunded }: SettleActionsProps) => {
  const [status, setStatus] = useState(settlement.status);
  const [settlementTxHash, setSettlementTxHash] = useState<string | undefined>(settlement.settlementTxHash);
  const [signing, setSigning] = useState(false);

  const onSettle = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setStatus("confirmed");
      setSettlementTxHash(fakeHash(Date.now()));
    }, 1300);
  };

  const disabled = signing || isUnderfunded || status === "confirmed";

  return (
    <GlassCard padding="lg" glow={status === "confirmed" ? "mint" : "none"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Execute deterministic settlement</div>
          <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">SettlementDistributor · settle()</h3>
        </div>
        <StatusPill status={status} />
      </div>

      {isUnderfunded ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[color:var(--color-harv-accent)]/30 bg-[color:var(--color-harv-accent)]/5 p-3 text-xs text-[color:var(--color-harv-accent)]">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          Pool underfunded · settle() will revert. Coordinate with custody to fund the pool first.
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSettle}
        disabled={disabled}
        className="btn btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 disabled:opacity-40"
      >
        {signing ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BoltIcon className="h-4 w-4" />}
        {status === "confirmed" ? "Settlement confirmed" : signing ? "Settling…" : "Execute settlement"}
      </button>

      {settlementTxHash ? (
        <div className="mt-4">
          <MonoHash label="SETTLEMENT TX" value={settlementTxHash} />
        </div>
      ) : null}

      {status === "confirmed" ? (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-harv-mint)]">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          SettlementExecuted reconciled (mock) · partnership marked settled
        </div>
      ) : null}

      <p className="mt-3 text-[11px] text-muted-harv">
        Operator wallet must hold SETTLEMENT_OPERATOR_ROLE. Convex prepares but never signs.
      </p>
    </GlassCard>
  );
};
