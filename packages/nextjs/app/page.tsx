import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  CubeTransparentIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { GlassCard } from "~~/components/harvverse/GlassCard";
import { GridBackdrop } from "~~/components/harvverse/GridBackdrop";
import { HeroParticleField } from "~~/components/harvverse/HeroParticleField";
import { LotCard } from "~~/components/harvverse/LotCard";
import { ProofTimeline } from "~~/components/harvverse/ProofTimeline";
import { Section } from "~~/components/harvverse/Section";
import { SettlementProofPanel } from "~~/components/harvverse/SettlementProofPanel";
import { StatsArc } from "~~/components/harvverse/StatsArc";
import { TopographicLines } from "~~/components/harvverse/TopographicLines";
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
    icon: MagnifyingGlassIcon,
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

        {/* ── Row 1: heading + image side by side ────────────────────── */}
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 lg:px-10 lg:pt-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            {/* Left: heading + description */}
            <div className="flex flex-col items-start">
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.55] tracking-tight text-harv-text sm:text-5xl lg:text-[3.25rem] lg:leading-[1.45]">
                Own a slice of{" "}
                <span className="harv-hero-highlight">
                  <span>Single-Origin Coffee</span>
                </span>
                , on-chain proofs included.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-harv sm:text-lg">
                Harvverse maps specialty coffee lots to accountable, proof-first partnerships. Review agronomy, sign
                with your wallet, track milestone evidence, and settle from locked terms.
              </p>
            </div>

            {/* Right: leaf image */}
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-[color:var(--color-harv-mint)]/10 blur-3xl animate-pulse-glow"
              />
              <Image
                src="/harvverse/harv-leaf.png"
                alt="Harvverse leaf mark"
                width={480}
                height={480}
                priority
                className="relative w-full max-w-[380px] animate-float-slow drop-shadow-[0_0_48px_color-mix(in_oklab,var(--color-harv-mint)_40%,transparent)]"
              />
            </div>
          </div>

          {/* ── Row 2: CTA buttons ──────────────────────────────────────── */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href={`/partner/lots/${activeLot.code}`}
              className="btn btn-primary btn-md inline-flex items-center gap-2"
            >
              View Lots
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/partner/dashboard"
              className="btn btn-md border border-[color:var(--color-harv-text)]/22 bg-transparent text-harv-text hover:border-[color:var(--color-harv-mint)]/55 hover:bg-[color-mix(in_oklab,var(--color-harv-mint)_8%,transparent)]"
            >
              See your lots
            </Link>
          </div>
        </div>

        {/* ── Row 3: StatsArc — full page width ──────────────────────── */}
        <div className="relative w-full px-6 pb-20 sm:px-10 lg:px-16 lg:pb-28">
          <StatsArc
            items={[
              { label: "Active lots", value: lots.length, tone: "default" },
              { label: "Origin", value: "Central America", tone: "muted" },
              { label: "Avg ticket", value: "$3.4k", tone: "mint" },
              { label: "Chain", value: "Hardhat", tone: "cyan" },
            ]}
          />
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
            <div key={step.title} className="harv-protocol-card relative p-6 lg:p-7">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-harv-mint)]/35 bg-[color:var(--color-harv-mint)]/10 text-[color:var(--color-harv-mint)]">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-muted-harv">0{idx + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold uppercase tracking-wide text-harv-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-harv">{step.desc}</p>
            </div>
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

      <p className="mx-auto max-w-7xl px-4 pb-10 font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-harv-mint)] sm:px-6 lg:px-10">
        Testnet demo · not financial advice
      </p>
    </>
  );
};

export default Home;
