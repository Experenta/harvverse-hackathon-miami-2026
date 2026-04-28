import Link from "next/link";
import { ArrowRightIcon, BeakerIcon, CheckBadgeIcon, CubeTransparentIcon, EyeIcon } from "@heroicons/react/24/outline";
import {
  CoffeeBeanArt,
  GlassCard,
  GridBackdrop,
  HeroParticleField,
  LotCard,
  MetricCard,
  ProofTimeline,
  Section,
  SettlementProofPanel,
  TopographicLines,
} from "~~/components/harvverse";
// TODO(phase3D): replace mock imports with useQuery(api.partner.lots.*) when integrating
import { getActiveLot, listLots } from "~~/lib/mock/lots";
import { getPlanByCode, getPlanForLot } from "~~/lib/mock/plans";
import { mockSettlements } from "~~/lib/mock/settlements";

const HOW_IT_WORKS = [
  {
    icon: EyeIcon,
    title: "Discover",
    desc: "Inspect lot data, agronomic context, and locked plan terms before any wallet prompt.",
  },
  {
    icon: CheckBadgeIcon,
    title: "Sign",
    desc: "Approve demo MockUSDC, then open the partnership from your wallet with explicit intent.",
  },
  {
    icon: BeakerIcon,
    title: "Evidence",
    desc: "Six milestone fixtures are attested onchain by authorized verifier roles.",
  },
  {
    icon: CubeTransparentIcon,
    title: "Settle",
    desc: "Deterministic settlement computes revenue and split from locked plan terms and evidence.",
  },
];

const Home = () => {
  const activeLot = getActiveLot();
  const activePlan = getPlanForLot(activeLot.code);
  const featuredSettlement = mockSettlements.find(s => s.status === "confirmed") ?? mockSettlements[0];
  const lots = listLots();

  return (
    <>
      {/* === Hero ============================================================ */}
      <section className="relative isolate overflow-hidden">
        <GridBackdrop variant="dense" className="opacity-70" />
        <TopographicLines intensity="normal" />
        <HeroParticleField />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[color:var(--color-harv-primary)]/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-160px] top-[-80px] h-[520px] w-[520px] rounded-full bg-[color:var(--color-harv-mint)]/8 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="flex flex-col items-start">
            <h1 className="mt-6 max-w-2xl text-4xl font-light leading-[1.05] tracking-tight text-harv-text sm:text-5xl lg:text-6xl">
              Own a slice of <span className="text-gradient-harv">single-origin coffee</span>,{" "}
              <span className="whitespace-nowrap">on-chain proofs</span> included.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-harv sm:text-lg">
              Harvverse maps specialty coffee lots to accountable, proof-first partnerships. Review agronomy, sign with
              your wallet, track milestone evidence, and settle from locked terms.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/partner/lots/${activeLot.code}`}
                className="btn btn-primary btn-md inline-flex items-center gap-2"
              >
                View Lots
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/partner/dashboard"
                className="btn btn-ghost btn-md border border-white/10 text-harv-text hover:border-[color:var(--color-harv-mint)]/30"
              >
                See your lots
              </Link>
            </div>

            <div className="mt-12 grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard
                label="Active lots"
                value={lots.length}
                mono
                align="center"
                className="min-h-[160px]"
                valueClassName="text-4xl"
              />
              <MetricCard
                label="Origin"
                value={<span className="inline-block whitespace-nowrap">Central America</span>}
                tone="muted"
                align="center"
                className="min-h-[160px]"
                valueClassName="text-[clamp(1rem,1.5vw,1.6rem)] leading-tight"
              />
              <MetricCard
                label="Avg ticket"
                value="$3.4k"
                tone="mint"
                align="center"
                className="min-h-[160px]"
                valueClassName="text-4xl"
              />
              <MetricCard
                label="Chain"
                value={<span className="inline-block whitespace-nowrap">Hardhat</span>}
                tone="gold"
                align="center"
                className="min-h-[160px]"
                valueClassName="text-[clamp(1.4rem,1.9vw,2rem)]"
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <CoffeeBeanArt className="relative aspect-square w-full max-w-[520px]" />
          </div>
        </div>

        <div className="divider-harv" />
      </section>

      {/* === How it works ==================================================== */}
      <Section
        eyebrow="Protocol flow · 4 steps"
        title="From discovery to deterministic settlement"
        description="Each step writes verifiable state. Frontend guides decisions; onchain records prove execution."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, idx) => (
            <GlassCard key={step.title} padding="lg" className="relative">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-harv-mint)]/25 bg-[color:var(--color-harv-mint)]/8 text-[color:var(--color-harv-mint)]">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-muted-harv">0{idx + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-harv-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-harv">{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* === Active lot teaser =============================================== */}
      <Section
        eyebrow="Featured lot"
        title={
          <>
            {activeLot.farmName} · <span className="text-muted-harv">{activeLot.region}</span>
          </>
        }
        description={activeLot.summary}
        actions={
          <Link
            href={`/partner/lots/${activeLot.code}`}
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
          >
            Open lot
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        }
      >
        <LotCard lot={activeLot} plan={activePlan} layout="feature" />
      </Section>

      {/* === Proof preview =================================================== */}
      <Section
        eyebrow="What proof looks like"
        title="Every step writes verifiable state"
        description="From signature to payout, Harvverse keeps the audit trail visible and deterministic."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <GlassCard padding="lg">
            <div className="eyebrow">Partnership timeline</div>
            <h3 className="mt-2 text-2xl font-light tracking-tight text-harv-text">Signed → settled</h3>
            <p className="mt-2 text-sm text-muted-harv">
              A simplified view of state transitions for the featured partnership.
            </p>
            <div className="mt-6">
              <ProofTimeline
                steps={[
                  {
                    id: "proposal",
                    label: "Proposal created",
                    timestamp: "T-26h",
                    state: "done",
                    description: "Locked from canonical lot/plan terms.",
                  },
                  {
                    id: "approve",
                    label: "MockUSDC approved",
                    timestamp: "T-25h 58m",
                    state: "done",
                  },
                  {
                    id: "open",
                    label: "Partnership opened",
                    timestamp: "T-25h 56m",
                    state: "done",
                    hash: "0x4d3a9b2e8c1f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b",
                  },
                  {
                    id: "milestones",
                    label: "Milestones M1–M6 attested",
                    timestamp: "T-3h",
                    state: "done",
                  },
                  {
                    id: "settlement",
                    label: "Deterministic settlement",
                    timestamp: "T-0",
                    state: "current",
                    description: "Awaiting onchain settle() execution.",
                  },
                ]}
              />
            </div>
          </GlassCard>

          <SettlementProofPanel settlement={featuredSettlement} />
        </div>
      </Section>

      {/* === Other lots ====================================================== */}
      <Section
        eyebrow="Browse"
        title="More lots in the pipeline"
        description="Each lot has a single locked plan. New lots appear as farmers and verifiers register them."
        actions={
          <Link
            href="/partner/lots"
            className="btn btn-ghost btn-sm border border-white/10 text-harv-text hover:border-[color:var(--color-harv-mint)]/30"
          >
            All lots
          </Link>
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {lots.slice(0, 4).map(lot => (
            <LotCard key={lot.code} lot={lot} plan={getPlanByCode(lot.activePlanCode)} />
          ))}
        </div>
      </Section>
    </>
  );
};

export default Home;
