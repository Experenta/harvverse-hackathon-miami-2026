# Phase 4 — Partner Signing and Certificate Mint

**Goal:** Let a Digital Partner approve demo MockUSDC and open a partnership from their own connected wallet, then reconcile the chain event into Convex partnership and certificate state. After this phase, a signed proposal becomes an active partnership with a non-transferable certificate and explorer-backed proof.

**Prerequisite:** Phase 1 generated ABIs include `MockUSDC`, `PartnershipFactory`, and `LotCertificate`. Phase 2 has schema, deployment registration, guards, and seeded lot/plan data. Phase 3 proposal creation returns `proposalId`, `proposalHash`, `onchainLotId`, and `ticketUsdcUnits`.

**Runs in PARALLEL with:** Phase 5 backend/admin evidence skeleton can run in parallel after Phase 4A transaction recording shape is stable. Final Phase 5 evidence attestation testing waits for at least one reconciled partnership from this phase.

**Skills to invoke:**

- `blockchain-developer` - Preserve wallet-owned financial intent and testnet-only custody boundaries.
- `openzeppelin` - Verify `SafeERC20`, access control, and non-reentrancy behavior when debugging `openPartnership`.
- `erc-721` - Validate certificate minting, non-transferability, metadata/proof display, and wallet rendering caveats.
- `convex` - Implement transaction submission records and internal reconciliation with validators.
- `convex-performance-audit` - Review event-sync polling, transaction status indexes, and dashboard reads before demo freeze.
- `next-best-practices` - Keep transaction components as client components and route pages within App Router conventions.
- `frontend-design` - Build a clear two-step approval/open flow with professional states and no misleading investment language.
- `browser-use:browser` or `playwright` - Verify wallet prompts, wrong-chain states, minted certificate view, and responsive UI.

**Acceptance Criteria:**

1. Proposal confirmation displays the exact ticket units, proposal hash, partner wallet, target chain, and `PartnershipFactory` address before any transaction prompt.
2. The partner must sign `MockUSDC.approve(PartnershipFactory, ticketUsdcUnits)` from their wallet before `openPartnership`.
3. The partner must sign `PartnershipFactory.openPartnership(onchainLotId, proposalHash)` from their wallet; Convex never submits this transaction.
4. Submitted approval and open-partnership transaction hashes are recorded in `chainTransactions` with role-scoped authorization.
5. Event reconciliation verifies chain ID, contract address, event name, partner wallet, lot ID, proposal hash, ticket amount, and receipt status before marking a proposal signed.
6. A reconciled `PartnershipOpened` event creates one `partnerships` row with `status: "active"` and stores `onchainPartnershipId` and `openedTxHash`.
7. The partner dashboard shows certificate proof and transaction links without relying on wallet NFT indexing.
8. Rejected wallet prompts, expired proposals, duplicate submissions, missing approval, and wrong-chain states render recoverable UI feedback.
9. `pnpm next:build && pnpm hardhat:test` passes without errors.
10. `pnpm next:check-types && pnpm hardhat:check-types` passes without errors.

---

## Subphase Dependency Graph

```
4A (tx record + status model) ───────────┬── 4B (approve/open UI) ─────┐
                                          │                              │
4C (event reconciliation) ────────────────┘                              ├── 4E (partner dashboard)
                                                                         │
4D (certificate read helpers) ───────────────────────────────────────────┘

4B + 4C + 4E complete ──→ 4F (wallet/browser QA)
```

**Optimal execution:**

1. Start 4A and 4D together; they touch separate Convex modules.
2. Start 4B after 4A defines transaction recording and Phase 3 proposal route props are stable.
3. Start 4C once deployed event ABI names are frozen; it can run in parallel with 4B.
4. Start 4E after 4D helpers and 4C status updates are defined.
5. Use 4F to verify the full wallet flow before milestone fixture work depends on active partnerships.

**Estimated time:** 3-4 days

---

## Subphases

### 4A — Submitted Transaction Recording

**Type:** Convex Backend
**Parallelizable:** Yes - independent of frontend transaction UI after function arguments are agreed.

**What:** Add a shared mutation for recording submitted transaction hashes across approval, open partnership, evidence attestation, funding, and settlement flows.

**Why:** Chain hashes are client-submitted hints, not final proof. Recording them gives event sync a queue without trusting client claims.

**Where:**

- `convex/chain/transactions.ts` (new)

**How:**

**Step 1: Define transaction type validator and mutation.**

```typescript
// Path: convex/chain/transactions.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireWalletSession } from "../auth/guards";

const txType = v.union(
  v.literal("mock_usdc_approval"),
  v.literal("open_partnership"),
  v.literal("evidence_attestation"),
  v.literal("fund_settlement"),
  v.literal("settlement"),
);

export const recordSubmitted = mutation({
  args: {
    sessionId: v.string(),
    txHash: v.string(),
    txType,
    proposalId: v.optional(v.id("proposals")),
    partnershipId: v.optional(v.id("partnerships")),
    settlementId: v.optional(v.id("settlements")),
  },
  handler: async (ctx, args) => {
    const user = await requireWalletSession(ctx, args.sessionId, [
      "partner",
      "admin",
      "verifier",
      "settlement_operator",
      "custodian",
    ]);

    const now = Date.now();
    return await ctx.db.insert("chainTransactions", {
      txHash: args.txHash.toLowerCase(),
      chainKey: "hardhat",
      type: args.txType,
      status: "submitted",
      submittedByWallet: user.walletAddress,
      ...(args.proposalId ? { relatedProposalId: args.proposalId } : {}),
      ...(args.partnershipId ? { relatedPartnershipId: args.partnershipId } : {}),
      ...(args.settlementId ? { relatedSettlementId: args.settlementId } : {}),
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

**Step 2: Add partner-scoped submitted transaction reads.**

```typescript
// Path: convex/chain/transactions.ts
export const listForProposal = query({
  args: { sessionId: v.string(), proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await requireWalletSession(ctx, args.sessionId, ["partner", "admin"]);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal || (user.role === "partner" && proposal.userId !== user._id)) return [];

    const rows = await ctx.db.query("chainTransactions").withIndex("by_status", q => q.eq("status", "submitted")).take(50);
    return rows.filter(row => row.relatedProposalId === args.proposalId);
  },
});
```

**Key implementation notes:**

- The `listForProposal` example is bounded but not ideal; add a `by_relatedProposalId` index if dashboard polling needs it.
- Do not mark proposals signed in `recordSubmitted`.
- Store hashes consistently and reconcile by receipt/logs before state changes.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/chain/transactions.ts` | Create | Submitted transaction queue and reads |

---

### 4B — Partner Approval and Open-Partnership UI

**Type:** Frontend
**Parallelizable:** Yes - depends on 4A mutation shape and Phase 3 proposal fields, but can run while 4C reconciliation is built.

**What:** Add a client transaction component that prompts for MockUSDC approval, then opens the partnership with `useScaffoldWriteContract`.

**Why:** Financial intent must be signed by the partner wallet. Convex cannot approve tokens or open partnerships on behalf of users.

**Where:**

- `packages/nextjs/app/partner/proposals/[proposalId]/ConfirmPartnershipButton.tsx` (new)
- `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` (modify)

**How:**

**Step 1: Build the transaction button with Scaffold-ETH hooks.**

```tsx
// Path: packages/nextjs/app/partner/proposals/[proposalId]/ConfirmPartnershipButton.tsx
"use client";

import { useMutation } from "convex/react";
import { useAccount } from "wagmi";
import { api } from "~~/services/convex/api";
import type { Id } from "~~/services/convex/dataModel";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type Props = {
  sessionId: string;
  proposalId: Id<"proposals">;
  onchainLotId: bigint;
  proposalHash: `0x${string}`;
  ticketUsdcUnits: bigint;
};

export function ConfirmPartnershipButton({
  sessionId,
  proposalId,
  onchainLotId,
  proposalHash,
  ticketUsdcUnits,
}: Props) {
  const { address } = useAccount();
  const recordSubmitted = useMutation(api.chain.transactions.recordSubmitted);
  const { data: factory } = useDeployedContractInfo({ contractName: "PartnershipFactory" });
  const { writeContractAsync: approveUsdc, isMining: isApproving } = useScaffoldWriteContract({
    contractName: "MockUSDC",
  });
  const { writeContractAsync: openPartnership, isMining: isOpening } = useScaffoldWriteContract({
    contractName: "PartnershipFactory",
  });

  const onConfirm = async () => {
    if (!address || !factory) return;

    try {
      const approvalTxHash = await approveUsdc({
        functionName: "approve",
        args: [factory.address, ticketUsdcUnits],
      });
      if (approvalTxHash) {
        await recordSubmitted({
          sessionId,
          txHash: approvalTxHash,
          txType: "mock_usdc_approval",
          proposalId,
        });
      }

      const openTxHash = await openPartnership({
        functionName: "openPartnership",
        args: [onchainLotId, proposalHash],
      });
      if (openTxHash) {
        await recordSubmitted({
          sessionId,
          txHash: openTxHash,
          txType: "open_partnership",
          proposalId,
        });
      }
    } catch (error) {
      notification.error(getParsedError(error));
    }
  };

  return (
    <button className="btn btn-primary w-full" disabled={!address || isApproving || isOpening} onClick={onConfirm}>
      {isApproving ? "Approving demo USDC..." : isOpening ? "Opening partnership..." : "Confirm partnership"}
    </button>
  );
}
```

**Step 2: Render immutable proposal details above the button.**

```tsx
// Path: packages/nextjs/app/partner/proposals/[proposalId]/page.tsx
<div className="rounded-lg bg-base-100 p-6 shadow-sm">
  <h1 className="text-2xl font-bold">Confirm testnet partnership</h1>
  <dl className="mt-4 grid gap-3 text-sm">
    <div className="flex justify-between gap-4">
      <dt className="text-base-content/60">Proposal hash</dt>
      <dd className="font-mono break-all">{proposal.proposal.proposalHash}</dd>
    </div>
  </dl>
  <ConfirmPartnershipButton
    sessionId={sessionId}
    proposalId={proposal.proposal._id}
    onchainLotId={BigInt(proposal.lot.onchainLotId)}
    proposalHash={proposal.proposal.proposalHash as `0x${string}`}
    ticketUsdcUnits={BigInt(ticketUsdcUnits)}
  />
</div>
```

**Key implementation notes:**

- Use `useScaffoldWriteContract`, not older hook names.
- Keep approval and partnership opening as two explicit prompts unless EIP-5792 batching is intentionally added later.
- Disable the button when the proposal is expired, signed, failed, or wrong-chain.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/partner/proposals/[proposalId]/ConfirmPartnershipButton.tsx` | Create | Approval/open transaction component |
| `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` | Modify | Proposal details and CTA |

---

### 4C — Partnership Event Reconciliation

**Type:** Convex Backend
**Parallelizable:** Yes - can run while frontend transaction UI is built, but final testing requires submitted transactions.

**What:** Add internal event sync for submitted transactions and update proposals/partnerships only after verified receipts and decoded logs.

**Why:** Client-submitted hashes can be wrong, reverted, or unrelated. Convex must reconcile chain evidence before moving app state.

**Where:**

- `convex/chain/events.ts` (new)
- `convex/chain/internal.ts` (new)
- `convex/crons.ts` (new or modify)

**How:**

**Step 1: Add an internal sync action.**

```typescript
// Path: convex/chain/events.ts
"use node";

import { v } from "convex/values";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { internalAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const syncSubmittedTransaction = internalAction({
  args: { transactionId: v.id("chainTransactions") },
  handler: async (ctx, args) => {
    const tx = await ctx.runQuery(internal.chain.internal.getTransactionForSync, args);
    if (!tx) return null;

    const client = createPublicClient({ chain: hardhat, transport: http() });
    const receipt = await client.getTransactionReceipt({ hash: tx.txHash as `0x${string}` });
    if (receipt.status !== "success") {
      await ctx.runMutation(internal.chain.events.markTransactionReverted, args);
      return null;
    }

    // Decode logs and pass verified event payload to an internal mutation.
    return { blockNumber: Number(receipt.blockNumber) };
  },
});
```

**Step 2: Add the internal transaction read used by the action.**

```typescript
// Path: convex/chain/internal.ts
import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getTransactionForSync = internalQuery({
  args: { transactionId: v.id("chainTransactions") },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx || tx.status !== "submitted") return null;
    return tx;
  },
});
```

**Step 3: Keep database writes in internal mutations.**

```typescript
// Path: convex/chain/events.ts
export const markPartnershipOpened = internalMutation({
  args: {
    transactionId: v.id("chainTransactions"),
    proposalId: v.id("proposals"),
    onchainPartnershipId: v.number(),
    openedTxHash: v.string(),
    blockNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal || proposal.status === "signed") return null;

    const lot = await ctx.db.get(proposal.lotId);
    if (!lot) throw new Error("Lot missing");

    const partnershipId = await ctx.db.insert("partnerships", {
      proposalId: proposal._id,
      lotId: proposal.lotId,
      planId: proposal.planId,
      partnerUserId: proposal.userId,
      partnerWallet: proposal.walletAddress,
      farmerWallet: lot.farmerWallet,
      status: "active",
      chainKey: "hardhat",
      onchainPartnershipId: args.onchainPartnershipId,
      openedTxHash: args.openedTxHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.patch(proposal._id, { status: "signed", submittedTxHash: args.openedTxHash, updatedAt: Date.now() });
    await ctx.db.patch(args.transactionId, { status: "confirmed", relatedPartnershipId: partnershipId, blockNumber: args.blockNumber, updatedAt: Date.now() });
    return partnershipId;
  },
});
```

**Key implementation notes:**

- Actions cannot use `ctx.db`; use internal queries/mutations.
- Verify the log emitter equals the active `PartnershipFactory` deployment.
- Verify proposal hash and partner wallet against the proposal record before state changes.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/chain/events.ts` | Create | Internal chain receipt/log reconciliation |
| `convex/chain/internal.ts` | Create | Internal transaction reads for actions |
| `convex/crons.ts` | Create / Modify | Poll submitted transactions |

---

### 4D — Partnership and Certificate Read Helpers

**Type:** Convex Backend
**Parallelizable:** Yes - independent of transaction UI after partnership table shape is stable.

**What:** Add partner dashboard queries that return active partnerships, certificate IDs when reconciled, and transaction proof links.

**Why:** The demo should not depend on a wallet or marketplace displaying the testnet NFT. The app must show its own certificate/proof view.

**Where:**

- `convex/partner/partnerships.ts` (new)

**How:**

**Step 1: Add a partner-scoped dashboard query.**

```typescript
// Path: convex/partner/partnerships.ts
import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireWalletSession } from "../auth/guards";

export const myDashboard = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireWalletSession(ctx, args.sessionId, ["partner"]);
    const partnerships = await ctx.db
      .query("partnerships")
      .withIndex("by_partnerUserId", q => q.eq("partnerUserId", user._id))
      .take(20);

    return await Promise.all(
      partnerships.map(async partnership => {
        const lot = await ctx.db.get(partnership.lotId);
        const plan = await ctx.db.get(partnership.planId);
        return { partnership, lot, plan };
      }),
    );
  },
});
```

**Key implementation notes:**

- Keep dashboard reads bounded.
- Show certificate state even when `certificateTokenId` is not yet known; the `openedTxHash` and `proposalHash` are still proof.
- Add `certificateTokenId` reconciliation if the contract emits or exposes enough data for reliable mapping.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/partner/partnerships.ts` | Create | Partner dashboard data |

---

### 4E — Partner Dashboard and Certificate View

**Type:** Frontend
**Parallelizable:** Yes - depends on 4D query shape and can run while 4C event sync is being hardened.

**What:** Add a partner dashboard route with active partnership status, certificate proof, proposal hash, and transaction links.

**Why:** Judges and partners need a readable proof surface after signing, even if wallet NFT indexing lags on testnet.

**Where:**

- `packages/nextjs/app/partner/dashboard/page.tsx` (new)
- `packages/nextjs/app/partner/_components/CertificateProof.tsx` (new)

**How:**

**Step 1: Render dashboard data from Convex.**

```tsx
// Path: packages/nextjs/app/partner/dashboard/page.tsx
"use client";

import { useQuery } from "convex/react";
import { Address } from "@scaffold-ui/components";
import { api } from "~~/services/convex/api";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useWalletSession } from "~~/services/siwe/useWalletSession";

export default function PartnerDashboardPage() {
  const { sessionId } = useWalletSession();
  const rows = useQuery(api.partner.partnerships.myDashboard, sessionId ? { sessionId } : "skip");
  const { targetNetwork } = useTargetNetwork();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Partner dashboard</h1>
      <div className="mt-6 grid gap-4">
        {rows?.map(row => (
          <article key={row.partnership._id} className="rounded-lg bg-base-100 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{row.lot?.farmName}</h2>
              <span className="badge badge-success">{row.partnership.status}</span>
            </div>
            <Address address={row.partnership.partnerWallet as `0x${string}`} chain={targetNetwork} />
            <p className="mt-3 break-all font-mono text-xs">{row.partnership.openedTxHash}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
```

**Key implementation notes:**

- Use `Address` for wallet display and explorer links.
- Avoid representing the certificate as transferable or investment rights.
- Include transaction hashes and `proposalHash` as proof even when wallet NFT metadata is unavailable.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/partner/dashboard/page.tsx` | Create | Partner proof dashboard |
| `packages/nextjs/app/partner/_components/CertificateProof.tsx` | Create | Certificate/proof card |

---

### 4F — Wallet Transaction QA

**Type:** QA
**Parallelizable:** No - integrated gate for wallet, chain, Convex, and UI behavior.

**What:** Verify the full local flow from proposal to approval, open-partnership transaction, event reconciliation, partnership row, and dashboard proof.

**Why:** Phase 5 and Phase 6 depend on active partnership state and onchain partnership IDs.

**Where:**

- `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` (verify)
- `packages/nextjs/app/partner/dashboard/page.tsx` (verify)
- `convex/chain/events.ts` (verify)
- `convex/partner/partnerships.ts` (verify)

**How:**

**Step 1: Run local chain, deploy, Convex, and frontend.**

```bash
pnpm chain
pnpm contracts:deploy
npx convex dev
pnpm start
```

**Step 2: Execute the wallet flow.**

```text
1. Create a proposal from the lot detail page.
2. Fund the partner with demo MockUSDC if needed.
3. Approve MockUSDC.
4. Open partnership.
5. Wait for reconciliation.
6. Open partner dashboard and verify active partnership proof.
```

**Step 3: Run static gates.**

```bash
pnpm next:build
pnpm hardhat:test
pnpm next:check-types
pnpm hardhat:check-types
```

**Key implementation notes:**

- Test rejected wallet prompts and duplicate button clicks.
- Test with the wrong chain selected and with no MockUSDC balance.
- Leave event sync recoverable if a Convex write fails after the transaction is mined.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` | Verify | Transaction flow |
| `packages/nextjs/app/partner/dashboard/page.tsx` | Verify | Certificate/proof view |
| `convex/chain/events.ts` | Verify | Reconciliation |
| `convex/partner/partnerships.ts` | Verify | Dashboard data |

---

## Phase Summary

| File | Action | Subphase |
| --- | --- | --- |
| `convex/chain/transactions.ts` | Create | 4A |
| `packages/nextjs/app/partner/proposals/[proposalId]/ConfirmPartnershipButton.tsx` | Create | 4B |
| `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx` | Modify | 4B, 4F |
| `convex/chain/events.ts` | Create | 4C |
| `convex/chain/internal.ts` | Create | 4C |
| `convex/crons.ts` | Create / Modify | 4C |
| `convex/partner/partnerships.ts` | Create | 4D |
| `packages/nextjs/app/partner/dashboard/page.tsx` | Create | 4E |
| `packages/nextjs/app/partner/_components/CertificateProof.tsx` | Create | 4E |
