import { SettleActions } from "./SettleActions";
import { GlassCard } from "~~/components/harvverse/GlassCard";
import { MetricCard } from "~~/components/harvverse/MetricCard";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Section } from "~~/components/harvverse/Section";
import { SettlementProofPanel } from "~~/components/harvverse/SettlementProofPanel";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPartnershipById } from "~~/lib/mock/partnerships";
import { getPlanByCode } from "~~/lib/mock/plans";
// TODO(phase6A/6C): replace with useQuery(api.admin.settlements.getActiveSettlementIntent)
import { getActiveSettlementIntent } from "~~/lib/mock/settlements";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);

const AdminSettlementPage = () => {
  const settlement = getActiveSettlementIntent();

  if (!settlement) {
    return (
      <Section
        eyebrow="Settlement"
        title="No active settlement intent"
        description="Move a partnership to awaiting_settlement to prepare a deterministic settlement intent."
      >
        <GlassCard padding="lg" className="text-center">
          <p className="text-sm text-muted-harv">Nothing to execute right now.</p>
        </GlassCard>
      </Section>
    );
  }

  const partnership = getPartnershipById(settlement.partnershipId);
  const lot = partnership ? getLotByCode(partnership.lotCode) : undefined;
  const plan = partnership ? getPlanByCode(partnership.planCode) : undefined;

  const required = BigInt(settlement.requiredUsdcUnits);
  const balance = BigInt(settlement.poolBalanceUsdcUnits);
  const isUnderfunded = balance < required;
  const shortfall = isUnderfunded ? required - balance : 0n;
  const fundedPct = required === 0n ? 100 : Number((balance * 100n) / (required === 0n ? 1n : required));

  return (
    <Section
      eyebrow={`Settlement · ${settlement.id}`}
      title={
        <>
          Execute deterministic settlement <span className="text-muted-harv">· {lot?.farmName}</span>
        </>
      }
      description="Locked plan terms × harvest evidence → exact cents per recipient. No human override."
      actions={<StatusPill status={settlement.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <GlassCard padding="lg">
            <div className="eyebrow">Harvest fixture · year {settlement.year}</div>
            <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">Locked inputs</h3>
            <p className="mt-1 text-sm text-muted-harv">
              These inputs feed both Convex preview and SettlementDistributor.preview onchain. They must agree.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Yield (qq)"
                value={(settlement.yieldTenthsQQ / 10).toFixed(1)}
                mono
                hint={`Cap ${plan ? (plan.yieldCapY1TenthsQQ / 10).toFixed(1) : "—"} qq`}
              />
              <MetricCard label="SCA score" value={(settlement.scaScoreTenths / 10).toFixed(1)} tone="gold" mono />
              <MetricCard
                label="Price /lb"
                value={`$${(settlement.priceCentsPerLb / 100).toFixed(2)}`}
                tone="mint"
                mono
              />
            </div>
            <div className="mt-4">
              <MonoHash label="HARVEST EVIDENCE HASH" value={settlement.harvestEvidenceHash} />
            </div>
          </GlassCard>

          <GlassCard padding="lg">
            <div className="eyebrow">Deterministic preview</div>
            <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">Computed payouts</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Revenue" value={formatCents(settlement.revenueCents)} mono />
              <MetricCard label="Profit" value={formatCents(settlement.profitCents)} mono />
              <MetricCard label="Farmer share" value={formatCents(settlement.farmerCents)} tone="gold" mono />
              <MetricCard label="Partner share" value={formatCents(settlement.partnerCents)} tone="mint" mono />
            </div>
            <p className="mt-4 text-xs text-muted-harv">
              Cents are converted to 6-decimal MockUSDC base units before {""}
              <span className="mono-hash text-harv-text">SettlementDistributor.settle</span> is signed by the operator.
            </p>
          </GlassCard>

          {partnership && lot ? (
            <GlassCard padding="lg">
              <div className="eyebrow">Counterparties</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                  <div className="eyebrow">Partner</div>
                  <div className="mt-2">
                    <WalletPillMock address={partnership.partnerWallet} />
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                  <div className="eyebrow">Farmer</div>
                  <div className="mt-2">
                    <WalletPillMock address={partnership.farmerWallet} />
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                <MonoHash label="OPENED TX" value={partnership.openedTxHash} />
                <MonoHash label="PROPOSAL HASH" value={partnership.proposalHash} />
              </div>
            </GlassCard>
          ) : null}

          {settlement.status === "confirmed" ? <SettlementProofPanel settlement={settlement} /> : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <GlassCard padding="lg" glow={isUnderfunded ? "gold" : "mint"}>
            <div className="eyebrow">Settlement pool</div>
            <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">Required vs balance</h3>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-harv">Required</span>
                <span className="mono-hash text-harv-text">{Number(required).toLocaleString("en-US")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-harv">Balance</span>
                <span className="mono-hash text-harv-text">{Number(balance).toLocaleString("en-US")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-harv">Shortfall</span>
                <span
                  className={`mono-hash ${
                    isUnderfunded ? "text-[color:var(--color-harv-accent)]" : "text-[color:var(--color-harv-mint)]"
                  }`}
                >
                  {Number(shortfall).toLocaleString("en-US")}
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${
                  isUnderfunded ? "bg-[color:var(--color-harv-accent)]" : "bg-[color:var(--color-harv-mint)]"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, fundedPct))}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] text-muted-harv">
              {fundedPct.toFixed(1)}% funded · 6-decimal MockUSDC base units
            </p>
          </GlassCard>

          <SettleActions settlement={settlement} isUnderfunded={isUnderfunded} />
        </aside>
      </div>
    </Section>
  );
};

export default AdminSettlementPage;
