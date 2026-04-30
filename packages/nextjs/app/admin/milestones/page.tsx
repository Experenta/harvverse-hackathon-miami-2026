"use client";

import { useMemo, useState } from "react";
import { MilestoneActions } from "./MilestoneActions";
import { ChevronDownIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Panel } from "~~/components/harvverse/Panel";
import { Section } from "~~/components/harvverse/Section";
import { Stat } from "~~/components/harvverse/Stat";
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
      index="§ MILESTONES"
      eyebrow="Compressed demo · M1 → M6"
      eyebrowTone="honey"
      title="Record fixtures · Attest evidence."
      description="Each milestone produces a canonical artifactHash. Once attested, the EvidenceAttested event reconciles to Convex and advances the partnership."
    >
      <Panel padding="sm" className="mb-6 flex flex-wrap items-center gap-3 border-honey/30 bg-honey/5">
        <ClockIcon className="h-4 w-4 text-honey" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-honey">COMPRESSED DEMO TIME</span>
        <span className="text-xs text-paper-2">
          Real agronomic timelines run 12+ months. The demo fast-forwards M1–M6 while keeping evidence accountable.
        </span>
      </Panel>

      <div className="mb-8 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Panel padding="md">
          <div className="eyebrow">Active partnership</div>
          <details className="dropdown mt-2 w-full">
            <summary
              className="flex w-full cursor-pointer list-none items-center justify-between border border-rule bg-ink-2 px-3 py-2 text-sm text-paper"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
            >
              <span className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
                  {partnership ? `#${partnership.onchainPartnershipId}` : "—"}
                </span>
                <span>{lot?.farmName ?? partnership?.lotCode}</span>
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </summary>
            <ul
              className="dropdown-content menu z-50 mt-2 w-full border border-rule bg-ink-1 p-1 shadow-xl"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-1)" }}
            >
              {partnerships.map(p => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPartnershipId(p.id)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs ${
                      p.id === partnershipId ? "bg-leaf/10 text-leaf" : "text-paper hover:bg-ink-2"
                    }`}
                    style={{ borderRadius: 1 }}
                  >
                    <span>{getLotByCode(p.lotCode)?.farmName ?? p.lotCode}</span>
                    <span className="font-mono text-paper-3">#{p.onchainPartnershipId}</span>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </Panel>
        <Stat label="Recorded fixtures" value={`${recorded} / 6`} size="md" tone="leaf" />
        <Stat
          label="Attested onchain"
          value={`${attested} / 6`}
          tone="proof"
          size="md"
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

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
        TEMPLATES: {milestoneTemplates.length} · EVIDENCE AS ACCOUNTABLE CLAIMS, NEVER PROOF OF PHYSICAL TRUTH
      </p>
    </Section>
  );
};

export default AdminMilestonesPage;
