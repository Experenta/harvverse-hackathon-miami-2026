"use client";

import { useState } from "react";
import { ArrowPathIcon, BanknotesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { GlassCard } from "~~/components/harvverse/GlassCard";
import { MonoHash } from "~~/components/harvverse/MonoHash";
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
    <GlassCard padding="lg" glow={funded ? "mint" : "gold"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Fund settlement pool</div>
          <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">MockUSDC.transfer</h3>
        </div>
        <StatusPill status={funded ? "funded" : "pending"} />
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-harv">Pool address</span>
        </div>
        <MonoHash value={poolAddress} />
        <div className="flex items-center justify-between border-t border-white/5 pt-2">
          <span className="text-muted-harv">Amount (units)</span>
          <span className="mono-hash text-harv-text">{Number(shortfallUnits).toLocaleString("en-US")}</span>
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
          <div className="eyebrow">Recent funding transactions</div>
          <ul className="space-y-2">
            {txs.map(tx => (
              <li key={tx} className="flex items-center gap-2">
                <CheckCircleIcon className="h-3.5 w-3.5 text-[color:var(--color-harv-mint)]" />
                <MonoHash value={tx} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-[11px] text-muted-harv">
        Custody wallet must be authorized for testnet pool funding. No real funds are moved.
      </p>
    </GlassCard>
  );
};
