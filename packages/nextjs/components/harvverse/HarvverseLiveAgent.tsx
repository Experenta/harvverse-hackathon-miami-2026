"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export type HarvverseLiveAgentLotPreview = {
  code: string;
  name: string;
};

export type HarvverseLiveAgentProps = {
  variant?: "lot" | "dashboard" | "proposal";
  lotCode?: string;
  farmName?: string;
  region?: string;
  ticketLabel?: string;
  yieldCapLabel?: string;
  splitLabel?: string;
  lotsPreview?: HarvverseLiveAgentLotPreview[];
  className?: string;
};

type Role = "agent" | "user";

type ChatMessage = {
  id: string;
  role: Role;
  body: string;
};

const MAX_WHAT_IF = 5;

const buildWelcome = (p: HarvverseLiveAgentProps): string => {
  if (p.variant === "proposal" && p.lotCode && p.farmName) {
    return (
      `You’re confirming the proposal for ${p.farmName} (${p.lotCode}). Ticket ${p.ticketLabel ?? "—"}, yield cap ${p.yieldCapLabel ?? "—"}, ` +
      `split ${p.splitLabel ?? "—"}. Ask before you sign — answers follow locked hashes only.`
    );
  }
  if (p.variant === "dashboard" && p.lotsPreview?.length) {
    const names = p.lotsPreview.map(l => `${l.name} (${l.code})`).join(", ");
    return (
      `Hi — I’m the Harvverse assistant. You have ${p.lotsPreview.length} demo lots on file (${names}). ` +
      `Ask about ticket size, farmer split, yield caps, or which lot fits your budget. I explain locked plan terms only — I never rewrite on-chain numbers.`
    );
  }
  if (p.lotCode && p.farmName) {
    return (
      `You’re reviewing ${p.farmName} (${p.lotCode}). Ticket ${p.ticketLabel ?? "—"}, yield cap ${p.yieldCapLabel ?? "—"}, ` +
      `farmer split ${p.splitLabel ?? "—"}. Ask “what if” questions about harvest or economics — I’ll reason from the locked plan, not alter settlement math.`
    );
  }
  return (
    `Hi — I’m the Harvverse assistant. Ask about available lots, ticket economics, or how deterministic settlement works in this demo. ` +
    `I provide context only; nothing here is financial advice.`
  );
};

const replyForUserText = (text: string, p: HarvverseLiveAgentProps): string => {
  const q = text.toLowerCase();
  if (q.includes("split") || q.includes("60") || q.includes("40")) {
    return (
      `The farmer/partner split is fixed in the plan hash for this lot (${p.splitLabel ?? "see terms panel"}). ` +
      `It can’t be changed after you lock the proposal — if you need different economics, you’d need a new approved plan on-chain (not available in this demo flow).`
    );
  }
  if (q.includes("yield") || q.includes("qq") || q.includes("cap")) {
    return (
      `Year-1 settlement uses the locked yield cap (${p.yieldCapLabel ?? "plan terms"}) and the fixed \$/lb price from the plan. ` +
      `If actual harvest exceeds the cap, the model still settles against the cap — that’s why it’s called deterministic.`
    );
  }
  if (q.includes("ticket") || q.includes("usdc") || q.includes("price")) {
    return (
      `Your ticket is ${p.ticketLabel ?? "set in the active plan"} paid in demo MockUSDC. It funds the agronomic line item in the partnership bundle; ` +
      `payouts follow the locked revenue equation at settlement time.`
    );
  }
  if (q.includes("lot") && p.lotsPreview?.length) {
    return p.lotsPreview.map(l => `• ${l.name} · ${l.code}`).join("\n");
  }
  return (
    `In this testnet demo, every figure comes from the canonical plan and proposal hashes — not from chat. ` +
    `Try asking about yield caps, the farmer split, or how settlement uses milestone evidence.`
  );
};

export const HarvverseLiveAgent = ({
  variant = "lot",
  lotCode,
  farmName,
  region,
  ticketLabel,
  yieldCapLabel,
  splitLabel,
  lotsPreview,
  className,
}: HarvverseLiveAgentProps) => {
  const titleId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [remaining, setRemaining] = useState(MAX_WHAT_IF);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "agent",
      body: buildWelcome({ variant, lotCode, farmName, ticketLabel, yieldCapLabel, splitLabel, lotsPreview }),
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "agent",
        body: buildWelcome({ variant, lotCode, farmName, ticketLabel, yieldCapLabel, splitLabel, lotsPreview }),
      },
    ]);
    setRemaining(MAX_WHAT_IF);
  }, [variant, lotCode, farmName, ticketLabel, yieldCapLabel, splitLabel, lotsPreview]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const send = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || remaining <= 0 || pending) return;

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", body: trimmed };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setPending(true);
      setRemaining(r => Math.max(0, r - 1));

      window.setTimeout(() => {
        const answer = replyForUserText(trimmed, {
          variant,
          lotCode,
          farmName,
          ticketLabel,
          yieldCapLabel,
          splitLabel,
          lotsPreview,
        });
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "agent", body: answer }]);
        setPending(false);
      }, 420);
    },
    [pending, remaining, variant, lotCode, farmName, ticketLabel, yieldCapLabel, splitLabel, lotsPreview],
  );

  const quickActions =
    variant === "dashboard"
      ? [
          { label: "Which lots are open right now?", q: "Which lots are open right now?" },
          { label: "Explain deterministic settlement", q: "How does deterministic settlement work?" },
        ]
      : [
          { label: "What if the actual yield is 10 qq?", q: "What if the actual yield is 10 qq?" },
          { label: "Can I change the 60/40 split?", q: "Can I change the 60/40 split?" },
        ];

  return (
    <section
      aria-labelledby={titleId}
      className={`flex min-h-[380px] flex-col rounded-xl border border-[color:var(--color-harv-mint)] bg-[color-mix(in_oklab,var(--color-harv-bg)_88%,var(--color-harv-purple))] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-harv-mint)_18%,transparent)] sm:p-5 ${className ?? ""}`}
    >
      <h3 id={titleId} className="text-sm font-semibold tracking-tight text-[color:var(--color-harv-text)]">
        Harvverse · <span className="text-[color:var(--color-harv-mint)]">AI Agent</span>
        {region ? (
          <span className="block text-xs font-normal text-muted-harv">
            {farmName} · {region}
          </span>
        ) : null}
      </h3>

      <div
        ref={scrollRef}
        className="mt-4 flex max-h-[280px] flex-1 flex-col gap-3 overflow-y-auto pr-1"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map(m =>
          m.role === "agent" ? (
            <div
              key={m.id}
              className="max-w-[95%] rounded-2xl rounded-bl-md bg-[color-mix(in_oklab,var(--color-harv-purple)_78%,#001020)] px-3.5 py-2.5 text-sm leading-relaxed text-[color:var(--color-harv-text)]"
            >
              {m.body.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </div>
          ) : (
            <div
              key={m.id}
              className="ml-auto max-w-[92%] rounded-2xl rounded-br-md border border-[color:var(--color-harv-mint)] bg-[color-mix(in_oklab,var(--color-harv-bg)_92%,transparent)] px-3.5 py-2.5 text-sm leading-relaxed text-[color:var(--color-harv-text)]"
            >
              {m.body}
            </div>
          ),
        )}
        {pending ? (
          <div className="max-w-[70%] rounded-2xl rounded-bl-md bg-[color-mix(in_oklab,var(--color-harv-purple)_40%,#001020)] px-3.5 py-2 text-sm text-muted-harv">
            Thinking…
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickActions.map(a => (
          <button
            key={a.label}
            type="button"
            disabled={remaining <= 0 || pending}
            onClick={() => send(a.q)}
            className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-harv-mint)] bg-transparent px-3 py-1.5 text-left text-xs font-medium text-[color:var(--color-harv-text)] transition hover:bg-[color-mix(in_oklab,var(--color-harv-mint)_12%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {a.label}
            <ArrowTopRightOnSquareIcon
              className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-harv-mint)]"
              aria-hidden
            />
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor={`${titleId}-input`} className="sr-only">
          Message to Harvverse assistant
        </label>
        <input
          id={`${titleId}-input`}
          value={input}
          disabled={remaining <= 0 || pending}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question…"
          className="input input-bordered input-sm min-h-10 flex-1 rounded-lg border-[color:var(--color-harv-mint)]/35 bg-[color-mix(in_oklab,var(--color-harv-bg)_90%,transparent)] text-sm text-[color:var(--color-harv-text)] placeholder:text-muted-harv"
        />
        <button type="submit" className="btn btn-primary btn-sm shrink-0 px-4" disabled={remaining <= 0 || pending}>
          Send
        </button>
      </form>

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-harv-mint)]">
        What-if iterations remaining {remaining}/{MAX_WHAT_IF}
      </p>
    </section>
  );
};
