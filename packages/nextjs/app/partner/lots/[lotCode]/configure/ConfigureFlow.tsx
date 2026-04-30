"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  CommandLineIcon,
  CpuChipIcon,
  GiftIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Coordinate } from "~~/components/harvverse/Coordinate";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { MonoTicker } from "~~/components/harvverse/MonoTicker";
import { type OracleToastSpec, OracleToastStack } from "~~/components/harvverse/OracleToast";
import { Panel } from "~~/components/harvverse/Panel";
import { PhaseRail } from "~~/components/harvverse/PhaseRail";
import { Stat } from "~~/components/harvverse/Stat";
import { StreamText } from "~~/components/harvverse/StreamText";
import type { Lot, Plan, Proposal } from "~~/lib/mock/types";

type ConfigureFlowProps = {
  lot: Lot;
  plan: Plan;
  proposal: Proposal;
};

type Layer = 0 | 1 | 2 | 3 | 4;

const layer1 =
  "Hi Maria. I'm the Harvverse AI Agent. The plan you're looking at was designed by Jorge Alberto Lanza, Cup of Excellence Honduras 2013 Champion with a record score of 92.75 points. The protocol is backed by 23+ peer-reviewed publications. Let me walk you through it.";

const layer2 = (ticket: string) =>
  `Your ticket of ${ticket} breaks down as follows:\n\n  · $1,490  agronomic plan      (43.5%)\n  · $149   operational contingency (4.4%)\n  · $164   Harvverse commission   (4.8%)\n  · $1,622 working capital · fiduciary at Banco Atlántida (47.4%)\n\nHarvverse never touches the money directly — that's a protocol principle.`;

const layer3 =
  "These projections use live Chainlink oracle data. Coffee spot just confirmed at $3.48/lb. Your contract is protected by a $2.50/lb floor — even in a market crash, the downside is bounded.\n\nYear 1: $104 partner return\nYear 2: $546 partner return\nYear 3: $993 partner return\n────────────────────────────\nTotal 3 years: $1,643 on $3,425\n= 48% cumulative, ~14% annualized.";

const layer4 =
  "Profit share is 60/40, with no cap on upside. Plus, as a Phygital partner, you receive 5 pounds of roasted Parainema coffee delivered January 2027.\n\nReady to configure your options?";

const what_if_10qq =
  "Year 1 yield cap is 8 qq (Rule R1 — gradual ramp-up). So if actual is 10 qq, your contract distributes on 8 qq.\n\n  Revenue = 8 × 83.3 × $3.50 = $2,332\n  Minus agro cost $1,490 = profit $842\n  Your 40% share = $337\n\nThat's 3.2× the pessimistic projection.";

const out_of_scope =
  "Split is protocol-level. Not negotiable on individual contracts.\n\nWhy: 60/40 is calibrated so the farmer keeps the majority of the upside on his own land. It's the core thesis of replacing debt with equity.";

const SUGGESTIONS: { id: string; label: string; type: "what-if" | "out-of-scope" | "neutral" }[] = [
  { id: "10qq", label: "What if the actual yield is 10 qq?", type: "what-if" },
  { id: "split", label: "Can I change the 60/40 split?", type: "out-of-scope" },
  { id: "compare", label: "Compare to other lots in the catalog", type: "neutral" },
];

export const ConfigureFlow = ({ lot, plan, proposal }: ConfigureFlowProps) => {
  const [layer, setLayer] = useState<Layer>(0);
  const [unlocked, setUnlocked] = useState(false);
  const [activeAnswer, setActiveAnswer] = useState<"none" | "10qq" | "split" | "neutral">("none");
  const [iterations, setIterations] = useState(5);

  const ticket = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(plan.ticketCents / 100),
    [plan.ticketCents],
  );

  // Sequence: oracle toasts → layer 1 → 2 → 3 → 4 → unlock
  useEffect(() => {
    const t1 = setTimeout(() => setLayer(1), 4200); // after toasts dismiss
    return () => clearTimeout(t1);
  }, []);

  const oracleToasts: OracleToastSpec[] = [
    {
      id: "plan",
      label: "Plan loaded from Convex",
      value: "block #11,482,331",
      source: "[ORACLE]",
      tone: "leaf",
      delay: 200,
    },
    {
      id: "native",
      label: "Native / USD",
      value: "$0.6125",
      source: "CHAINLINK",
      tone: "honey",
      delay: 1000,
    },
    {
      id: "coffee",
      label: "Coffee spot",
      value: "$3.48 / lb",
      source: "CHAINLINK FUNCS",
      tone: "proof",
      delay: 1900,
    },
  ];

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Toasts on Phase 2.2 only */}
      {layer === 0 ? <OracleToastStack toasts={oracleToasts} /> : null}

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* === LEFT: Agent Stage === */}
        <div className="flex min-h-[80vh] flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-rule pb-4">
            <Link
              href={`/partner/lots/${lot.code}`}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3 hover:text-leaf"
            >
              ← back · {lot.code}
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">/</span>
            <span className="eyebrow-leaf">CONFIGURE · LIVE AGENT</span>
            <Coordinate block="11,482,331" className="ml-auto" />
          </div>

          {/* Agent panel */}
          <Panel padding="lg" variant="elevated" className="scanline mt-6 flex-1 overflow-hidden contour-bg" crosshair>
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center border border-leaf/40 bg-leaf/10 text-leaf"
                  style={{ borderRadius: 1 }}
                >
                  <CpuChipIcon className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-display text-base leading-none text-paper">Harvverse AI Agent</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">
                    locked-facts narrator · advisory
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LiveDot tone="leaf" label="streaming" />
              </div>
            </div>

            <div className="mt-5 space-y-6 text-[15px] leading-relaxed text-paper">
              {layer >= 1 ? (
                <AgentLine
                  text={layer1}
                  speed={11}
                  startDelay={0}
                  onDone={() => setLayer(curr => (curr === 1 ? 2 : curr))}
                />
              ) : (
                <div className="text-paper-3 cursor-blink">[…] Loading agronomic plan {plan.planCode}</div>
              )}

              {layer >= 2 ? (
                <AgentLine text={layer2(ticket)} speed={9} onDone={() => setLayer(curr => (curr === 2 ? 3 : curr))} />
              ) : null}

              {layer >= 3 ? (
                <AgentLine text={layer3} speed={9} onDone={() => setLayer(curr => (curr === 3 ? 4 : curr))} />
              ) : null}

              {layer >= 4 ? <AgentLine text={layer4} speed={9} onDone={() => setUnlocked(true)} /> : null}

              {/* Branched answers replace the layer4 if user clicked a suggestion */}
              {activeAnswer === "10qq" ? <AgentLine text={what_if_10qq} speed={9} /> : null}
              {activeAnswer === "split" ? <AgentLine text={out_of_scope} speed={9} /> : null}
            </div>
          </Panel>

          {/* Suggestions + composer */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => {
                const disabled = !unlocked || iterations <= 0;
                return (
                  <button
                    type="button"
                    key={s.id}
                    disabled={disabled}
                    onClick={() => {
                      if (s.id === "10qq") setActiveAnswer("10qq");
                      else if (s.id === "split") setActiveAnswer("split");
                      else setActiveAnswer("neutral");
                      setIterations(i => Math.max(0, i - 1));
                    }}
                    className={`btn-tag ${disabled ? "opacity-40" : ""}`}
                  >
                    <SparklesIcon className="h-3 w-3" />
                    {s.label}
                  </button>
                );
              })}
            </div>

            <Panel padding="xs">
              <div className="flex items-center gap-3">
                <CommandLineIcon className="h-4 w-4 text-leaf" />
                <input
                  type="text"
                  placeholder={
                    unlocked ? "Type a question over locked plan facts…" : "Locked while the Agent narrates…"
                  }
                  disabled={!unlocked}
                  className="flex-1 bg-transparent font-mono text-sm text-paper placeholder:text-paper-3 focus:outline-none"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">
                  ITER {iterations}/5
                </span>
                <button
                  type="button"
                  disabled={!unlocked || iterations <= 0}
                  className="btn btn-primary btn-xs inline-flex items-center gap-1.5"
                >
                  Send
                  <PaperAirplaneIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </Panel>
          </div>
        </div>

        {/* === RIGHT: Live state panel === */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2">
            <LiveDot tone="leaf" label="LIVE STATE" />
          </div>

          {/* Investment summary */}
          <Panel padding="lg" variant="hot" crosshair>
            <div className="eyebrow-leaf">YOUR INVESTMENT · LIVE</div>
            <h3 className="font-display mt-3 text-[2rem] leading-none tracking-[-0.025em] text-paper">
              {lot.farmName}
            </h3>
            <div className="font-mono mt-1 text-[11px] uppercase tracking-[0.18em] text-paper-3">
              {lot.code} · {lot.region}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat label="Ticket" value={ticket} size="md" tone="default" bordered />
              <Stat label="Type" value="Phygital" size="sm" bordered />
            </div>

            <div className="mt-5 space-y-3">
              <BreakdownBar label="Agronomic plan" amount="$1,490" pct={43.5} tone="leaf" visible={layer >= 2} />
              <BreakdownBar label="Contingency" amount="$149" pct={4.4} tone="honey" visible={layer >= 2} />
              <BreakdownBar label="Harvverse fee" amount="$164" pct={4.8} tone="proof" visible={layer >= 2} />
              <BreakdownBar label="Working capital" amount="$1,622" pct={47.4} tone="bean" visible={layer >= 2} />
            </div>
          </Panel>

          {/* 3-year projection — unlocks at Layer 3 */}
          <Panel padding="md" className={layer >= 3 ? "" : "opacity-40"}>
            <div className="flex items-center justify-between">
              <span className="eyebrow-honey">3-YEAR PROJECTION</span>
              <span className="font-mono text-[10px] text-paper-3">Y1·Y2·Y3</span>
            </div>
            <div className="mt-3 space-y-2.5">
              <ProjectionBar year="Y1" amount={104} max={1643} visible={layer >= 3} delay={0} />
              <ProjectionBar year="Y2" amount={546} max={1643} visible={layer >= 3} delay={0.4} />
              <ProjectionBar year="Y3" amount={993} max={1643} visible={layer >= 3} delay={0.8} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4">
              <Stat
                label="Cum. ROI"
                value={layer >= 3 ? <MonoTicker value={48} suffix="%" delay={1200} /> : "—"}
                tone="proof"
                size="md"
              />
              <Stat label="Annualized" value={layer >= 3 ? <span>~14%</span> : "—"} tone="leaf" size="md" />
            </div>
          </Panel>

          {/* Phygital — Layer 4 reveal */}
          <Panel padding="md" className={layer >= 4 ? "" : "opacity-40"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GiftIcon className="h-4 w-4 text-honey" />
                <span className="eyebrow-honey">PHYGITAL BONUS</span>
              </div>
              <span className="font-mono text-[10px] text-paper-3">JAN 2027</span>
            </div>
            <div className="mt-3 grid grid-cols-[auto_1fr] gap-4">
              <div
                className="flex h-16 w-16 flex-col items-center justify-center border border-honey/30 bg-honey/5"
                style={{ borderRadius: 2 }}
              >
                <span className="font-display text-xl text-honey">5lb</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-paper-3">bag</span>
              </div>
              <div className="text-sm text-paper-2">
                <div className="text-paper">Parainema · medium roast</div>
                <div className="font-mono text-[11px] text-paper-3">SCA target ≥ 84.5</div>
                <div className="mt-1 font-mono text-[11px] text-paper-3">+ QR → onchain provenance</div>
              </div>
            </div>
          </Panel>

          {/* CTA — only after unlock */}
          <Link
            href={`/partner/proposals/${proposal.id}`}
            className={`btn btn-primary inline-flex w-full items-center justify-center gap-2 ${
              unlocked ? "shimmer-cta" : "btn-disabled pointer-events-none opacity-40"
            }`}
          >
            <CheckBadgeIcon className="h-4 w-4" />
            Lock terms & review
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

          <PhaseRail
            items={[
              { id: "discover", label: "Discover", state: "done" },
              { id: "configure", label: "Configure & ask", state: "current" },
              { id: "review", label: "Review contract", state: "pending" },
              { id: "sign", label: "Sign with wallet", state: "pending" },
              { id: "settle", label: "Settle & receive", state: "pending" },
            ]}
            className="mt-2"
          />
        </aside>
      </div>
    </div>
  );
};

const AgentLine = ({
  text,
  speed = 12,
  startDelay = 0,
  onDone,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  onDone?: () => void;
}) => (
  <div className="reveal">
    <StreamText text={text} speed={speed} startDelay={startDelay} onDone={onDone} />
  </div>
);

const BreakdownBar = ({
  label,
  amount,
  pct,
  tone,
  visible,
}: {
  label: string;
  amount: string;
  pct: number;
  tone: "leaf" | "honey" | "proof" | "bean";
  visible: boolean;
}) => {
  const color =
    tone === "leaf"
      ? "var(--color-leaf)"
      : tone === "honey"
        ? "var(--color-honey)"
        : tone === "proof"
          ? "var(--color-proof)"
          : "var(--color-bean)";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-paper">{label}</span>
        <span className="font-mono text-paper-2">
          {amount} <span className="text-paper-3">· {pct.toFixed(1)}%</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden border border-rule" style={{ borderRadius: 1 }}>
        <div
          className={`h-full ${visible ? "bar-grow" : ""}`}
          style={{
            width: visible ? `${pct}%` : "0%",
            backgroundColor: color,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
};

const ProjectionBar = ({
  year,
  amount,
  max,
  visible,
  delay,
}: {
  year: string;
  amount: number;
  max: number;
  visible: boolean;
  delay: number;
}) => {
  const pct = (amount / max) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-mono text-paper-2">{year}</span>
        <span className="font-mono text-paper">
          {visible ? <MonoTicker value={amount} prefix="$" delay={delay * 1000} /> : "—"}
        </span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden border border-rule" style={{ borderRadius: 1 }}>
        <div
          className={`h-full ${visible ? "bar-grow" : ""}`}
          style={{
            width: visible ? `${pct}%` : "0%",
            background: `linear-gradient(90deg, var(--color-leaf), var(--color-honey))`,
            animationDelay: `${delay}s`,
          }}
        />
      </div>
    </div>
  );
};
