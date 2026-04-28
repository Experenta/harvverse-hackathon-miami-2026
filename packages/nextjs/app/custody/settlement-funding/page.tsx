import { FundActions } from "./FundActions";
import { GlassCard, MetricCard, MonoHash, Section, StatusPill } from "~~/components/harvverse";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPartnershipById } from "~~/lib/mock/partnerships";
// TODO(phase6B): replace with useQuery(api.admin.settlements.getActiveSettlementIntent) + useScaffoldReadContract
import { listSettlements } from "~~/lib/mock/settlements";

const POOL_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const formatUnits = (units: string) => Number(units).toLocaleString("en-US");

const SettlementFundingPage = () => {
  const settlements = listSettlements();

  return (
    <Section
      eyebrow="Settlement funding · MockUSDC"
      title="Top up the pool before settlement executes"
      description="Settlement is blocked when the pool can't pay computed farmer + partner shares. Fund only what's needed."
    >
      <div className="space-y-8">
        {settlements.map(settlement => {
          const partnership = getPartnershipById(settlement.partnershipId);
          const lot = partnership ? getLotByCode(partnership.lotCode) : undefined;
          const required = BigInt(settlement.requiredUsdcUnits);
          const balance = BigInt(settlement.poolBalanceUsdcUnits);
          const isUnderfunded = balance < required;
          const shortfall = isUnderfunded ? required - balance : 0n;
          const fundedPct = required === 0n ? 100 : Number((balance * 100n) / required);

          return (
            <article key={settlement.id} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <GlassCard padding="lg">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="eyebrow">Settlement intent</div>
                      <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">
                        {lot?.farmName ?? settlement.partnershipId}
                      </h3>
                      <p className="mt-1 text-sm text-muted-harv">
                        Partnership #{partnership?.onchainPartnershipId ?? "—"} · year {settlement.year}
                      </p>
                    </div>
                    <StatusPill status={settlement.status} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="Required"
                      value={formatUnits(settlement.requiredUsdcUnits)}
                      mono
                      hint="6-dec base units"
                    />
                    <MetricCard
                      label="Balance"
                      value={formatUnits(settlement.poolBalanceUsdcUnits)}
                      tone="muted"
                      mono
                    />
                    <MetricCard
                      label="Shortfall"
                      value={formatUnits(shortfall.toString())}
                      tone={isUnderfunded ? "gold" : "mint"}
                      mono
                    />
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${
                        isUnderfunded ? "bg-[color:var(--color-harv-accent)]" : "bg-[color:var(--color-harv-mint)]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, fundedPct))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-harv">{fundedPct.toFixed(1)}% of required liquidity</p>

                  <div className="mt-5 grid gap-2 border-t border-white/5 pt-4">
                    <MonoHash label="EVIDENCE HASH" value={settlement.harvestEvidenceHash} />
                    {settlement.fundingTxHash ? <MonoHash label="FUNDING TX" value={settlement.fundingTxHash} /> : null}
                    {settlement.settlementTxHash ? (
                      <MonoHash label="SETTLEMENT TX" value={settlement.settlementTxHash} />
                    ) : null}
                  </div>
                </GlassCard>
              </div>

              <aside className="space-y-5">
                {isUnderfunded ? (
                  <FundActions shortfallUnits={shortfall.toString()} poolAddress={POOL_ADDRESS} />
                ) : (
                  <GlassCard padding="lg" glow="mint">
                    <div className="eyebrow">Pool ready</div>
                    <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">Fully funded</h3>
                    <p className="mt-2 text-sm text-muted-harv">
                      The pool can pay the computed farmer + partner shares. The operator can execute settlement.
                    </p>
                  </GlassCard>
                )}
              </aside>
            </article>
          );
        })}
      </div>
    </Section>
  );
};

export default SettlementFundingPage;
