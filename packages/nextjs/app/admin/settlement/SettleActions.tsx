"use client";

import { useState } from "react";
import { SettlementChoreography } from "./SettlementChoreography";
import { ArrowPathIcon, BoltIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { StatusPill } from "~~/components/harvverse/StatusPill";
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
  const [showAnimation, setShowAnimation] = useState(false);

  const onSettle = () => {
    setShowAnimation(true);
  };

  const onAnimationComplete = () => {
    setStatus("confirmed");
    setSettlementTxHash(fakeHash(Date.now()));
  };

  const disabled = isUnderfunded || status === "confirmed";

  return (
    <>
      <Panel padding="lg" variant={status === "confirmed" ? "hot" : "default"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow-leaf">EXECUTE · DETERMINISTIC</span>
            <h3 className="font-display mt-2 text-xl leading-none tracking-tight text-paper">
              SettlementDistributor.settle()
            </h3>
          </div>
          <StatusPill status={status} />
        </div>

        <button
          type="button"
          onClick={onSettle}
          disabled={disabled}
          className="btn btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 shimmer-cta disabled:opacity-40"
        >
          {showAnimation ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BoltIcon className="h-4 w-4" />}
          {status === "confirmed" ? "Settlement confirmed" : "Execute settlement"}
        </button>

        {settlementTxHash ? (
          <div className="mt-5">
            <MonoHash label="SETTLEMENT TX" value={settlementTxHash} truncate={6} />
          </div>
        ) : null}

        {status === "confirmed" ? (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-leaf">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            SettlementExecuted reconciled (mock) · partnership marked settled
          </div>
        ) : null}

        <p className="mt-4 text-[11px] text-paper-3">
          Operator wallet must hold SETTLEMENT_OPERATOR_ROLE. Convex prepares but never signs.
        </p>
      </Panel>

      {showAnimation ? (
        <SettlementChoreography
          settlement={settlement}
          onClose={() => setShowAnimation(false)}
          onComplete={onAnimationComplete}
        />
      ) : null}
    </>
  );
};
