import { GlassCard } from "./GlassCard";
import { MetricCard } from "./MetricCard";
import { MonoHash } from "./MonoHash";
import { StatusPill } from "./StatusPill";
import type { Settlement } from "~~/lib/mock/types";

type SettlementProofPanelProps = {
  settlement: Settlement;
  variant?: "compact" | "full";
  className?: string;
};

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);

export const SettlementProofPanel = ({ settlement, variant = "full", className }: SettlementProofPanelProps) => {
  return (
    <GlassCard padding={variant === "compact" ? "md" : "lg"} className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="eyebrow">Deterministic settlement · year {settlement.year}</div>
          <h3 className="mt-1 text-2xl font-light tracking-tight text-harv-text">Settlement proof</h3>
          <p className="mt-1 text-sm text-muted-harv">
            Computed from locked plan terms and harvest evidence. No human override.
          </p>
        </div>
        <StatusPill status={settlement.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatCents(settlement.revenueCents)}
          mono
          align="center"
          className="min-h-[136px]"
          valueClassName="text-[clamp(1.45rem,1.9vw,2.2rem)] whitespace-nowrap"
        />
        <MetricCard
          label="Profit"
          value={formatCents(settlement.profitCents)}
          mono
          align="center"
          className="min-h-[136px]"
          valueClassName="text-[clamp(1.45rem,1.9vw,2.2rem)] whitespace-nowrap"
        />
        <MetricCard
          label="Farmer share"
          value={formatCents(settlement.farmerCents)}
          tone="gold"
          mono
          align="center"
          className="min-h-[136px]"
          valueClassName="text-[clamp(1.45rem,1.9vw,2.2rem)] whitespace-nowrap"
        />
        <MetricCard
          label="Partner share"
          value={formatCents(settlement.partnerCents)}
          tone="mint"
          mono
          align="center"
          className="min-h-[136px]"
          valueClassName="text-[clamp(1.45rem,1.9vw,2.2rem)] whitespace-nowrap"
        />
      </div>

      <div className="mt-5 grid gap-2">
        <MonoHash label="EVIDENCE HASH" value={settlement.harvestEvidenceHash} />
        {settlement.fundingTxHash ? <MonoHash label="FUNDING TX" value={settlement.fundingTxHash} /> : null}
        {settlement.settlementTxHash ? <MonoHash label="SETTLEMENT TX" value={settlement.settlementTxHash} /> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 border-t border-white/5 pt-4 text-xs text-muted-harv">
        <div>
          <div className="eyebrow">Yield</div>
          <div className="mono-hash mt-1 text-sm text-harv-text">{(settlement.yieldTenthsQQ / 10).toFixed(1)} qq</div>
        </div>
        <div>
          <div className="eyebrow">SCA score</div>
          <div className="mono-hash mt-1 text-sm text-harv-text">{(settlement.scaScoreTenths / 10).toFixed(1)}</div>
        </div>
        <div>
          <div className="eyebrow">Price /lb</div>
          <div className="mono-hash mt-1 text-sm text-harv-text">${(settlement.priceCentsPerLb / 100).toFixed(2)}</div>
        </div>
      </div>
    </GlassCard>
  );
};
