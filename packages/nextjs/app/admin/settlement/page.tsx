import { SettleActions } from "./SettleActions";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { Section } from "~~/components/harvverse/Section";
import { SettlementProofPanel } from "~~/components/harvverse/SettlementProofPanel";
import { Stat } from "~~/components/harvverse/Stat";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPartnershipById } from "~~/lib/mock/partnerships";
import { getPlanByCode } from "~~/lib/mock/plans";
import { getActiveSettlementIntent } from "~~/lib/mock/settlements";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);

const AdminSettlementPage = () => {
  const settlement = getActiveSettlementIntent();

  if (!settlement) {
    return (
      <Section
        index="§ SETTLEMENT"
        eyebrow="Settlement"
        eyebrowTone="honey"
        title="No active settlement intent."
        description="Move a partnership to awaiting_settlement to prepare a deterministic settlement intent."
      >
        <Panel padding="lg" className="text-center">
          <p className="text-sm text-paper-2">Nothing to execute right now.</p>
        </Panel>
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
      index={`§ SETTLEMENT · ${settlement.id}`}
      eyebrow="Settlement intent"
      eyebrowTone="honey"
      coordinate={`Y${settlement.year} · ${(settlement.yieldTenthsQQ / 10).toFixed(1)} qq`}
      title={
        <>
          Execute deterministic settlement
          <span className="block text-paper-2">{lot?.farmName}</span>
        </>
      }
      description="Locked plan terms × harvest evidence → exact cents per recipient. No human override."
      actions={<StatusPill status={settlement.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Harvest fixture inputs */}
          <Panel padding="lg">
            <div className="flex items-center justify-between">
              <span className="eyebrow-honey">HARVEST FIXTURE · YEAR {settlement.year}</span>
              <LiveDot tone="honey" label="locked" />
            </div>
            <h3 className="font-display mt-3 text-2xl leading-none tracking-tight text-paper">Locked inputs</h3>
            <p className="mt-2 text-sm text-paper-2">
              These inputs feed both Convex preview and{" "}
              <span className="font-mono text-paper">SettlementDistributor.preview</span> onchain. They must agree.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat
                label="Yield (qq)"
                value={(settlement.yieldTenthsQQ / 10).toFixed(1)}
                size="md"
                hint={`Cap ${plan ? (plan.yieldCapY1TenthsQQ / 10).toFixed(1) : "—"} qq`}
              />
              <Stat label="SCA score" value={(settlement.scaScoreTenths / 10).toFixed(1)} size="md" tone="honey" />
              <Stat
                label="Price /lb"
                value={`$${(settlement.priceCentsPerLb / 100).toFixed(2)}`}
                size="md"
                tone="proof"
              />
            </div>
            <div className="mt-5">
              <MonoHash label="HARVEST EVIDENCE HASH" value={settlement.harvestEvidenceHash} truncate={6} />
            </div>
          </Panel>

          {/* Computed payouts */}
          <Panel padding="lg" crosshair>
            <div className="eyebrow-leaf">DETERMINISTIC PREVIEW</div>
            <h3 className="font-display mt-3 text-2xl leading-none tracking-tight text-paper">Computed payouts</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Revenue" value={formatCents(settlement.revenueCents)} size="md" />
              <Stat label="Profit" value={formatCents(settlement.profitCents)} size="md" />
              <Stat label="Farmer · 60%" value={formatCents(settlement.farmerCents)} tone="honey" size="md" />
              <Stat label="Partner · 40%" value={formatCents(settlement.partnerCents)} tone="proof" size="md" />
            </div>
            <p className="mt-5 text-xs text-paper-2">
              Cents are converted to 6-decimal MockUSDC base units before{" "}
              <span className="font-mono text-paper">SettlementDistributor.settle</span> is signed by the operator.
            </p>
          </Panel>

          {/* Counterparties */}
          {partnership && lot ? (
            <Panel padding="lg">
              <div className="eyebrow">COUNTERPARTIES</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div
                  className="border border-rule bg-ink-2 p-3"
                  style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
                >
                  <div className="eyebrow">PARTNER</div>
                  <div className="mt-2">
                    <WalletPillMock address={partnership.partnerWallet} />
                  </div>
                </div>
                <div
                  className="border border-rule bg-ink-2 p-3"
                  style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
                >
                  <div className="eyebrow">FARMER</div>
                  <div className="mt-2">
                    <WalletPillMock address={partnership.farmerWallet} />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <MonoHash label="OPENED TX" value={partnership.openedTxHash} truncate={6} />
                <MonoHash label="PROPOSAL HASH" value={partnership.proposalHash} truncate={6} />
              </div>
            </Panel>
          ) : null}

          {settlement.status === "confirmed" ? <SettlementProofPanel settlement={settlement} /> : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* Pool funding */}
          <Panel padding="lg" variant={isUnderfunded ? "default" : "hot"}>
            <div className="flex items-center justify-between">
              <span className={isUnderfunded ? "eyebrow-honey" : "eyebrow-leaf"}>SETTLEMENT POOL</span>
              <LiveDot tone={isUnderfunded ? "honey" : "leaf"} />
            </div>
            <h3 className="font-display mt-3 text-2xl leading-none tracking-tight text-paper">Required vs balance</h3>

            <div className="mt-5 space-y-2 text-sm">
              <PoolRow label="Required" value={Number(required).toLocaleString("en-US")} />
              <PoolRow label="Balance" value={Number(balance).toLocaleString("en-US")} />
              <PoolRow
                label="Shortfall"
                value={Number(shortfall).toLocaleString("en-US")}
                tone={isUnderfunded ? "honey" : "leaf"}
              />
            </div>

            <div className="mt-5 h-2 overflow-hidden border border-rule" style={{ borderRadius: 1 }}>
              <div
                className="h-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, fundedPct))}%`,
                  background: isUnderfunded
                    ? "linear-gradient(90deg, var(--color-honey), var(--color-honey-deep))"
                    : "linear-gradient(90deg, var(--color-leaf), var(--color-proof))",
                }}
              />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
              {fundedPct.toFixed(1)}% funded · 6-decimal MockUSDC base units
            </p>
          </Panel>

          {isUnderfunded ? (
            <Panel padding="md" className="border-honey/40 bg-honey/5">
              <div className="flex items-start gap-2 text-honey">
                <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-xs">
                  <div className="font-mono uppercase tracking-[0.18em]">UNDERFUNDED</div>
                  <p className="mt-1 text-paper-2">
                    settle() will revert. Coordinate with custody to fund the pool first.
                  </p>
                </div>
              </div>
            </Panel>
          ) : null}

          <SettleActions settlement={settlement} isUnderfunded={isUnderfunded} />
        </aside>
      </div>
    </Section>
  );
};

const PoolRow = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "leaf" | "honey";
}) => (
  <div className="flex items-center justify-between border-b border-rule pb-2 last:border-b-0">
    <span className="text-paper-2">{label}</span>
    <span className={`font-mono text-paper ${tone === "honey" ? "text-honey" : tone === "leaf" ? "text-leaf" : ""}`}>
      {value}
    </span>
  </div>
);

export default AdminSettlementPage;
