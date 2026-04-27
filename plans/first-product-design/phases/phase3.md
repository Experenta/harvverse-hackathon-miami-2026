# Phase 3 — Discovery, Proposal, and AI Explanation

**Goal:** Replace the default home experience with Harvverse lot discovery, wallet-session authentication, deterministic proposal creation, and fallback-safe AI explanation. After this phase, a Digital Partner can review the active lot, create a proposal from canonical Convex data, and see a proposal hash ready for Phase 4 wallet transactions.

**Prerequisite:** Phase 1 generated ABIs exist for `PartnershipFactory`. Phase 2A-2D have landed schema, guards, lot/plan reads, and seeded Zafiro data. `NEXT_PUBLIC_CONVEX_URL` is configured for the Next.js app.

**Runs in PARALLEL with:** Late Phase 2 evidence-only work can continue while 3A/3D are built. Phase 4 UI shell can start after 3B freezes proposal return fields, but Phase 4 transaction execution waits until 3C proposal creation is complete.

**Skills to invoke:**

- `siwe` - Implement wallet-based login/session routes using `viem/siwe`, not the `siwe` npm package.
- `convex` - Build public mutations/actions with validators and correct internal function boundaries.
- `convex-setup-auth` - Invoke only if the team switches from MVP wallet sessions to Convex Auth/JWT; otherwise do not use `ctx.auth.getUserIdentity()`.
- `next-best-practices` - Keep App Router routes, route handlers, and client/server boundaries correct for Next.js 15.
- `vercel-react-best-practices` - Avoid data waterfalls across lot detail, proposal creation, and explanation UI.
- `frontend-design` - Build the active lot and proposal surfaces as a product UI, not a landing page.
- `openai-docs` - Invoke only if the optional explanation action uses OpenAI APIs; fallback copy must work without an LLM provider.
- `browser-use:browser` or `playwright` - Verify wallet session, proposal flow, responsive layout, and fallback explanation behavior.

**Acceptance Criteria:**

1. The home route renders the active Harvverse lot experience instead of the default Scaffold-ETH welcome page.
2. A connected wallet can complete a SIWE-style session and Convex can resolve the user role from `walletSessions`.
3. `createProposal` creates proposals only for available lots with approved plans and active `PartnershipFactory` deployment data.
4. The proposal hash computed in Convex matches `PartnershipFactory.expectedProposalHash(lotId, partner)` for the same chain, factory, lot, partner, ticket, farmer, and plan hash.
5. AI explanation output is optional, never computes financial terms, and falls back to deterministic text if the provider is missing, slow, or unsafe.
6. The proposal page shows ticket amount, projected preview, demo/legal boundary text, expiry state, and the `proposalHash` without exposing admin-only data.
7. Wrong-chain or missing-session states disable proposal creation with clear UI feedback.
8. `pnpm next:build` completes successfully after Convex provider wiring and route additions.
9. `pnpm next:check-types && pnpm hardhat:check-types` passes without errors.

---

## Subphase Dependency Graph

```
3A (SIWE/session provider) ───────────────┐
                                          ├── 3D (lot + proposal routes) ──→ 3F (browser QA)
3B (finance/hash helpers) ───┬────────────┤
                             │            │
                             └── 3C (proposal mutation) ────────────────┘

3E (AI explanation action) ───────────────────────────────┘
```

**Optimal execution:**

1. Start 3A and 3B together; they touch separate Convex/Next utility files.
2. Start 3E in parallel because it depends on proposal facts shape but not transaction hooks.
3. Start 3C after 3B and Phase 2 deployment records are stable.
4. Start 3D as soon as 3A session state and 2C lot reads are callable; wire proposal creation when 3C lands.
5. Run 3F before Phase 4 transaction buttons consume proposal props.

**Estimated time:** 3-4 days

---

## Subphases

### 3A — Convex Provider and Wallet Session Flow

**Type:** Full-Stack
**Parallelizable:** Yes - independent of proposal math, but blocks protected proposal mutations.

**What:** Add Convex React provider wiring, optional SIWE route handlers, and Convex session lifecycle functions for wallet nonce, verification, viewer state, and logout.

**Why:** Partner proposals must be tied to a wallet-controlled session. Wallet connection alone is not authorization.

**Where:**

- `packages/nextjs/components/ScaffoldEthAppWithProviders.tsx` (modify)
- `packages/nextjs/services/convex/api.ts` (new)
- `packages/nextjs/services/convex/dataModel.ts` (new)
- `packages/nextjs/app/api/siwe/nonce/route.ts` (new)
- `packages/nextjs/app/api/siwe/verify/route.ts` (new)
- `packages/nextjs/app/api/siwe/session/route.ts` (new)
- `packages/nextjs/services/siwe/useWalletSession.ts` (new)
- `packages/nextjs/utils/siwe.ts` (new, if using `iron-session`)
- `convex/auth/sessions.ts` (modify)

**How:**

**Step 1: Add Convex provider inside the existing wagmi/query provider tree.**

```tsx
// Path: packages/nextjs/components/ScaffoldEthAppWithProviders.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConvexProvider client={convex}>
          <RainbowKitProvider
            avatar={BlockieAvatar}
            theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
          >
            <ProgressBar height="3px" color="#2299dd" />
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </RainbowKitProvider>
        </ConvexProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
```

**Step 2: Re-export generated Convex API through the Next.js alias boundary.**

```typescript
// Path: packages/nextjs/services/convex/api.ts
export { api } from "../../../../convex/_generated/api";
```

```typescript
// Path: packages/nextjs/services/convex/dataModel.ts
export type { Doc, Id } from "../../../../convex/_generated/dataModel";
```

**Step 3: Implement SIWE verification through viem.**

```typescript
// Path: packages/nextjs/app/api/siwe/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { verifySiweMessage } from "viem/siwe";

export async function POST(req: NextRequest) {
  const { message, signature, nonce } = await req.json();
  const domain = req.headers.get("host");
  if (!domain) return NextResponse.json({ error: "Missing Host header" }, { status: 400 });

  const publicClient = createPublicClient({ chain: hardhat, transport: http() });
  const valid = await verifySiweMessage(publicClient, { message, signature, nonce, domain });

  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
```

**Step 4: Expose a client hook for session-aware routes.**

```typescript
// Path: packages/nextjs/services/siwe/useWalletSession.ts
import { useEffect, useState } from "react";

export function useWalletSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/siwe/session")
      .then(response => (response.ok ? response.json() : null))
      .then(data => setSessionId(data?.sessionId ?? null))
      .catch(() => setSessionId(null));
  }, []);

  return { sessionId };
}
```

**Key implementation notes:**

- Use `viem/siwe`; do not install the `siwe` package.
- If `iron-session` is used, evaluate `IRON_SESSION_SECRET` lazily at request time so `next build` does not fail in local development.
- For public testnets or smart wallets, expand the SIWE verifier to select a `publicClient` by parsed chain ID.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/components/ScaffoldEthAppWithProviders.tsx` | Modify | Add `ConvexProvider` |
| `packages/nextjs/services/convex/api.ts` | Create | Re-export generated Convex API |
| `packages/nextjs/services/convex/dataModel.ts` | Create | Re-export generated Convex document/id types |
| `packages/nextjs/app/api/siwe/nonce/route.ts` | Create | Nonce route |
| `packages/nextjs/app/api/siwe/verify/route.ts` | Create | Domain-checked SIWE verification |
| `packages/nextjs/app/api/siwe/session/route.ts` | Create | Session read/delete |
| `packages/nextjs/services/siwe/useWalletSession.ts` | Create | Client session hook for routes |
| `packages/nextjs/utils/siwe.ts` | Create | Optional lazy `iron-session` helpers |
| `convex/auth/sessions.ts` | Modify | Create/complete/view wallet sessions |

---

### 3B — Deterministic Finance and Proposal Hash Helpers

**Type:** Convex Backend
**Parallelizable:** Yes - independent of UI and SIWE route implementation.

**What:** Add deterministic finance preview math and proposal hash helpers shared by proposal creation, explanation facts, and settlement preview.

**Why:** AI and UI can explain values, but cannot compute or alter the economic terms. Proposal hash parity is the bridge between Convex proposal records and onchain validation.

**Where:**

- `convex/model/finance.ts` (new)
- `convex/model/proposalHash.ts` (new)

**How:**

**Step 1: Implement exact preview math in cents.**

```typescript
// Path: convex/model/finance.ts
export function computePreview(args: {
  yieldTenthsQQ: number;
  priceCentsPerLb: number;
  agronomicCostCents: number;
  yieldCapTenthsQQ: number;
  splitFarmerBps: number;
}) {
  const cappedYield = Math.min(args.yieldTenthsQQ, args.yieldCapTenthsQQ);
  const revenueCents = Math.floor((cappedYield * 833 * args.priceCentsPerLb) / 100);
  const profitCents = Math.max(0, revenueCents - args.agronomicCostCents);
  const farmerCents = Math.floor((profitCents * args.splitFarmerBps) / 10_000);
  const partnerCents = profitCents - farmerCents;

  return { revenueCents, profitCents, farmerCents, partnerCents };
}
```

**Step 2: Encode the proposal hash exactly like Solidity.**

```typescript
// Path: convex/model/proposalHash.ts
import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";

export function computeProposalHash(args: {
  chainId: number;
  factoryAddress: `0x${string}`;
  onchainLotId: number;
  partnerWallet: `0x${string}`;
  ticketUsdcUnits: bigint;
  farmerWallet: `0x${string}`;
  planHash: `0x${string}`;
}) {
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters("uint256,address,uint256,address,uint256,address,bytes32"),
      [
        BigInt(args.chainId),
        args.factoryAddress,
        BigInt(args.onchainLotId),
        args.partnerWallet,
        args.ticketUsdcUnits,
        args.farmerWallet,
        args.planHash,
      ],
    ),
  );
}
```

**Step 3: Verify the Convex runtime can resolve `viem`.**

```bash
node -e "require.resolve('viem'); console.log('viem available')"
```

If Convex bundling cannot resolve `viem` from the workspace root, add a root dependency pinned to the installed Next.js version:

```bash
pnpm add -w viem@2.39.0
```

**Key implementation notes:**

- Keep `ticketUsdcUnits = BigInt(ticketCents) * 10_000n` for 6-decimal MockUSDC.
- Do not use floating point dollars in proposal or settlement math.
- The ABI tuple order must stay aligned with `PartnershipFactory.expectedProposalHash`.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/model/finance.ts` | Create | Deterministic preview math |
| `convex/model/proposalHash.ts` | Create | Solidity hash parity helper |
| `package.json` | Modify | Only if root Convex bundling cannot resolve `viem` |

---

### 3C — Proposal Creation and Facts API

**Type:** Convex Backend
**Parallelizable:** No - depends on 3A guards and 3B math/hash helpers.

**What:** Add partner proposal mutation and internal proposal fact readers for AI explanation and Phase 4 transaction pages.

**Why:** Partner signing must operate on a canonical proposal created from Convex and verified against onchain lot terms.

**Where:**

- `convex/partner/proposals.ts` (new)
- `convex/agent/internal.ts` (new)

**How:**

**Step 1: Create a proposal from canonical lot/plan/deployment state.**

```typescript
// Path: convex/partner/proposals.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireWalletSession } from "../auth/guards";
import { computePreview } from "../model/finance";
import { computeProposalHash } from "../model/proposalHash";

export const createProposal = mutation({
  args: { sessionId: v.string(), lotCode: v.string() },
  handler: async (ctx, args) => {
    const user = await requireWalletSession(ctx, args.sessionId, ["partner"]);
    const lot = await ctx.db.query("lots").withIndex("by_code", q => q.eq("code", args.lotCode)).unique();
    if (!lot || lot.status !== "available" || !lot.activePlanId || lot.onchainLotId === undefined) {
      throw new Error("Lot is not available for proposal");
    }

    const plan = await ctx.db.get(lot.activePlanId);
    if (!plan || plan.status !== "approved_for_demo") throw new Error("Plan is not approved");

    const deployment = await ctx.db
      .query("contractDeployments")
      .withIndex("by_chainKey_and_contractName", q =>
        q.eq("chainKey", "hardhat").eq("contractName", "PartnershipFactory"),
      )
      .unique();
    if (!deployment || !deployment.active) throw new Error("PartnershipFactory deployment missing");

    const ticketUsdcUnits = BigInt(plan.ticketCents) * 10_000n;
    const preview = computePreview({
      yieldTenthsQQ: plan.projectedYieldY1TenthsQQ,
      priceCentsPerLb: plan.priceCentsPerLb,
      agronomicCostCents: plan.agronomicCostCents,
      yieldCapTenthsQQ: plan.yieldCapY1TenthsQQ,
      splitFarmerBps: plan.splitFarmerBps,
    });

    const proposalHash = computeProposalHash({
      chainId: deployment.chainId,
      factoryAddress: deployment.address as `0x${string}`,
      onchainLotId: lot.onchainLotId,
      partnerWallet: user.walletAddress as `0x${string}`,
      ticketUsdcUnits,
      farmerWallet: lot.farmerWallet as `0x${string}`,
      planHash: plan.planHash as `0x${string}`,
    });

    const now = Date.now();
    const proposalId = await ctx.db.insert("proposals", {
      lotId: lot._id,
      planId: plan._id,
      userId: user._id,
      walletAddress: user.walletAddress,
      partnershipType: "phygital",
      status: "pending",
      ...preview,
      proposalHash,
      expiresAt: now + 10 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });

    return { proposalId, proposalHash, onchainLotId: lot.onchainLotId, ticketUsdcUnits: ticketUsdcUnits.toString() };
  },
});
```

**Step 2: Add a partner-scoped proposal read for the confirmation route.**

```typescript
// Path: convex/partner/proposals.ts
export const getMyProposal = query({
  args: { sessionId: v.string(), proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireWalletSession(ctx, args.sessionId, ["partner"]);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal || proposal.userId !== user._id) return null;
    const lot = await ctx.db.get(proposal.lotId);
    const plan = await ctx.db.get(proposal.planId);
    return { proposal, lot, plan };
  },
});
```

**Key implementation notes:**

- `contractDeployments` should have only one active deployment per `(chainKey, contractName)`; if multiple records are possible, add an active-specific query helper.
- Proposal TTL is part of the signed intent surface; expired proposals should not be reused.
- Never let the client submit ticket amount, farmer split, or plan economics.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/partner/proposals.ts` | Create | Proposal create/read functions |
| `convex/agent/internal.ts` | Create | Internal proposal facts and agent event writes |

---

### 3D — Discovery and Proposal UI

**Type:** Frontend
**Parallelizable:** Yes - can start after 2C lot reads and 3A provider wiring, then connect proposal mutation when 3C lands.

**What:** Build public active lot, lot detail, and proposal confirmation routes using DaisyUI and `@scaffold-ui/components` for web3 UI elements.

**Why:** The demo first screen must be the usable Harvverse experience, not marketing or the default SE-2 starter page.

**Where:**

- `packages/nextjs/app/page.tsx` (modify)
- `packages/nextjs/app/partner/lots/[lotCode]/page.tsx` (new)
- `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` (new)
- `packages/nextjs/app/partner/_components/LotSummary.tsx` (new)
- `packages/nextjs/app/partner/_components/ProposalPanel.tsx` (new)
- `packages/nextjs/app/partner/layout.tsx` (new)

**How:**

**Step 1: Replace the default home page with the active lot experience.**

```tsx
// Path: packages/nextjs/app/page.tsx
"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "~~/services/convex/api";

export default function Home() {
  const lots = useQuery(api.partner.lots.listPublishedLots);
  const activeLot = lots?.[0];

  return (
    <main className="min-h-screen bg-base-200">
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg bg-base-100 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-success">Testnet demo</p>
          <h1 className="mt-2 text-3xl font-bold">Finca Zafiro coffee partnership</h1>
          <p className="mt-4 text-base-content/75">
            Review the lot, sign with your wallet, and inspect deterministic settlement proof.
          </p>
          {activeLot ? (
            <Link className="btn btn-primary mt-6" href={`/partner/lots/${activeLot.code}`}>
              Review lot
            </Link>
          ) : (
            <span className="loading loading-spinner mt-6" />
          )}
        </div>
        <div className="rounded-lg bg-base-100 p-6 shadow-sm">
          <div className="stat">
            <div className="stat-title">Demo ticket</div>
            <div className="stat-value">$3,425</div>
            <div className="stat-desc">Paid in demo MockUSDC on testnet</div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

**Step 2: Add a client proposal CTA that calls Convex mutation.**

```tsx
// Path: packages/nextjs/app/partner/_components/ProposalPanel.tsx
"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "~~/services/convex/api";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

export function ProposalPanel({ sessionId, lotCode }: { sessionId: string; lotCode: string }) {
  const router = useRouter();
  const createProposal = useMutation(api.partner.proposals.createProposal);

  const onCreate = async () => {
    try {
      const result = await createProposal({ sessionId, lotCode });
      router.push(`/partner/proposals/${result.proposalId}`);
    } catch (error) {
      notification.error(getParsedError(error));
    }
  };

  return (
    <button className="btn btn-primary w-full" onClick={onCreate}>
      Create wallet proposal
    </button>
  );
}
```

**Key implementation notes:**

- Use DaisyUI components where they fit; avoid raw Tailwind replacements for common buttons/cards.
- Avoid in-app instructional prose about keyboard shortcuts or implementation details.
- Keep financial language explicit: "testnet demo", "demo MockUSDC", and "not financial advice".

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/page.tsx` | Modify | Active lot first screen |
| `packages/nextjs/app/partner/layout.tsx` | Create | Partner route wrapper |
| `packages/nextjs/app/partner/lots/[lotCode]/page.tsx` | Create | Lot detail route |
| `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` | Create | Proposal confirmation route |
| `packages/nextjs/app/partner/_components/LotSummary.tsx` | Create | Lot detail component |
| `packages/nextjs/app/partner/_components/ProposalPanel.tsx` | Create | Proposal CTA |

---

### 3E — AI Explanation With Deterministic Fallback

**Type:** Convex Backend
**Parallelizable:** Yes - can be built in parallel with UI once `agent/internal.ts` fact shape is agreed.

**What:** Add an optional explanation action that reads locked proposal facts, records agent events, and returns fallback-safe text when LLM output is unavailable.

**Why:** The demo benefits from explanation, but AI must not become a source of truth for terms, payouts, eligibility, or legal advice.

**Where:**

- `convex/agent/explainProposal.ts` (new)
- `convex/agent/internal.ts` (modify)

**How:**

**Step 1: Add internal fact and event helpers.**

```typescript
// Path: convex/agent/internal.ts
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const readProposalFacts = internalQuery({
  args: { sessionId: v.string(), proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("Proposal not found");
    const lot = await ctx.db.get(proposal.lotId);
    const plan = await ctx.db.get(proposal.planId);
    if (!lot || !plan) throw new Error("Proposal facts missing");
    return { proposal, lot, plan };
  },
});

export const appendAgentEvent = internalMutation({
  args: {
    proposalId: v.id("proposals"),
    eventType: v.union(
      v.literal("explanation_start"),
      v.literal("explanation_complete"),
      v.literal("whatif_complete"),
      v.literal("fallback_used"),
      v.literal("error"),
    ),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agentEvents", { proposalId: args.proposalId, eventType: args.eventType, text: args.text, createdAt: Date.now() });
  },
});
```

**Step 2: Keep the action text-only and fallback-safe.**

```typescript
// Path: convex/agent/explainProposal.ts
"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

export const explainProposal = action({
  args: { sessionId: v.string(), proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const facts = await ctx.runQuery(internal.agent.internal.readProposalFacts, args);
    const fallbackText =
      `This is a testnet demo for ${facts.lot.code}. The ticket is $${facts.plan.ticketCents / 100}, ` +
      `and settlement is computed from locked plan terms and harvest fixture data.`;

    await ctx.runMutation(internal.agent.internal.appendAgentEvent, {
      proposalId: args.proposalId,
      eventType: "fallback_used",
      text: fallbackText,
    });

    return { mode: "fallback", text: fallbackText };
  },
});
```

**Key implementation notes:**

- Actions cannot use `ctx.db`; use `ctx.runQuery` and `ctx.runMutation` with `internal` references.
- Add `"use node";` only if the action uses Node-only provider SDKs or environment behavior.
- If OpenAI is selected, use `openai-docs` and official OpenAI docs before adding provider-specific code.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/agent/explainProposal.ts` | Create | Optional explanation action |
| `convex/agent/internal.ts` | Modify | Fact reads and event logging |

---

### 3F — Proposal Flow QA

**Type:** QA
**Parallelizable:** No - validates the integrated session, proposal, UI, and explanation flow before Phase 4 signing work begins.

**What:** Verify local Convex, Next.js, wallet session, proposal hash parity, fallback text, and responsive UI behavior.

**Why:** Phase 4 wallet transactions require reliable proposal props. Catching hash or session issues after transaction UI is built creates rework across Convex and Next.js.

**Where:**

- `packages/nextjs/app/page.tsx` (verify)
- `packages/nextjs/app/partner/lots/[lotCode]/page.tsx` (verify)
- `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` (verify)
- `convex/partner/proposals.ts` (verify)

**How:**

**Step 1: Run the local services.**

```bash
npx convex dev
pnpm start
```

**Step 2: Verify type/build gates.**

```bash
pnpm next:check-types
pnpm next:build
```

**Step 3: Use browser automation for the critical flow.**

```bash
# Use browser-use:browser or playwright against http://localhost:3000
# Verify: home renders active lot, lot detail loads, wallet/session state appears,
# create proposal navigates to /partner/proposals/[proposalId],
# fallback explanation appears without blocking the CTA.
```

**Key implementation notes:**

- Browser testing can skip actual Phase 4 transactions; proposal creation is the Phase 3 boundary.
- Check mobile and desktop widths for text overflow in ticket/projection panels.
- Wrong-chain and missing-session states should disable proposal creation.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/page.tsx` | Verify | Active lot screen |
| `packages/nextjs/app/partner/lots/[lotCode]/page.tsx` | Verify | Lot detail |
| `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` | Verify | Proposal confirmation |
| `convex/partner/proposals.ts` | Verify | Proposal mutation and reads |

---

## Phase Summary

| File | Action | Subphase |
| --- | --- | --- |
| `packages/nextjs/components/ScaffoldEthAppWithProviders.tsx` | Modify | 3A |
| `packages/nextjs/services/convex/api.ts` | Create | 3A |
| `packages/nextjs/services/convex/dataModel.ts` | Create | 3A |
| `packages/nextjs/app/api/siwe/nonce/route.ts` | Create | 3A |
| `packages/nextjs/app/api/siwe/verify/route.ts` | Create | 3A |
| `packages/nextjs/app/api/siwe/session/route.ts` | Create | 3A |
| `packages/nextjs/services/siwe/useWalletSession.ts` | Create | 3A |
| `packages/nextjs/utils/siwe.ts` | Create | 3A |
| `convex/auth/sessions.ts` | Modify | 3A |
| `convex/model/finance.ts` | Create | 3B |
| `convex/model/proposalHash.ts` | Create | 3B |
| `package.json` | Modify | 3B |
| `convex/partner/proposals.ts` | Create | 3C |
| `convex/agent/internal.ts` | Create / Modify | 3C, 3E |
| `packages/nextjs/app/page.tsx` | Modify | 3D |
| `packages/nextjs/app/partner/layout.tsx` | Create | 3D |
| `packages/nextjs/app/partner/lots/[lotCode]/page.tsx` | Create | 3D |
| `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` | Create | 3D |
| `packages/nextjs/app/partner/_components/LotSummary.tsx` | Create | 3D |
| `packages/nextjs/app/partner/_components/ProposalPanel.tsx` | Create | 3D |
| `convex/agent/explainProposal.ts` | Create | 3E |
