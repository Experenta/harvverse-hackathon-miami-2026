"use client";

import { useMemo, useState } from "react";
import { MilestoneActions } from "./MilestoneActions";
import { ChevronDownIcon, ClockIcon } from "@heroicons/react/24/outline";
import { GlassCard, MetricCard, Section } from "~~/components/harvverse";
// TODO(phase5C/5D): replace mock helpers with api.evidence.fixtures + api.partner.partnerships
import { buildMilestoneRows, milestoneTemplates } from "~~/lib/mock/evidence";
import { getLotByCode } from "~~/lib/mock/lots";
import { listPartnerships } from "~~/lib/mock/partnerships";

const AdminMilestonesPage = () => {
  const partnerships = listPartnerships().filter(p => p.status !== "settled");
  const [partnershipId, setPartnershipId] = useState(partnerships[0]?.id ?? "");

  const partnership = useMemo(
    () => partnerships.find(p => p.id === partnershipId) ?? partnerships[0],
    [partnerships, partnershipId],
  );
  const lot = partnership ? getLotByCode(partnership.lotCode) : undefined;
  const rows = partnership ? buildMilestoneRows(partnership.id) : [];
  const recorded = rows.filter(r => r.record?.status === "recorded" || r.record?.status === "attested").length;
  const attested = rows.filter(r => r.record?.status === "attested").length;

  return (
    <Section
      eyebrow="Compressed demo milestones · M1–M6"
      title="Record fixtures · Attest evidence"
      description="Each milestone produces a canonical artifactHash. Once attested, the EvidenceAttested event reconciles to Convex and advances the partnership."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--color-harv-accent)]/20 bg-[color:var(--color-harv-accent)]/5 px-4 py-3">
        <ClockIcon className="h-4 w-4 text-[color:var(--color-harv-accent)]" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-harv-accent)]">
          Compressed demo time
        </span>
        <span className="text-xs text-muted-harv">
          Real agronomic timelines run 12+ months. The demo fast-forwards M1–M6 while keeping evidence accountable.
        </span>
      </div>

      <div className="mb-8 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <GlassCard padding="md">
          <div className="eyebrow">Active partnership</div>
          <details className="dropdown mt-2 w-full">
            <summary className="flex w-full cursor-pointer list-none items-center justify-between rounded-md border border-white/10 bg-white/3 px-3 py-2 text-sm text-harv-text">
              <span className="flex flex-col">
                <span className="font-mono text-xs text-muted-harv">
                  {partnership ? `#${partnership.onchainPartnershipId}` : "—"}
                </span>
                <span>{lot?.farmName ?? partnership?.lotCode}</span>
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </summary>
            <ul className="dropdown-content menu glass z-50 mt-2 w-full rounded-xl border-white/10 p-1 shadow-xl">
              {partnerships.map(p => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPartnershipId(p.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs ${
                      p.id === partnershipId ? "bg-white/5 text-[color:var(--color-harv-mint)]" : "text-harv-text"
                    }`}
                  >
                    <span>{getLotByCode(p.lotCode)?.farmName ?? p.lotCode}</span>
                    <span className="font-mono text-muted-harv">#{p.onchainPartnershipId}</span>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </GlassCard>
        <MetricCard label="Recorded fixtures" value={`${recorded} / 6`} mono />
        <MetricCard
          label="Attested onchain"
          value={`${attested} / 6`}
          tone="mint"
          mono
          hint="EvidenceRegistry · ATTESTER_ROLE"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {rows.map(row => (
          <MilestoneActions
            key={row.template.number}
            template={row.template}
            initialRecord={row.record}
            partnershipLabel={`${lot?.farmName ?? partnership?.lotCode} · #${partnership?.onchainPartnershipId}`}
          />
        ))}
      </div>

      <p className="mt-8 text-[11px] text-muted-harv">
        Templates: {milestoneTemplates.length} milestones · evidence as accountable claims, never proof of physical
        truth.
      </p>
    </Section>
  );
};

export default AdminMilestonesPage;
