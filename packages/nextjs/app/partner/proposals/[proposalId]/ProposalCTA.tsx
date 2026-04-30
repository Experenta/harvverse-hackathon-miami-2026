"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { Panel } from "~~/components/harvverse/Panel";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import type { Proposal } from "~~/lib/mock/types";

type Step = "approve" | "open" | "done";
type StepState = "idle" | "metamask" | "signing" | "success" | "rejected" | "wrong_chain";

type ProposalCTAProps = {
  proposal: Proposal;
};

const stepCopy: Record<Step, { idle: string; signing: string; success: string }> = {
  approve: { idle: "Approve MockUSDC", signing: "Approving…", success: "Demo USDC approved" },
  open: { idle: "Open partnership", signing: "Opening…", success: "Partnership opened" },
  done: { idle: "Confirmed", signing: "Confirming…", success: "Confirmed" },
};

const Spinner = () => <ArrowPathIcon className="h-4 w-4 animate-spin" />;

export const ProposalCTA = ({ proposal }: ProposalCTAProps) => {
  const [step, setStep] = useState<Step>("approve");
  const [state, setState] = useState<StepState>("idle");
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    Math.max(0, Math.floor((proposal.expiresAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (proposal.status !== "pending") return;
    const t = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [proposal.status]);

  const isExpired = proposal.status === "expired" || (proposal.status === "pending" && secondsLeft <= 0);
  const isAlreadySigned = proposal.status === "signed";

  const expiry = useMemo(() => {
    if (isAlreadySigned) return "signed";
    if (isExpired) return "expired";
    const m = Math.floor(secondsLeft / 60);
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [isAlreadySigned, isExpired, secondsLeft]);

  const runStep = (target: Step) => {
    setState("metamask");
    // user "confirms" MetaMask after a moment
    setTimeout(() => setState("signing"), 1400);
    setTimeout(() => {
      setState("success");
      setTimeout(() => {
        setState("idle");
        if (target === "approve") setStep("open");
        else setStep("done");
      }, 700);
    }, 2400);
  };

  const reset = () => {
    setStep("approve");
    setState("idle");
  };

  const disabled = isExpired || isAlreadySigned || state === "signing" || state === "metamask";

  const showMetamaskModal = state === "metamask";

  return (
    <>
      <Panel padding="lg" variant="hot" className="space-y-5" crosshair>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="eyebrow-leaf">TWO-STEP WALLET SIGN</div>
            <h3 className="font-display mt-2 text-2xl leading-none tracking-tight text-paper">Confirm partnership</h3>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={isAlreadySigned ? "signed" : isExpired ? "expired" : proposal.status} />
            <span
              className="border border-rule bg-ink-2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-2"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
            >
              expires · {expiry}
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <ol className="grid grid-cols-2 gap-2 text-xs">
          <StepCell index={1} label="Approve" active={step === "approve"} done={step !== "approve"} />
          <StepCell index={2} label="Open" active={step === "open"} done={step === "done"} />
        </ol>

        {state === "rejected" ? (
          <div
            className="flex items-start gap-2 border border-cherry/40 bg-cherry/5 p-3 text-xs text-cherry"
            style={{ borderRadius: 2 }}
          >
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>Wallet rejected. No state changed — try again.</div>
          </div>
        ) : null}

        {state === "wrong_chain" ? (
          <div
            className="flex items-start gap-2 border border-torch/40 bg-torch/5 p-3 text-xs text-torch"
            style={{ borderRadius: 2 }}
          >
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>Wrong network. Switch to Hardhat (31337) to continue.</div>
          </div>
        ) : null}

        {step === "done" ? (
          <Link
            href={`/partner/proposals/${proposal.id}/success`}
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2 shimmer-cta"
          >
            <CheckCircleIcon className="h-4 w-4" />
            View partnership
          </Link>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => runStep(step)}
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2"
          >
            {state === "signing" ? <Spinner /> : <WalletIcon className="h-4 w-4" />}
            {state === "metamask"
              ? "Awaiting MetaMask…"
              : state === "signing"
                ? stepCopy[step].signing
                : stepCopy[step].idle}
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setState("rejected")}
            className="border border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3 transition hover:border-cherry/40 hover:text-cherry"
            style={{ borderRadius: 2 }}
            disabled={disabled}
          >
            Sim · reject
          </button>
          <button
            type="button"
            onClick={() => setState("wrong_chain")}
            className="border border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3 transition hover:border-honey/40 hover:text-honey"
            style={{ borderRadius: 2 }}
            disabled={disabled}
          >
            Sim · wrong chain
          </button>
        </div>

        {step === "done" ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-xs text-paper-3 hover:text-leaf"
          >
            <HandRaisedIcon className="h-3.5 w-3.5" />
            Reset demo flow
          </button>
        ) : null}

        <div className="flex items-center gap-2">
          <LiveDot tone="leaf" />
          <p className="text-[11px] text-paper-2">Two distinct wallet prompts. Convex never signs on your behalf.</p>
        </div>
      </Panel>

      {/* MetaMask popup mock */}
      {showMetamaskModal ? (
        <MetaMaskPopupMock proposal={proposal} step={step} onClose={() => setState("idle")} />
      ) : null}
    </>
  );
};

const StepCell = ({ index, label, active, done }: { index: number; label: string; active: boolean; done: boolean }) => (
  <li
    className="flex items-center gap-2 border px-3 py-2"
    style={{
      borderColor: done || active ? "var(--color-leaf)" : "var(--color-rule)",
      backgroundColor: active ? "color-mix(in oklab, var(--color-leaf) 8%, transparent)" : "var(--color-ink-2)",
      borderRadius: 2,
    }}
  >
    <span className="font-mono text-[10px] text-leaf">[{index}]</span>
    <span className="flex-1 text-paper">{label}</span>
    {done ? <CheckCircleIcon className="h-4 w-4 text-leaf" /> : null}
  </li>
);

const MetaMaskPopupMock = ({ proposal, step, onClose }: { proposal: Proposal; step: Step; onClose: () => void }) => {
  const fnCall =
    step === "approve"
      ? `MockUSDC.approve(factory, ${Number(proposal.ticketUsdcUnits).toLocaleString()})`
      : `PartnershipFactory.openPartnership(${proposal.onchainLotId}, proposalHash)`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm pt-12 sm:pt-20">
      <Panel
        padding="none"
        variant="elevated"
        className="reveal w-full max-w-md overflow-hidden border-leaf/30 shadow-glow-leaf"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-rule bg-ink-2 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className="flex h-5 w-5 items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f6851b, #e2761b)", borderRadius: 2 }}
            >
              <span className="text-[10px] font-bold text-white">M</span>
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-paper">METAMASK · LOCALHOST</span>
          </div>
          <button type="button" onClick={onClose} className="text-paper-3 hover:text-paper">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <div className="eyebrow">TRANSACTION REQUEST</div>
            <h4 className="font-display mt-1 text-2xl leading-none tracking-tight text-paper">Confirm transaction</h4>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="From" value={`${proposal.walletAddress.slice(0, 6)}…${proposal.walletAddress.slice(-4)}`} />
            <Row
              label="To"
              value={`${proposal.factoryAddress.slice(0, 6)}…${proposal.factoryAddress.slice(-4)}`}
              hint="PartnershipFactory.sol"
            />
            <Row label="Network" value="Hardhat · 31337" hint="local" />
          </div>

          <div className="border border-rule bg-ink-1 p-3" style={{ borderRadius: 2 }}>
            <div className="eyebrow">FUNCTION</div>
            <code className="mono-hash mt-1 block text-[12px] text-leaf">{fnCall}</code>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="eyebrow">VALUE</div>
              <div className="mt-1 font-mono text-sm text-paper">{step === "approve" ? "0 ETH" : "0 ETH"}</div>
            </div>
            <div>
              <div className="eyebrow">GAS · EST</div>
              <div className="mt-1 font-mono text-sm text-paper">~$0.0015</div>
            </div>
          </div>

          {step === "open" ? (
            <div className="border border-leaf/30 bg-leaf/5 p-3" style={{ borderRadius: 2 }}>
              <div className="eyebrow-leaf">TOKEN TRANSFER</div>
              <div className="mt-1 font-mono text-sm text-paper">
                − {(Number(proposal.ticketUsdcUnits) / 1e6).toLocaleString()} USDC
              </div>
            </div>
          ) : null}

          <div className="flex justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-paper-2 hover:border-cherry/40 hover:text-cherry"
              style={{ borderRadius: 2 }}
            >
              Reject
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3 self-center">
              auto-confirming…
            </span>
            <button type="button" className="btn btn-primary px-5 py-2" disabled>
              Confirm
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

const Row = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="grid grid-cols-[auto_1fr] items-baseline gap-3 border-b border-rule pb-2">
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">{label}</span>
    <div className="text-right">
      <span className="font-mono text-[12px] text-paper">{value}</span>
      {hint ? <div className="font-mono text-[10px] text-paper-3">{hint}</div> : null}
    </div>
  </div>
);
