import { MonoHash } from "./MonoHash";
import { Panel } from "./Panel";
import { Stat } from "./Stat";
import { StatusPill } from "./StatusPill";
import type { Settlement } from "~~/lib/mock/types";

type SettlementProofPanelProps = {
  settlement: Settlement;
  variant?: "compact" | "full";
  className?: string;
};

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);

/**
 * SettlementProofPanel — display of a settlement's deterministic math + hashes.
 * Uses Stat for the four key dollar readouts; pairs with MonoHash chain.
 */
export const SettlementProofPanel = ({ settlement, variant = "full", className }: SettlementProofPanelProps) => {
  return (
    <Panel padding={variant === "compact" ? "md" : "lg"} className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="eyebrow-proof">DETERMINISTIC SETTLEMENT · YEAR {settlement.year}</div>
          <h3 className="font-display mt-2 text-3xl leading-none tracking-tight text-paper">Settlement proof</h3>
          <p className="mt-2 text-sm text-paper-2">
            Computed from locked plan terms and harvest evidence. No human override.
          </p>
        </div>
        <StatusPill status={settlement.status} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatCents(settlement.revenueCents)} size="md" />
        <Stat label="Profit" value={formatCents(settlement.profitCents)} size="md" />
        <Stat label="Farmer · 60%" value={formatCents(settlement.farmerCents)} tone="honey" size="md" />
        <Stat label="Partner · 40%" value={formatCents(settlement.partnerCents)} tone="proof" size="md" />
      </div>

      <div className="mt-5 grid gap-2">
        <MonoHash label="EVIDENCE HASH" value={settlement.harvestEvidenceHash} truncate={6} />
        {settlement.fundingTxHash ? (
          <MonoHash label="FUNDING TX" value={settlement.fundingTxHash} truncate={6} />
        ) : null}
        {settlement.settlementTxHash ? (
          <MonoHash label="SETTLEMENT TX" value={settlement.settlementTxHash} truncate={6} />
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 border-t border-rule pt-4 sm:grid-cols-3 text-xs text-paper-2">
        <div>
          <div className="eyebrow">Yield</div>
          <div className="mono-hash mt-1 text-sm text-paper">{(settlement.yieldTenthsQQ / 10).toFixed(1)} qq</div>
        </div>
        <div>
          <div className="eyebrow">SCA score</div>
          <div className="mono-hash mt-1 text-sm text-paper">{(settlement.scaScoreTenths / 10).toFixed(1)}</div>
        </div>
        <div>
          <div className="eyebrow">Price /lb</div>
          <div className="mono-hash mt-1 text-sm text-paper">${(settlement.priceCentsPerLb / 100).toFixed(2)}</div>
        </div>
      </div>
    </Panel>
  );
};
