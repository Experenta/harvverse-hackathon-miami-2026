import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { GlassCard } from "~~/components/harvverse/GlassCard";
import { MetricCard } from "~~/components/harvverse/MetricCard";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Section } from "~~/components/harvverse/Section";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { mockEvidence } from "~~/lib/mock/evidence";
import { getLotByCode } from "~~/lib/mock/lots";
import { listPartnerships } from "~~/lib/mock/partnerships";
import { mockSettlements } from "~~/lib/mock/settlements";

const AdminOverviewPage = () => {
  const partnerships = listPartnerships();
  const attested = mockEvidence.filter(e => e.status === "attested").length;

  return (
    <Section
      eyebrow="Operator overview"
      title="Harvverse · operator console"
      description="Operate the demo flow: record fixtures, attest evidence, prepare settlement intents."
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active partnerships" value={partnerships.filter(p => p.status === "active").length} mono />
        <MetricCard label="Milestones attested" value={attested} tone="mint" mono hint="across all partnerships" />
        <MetricCard
          label="Awaiting settlement"
          value={partnerships.filter(p => p.status === "awaiting_settlement").length}
          tone="gold"
          mono
        />
        <MetricCard
          label="Settled"
          value={mockSettlements.filter(s => s.status === "confirmed").length}
          tone="mint"
          mono
        />
      </div>

      <GlassCard padding="none">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="eyebrow">Partnerships ledger</div>
          <span className="font-mono text-[10px] text-muted-harv">{partnerships.length} rows</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-harv">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Lot</th>
                <th className="px-5 py-3">Partner</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Opened tx</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partnerships.map(p => {
                const lot = getLotByCode(p.lotCode);
                return (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                    <td className="px-5 py-3 font-mono text-harv-text">#{p.onchainPartnershipId}</td>
                    <td className="px-5 py-3">
                      <div className="text-harv-text">{lot?.farmName ?? p.lotCode}</div>
                      <div className="eyebrow mt-0.5">{lot?.region}</div>
                    </td>
                    <td className="px-5 py-3">
                      <WalletPillMock address={p.partnerWallet} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={p.status} size="sm" />
                    </td>
                    <td className="px-5 py-3 max-w-[180px]">
                      <MonoHash value={p.openedTxHash} truncate={4} showCopy={false} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/milestones?p=${p.id}`}
                          className="rounded-md border border-white/8 px-2 py-1 text-[11px] text-harv-text/80 hover:border-[color:var(--color-harv-mint)]/30 hover:text-[color:var(--color-harv-mint)]"
                        >
                          Milestones
                        </Link>
                        {(p.status === "awaiting_settlement" || p.status === "settled") && (
                          <Link
                            href={`/admin/settlement?p=${p.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-white/8 px-2 py-1 text-[11px] text-harv-text/80 hover:border-[color:var(--color-harv-mint)]/30 hover:text-[color:var(--color-harv-mint)]"
                          >
                            Settlement
                            <ArrowRightIcon className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </Section>
  );
};

export default AdminOverviewPage;
