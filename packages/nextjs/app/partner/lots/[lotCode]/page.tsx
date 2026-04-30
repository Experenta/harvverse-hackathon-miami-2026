import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Coordinate } from "~~/components/harvverse/Coordinate";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { LotMapPreview } from "~~/components/harvverse/LotMapPreview";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { PhaseRail } from "~~/components/harvverse/PhaseRail";
import { Section } from "~~/components/harvverse/Section";
import { Stat } from "~~/components/harvverse/Stat";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPlanForLot } from "~~/lib/mock/plans";
import { getActivePendingProposal } from "~~/lib/mock/proposals";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

const TABS = [
  { id: "agronomy", label: "Agronomy" },
  { id: "plan", label: "Plan terms" },
  { id: "yield", label: "Yield" },
  { id: "risks", label: "Risks" },
  { id: "boundary", label: "Demo boundary" },
];

type LotPageProps = { params: Promise<{ lotCode: string }> };

const LotDetailPage = async ({ params }: LotPageProps) => {
  const { lotCode } = await params;
  const lot = getLotByCode(lotCode);
  if (!lot) notFound();

  const plan = getPlanForLot(lot.code);
  const pendingProposal = getActivePendingProposal();
  const isActiveLot = pendingProposal?.lotCode === lot.code;

  return (
    <Section
      index={`§ LOT · ${lot.code.toUpperCase()}`}
      eyebrow={`Lot · ${lot.code}`}
      eyebrowTone="leaf"
      coordinate={lot.coordinates}
      title={
        <>
          {lot.farmName}
          <span className="block text-paper-2">
            {lot.region}, {lot.country}
          </span>
        </>
      }
      description={lot.summary}
      actions={<StatusPill status={lot.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        {/* === LEFT: facts ================================================ */}
        <div className="space-y-6">
          <Panel padding="none" className="overflow-hidden" variant="elevated">
            <LotMapPreview
              lotCode={lot.code}
              hectares={lot.hectares}
              altitude={lot.altitudeMasl}
              coordinates={lot.coordinates}
              className="min-h-[300px] sm:min-h-[400px]"
            />
            <div className="grid grid-cols-2 gap-3 border-t border-rule p-5 sm:grid-cols-4">
              <Field label="Varietal" value={lot.varietal} />
              <Field label="Process" value={lot.process} />
              <Field label="Altitude" value={`${lot.altitudeMasl} masl`} />
              <Field label="SCA" value={(lot.scaScoreTenths / 10).toFixed(1)} tone="leaf" />
            </div>
          </Panel>

          <Panel padding="lg">
            <div className="flex flex-wrap items-center gap-2 border-b border-rule pb-3">
              {TABS.map((tab, i) => (
                <button type="button" key={tab.id} data-active={i === 1 ? "true" : undefined} className="btn-tag">
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-8 pt-6 lg:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-leaf">
                  <DocumentCheckIcon className="h-4 w-4" />
                  <span className="eyebrow-leaf">PLAN TERMS · LOCKED</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-paper-2">
                  {plan?.termsSummary ??
                    "Plan terms are loaded from canonical Convex data and bound to the locked planHash."}
                </p>
                <ul className="mt-5 space-y-0 divide-y divide-rule border-y border-rule">
                  <PlanRow label="Ticket" value={plan ? formatCents(plan.ticketCents) : "—"} prominent />
                  <PlanRow label="Price /lb" value={plan ? `$${(plan.priceCentsPerLb / 100).toFixed(2)}` : "—"} />
                  <PlanRow label="Agronomic cost" value={plan ? formatCents(plan.agronomicCostCents) : "—"} />
                  <PlanRow
                    label="Yield cap (Y1)"
                    value={plan ? `${(plan.yieldCapY1TenthsQQ / 10).toFixed(1)} qq` : "—"}
                  />
                  <PlanRow
                    label="Farmer split"
                    value={plan ? `${(plan.splitFarmerBps / 100).toFixed(0)}%` : "—"}
                    tone="honey"
                  />
                </ul>
                {plan ? (
                  <div className="mt-5">
                    <span className="eyebrow">PLAN HASH</span>
                    <MonoHash value={plan.planHash} truncate={8} className="mt-2" />
                  </div>
                ) : null}
              </div>

              <div>
                <div className="flex items-center gap-2 text-honey">
                  <ScaleIcon className="h-4 w-4" />
                  <span className="eyebrow-honey">DETERMINISTIC PREVIEW · YEAR 1</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-paper-2">
                  Computed from locked plan terms. AI never alters or proposes alternative numbers.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Stat
                    label="Projected revenue"
                    value={pendingProposal ? formatCents(pendingProposal.revenueCents) : "—"}
                    size="md"
                    bordered
                  />
                  <Stat
                    label="Projected profit"
                    value={pendingProposal ? formatCents(pendingProposal.profitCents) : "—"}
                    size="md"
                    bordered
                  />
                  <Stat
                    label="Farmer share · 60%"
                    value={pendingProposal ? formatCents(pendingProposal.farmerCents) : "—"}
                    tone="honey"
                    size="md"
                    bordered
                  />
                  <Stat
                    label="Partner share · 40%"
                    value={pendingProposal ? formatCents(pendingProposal.partnerCents) : "—"}
                    tone="proof"
                    size="md"
                    bordered
                  />
                </div>
              </div>
            </div>

            <div
              className="mt-7 flex items-start gap-3 border border-honey/25 bg-honey/5 p-4 text-xs text-paper-2"
              style={{ borderRadius: 2 }}
            >
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-honey" />
              <div>
                <span className="text-honey">Demo boundary.</span> This is a local-only demo with deterministic
                settlement. No real funds, no transferable investment rights, no guarantee of yield, and no financial
                advice. Demo MockUSDC only.
              </div>
            </div>
          </Panel>

          <Panel padding="lg" className="contour-bg">
            <div className="flex items-center gap-2 text-proof">
              <ShieldCheckIcon className="h-4 w-4" />
              <span className="eyebrow-proof">VALIDATION · ACCOUNTABLE EVIDENCE</span>
            </div>
            <h3 className="font-display mt-3 text-2xl leading-none tracking-tight text-paper">
              Verified by people who&apos;ve done it before.
            </h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              <ValidationRow title="Cup of Excellence 2013" meta="Champion · 92.75" detail="Jorge Alberto Lanza" />
              <ValidationRow title="DR-039 + 23 papers" meta="Peer-reviewed agronomy" detail="Underlying protocol" />
              <ValidationRow title="Banco Atlántida" meta="Fiduciary partner" detail="Custody (production only)" />
            </ul>
          </Panel>
        </div>

        {/* === RIGHT: sticky proposal sidebar ============================== */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Panel padding="lg" variant={isActiveLot ? "hot" : "default"} crosshair>
            <div className="flex items-center gap-2">
              <LiveDot tone={isActiveLot ? "leaf" : "honey"} />
              <span className={isActiveLot ? "eyebrow-leaf" : "eyebrow-honey"}>
                {isActiveLot ? "PARTNERSHIP · READY" : "PARTNERSHIP"}
              </span>
            </div>
            <h3 className="font-display mt-3 text-3xl leading-none tracking-[-0.025em] text-paper">
              {isActiveLot ? "Configure your terms" : "Open a partnership"}
            </h3>

            <div className="mt-5 grid gap-2 text-sm">
              <SidebarRow label="Ticket" value={plan ? formatCents(plan.ticketCents) : "—"} prominent />
              <SidebarRow label="Type" value="Phygital" hint="incl. 5 lb roasted" />
              <SidebarRow label="Cycle" value="12 months" hint="6 milestones" />
              <SidebarRow label="Network" value="Hardhat · 31337" />
            </div>

            <div
              className="mt-5 border border-rule bg-ink-2 p-3"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
            >
              <span className="eyebrow">FARMER WALLET</span>
              <div className="mt-2">
                <WalletPillMock address={lot.farmerWallet} label="recipient" />
              </div>
            </div>

            <Link
              href={`/partner/lots/${lot.code}/configure`}
              className="btn btn-primary mt-6 w-full inline-flex items-center justify-center gap-2 shimmer-cta"
            >
              Configure my investment
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <ul className="mt-3 space-y-1 font-mono text-[10px] text-paper-3">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-3.5 w-3.5 text-leaf" />
                Wallet connected
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-3.5 w-3.5 text-leaf" />
                Lot available
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-3.5 w-3.5 text-leaf" />
                n8n healthcheck OK
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-3.5 w-3.5 text-leaf" />
                Plan loaded
              </li>
            </ul>
          </Panel>

          <Panel padding="md">
            <div className="eyebrow">FLOW POSITION</div>
            <PhaseRail
              className="mt-3"
              items={[
                { id: "discover", label: "Discover", state: "current" },
                { id: "configure", label: "Configure & ask", state: "pending" },
                { id: "review", label: "Review contract", state: "pending" },
                { id: "sign", label: "Sign with wallet", state: "pending" },
                { id: "settle", label: "Settle & receive", state: "pending" },
              ]}
            />
          </Panel>

          <Panel padding="md">
            <div className="eyebrow">COORDINATES</div>
            <Coordinate
              lat={lot.coordinates.split(",")[0]}
              lon={lot.coordinates.split(",")[1]?.trim()}
              className="mt-2"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Hectares" value={lot.hectares.toString()} />
              <Field label="Harvest" value={lot.harvestYear.toString()} />
            </div>
          </Panel>
        </aside>
      </div>
    </Section>
  );
};

const Field = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "leaf" | "honey";
}) => (
  <div>
    <div className="eyebrow">{label}</div>
    <div
      className={`mt-1 font-mono text-sm ${tone === "leaf" ? "text-leaf" : tone === "honey" ? "text-honey" : "text-paper"}`}
    >
      {value}
    </div>
  </div>
);

const PlanRow = ({
  label,
  value,
  tone = "default",
  prominent,
}: {
  label: string;
  value: string;
  tone?: "default" | "honey";
  prominent?: boolean;
}) => (
  <li className="flex items-center justify-between py-3">
    <span className="text-sm text-paper-2">{label}</span>
    <span
      className={`font-mono ${prominent ? "text-base text-paper" : "text-sm text-paper"} ${
        tone === "honey" ? "text-honey" : ""
      }`}
    >
      {value}
    </span>
  </li>
);

const SidebarRow = ({
  label,
  value,
  hint,
  prominent,
}: {
  label: string;
  value: string;
  hint?: string;
  prominent?: boolean;
}) => (
  <div className="flex items-center justify-between border-b border-rule pb-2 last:border-b-0">
    <span className="text-paper-2">{label}</span>
    <div className="text-right">
      <span className={`font-mono ${prominent ? "text-base text-paper" : "text-sm text-paper"}`}>{value}</span>
      {hint ? <div className="font-mono text-[10px] text-paper-3">{hint}</div> : null}
    </div>
  </div>
);

const ValidationRow = ({ title, meta, detail }: { title: string; meta: string; detail: string }) => (
  <li className="border border-rule bg-ink-2 p-4" style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}>
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">{meta}</div>
    <div className="mt-1.5 font-display text-lg leading-none tracking-tight text-paper">{title}</div>
    <div className="mt-1 text-sm text-paper-2">{detail}</div>
  </li>
);

export default LotDetailPage;
