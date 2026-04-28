"use client";

import Link from "next/link";
import {
  CertificateProofCard,
  GlassCard,
  MetricCard,
  MilestoneStep,
  Section,
  SettlementProofPanel,
} from "~~/components/harvverse";
import { useViewerRole } from "~~/components/harvverse/RoleSwitcher";
import { buildMilestoneRows } from "~~/lib/mock/evidence";
import { getLotByCode } from "~~/lib/mock/lots";
// TODO(phase4E/5F/6E): replace with useQuery(api.partner.partnerships.myDashboard)
import { listPartnerships } from "~~/lib/mock/partnerships";
import { getSettlementForPartnership } from "~~/lib/mock/settlements";

const PartnerDashboardPage = () => {
  const role = useViewerRole(state => state.role);
  const partnerships = listPartnerships();

  if (role === "guest") {
    return (
      <Section
        eyebrow="Partner dashboard"
        title="Connect your wallet to see your partnerships"
        description="Once you sign a partnership, your certificate proof and milestone evidence will live here."
      >
        <GlassCard padding="lg" className="text-center">
          <p className="text-sm text-muted-harv">
            Use the Connect Wallet button in the header. This is a testnet demo with deterministic settlement only.
          </p>
          <Link href="/" className="btn btn-primary mt-5 inline-flex items-center gap-2">
            Browse lots
          </Link>
        </GlassCard>
      </Section>
    );
  }

  return (
    <Section
      eyebrow="Partner dashboard"
      title="Your coffee partnerships"
      description="Each partnership shows its certificate proof, milestone timeline, and (when available) the deterministic settlement panel."
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Active partnerships"
          value={partnerships.filter(p => p.status === "active" || p.status === "milestones_attested").length}
          mono
        />
        <MetricCard
          label="Awaiting settlement"
          value={partnerships.filter(p => p.status === "awaiting_settlement").length}
          tone="gold"
          mono
        />
        <MetricCard label="Settled" value={partnerships.filter(p => p.status === "settled").length} tone="mint" mono />
      </div>

      <div className="space-y-10">
        {partnerships.map(partnership => {
          const lot = getLotByCode(partnership.lotCode);
          const milestones = buildMilestoneRows(partnership.id);
          const settlement = getSettlementForPartnership(partnership.id);
          if (!lot) return null;

          return (
            <article key={partnership.id} className="space-y-5">
              <CertificateProofCard partnership={partnership} lotName={lot.farmName} />

              <GlassCard padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="eyebrow">Milestone proof timeline · compressed demo</div>
                    <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">Six attestations · M1–M6</h3>
                  </div>
                  <span className="rounded-md border border-[color:var(--color-harv-accent)]/20 bg-[color:var(--color-harv-accent)]/5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-harv-accent)]">
                    Demo time
                  </span>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {milestones.map(row => (
                    <MilestoneStep
                      key={row.template.number}
                      number={row.template.number}
                      label={row.template.label}
                      status={row.record?.status ?? "pending"}
                      artifactHash={row.record?.artifactHash}
                      registryTxHash={row.record?.registryTxHash}
                      notes={row.record?.notes}
                      completedAt={row.record?.completedAtDemoLabel}
                    />
                  ))}
                </div>
              </GlassCard>

              {settlement ? <SettlementProofPanel settlement={settlement} /> : null}
            </article>
          );
        })}
      </div>
    </Section>
  );
};

export default PartnerDashboardPage;
