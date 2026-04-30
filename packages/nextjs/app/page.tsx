import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  CommandLineIcon,
  CubeTransparentIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { CoffeeBeanArt } from "~~/components/harvverse/CoffeeBeanArt";
import { GridBackdrop } from "~~/components/harvverse/GridBackdrop";
import { HeroParticleField } from "~~/components/harvverse/HeroParticleField";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { LotCard } from "~~/components/harvverse/LotCard";
import { Panel } from "~~/components/harvverse/Panel";
import { ProofTimeline } from "~~/components/harvverse/ProofTimeline";
import { Section } from "~~/components/harvverse/Section";
import { SettlementProofPanel } from "~~/components/harvverse/SettlementProofPanel";
import { Stat } from "~~/components/harvverse/Stat";
import { TopographicLines } from "~~/components/harvverse/TopographicLines";
import { getActiveLot, listLots } from "~~/lib/mock/lots";
import { getPlanByCode, getPlanForLot } from "~~/lib/mock/plans";
import { mockSettlements } from "~~/lib/mock/settlements";

const HOW_IT_WORKS = [
  {
    icon: EyeIcon,
    title: "Discover",
    desc: "Inspect lot data, agronomic context, and locked plan terms before any wallet prompt.",
    code: "01·DISCO",
  },
  {
    icon: CheckBadgeIcon,
    title: "Sign",
    desc: "Approve demo MockUSDC, then open the partnership from your wallet with explicit intent.",
    code: "02·SIGN",
  },
  {
    icon: CommandLineIcon,
    title: "Evidence",
    desc: "Six milestone fixtures are attested onchain by authorized verifier roles.",
    code: "03·EVID",
  },
  {
    icon: CubeTransparentIcon,
    title: "Settle",
    desc: "Deterministic settlement computes revenue and split from locked plan terms and evidence.",
    code: "04·SETL",
  },
];

const Home = () => {
  const activeLot = getActiveLot();
  const activePlan = getPlanForLot(activeLot.code);
  const featuredSettlement = mockSettlements.find(s => s.status === "confirmed") ?? mockSettlements[0];
  const lots = listLots();

  return (
    <>
      {/* === HERO ============================================================ */}
      <section className="relative isolate overflow-hidden">
        <GridBackdrop variant="dense" className="opacity-60" />
        <TopographicLines intensity="normal" />
        <HeroParticleField />

        {/* warm color washes */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-12 h-[440px] w-[440px] rounded-full bg-leaf/15 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-160px] top-[-120px] h-[520px] w-[520px] rounded-full bg-honey/10 blur-[120px]"
        />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-20 lg:px-10 lg:pb-28 lg:pt-20">
          <div className="flex flex-col items-start">
            {/* Mission strip */}
            <div
              className="reveal reveal-1 flex flex-wrap items-center gap-3 border border-rule bg-ink-2/60 px-3 py-1.5"
              style={{ borderRadius: 2 }}
            >
              <LiveDot tone="leaf" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-2">
                ZAFIRO · Parainema · 1.0 mz · Comayagua HN
              </span>
              <span className="hidden md:inline coordinate">⌖ 14°56′47.4″N · 88°05′10.7″W</span>
            </div>

            <h1
              className="reveal reveal-2 mt-6 font-display text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[0.95] tracking-[-0.035em] text-paper"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 80' }}
            >
              Co-invest in <em className="not-italic text-gradient-leaf">single-origin</em> coffee,
              <br />
              <span className="text-paper-2">verified by the chain.</span>
            </h1>

            <p className="reveal reveal-3 mt-6 max-w-xl text-base leading-relaxed text-paper-2 sm:text-lg">
              Harvverse maps specialty coffee lots to accountable, proof-first partnerships. Review the agronomy, sign
              with your wallet, watch milestone evidence land onchain, and settle from locked terms.{" "}
              <span className="text-paper">60/40 split, no overrides, deterministic math.</span>
            </p>

            <div className="reveal reveal-4 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/partner/lots/${activeLot.code}`}
                className="btn btn-primary btn-md shimmer-cta inline-flex items-center gap-2"
              >
                Enter the active lot
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="/partner/dashboard" className="btn btn-ghost btn-md">
                See your partnerships
              </Link>
            </div>

            <div className="reveal reveal-5 mt-12 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Active lots" value={lots.length} tone="default" size="md" coordinate="01" />
              <Stat
                label="Origin"
                value={<span className="font-display text-2xl">Honduras</span>}
                tone="muted"
                size="sm"
                coordinate="02"
              />
              <Stat label="Avg ticket" value="$3.4k" tone="honey" size="md" coordinate="03" />
              <Stat
                label="Chain"
                value={<span className="font-mono text-2xl">31337</span>}
                tone="proof"
                size="sm"
                coordinate="04"
              />
            </div>

            {/* Proof line */}
            <div className="reveal reveal-6 mt-10 flex flex-wrap items-center gap-4 border-t border-rule pt-6 text-[12px] text-paper-3">
              <span className="font-mono uppercase tracking-[0.18em]">VALIDATED BY</span>
              <span className="text-paper">Jorge A. Lanza</span>
              <span>·</span>
              <span>Cup of Excellence Honduras 2013 · 92.75</span>
              <span>·</span>
              <span>23 peer-reviewed publications</span>
            </div>
          </div>

          {/* Hero art */}
          <div className="reveal reveal-3 relative flex items-center justify-center">
            <div className="relative aspect-square w-full max-w-[560px]">
              <CoffeeBeanArt className="absolute inset-0" />
              {/* corner crosshair markers */}
              <div className="absolute inset-0 pointer-events-none crosshair-4">
                <span data-corner="tl" />
                <span data-corner="tr" />
                <span data-corner="bl" />
                <span data-corner="br" />
              </div>
              {/* live oracle readout panel */}
              <div className="absolute -bottom-4 left-2 right-2 sm:left-6 sm:right-6">
                <Panel padding="xs" className="scanline">
                  <div className="grid grid-cols-3 divide-x divide-rule">
                    <div className="px-3">
                      <div className="flex items-center gap-1.5">
                        <LiveDot tone="proof" />
                        <span className="eyebrow">Coffee spot</span>
                      </div>
                      <div className="mt-1 font-mono text-sm text-paper">$3.48 / lb</div>
                    </div>
                    <div className="px-3">
                      <div className="flex items-center gap-1.5">
                        <LiveDot tone="honey" />
                        <span className="eyebrow">Native / USD</span>
                      </div>
                      <div className="mt-1 font-mono text-sm text-paper">$0.6125</div>
                    </div>
                    <div className="px-3">
                      <div className="flex items-center gap-1.5">
                        <LiveDot tone="leaf" />
                        <span className="eyebrow">Block</span>
                      </div>
                      <div className="mt-1 font-mono text-sm text-paper">#11,482,331</div>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </div>

        <div className="divider-leaf" />
      </section>

      {/* === HOW IT WORKS ==================================================== */}
      <Section
        index="§ 01"
        eyebrow="Protocol flow"
        eyebrowTone="leaf"
        coordinate="four-step rail"
        title="From discovery to deterministic settlement."
        description="Each step writes verifiable state. Frontend guides decisions; onchain records prove execution."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, idx) => (
            <Panel
              key={step.title}
              padding="lg"
              className="group relative transition hover:-translate-y-1 hover:border-leaf/40"
            >
              <div className="flex items-start justify-between">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center border border-leaf/30 bg-leaf/10 text-leaf"
                  style={{ borderRadius: 1 }}
                >
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">{step.code}</span>
              </div>
              <h3
                className="font-display mt-6 text-[1.6rem] leading-none tracking-[-0.025em] text-paper"
                style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30' }}
              >
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-2">{step.desc}</p>
              <div className="absolute bottom-3 right-3 font-mono text-[10px] text-paper-3 opacity-0 transition group-hover:opacity-100">
                phase {idx + 1}/4
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      {/* === ACTIVE LOT ====================================================== */}
      <Section
        index="§ 02"
        eyebrow="Featured lot"
        eyebrowTone="honey"
        coordinate={`lot ${activeLot.code}`}
        title={
          <>
            {activeLot.farmName}
            <span className="block text-paper-2">
              {activeLot.region}, {activeLot.country}
            </span>
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

      {/* === PROOF =========================================================== */}
      <Section
        index="§ 03"
        eyebrow="What proof looks like"
        eyebrowTone="proof"
        title={
          <>
            Every step writes <em className="not-italic text-gradient-honey">verifiable</em> state.
          </>
        }
        description="From signature to payout, Harvverse keeps the audit trail visible and deterministic."
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_1.45fr]">
          <Panel padding="lg" crosshair>
            <div className="flex items-center justify-between">
              <div className="eyebrow-leaf">PARTNERSHIP TIMELINE</div>
              <ArrowTrendingUpIcon className="h-4 w-4 text-leaf" />
            </div>
            <h3
              className="font-display mt-3 text-3xl leading-none tracking-[-0.025em] text-paper"
              style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30' }}
            >
              Signed → settled
            </h3>
            <p className="mt-2 text-sm text-paper-2">
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
          </Panel>

          <SettlementProofPanel settlement={featuredSettlement} />
        </div>
      </Section>

      {/* === Other lots ====================================================== */}
      <Section
        index="§ 04"
        eyebrow="Browse"
        coordinate="catalog feed"
        title="More lots in the pipeline."
        description="Each lot carries a single locked plan. New lots appear as farmers and verifiers register them."
        actions={
          <Link href="/partner/lots" className="btn btn-ghost btn-sm">
            All lots →
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
