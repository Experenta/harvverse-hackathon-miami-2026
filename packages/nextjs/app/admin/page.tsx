import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { Section } from "~~/components/harvverse/Section";
import { Stat } from "~~/components/harvverse/Stat";
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
      index="§ ADMIN"
      eyebrow="Operator overview"
      eyebrowTone="honey"
      coordinate="ledger live"
      title="Operator console."
      description="Operate the demo flow: record fixtures, attest evidence, prepare settlement intents."
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Active partnerships"
          value={partnerships.filter(p => p.status === "active").length}
          size="lg"
          tone="leaf"
        />
        <Stat label="Milestones attested" value={attested} size="lg" tone="proof" hint="across all partnerships" />
        <Stat
          label="Awaiting settlement"
          value={partnerships.filter(p => p.status === "awaiting_settlement").length}
          tone="honey"
          size="lg"
        />
        <Stat
          label="Settled"
          value={mockSettlements.filter(s => s.status === "confirmed").length}
          tone="proof"
          size="lg"
        />
      </div>

      <Panel padding="none">
        <div className="flex items-center justify-between border-b border-rule px-5 py-3">
          <div className="flex items-center gap-3">
            <LiveDot tone="leaf" />
            <span className="eyebrow-leaf">PARTNERSHIPS LEDGER</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
            {partnerships.length} rows
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-rule font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
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
                  <tr key={p.id} className="border-b border-rule transition last:border-0 hover:bg-ink-2">
                    <td className="px-5 py-3 font-mono text-paper">#{p.onchainPartnershipId}</td>
                    <td className="px-5 py-3">
                      <div className="text-paper">{lot?.farmName ?? p.lotCode}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
                        {lot?.region}
                      </div>
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
                          className="border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-2 hover:border-leaf hover:text-leaf"
                          style={{ borderRadius: 1 }}
                        >
                          Milestones
                        </Link>
                        {(p.status === "awaiting_settlement" || p.status === "settled") && (
                          <Link
                            href={`/admin/settlement?p=${p.id}`}
                            className="inline-flex items-center gap-1 border border-honey/30 bg-honey/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-honey hover:bg-honey/15"
                            style={{ borderRadius: 1 }}
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
      </Panel>
    </Section>
  );
};

export default AdminOverviewPage;
