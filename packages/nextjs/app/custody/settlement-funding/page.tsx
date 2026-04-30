import { FundActions } from "./FundActions";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { Section } from "~~/components/harvverse/Section";
import { Stat } from "~~/components/harvverse/Stat";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPartnershipById } from "~~/lib/mock/partnerships";
import { listSettlements } from "~~/lib/mock/settlements";

const POOL_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const formatUnits = (units: string) => Number(units).toLocaleString("en-US");

const SettlementFundingPage = () => {
  const settlements = listSettlements();

  return (
    <Section
      index="§ CUSTODY"
      eyebrow="Settlement funding · MockUSDC"
      eyebrowTone="proof"
      title="Top up the pool before settlement executes."
      description="Settlement is blocked when the pool can't pay computed farmer + partner shares. Fund only what's needed."
    >
      <div className="space-y-10">
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
              <Panel padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="eyebrow-proof">SETTLEMENT INTENT</span>
                    <h3 className="font-display mt-2 text-2xl leading-none tracking-tight text-paper">
                      {lot?.farmName ?? settlement.partnershipId}
                    </h3>
                    <p className="mt-1 text-sm text-paper-2">
                      Partnership #{partnership?.onchainPartnershipId ?? "—"} · year {settlement.year}
                    </p>
                  </div>
                  <StatusPill status={settlement.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Stat
                    label="Required"
                    value={formatUnits(settlement.requiredUsdcUnits)}
                    size="md"
                    hint="6-dec base units"
                  />
                  <Stat label="Balance" value={formatUnits(settlement.poolBalanceUsdcUnits)} size="md" tone="muted" />
                  <Stat
                    label="Shortfall"
                    value={formatUnits(shortfall.toString())}
                    tone={isUnderfunded ? "honey" : "proof"}
                    size="md"
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
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
                  {fundedPct.toFixed(1)}% of required liquidity
                </p>

                <div className="mt-5 grid gap-2 border-t border-rule pt-4">
                  <MonoHash label="EVIDENCE HASH" value={settlement.harvestEvidenceHash} truncate={6} />
                  {settlement.fundingTxHash ? (
                    <MonoHash label="FUNDING TX" value={settlement.fundingTxHash} truncate={6} />
                  ) : null}
                  {settlement.settlementTxHash ? (
                    <MonoHash label="SETTLEMENT TX" value={settlement.settlementTxHash} truncate={6} />
                  ) : null}
                </div>
              </Panel>

              <aside>
                {isUnderfunded ? (
                  <FundActions shortfallUnits={shortfall.toString()} poolAddress={POOL_ADDRESS} />
                ) : (
                  <Panel padding="lg" variant="hot">
                    <div className="eyebrow-leaf">POOL READY</div>
                    <h3 className="font-display mt-2 text-2xl leading-none tracking-tight text-paper">Fully funded</h3>
                    <p className="mt-3 text-sm text-paper-2">
                      The pool can pay the computed farmer + partner shares. The operator can execute settlement.
                    </p>
                  </Panel>
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
