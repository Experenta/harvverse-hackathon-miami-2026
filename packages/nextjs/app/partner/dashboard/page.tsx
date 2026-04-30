import Link from "next/link";
import { PartnerDashboardRoleGate } from "./PartnerDashboardRoleGate";
import { ArrowRightIcon, BeakerIcon, ChartBarIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { CertificateProofCard } from "~~/components/harvverse/CertificateProofCard";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { MilestoneStep } from "~~/components/harvverse/MilestoneStep";
import { Panel } from "~~/components/harvverse/Panel";
import { Section } from "~~/components/harvverse/Section";
import { SettlementProofPanel } from "~~/components/harvverse/SettlementProofPanel";
import { Stat } from "~~/components/harvverse/Stat";
import { buildMilestoneRows } from "~~/lib/mock/evidence";
import { getLotByCode } from "~~/lib/mock/lots";
import { listPartnerships } from "~~/lib/mock/partnerships";
import { getSettlementForPartnership } from "~~/lib/mock/settlements";

const PartnerDashboardPage = () => {
  const partnerships = listPartnerships();

  return (
    <PartnerDashboardRoleGate>
      <Section
        index="§ DASHBOARD"
        eyebrow="Partner dashboard"
        eyebrowTone="leaf"
        coordinate="6 partnerships · 1 awaiting"
        title="Your coffee partnerships."
        description="Each partnership shows its certificate proof, milestone timeline, and (when available) the deterministic settlement panel."
      >
        <div className="mb-10 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Active partnerships"
            value={partnerships.filter(p => p.status === "active" || p.status === "milestones_attested").length}
            tone="leaf"
            size="lg"
          />
          <Stat
            label="Awaiting settlement"
            value={partnerships.filter(p => p.status === "awaiting_settlement").length}
            tone="honey"
            size="lg"
          />
          <Stat
            label="Settled"
            value={partnerships.filter(p => p.status === "settled").length}
            tone="proof"
            size="lg"
          />
        </div>

        <div className="space-y-12">
          {partnerships.map(partnership => {
            const lot = getLotByCode(partnership.lotCode);
            const milestones = buildMilestoneRows(partnership.id);
            const settlement = getSettlementForPartnership(partnership.id);
            if (!lot) return null;

            return (
              <article key={partnership.id} className="space-y-5">
                <CertificateProofCard partnership={partnership} lotName={lot.farmName} />

                {/* IoT live + milestones combined */}
                <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
                  <Panel padding="lg" className="contour-bg">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow-proof">IOT LIVE · LAST 24H</span>
                      <LiveDot tone="proof" label="streaming" />
                    </div>
                    <h3 className="font-display mt-3 text-xl leading-none tracking-tight text-paper">
                      Sensors at {lot.farmName}
                    </h3>
                    <ul className="mt-5 grid grid-cols-2 gap-3">
                      <SensorRow icon={GlobeAltIcon} label="Temp" value="18 – 26 °C" tone="leaf" />
                      <SensorRow icon={BeakerIcon} label="Humidity" value="68 %" tone="leaf" />
                      <SensorRow icon={ChartBarIcon} label="Soil pH" value="5.7" tone="leaf" />
                      <SensorRow icon={ChartBarIcon} label="Cond." value="1.1 dS/m" tone="leaf" />
                    </ul>
                    <p className="mt-4 text-[11px] text-paper-3">
                      Demo fixtures. Real IoT ingestion is post-MVP. Ranges are within plan tolerance.
                    </p>
                  </Panel>

                  <Panel padding="lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="eyebrow-honey">MILESTONE TIMELINE · COMPRESSED</span>
                        <h3 className="font-display mt-2 text-xl leading-none tracking-tight text-paper">
                          Six attestations · M1 → M6
                        </h3>
                      </div>
                      <span
                        className="border border-honey/30 bg-honey/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-honey"
                        style={{ borderRadius: 1 }}
                      >
                        DEMO TIME
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                  </Panel>
                </div>

                {settlement ? <SettlementProofPanel settlement={settlement} /> : null}

                {partnership.status === "awaiting_settlement" ? (
                  <Panel padding="md" variant="hot">
                    <div className="flex flex-wrap items-center gap-3">
                      <LiveDot tone="honey" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-honey">
                        SETTLEMENT INTENT READY
                      </span>
                      <span className="text-paper-2 text-sm">Operator can execute deterministic settlement.</span>
                      <Link
                        href={`/admin/settlement?p=${partnership.id}`}
                        className="ml-auto inline-flex items-center gap-1.5 text-sm text-honey hover:text-paper"
                      >
                        Open settlement <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </Panel>
                ) : null}
              </article>
            );
          })}
        </div>
      </Section>
    </PartnerDashboardRoleGate>
  );
};

const SensorRow = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof GlobeAltIcon;
  label: string;
  value: string;
  tone: "leaf" | "honey";
}) => (
  <li className="border border-rule bg-ink-2 p-3" style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}>
    <div className="flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 ${tone === "leaf" ? "text-leaf" : "text-honey"}`} />
      <span className="eyebrow">{label}</span>
    </div>
    <div className="mt-1 font-mono text-sm text-paper">{value}</div>
    <div className="mt-1 font-mono text-[10px] text-paper-3">range OK</div>
  </li>
);

export default PartnerDashboardPage;
