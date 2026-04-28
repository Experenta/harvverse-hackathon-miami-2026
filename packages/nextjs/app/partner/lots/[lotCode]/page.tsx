import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import {
  GlassCard,
  LotMapPreview,
  MetricCard,
  MonoHash,
  Section,
  StatusPill,
  WalletPillMock,
} from "~~/components/harvverse";
// TODO(phase3D): replace with useQuery(api.partner.lots.getByCode)
import { getLotByCode } from "~~/lib/mock/lots";
import { getPlanForLot } from "~~/lib/mock/plans";
import { getActivePendingProposal } from "~~/lib/mock/proposals";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

const TABS = [
  { id: "agronomy", label: "Agronomy" },
  { id: "plan", label: "Plan terms" },
  { id: "yield", label: "Yield projection" },
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
  const targetProposalId = pendingProposal?.lotCode === lot.code ? pendingProposal.id : "prop_zafiro_001_pending";

  return (
    <Section
      eyebrow={`Lot · ${lot.code}`}
      title={
        <>
          {lot.farmName}{" "}
          <span className="text-muted-harv">
            · {lot.region}, {lot.country}
          </span>
        </>
      }
      description={lot.summary}
      actions={<StatusPill status={lot.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <GlassCard padding="none" className="overflow-hidden">
            <LotMapPreview
              lotCode={lot.code}
              hectares={lot.hectares}
              altitude={lot.altitudeMasl}
              coordinates={lot.coordinates}
              className="min-h-[280px] sm:min-h-[360px]"
            />
            <div className="grid grid-cols-2 gap-3 border-t border-white/5 p-4 sm:grid-cols-4">
              <div>
                <div className="eyebrow">Varietal</div>
                <div className="mono-hash mt-1 text-sm text-harv-text">{lot.varietal}</div>
              </div>
              <div>
                <div className="eyebrow">Process</div>
                <div className="mono-hash mt-1 text-sm text-harv-text">{lot.process}</div>
              </div>
              <div>
                <div className="eyebrow">Altitude</div>
                <div className="mono-hash mt-1 text-sm text-harv-text">{lot.altitudeMasl} masl</div>
              </div>
              <div>
                <div className="eyebrow">SCA</div>
                <div className="mono-hash mt-1 text-sm text-harv-text">{(lot.scaScoreTenths / 10).toFixed(1)}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="lg">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
              {TABS.map(tab => (
                <button
                  type="button"
                  key={tab.id}
                  className="rounded-md px-3 py-1.5 text-xs text-harv-text/70 transition hover:bg-white/5 hover:text-harv-text"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-6 pt-6 lg:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--color-harv-mint)]">
                  <DocumentCheckIcon className="h-4 w-4" />
                  Plan terms
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-harv">
                  {plan?.termsSummary ??
                    "Plan terms are loaded from canonical Convex data and bound to the locked planHash."}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-harv-text">
                  <li className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-harv">Ticket</span>
                    <span className="mono-hash">{plan ? formatCents(plan.ticketCents) : "—"}</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-harv">Price /lb</span>
                    <span className="mono-hash">${plan ? (plan.priceCentsPerLb / 100).toFixed(2) : "—"}</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-harv">Agronomic cost</span>
                    <span className="mono-hash">{plan ? formatCents(plan.agronomicCostCents) : "—"}</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-harv">Yield cap</span>
                    <span className="mono-hash">{plan ? `${(plan.yieldCapY1TenthsQQ / 10).toFixed(1)} qq` : "—"}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-harv">Farmer split</span>
                    <span className="mono-hash">{plan ? `${(plan.splitFarmerBps / 100).toFixed(0)}%` : "—"}</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--color-harv-mint)]">
                  <ScaleIcon className="h-4 w-4" />
                  Deterministic preview · year 1
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-harv">
                  Computed from locked plan terms. AI never alters or proposes alternative numbers.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Projected revenue"
                    value={pendingProposal ? formatCents(pendingProposal.revenueCents) : "—"}
                    mono
                  />
                  <MetricCard
                    label="Projected profit"
                    value={pendingProposal ? formatCents(pendingProposal.profitCents) : "—"}
                    mono
                  />
                  <MetricCard
                    label="Farmer share"
                    value={pendingProposal ? formatCents(pendingProposal.farmerCents) : "—"}
                    tone="gold"
                    mono
                  />
                  <MetricCard
                    label="Partner share"
                    value={pendingProposal ? formatCents(pendingProposal.partnerCents) : "—"}
                    tone="mint"
                    mono
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[color:var(--color-harv-accent)]/20 bg-[color:var(--color-harv-accent)]/5 p-4 text-xs text-muted-harv">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-harv-accent)]" />
              <div>
                <span className="text-[color:var(--color-harv-accent)]">Demo boundary.</span> This is a testnet demo
                with deterministic settlement. No real funds, no transferable investment rights, no guarantee of yield,
                and no financial advice. Demo MockUSDC only.
              </div>
            </div>
          </GlassCard>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <GlassCard padding="lg" glow="mint">
            <div className="eyebrow">Sign your partnership</div>
            <h3 className="mt-2 text-2xl font-light tracking-tight text-harv-text">Create proposal</h3>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-muted-harv">Ticket</span>
                <span className="mono-hash">{plan ? formatCents(plan.ticketCents) : "—"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-muted-harv">Chain</span>
                <span className="mono-hash">Hardhat · 31337</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-harv">Plan hash</span>
              </div>
              {plan ? <MonoHash value={plan.planHash} /> : null}
            </div>

            <div className="mt-5 rounded-lg border border-white/5 bg-white/3 p-3">
              <div className="eyebrow">Farmer wallet</div>
              <div className="mt-2">
                <WalletPillMock address={lot.farmerWallet} />
              </div>
            </div>

            <Link
              href={`/partner/proposals/${targetProposalId}`}
              className="btn btn-primary mt-5 w-full inline-flex items-center justify-center gap-2"
            >
              Create proposal
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-harv">
              <CheckCircleIcon className="h-3.5 w-3.5 text-[color:var(--color-harv-mint)]" />
              Available · plan approved · factory active
            </div>
          </GlassCard>

          <GlassCard padding="md">
            <div className="eyebrow">Coordinates</div>
            <p className="mono-hash mt-2 text-xs text-harv-text">{lot.coordinates}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="eyebrow">Hectares</div>
                <div className="mono-hash mt-1 text-harv-text">{lot.hectares}</div>
              </div>
              <div>
                <div className="eyebrow">Harvest</div>
                <div className="mono-hash mt-1 text-harv-text">{lot.harvestYear}</div>
              </div>
            </div>
          </GlassCard>
        </aside>
      </div>
    </Section>
  );
};

export default LotDetailPage;
