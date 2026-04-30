"use client";

import { useState } from "react";
import { ArrowPathIcon, BanknotesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { StatusPill } from "~~/components/harvverse/StatusPill";

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

type FundActionsProps = {
  shortfallUnits: string;
  poolAddress: string;
};

export const FundActions = ({ shortfallUnits, poolAddress }: FundActionsProps) => {
  const [signing, setSigning] = useState(false);
  const [txs, setTxs] = useState<string[]>([]);
  const [funded, setFunded] = useState(false);

  const onFund = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      const hash = fakeHash(Date.now());
      setTxs(prev => [hash, ...prev]);
      setFunded(true);
    }, 1100);
  };

  return (
    <Panel padding="lg" variant={funded ? "hot" : "default"} crosshair>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className={funded ? "eyebrow-leaf" : "eyebrow-honey"}>FUND SETTLEMENT POOL</span>
          <h3 className="font-display mt-2 text-2xl leading-none tracking-tight text-paper">MockUSDC.transfer</h3>
        </div>
        <StatusPill status={funded ? "funded" : "pending"} />
      </div>

      <div className="mt-5 space-y-3 text-xs">
        <MonoHash label="POOL ADDRESS" value={poolAddress} truncate={6} />
        <div
          className="flex items-center justify-between border border-rule bg-ink-2 px-3 py-2"
          style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
        >
          <span className="text-paper-2">Amount (units)</span>
          <span className="font-mono text-sm text-paper">{Number(shortfallUnits).toLocaleString("en-US")}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onFund}
        disabled={signing}
        className="btn btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 disabled:opacity-40"
      >
        {signing ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <BanknotesIcon className="h-4 w-4" />}
        {signing ? "Funding…" : funded ? "Top up again" : "Fund pool now"}
      </button>

      {txs.length > 0 ? (
        <div className="mt-5 space-y-2">
          <span className="eyebrow-proof">RECENT FUNDING TXS</span>
          <ul className="space-y-2">
            {txs.map(tx => (
              <li key={tx} className="flex items-center gap-2">
                <CheckCircleIcon className="h-3.5 w-3.5 text-proof" />
                <MonoHash value={tx} truncate={6} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-[11px] text-paper-3">
        Custody wallet must be authorized for local pool funding. No real funds are moved.
      </p>
    </Panel>
  );
};
