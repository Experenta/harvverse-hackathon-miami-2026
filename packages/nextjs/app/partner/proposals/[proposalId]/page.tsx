import { notFound } from "next/navigation";
import { ProposalCTA } from "./ProposalCTA";
import { Coordinate } from "~~/components/harvverse/Coordinate";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { Stat } from "~~/components/harvverse/Stat";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPlanByCode } from "~~/lib/mock/plans";
import { getProposalById } from "~~/lib/mock/proposals";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);

const formatCentsShort = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

type ProposalPageProps = { params: Promise<{ proposalId: string }> };

const MILESTONES = [
  { code: "M1", title: "Diagnóstico", window: "Feb", amount: "$110" },
  { code: "M2", title: "Preparación + Poda", window: "Mar–Apr", amount: "$270" },
  { code: "M3", title: "Nutrición Base", window: "Apr–May", amount: "$225" },
  { code: "M4", title: "Mantenim + Sanidad", window: "Jun–Aug", amount: "$175" },
  { code: "M5", title: "Refuerzo + Pre-cos", window: "Aug–Sep", amount: "$210" },
  { code: "M6", title: "Cosecha + Beneficio", window: "Oct–Dec", amount: "$460" },
];

const ProposalPage = async ({ params }: ProposalPageProps) => {
  const { proposalId } = await params;
  const proposal = getProposalById(proposalId);
  if (!proposal) notFound();

  const lot = getLotByCode(proposal.lotCode);
  const plan = getPlanByCode(proposal.planCode);
  if (!lot || !plan) notFound();

  return (
    <div className="relative min-h-screen px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Stage header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-rule pb-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">CONTRACT PREVIEW</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">/</span>
          <span className="eyebrow-leaf">{proposal.id}</span>
          <Coordinate block="11,482,331" className="ml-auto" />
          <StatusPill status={proposal.status} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* === LEFT: contract === */}
          <div className="space-y-6">
            {/* Section 1 — Executive summary */}
            <Panel padding="lg" crosshair>
              <SectionHeader index="01" tone="leaf" label="Executive summary" />
              <h1 className="font-display mt-4 text-[clamp(1.85rem,3.4vw,2.85rem)] leading-[0.95] tracking-[-0.025em] text-paper">
                Maria · partner of <em className="not-italic text-gradient-leaf">{lot.farmName}</em>
              </h1>
              <p className="mt-3 max-w-xl text-paper-2">
                Non-transferable certificate · cycle Feb 2026 → Dec 2026 · 60% farmer / 40% partner · Phygital includes
                5 lb roasted Parainema, January 2027.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Ticket" value={formatCentsShort(proposal.ticketCents)} size="md" />
                <Stat label="Cycle" value="12 mo" size="sm" tone="muted" hint="6 milestones" />
                <Stat label="Split" value="60 / 40" size="md" tone="honey" />
                <Stat label="Lot" value={lot.code.toUpperCase()} size="sm" tone="leaf" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div
                  className="border border-rule bg-ink-2 p-3"
                  style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
                >
                  <span className="eyebrow">PARTNER WALLET</span>
                  <div className="mt-2">
                    <WalletPillMock address={proposal.walletAddress} label="Maria, Miami" />
                  </div>
                </div>
                <div
                  className="border border-rule bg-ink-2 p-3"
                  style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
                >
                  <span className="eyebrow">FARMER WALLET</span>
                  <div className="mt-2">
                    <WalletPillMock address={lot.farmerWallet} label="Don Jorge · Finca Zafiro" />
                  </div>
                </div>
              </div>
            </Panel>

            {/* Section 2 — Contracts to be deployed */}
            <Panel padding="lg">
              <SectionHeader index="02" tone="default" label="Contracts to be deployed" />
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                <ContractRow name="LotNFT.sol" symbol="ERC-721" detail="Non-transferable certificate (your proof)" />
                <ContractRow
                  name="MilestoneEscrow"
                  symbol="ESCROW"
                  detail={`Holds ${formatCentsShort(proposal.ticketCents)} USDC, releases per milestone`}
                />
                <ContractRow name="YieldDistributor" symbol="MATH" detail="Settles 60/40 in one transaction" />
                <ContractRow name="EvidenceRegistry" symbol="ATTEST" detail="Emits accountable evidence events" />
              </ul>
            </Panel>

            {/* Section 3 — Milestones */}
            <Panel padding="lg">
              <SectionHeader index="03" tone="honey" label="Milestone schedule" />
              <ol className="mt-4 grid gap-2">
                {MILESTONES.map(m => (
                  <li
                    key={m.code}
                    className="grid grid-cols-[44px_1fr_auto_auto] items-center gap-3 border border-rule bg-ink-2 px-3 py-2.5 transition hover:border-leaf/40"
                    style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
                  >
                    <span
                      className="flex h-7 w-9 items-center justify-center border border-honey/30 bg-honey/8 font-mono text-xs text-honey"
                      style={{ borderRadius: 1 }}
                    >
                      {m.code}
                    </span>
                    <div>
                      <div className="text-sm text-paper">{m.title}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">{m.window}</div>
                    </div>
                    <span className="font-mono text-sm text-paper">{m.amount}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">tranche</span>
                  </li>
                ))}
              </ol>
            </Panel>

            {/* Section 4 — Math */}
            <Panel padding="lg">
              <SectionHeader index="04" tone="proof" label="Contract math · year 1 pessimistic" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Yield (plan)" value="6 qq" size="md" />
                <Stat label="Conversion" value="499.8 lb" size="md" tone="muted" hint="6 × 83.3" />
                <Stat label="Revenue" value={formatCentsShort(proposal.revenueCents)} size="md" tone="leaf" />
                <Stat label="Profit" value={formatCentsShort(proposal.profitCents)} size="md" tone="honey" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Stat label="Farmer · 60%" value={formatCents(proposal.farmerCents)} size="md" tone="honey" />
                <Stat label="Partner · 40%" value={formatCents(proposal.partnerCents)} size="md" tone="proof" />
              </div>
            </Panel>

            {/* Section 5 — Phygital */}
            <Panel padding="lg">
              <SectionHeader index="05" tone="honey" label="Phygital delivery" />
              <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
                <div
                  className="flex h-24 w-24 flex-col items-center justify-center border border-honey/30 bg-honey/8"
                  style={{ borderRadius: 2 }}
                >
                  <span className="font-display text-3xl text-honey">5lb</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-paper-3">parainema</span>
                </div>
                <ul className="space-y-1.5 text-sm text-paper-2">
                  <li>SCA score target ≥ 82 · 84.5 expected on this lot</li>
                  <li>Medium roast · branded Harvverse bag</li>
                  <li>Ship: ~30 days post M6 · January 2027</li>
                  <li className="font-mono text-[11px] text-paper-3">QR → /certificate/HV-001 (onchain provenance)</li>
                </ul>
              </div>
            </Panel>

            {/* Section 6 — Protection rules */}
            <Panel padding="lg">
              <SectionHeader index="06" tone="leaf" label="Protection rules · R1–R4" />
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                <RuleRow code="R1" title="Yield ceiling" detail="Y1=8 · Y2=14 · Y3=18 · Y4+=22 qq" />
                <RuleRow code="R2" title="Yield floor" detail="Min 4 qq honored even in force majeure" />
                <RuleRow code="R3" title="Price band" detail="$3.50 fixed · $2.50 floor · no cap" />
                <RuleRow code="R4" title="Upside" detail="60/40 on ALL profit · no excess formula" />
              </ul>
            </Panel>

            {/* Section 7 — Hashes */}
            <Panel padding="lg">
              <SectionHeader index="07" tone="default" label="Canonical hashes" />
              <div className="mt-4 space-y-3">
                <MonoHash label="PROPOSAL HASH" value={proposal.proposalHash} truncate={8} />
                <MonoHash label="PLAN HASH" value={plan.planHash} truncate={8} />
                <MonoHash label="FACTORY ADDR" value={proposal.factoryAddress} truncate={8} />
              </div>
            </Panel>

            {/* Section 8 — Gas */}
            <Panel padding="lg">
              <SectionHeader index="08" tone="muted" label="Gas estimate" />
              <ul className="mt-4 space-y-2 text-sm">
                <GasRow label="Network" value="Hardhat · 31337" />
                <GasRow label="Approval" value="USDC.approve(factory, 3,425.00)" />
                <GasRow label="Open" value="PartnershipFactory.openPartnership(lotId, hash)" />
                <GasRow label="Estimated total" value="~ $0.0015" tone="leaf" />
              </ul>
            </Panel>
          </div>

          {/* === RIGHT: CTA stack === */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <ProposalCTA proposal={proposal} />

            <Panel padding="md">
              <div className="flex items-center gap-2">
                <LiveDot tone="proof" label="LIVE" />
              </div>
              <p className="mt-3 text-xs text-paper-2">
                Approval and open-partnership are two distinct wallet prompts. Convex never signs on your behalf. Two
                events fire onchain: <span className="font-mono text-paper">deposit()</span> and{" "}
                <span className="font-mono text-paper">mint()</span>.
              </p>
            </Panel>

            <Panel padding="md" className="contour-bg">
              <div className="eyebrow-honey">DEMO TIME · COMPRESSED</div>
              <p className="mt-2 text-sm text-paper-2">
                On stage, milestones M1→M6 fast-forward. In real life, this cycle unfolds across ~10 months of farming
                operations.
              </p>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  index,
  tone,
  label,
}: {
  index: string;
  tone: "default" | "leaf" | "honey" | "proof" | "muted";
  label: string;
}) => {
  const eyebrowClass =
    tone === "leaf"
      ? "eyebrow-leaf"
      : tone === "honey"
        ? "eyebrow-honey"
        : tone === "proof"
          ? "eyebrow-proof"
          : "eyebrow";
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-7 w-7 items-center justify-center border border-rule font-mono text-[10px] text-paper-3"
        style={{ borderRadius: 1 }}
      >
        {index}
      </span>
      <span className={eyebrowClass}>{label}</span>
    </div>
  );
};

const ContractRow = ({ name, symbol, detail }: { name: string; symbol: string; detail: string }) => (
  <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
    <span
      className="flex h-7 w-14 items-center justify-center border border-leaf/30 bg-leaf/8 font-mono text-[10px] uppercase tracking-[0.18em] text-leaf"
      style={{ borderRadius: 1 }}
    >
      {symbol}
    </span>
    <div>
      <div className="font-mono text-sm text-paper">{name}</div>
      <div className="text-xs text-paper-2">{detail}</div>
    </div>
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">deploy</span>
  </li>
);

const RuleRow = ({ code, title, detail }: { code: string; title: string; detail: string }) => (
  <li
    className="grid grid-cols-[auto_1fr] gap-3 border border-rule bg-ink-2 p-3"
    style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
  >
    <span
      className="flex h-7 w-7 items-center justify-center border border-honey/30 bg-honey/8 font-mono text-[10px] text-honey"
      style={{ borderRadius: 1 }}
    >
      {code}
    </span>
    <div>
      <div className="text-sm text-paper">{title}</div>
      <div className="font-mono text-[11px] text-paper-3">{detail}</div>
    </div>
  </li>
);

const GasRow = ({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "leaf" }) => (
  <li className="flex items-center justify-between border-b border-rule pb-2 last:border-b-0 last:pb-0">
    <span className="text-paper-2">{label}</span>
    <span className={`font-mono ${tone === "leaf" ? "text-leaf" : "text-paper"}`}>{value}</span>
  </li>
);

export default ProposalPage;
