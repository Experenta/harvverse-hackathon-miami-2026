"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { MonoTicker } from "~~/components/harvverse/MonoTicker";
import { Panel } from "~~/components/harvverse/Panel";
import { Stat } from "~~/components/harvverse/Stat";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPartnershipById } from "~~/lib/mock/partnerships";
import type { Settlement } from "~~/lib/mock/types";

type SettlementChoreographyProps = {
  settlement: Settlement;
  onComplete: () => void;
  onClose: () => void;
};

type Phase = "frame_a" | "frame_b" | "frame_c" | "wallet_proof" | "done";

/**
 * SettlementChoreography — the WOW MOMENT #2 sequence.
 *
 * Frame A · Step 1 · Revenue lights up           (0–4s)
 * Frame B · Steps 1-3 collapsed, Step 4 lights   (4–9s)
 * Frame C · Single tx fires, hashes resolve      (9–14s)
 * MetaMask balance proof                          (14–22s)
 * Done — confirmation panel + dismiss            (22+)
 */
export const SettlementChoreography = ({ settlement, onComplete, onClose }: SettlementChoreographyProps) => {
  const [phase, setPhase] = useState<Phase>("frame_a");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const partnership = getPartnershipById(settlement.partnershipId);
  const lot = partnership ? getLotByCode(partnership.lotCode) : undefined;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("frame_b"), 4500);
    const t2 = setTimeout(() => setPhase("frame_c"), 9500);
    const t3 = setTimeout(() => {
      setPhase("wallet_proof");
      onCompleteRef.current();
    }, 14500);
    const t4 = setTimeout(() => setPhase("done"), 22000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const txHash = "0xc8d2f7b3a1e4d5c6b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0e91a";
  const dollars = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
      cents / 100,
    );

  const yieldQQ = settlement.yieldTenthsQQ / 10;
  const lbs = (yieldQQ * 83.3).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[color:var(--color-ink-0)]/96 backdrop-blur-md">
      {/* atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-leaf/15 blur-[120px]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-overlay opacity-30" />

      <button
        type="button"
        onClick={onClose}
        className="fixed right-6 top-6 z-10 inline-flex items-center gap-2 border border-rule bg-ink-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-2 hover:text-paper"
        style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
      >
        <XMarkIcon className="h-3.5 w-3.5" />
        Dismiss
      </button>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-rule pb-5">
          <span className="eyebrow-leaf">SETTLEMENT</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper">
            {lot?.code.toUpperCase()} · YEAR {settlement.year}
          </span>
          <LiveDot tone="proof" label={phase === "done" ? "settled" : "executing"} className="ml-auto" />
        </div>

        <h1
          className="font-display mt-8 text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95] tracking-[-0.04em] text-paper"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 60' }}
        >
          {phase === "wallet_proof" || phase === "done" ? (
            <>
              The math <em className="not-italic text-gradient-leaf">arrives</em>.
            </>
          ) : (
            <>
              Five steps <em className="not-italic text-gradient-honey">into one tx</em>.
            </>
          )}
        </h1>

        {/* === Steps === */}
        <ol className="mt-10 space-y-4">
          <Step
            index={1}
            title="Revenue"
            active={phase === "frame_a"}
            done={phase !== "frame_a"}
            collapsed={phase === "frame_c" || phase === "wallet_proof" || phase === "done"}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-2 font-mono text-paper-2">
                <div className="text-sm">
                  <span className="text-paper">{yieldQQ}</span> qq × <span className="text-paper">83.3</span> lb/qq ×{" "}
                  <span className="text-paper">${(settlement.priceCentsPerLb / 100).toFixed(2)}</span> /lb
                </div>
                <div className="text-sm">
                  = <span className="text-paper">{lbs} lb</span> green ×{" "}
                  <span className="text-paper">${(settlement.priceCentsPerLb / 100).toFixed(2)}</span>
                </div>
              </div>
              <div className="font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-leaf">
                {phase === "frame_a" ? (
                  <MonoTicker
                    value={settlement.revenueCents / 100}
                    prefix="$"
                    decimals={0}
                    duration={2200}
                    delay={400}
                  />
                ) : (
                  dollars(settlement.revenueCents)
                )}
              </div>
            </div>
          </Step>

          <Step
            index={2}
            title="Cost"
            active={false}
            done={phase !== "frame_a"}
            collapsed={phase === "frame_c" || phase === "wallet_proof" || phase === "done"}
            visible={phase !== "frame_a"}
          >
            <div className="flex justify-end font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-cherry">
              − {dollars(settlement.revenueCents - settlement.profitCents)}
            </div>
          </Step>

          <Step
            index={3}
            title="Profit"
            active={false}
            done={phase !== "frame_a"}
            collapsed={phase === "frame_c" || phase === "wallet_proof" || phase === "done"}
            visible={phase !== "frame_a"}
          >
            <div className="flex justify-end font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-paper">
              {dollars(settlement.profitCents)}
            </div>
          </Step>

          <Step
            index={4}
            title="Distribution"
            active={phase === "frame_b"}
            done={phase === "frame_c" || phase === "wallet_proof" || phase === "done"}
            visible={phase !== "frame_a"}
            collapsed={phase === "frame_c" || phase === "wallet_proof" || phase === "done"}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label="Farmer · 60%"
                value={
                  phase === "frame_b" ? (
                    <MonoTicker
                      value={settlement.farmerCents / 100}
                      prefix="$"
                      decimals={0}
                      delay={400}
                      duration={1800}
                    />
                  ) : (
                    dollars(settlement.farmerCents)
                  )
                }
                tone="honey"
                size="lg"
              />
              <Stat
                label="Partner · 40%"
                value={
                  phase === "frame_b" ? (
                    <MonoTicker
                      value={settlement.partnerCents / 100}
                      prefix="$"
                      decimals={0}
                      delay={400}
                      duration={1800}
                    />
                  ) : (
                    dollars(settlement.partnerCents)
                  )
                }
                tone="proof"
                size="lg"
              />
            </div>
          </Step>

          <Step
            index={5}
            title="Onchain · Single transaction"
            active={phase === "frame_c"}
            done={phase === "wallet_proof" || phase === "done"}
            visible={phase === "frame_c" || phase === "wallet_proof" || phase === "done"}
          >
            <div className="space-y-4">
              <div className="font-mono text-sm text-paper">
                <span className="text-paper-3">{">>"} </span>YieldDistributor.settle(lotId={lot?.onchainLotId}, yieldQQ=
                {yieldQQ}, pricePerLb={settlement.priceCentsPerLb})
              </div>

              {/* Single tx burst flow */}
              <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr]">
                <Panel padding="sm" className="self-start">
                  <div className="eyebrow">ONE TX</div>
                  <MonoHash value={txHash} truncate={6} className="mt-1.5" />
                  <div className="font-mono mt-2 text-[10px] uppercase tracking-[0.18em] text-paper-3">
                    blk #11,495,118 · gas ~$0.0019
                  </div>
                </Panel>
                <span className="hidden self-center font-mono text-2xl text-leaf sm:inline">▸</span>
                <ul className="space-y-2">
                  <RecipientRow
                    label="Farmer"
                    address={partnership?.farmerWallet ?? "0x4C8B7"}
                    amount={dollars(settlement.farmerCents)}
                  />
                  <RecipientRow
                    label="Partner"
                    address={partnership?.partnerWallet ?? "0xAB3F4"}
                    amount={dollars(settlement.partnerCents)}
                  />
                  <RecipientRow
                    label="LotNFT #001"
                    address="metadata updated"
                    amount="status: COMPLETED"
                    tone="proof"
                  />
                </ul>
              </div>
            </div>
          </Step>
        </ol>

        {/* MetaMask wallet proof */}
        {phase === "wallet_proof" || phase === "done" ? (
          <div className="reveal mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-leaf">
              <LiveDot tone="leaf" />
              <span className="eyebrow-leaf">PROOF · WALLET BALANCE</span>
            </div>
            <Panel padding="none" variant="elevated" className="w-full max-w-md overflow-hidden shadow-glow-leaf">
              <div className="flex items-center justify-between border-b border-rule bg-ink-2 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f6851b, #e2761b)", borderRadius: 2 }}
                  >
                    <span className="text-[10px] font-bold text-white">M</span>
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-paper">METAMASK · ACCOUNT 1</span>
                </div>
                <WalletIcon className="h-4 w-4 text-paper-2" />
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <div className="eyebrow">ACTIVITY · USDC</div>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
                    <div className="space-y-1.5">
                      <BalRow label="Before" value="1,234.00 USDC" tone="muted" />
                      <BalRow label="Now" value="1,338.00 USDC" tone="default" />
                    </div>
                    <div className="self-end font-display text-3xl tracking-tight text-leaf">
                      <MonoTicker value={104} prefix="+ $" decimals={0} duration={1400} />
                    </div>
                  </div>
                </div>
                <div className="border-t border-rule pt-3">
                  <div className="eyebrow">NFTS</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-sm text-paper">LotNFT #001 · Zafiro Parainema</span>
                    <span
                      className="border border-leaf/30 bg-leaf/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-leaf"
                      style={{ borderRadius: 1 }}
                    >
                      UPDATED
                    </span>
                  </div>
                </div>
              </div>
            </Panel>

            <div className="flex items-center gap-3">
              <Link href={`/partner/dashboard`} className="btn btn-primary inline-flex items-center gap-2 shimmer-cta">
                <CheckCircleIcon className="h-4 w-4" />
                See partnership · settled
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/blockexplorer"
                className="inline-flex items-center gap-1.5 border border-rule px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-2 hover:border-leaf hover:text-leaf"
                style={{ borderRadius: 2 }}
              >
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                View tx onchain
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Step = ({
  index,
  title,
  active,
  done,
  visible = true,
  collapsed = false,
  children,
}: {
  index: number;
  title: string;
  active: boolean;
  done: boolean;
  visible?: boolean;
  collapsed?: boolean;
  children?: React.ReactNode;
}) => {
  if (!visible) return null;
  return (
    <li
      className={`relative grid grid-cols-[auto_1fr] items-start gap-4 border p-5 transition-all ${
        active ? "border-leaf shadow-glow-leaf" : done ? "border-rule-hi" : "border-rule"
      } ${collapsed ? "py-3" : ""}`}
      style={{ borderRadius: 2, backgroundColor: collapsed ? "var(--color-ink-1)" : "var(--color-ink-2)" }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center border"
        style={{
          borderColor: active ? "var(--color-leaf)" : done ? "var(--color-rule-hi)" : "var(--color-rule)",
          backgroundColor: active ? "color-mix(in oklab, var(--color-leaf) 15%, transparent)" : "transparent",
          borderRadius: 1,
        }}
      >
        {done ? (
          <CheckCircleIcon className="h-4 w-4 text-leaf" />
        ) : active ? (
          <ArrowPathIcon className="h-4 w-4 animate-spin text-leaf" />
        ) : (
          <span className="font-mono text-xs text-paper-3">{index}</span>
        )}
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <span
            className={`font-mono text-[11px] uppercase tracking-[0.2em] ${active ? "text-leaf" : done ? "text-paper" : "text-paper-3"}`}
          >
            STEP {index} · {title}
          </span>
          {collapsed && done ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">collapsed</span>
          ) : null}
        </div>
        {!collapsed ? <div className="mt-3">{children}</div> : null}
      </div>
    </li>
  );
};

const RecipientRow = ({
  label,
  address,
  amount,
  tone = "default",
}: {
  label: string;
  address: string;
  amount: string;
  tone?: "default" | "proof";
}) => (
  <li
    className="flex items-center justify-between gap-3 border border-rule bg-ink-1 px-3 py-2.5"
    style={{ borderRadius: 2, backgroundColor: "var(--color-ink-1)" }}
  >
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">{label}</span>
      {address.startsWith("0x") ? (
        <WalletPillMock address={address} status="live" />
      ) : (
        <span className="font-mono text-xs text-paper">{address}</span>
      )}
    </div>
    <span className={`font-mono text-sm ${tone === "proof" ? "text-proof" : "text-paper"}`}>{amount}</span>
  </li>
);

const BalRow = ({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "muted" }) => (
  <div className="flex items-baseline justify-between">
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">{label}</span>
    <span className={`font-mono text-sm ${tone === "muted" ? "text-paper-3" : "text-paper"}`}>{value}</span>
  </div>
);
