"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { GlassCard } from "~~/components/harvverse/GlassCard";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import type { Proposal } from "~~/lib/mock/types";

type Step = "approve" | "open" | "done";
type StepState = "idle" | "signing" | "success" | "rejected" | "wrong_chain";

type ProposalCTAProps = {
  proposal: Proposal;
};

const stepCopy: Record<Step, { idle: string; signing: string; success: string }> = {
  approve: {
    idle: "Approve demo USDC",
    signing: "Approving demo USDC…",
    success: "Demo USDC approved",
  },
  open: {
    idle: "Open partnership",
    signing: "Opening partnership…",
    success: "Partnership opened",
  },
  done: {
    idle: "Confirmed",
    signing: "Confirming…",
    success: "Confirmed",
  },
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
    setState("signing");
    const win = Math.random() > 0.15;
    setTimeout(() => {
      if (!win) {
        setState("rejected");
        return;
      }
      setState("success");
      setTimeout(() => {
        setState("idle");
        if (target === "approve") setStep("open");
        else setStep("done");
      }, 700);
    }, 1100);
  };

  const reset = () => {
    setStep("approve");
    setState("idle");
  };

  const disabled = isExpired || isAlreadySigned || state === "signing";

  return (
    <GlassCard padding="lg" glow="mint" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Two-step wallet signing</div>
          <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">Confirm partnership</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={isAlreadySigned ? "signed" : isExpired ? "expired" : proposal.status} />
          <span className="rounded-md border border-white/8 bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-harv">
            Expires · {expiry}
          </span>
        </div>
      </div>

      <ol className="grid grid-cols-2 gap-3 text-xs">
        <li
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
            step === "approve"
              ? "border-[color:var(--color-harv-mint)]/30 bg-[color:var(--color-harv-mint)]/5"
              : step === "open" || step === "done"
                ? "border-[color:var(--color-harv-mint)]/20 bg-white/3"
                : "border-white/5 bg-white/3"
          }`}
        >
          <span className="font-mono text-[color:var(--color-harv-mint)]">[1]</span>
          <span className="flex-1 text-harv-text/80">Approve MockUSDC</span>
          {step !== "approve" ? <CheckCircleIcon className="h-4 w-4 text-[color:var(--color-harv-mint)]" /> : null}
        </li>
        <li
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
            step === "open"
              ? "border-[color:var(--color-harv-mint)]/30 bg-[color:var(--color-harv-mint)]/5"
              : step === "done"
                ? "border-[color:var(--color-harv-mint)]/20 bg-white/3"
                : "border-white/5 bg-white/3"
          }`}
        >
          <span className="font-mono text-[color:var(--color-harv-mint)]">[2]</span>
          <span className="flex-1 text-harv-text/80">Open partnership</span>
          {step === "done" ? <CheckCircleIcon className="h-4 w-4 text-[color:var(--color-harv-mint)]" /> : null}
        </li>
      </ol>

      {state === "rejected" ? (
        <div className="flex items-start gap-2 rounded-xl border border-[#ff8863]/30 bg-[#ff8863]/5 p-3 text-xs text-[#ff8863]">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            Wallet rejected the request. You can try again — no state was changed and your balance is unaffected.
          </div>
        </div>
      ) : null}

      {state === "wrong_chain" ? (
        <div className="flex items-start gap-2 rounded-xl border border-[#ff8863]/30 bg-[#ff8863]/5 p-3 text-xs text-[#ff8863]">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>Wrong network. Switch to Hardhat (31337) to continue.</div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (step === "approve") runStep("approve");
          else if (step === "open") runStep("open");
        }}
        className="btn btn-primary inline-flex w-full items-center justify-center gap-2 disabled:opacity-40"
      >
        {state === "signing" ? <Spinner /> : <WalletIcon className="h-4 w-4" />}
        {step === "done" ? "Partnership confirmed" : state === "signing" ? stepCopy[step].signing : stepCopy[step].idle}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setState("rejected")}
          className="rounded-md border border-white/8 px-3 py-1.5 text-[11px] text-muted-harv transition hover:border-[#ff8863]/30 hover:text-[#ff8863]"
          disabled={disabled}
        >
          Simulate rejection
        </button>
        <button
          type="button"
          onClick={() => setState("wrong_chain")}
          className="rounded-md border border-white/8 px-3 py-1.5 text-[11px] text-muted-harv transition hover:border-[color:var(--color-harv-accent)]/30 hover:text-[color:var(--color-harv-accent)]"
          disabled={disabled}
        >
          Simulate wrong chain
        </button>
      </div>

      {step === "done" ? (
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-harv hover:text-[color:var(--color-harv-mint)]"
        >
          <HandRaisedIcon className="h-3.5 w-3.5" />
          Reset demo flow
        </button>
      ) : null}

      <p className="text-[11px] text-muted-harv">
        Approval and open-partnership are two distinct wallet prompts. Convex never signs on your behalf.
      </p>
    </GlassCard>
  );
};
