# Phase 6 — Settlement and Demo Proof

**Goal:** Create a harvest fixture, compute deterministic settlement, require testnet pool funding, execute `SettlementDistributor.settle` from the operator wallet, and reconcile final proof into the partner/admin UI. After this phase, the MVP can show exact settlement amounts, recipient wallets, evidence hash, and explorer links end to end.

**Prerequisite:** Phase 1 deployed `SettlementDistributor`, `MockUSDC`, and `PartnershipFactory`. Phase 4 produced an active partnership. Phase 5 moved that partnership to `awaiting_settlement` after six attested milestone fixtures.

**Runs in PARALLEL with:** 6A settlement intent backend and 6B funding UI can start while Phase 5 reconciliation is being finalized, using a seeded/mock `awaiting_settlement` partnership in local dev. 6C-6F final execution and proof wait for Phase 5 completion.

**Skills to invoke:**

- `blockchain-developer` - Preserve deterministic settlement, wallet-owned execution, and testnet-only custody boundaries.
- `openzeppelin` - Verify `SafeERC20`, `AccessControl`, and `ReentrancyGuard` behavior when debugging settlement execution.
- `convex` - Implement settlement intents, funding records, internal reconciliation, and guarded admin/operator/custodian functions.
- `convex-performance-audit` - Review settlement dashboard reads and chain sync before final demo.
- `next-best-practices` - Keep admin/custody route handlers and client transaction components App Router compliant.
- `frontend-design` - Build dense operational settlement screens and final proof views without marketing/investment language.
- `browser-use:browser` or `playwright` - Run the final end-to-end browser rehearsal across partner, admin, and custody views.

**Acceptance Criteria:**

1. Admin/operator can create one settlement intent only for a partnership in `awaiting_settlement`.
2. Settlement preview uses the same deterministic cents math as `SettlementDistributor.preview` for `yieldTenthsQQ`, capped yield, fixed price, cost basis, and farmer/partner split.
3. Custody/operator UI shows exact required MockUSDC funding, current settlement pool balance, and shortfall before execution.
4. Settlement execution is signed by a wallet with `SETTLEMENT_OPERATOR_ROLE`; Convex never signs or submits the transaction.
5. `SettlementDistributor.settle` transfers exact 6-decimal MockUSDC base units to farmer and partner and prevents duplicate settlement.
6. Reconciliation verifies `SettlementExecuted` emitter, partnership ID, evidence hash, computed amounts, receipt status, and transaction hash before marking settlement confirmed.
7. Partner dashboard and admin proof page show exact revenue, profit, farmer share, partner share, funding hash, settlement hash, and explorer links.
8. Underfunded pool, wrong wallet role, duplicate settlement, negative profit, and yield-above-cap scenarios have tested behavior and readable UI feedback.
9. `pnpm next:build && pnpm hardhat:test` passes without errors.
10. `pnpm next:check-types && pnpm hardhat:check-types` passes without errors.

---

## Subphase Dependency Graph

```
6A (settlement intent) ──────────────┬── 6C (settlement execution UI) ───┐
                                     │                                    │
6B (funding instruction UI) ─────────┤                                    ├── 6E (proof views)
                                     │                                    │
6D (settlement reconciliation) ──────┘                                    │
                                                                          │
6F (end-to-end QA + demo script) ◄────────────────────────────────────────┘
```

**Optimal execution:**

1. Start 6A and 6B in parallel once the settlement schema exists.
2. Start 6D by extending Phase 4/5 event-sync code while 6C UI is built.
3. Start 6C after 6A defines settlement input and funding status fields.
4. Start 6E when `settlements` and `partnerships` final statuses are stable.
5. Run 6F only after a Phase 5 partnership reaches `awaiting_settlement`.

**Estimated time:** 3-4 days

---

## Subphases

### 6A — Harvest Fixture and Settlement Intent

**Type:** Convex Backend
**Parallelizable:** Yes - independent of funding/execution UI after settlement table fields are stable.

**What:** Add admin/operator mutation to create a settlement intent from a harvest fixture and deterministic preview.

**Why:** Settlement execution should be prepared from locked plan terms and an evidence hash, not client-submitted payout amounts.

**Where:**

- `convex/admin/settlements.ts` (new)

**How:**

**Step 1: Create settlement intent from partnership and harvest evidence.**

```typescript
// Path: convex/admin/settlements.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireWalletSession } from "../auth/guards";
import { computePreview } from "../model/finance";

export const createSettlementIntent = mutation({
  args: {
    sessionId: v.string(),
    partnershipId: v.id("partnerships"),
    yieldTenthsQQ: v.number(),
    scaScoreTenths: v.number(),
    harvestEvidenceHash: v.string(),
  },
  handler: async (ctx, args) => {
    await requireWalletSession(ctx, args.sessionId, ["admin", "settlement_operator"]);
    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership || partnership.status !== "awaiting_settlement") {
      throw new Error("Partnership is not ready for settlement");
    }

    const existing = await ctx.db
      .query("settlements")
      .withIndex("by_partnershipId", q => q.eq("partnershipId", partnership._id))
      .unique();
    if (existing) return existing._id;

    const plan = await ctx.db.get(partnership.planId);
    if (!plan) throw new Error("Plan missing");

    const preview = computePreview({
      yieldTenthsQQ: args.yieldTenthsQQ,
      priceCentsPerLb: plan.priceCentsPerLb,
      agronomicCostCents: plan.agronomicCostCents,
      yieldCapTenthsQQ: plan.yieldCapY1TenthsQQ,
      splitFarmerBps: plan.splitFarmerBps,
    });

    const now = Date.now();
    return await ctx.db.insert("settlements", {
      partnershipId: partnership._id,
      status: "intent_created",
      year: 1,
      yieldTenthsQQ: args.yieldTenthsQQ,
      scaScoreTenths: args.scaScoreTenths,
      priceCentsPerLb: plan.priceCentsPerLb,
      ...preview,
      harvestEvidenceHash: args.harvestEvidenceHash,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

**Step 2: Add operator read for settlement intent and required funding.**

```typescript
// Path: convex/admin/settlements.ts
export const getSettlementIntent = query({
  args: { sessionId: v.string(), settlementId: v.id("settlements") },
  handler: async (ctx, args) => {
    await requireWalletSession(ctx, args.sessionId, ["admin", "settlement_operator", "custodian"]);
    const settlement = await ctx.db.get(args.settlementId);
    if (!settlement) return null;
    const requiredUsdcUnits = BigInt(settlement.farmerCents + settlement.partnerCents) * 10_000n;
    return { settlement, requiredUsdcUnits: requiredUsdcUnits.toString() };
  },
});

export const getActiveSettlementIntent = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    await requireWalletSession(ctx, args.sessionId, ["admin", "settlement_operator", "custodian"]);
    const intents = await ctx.db
      .query("settlements")
      .withIndex("by_status", q => q.eq("status", "intent_created"))
      .take(10);
    const settlement = intents[0] ?? null;
    if (!settlement) return null;
    const requiredUsdcUnits = BigInt(settlement.farmerCents + settlement.partnerCents) * 10_000n;
    return { settlement, requiredUsdcUnits: requiredUsdcUnits.toString() };
  },
});
```

**Key implementation notes:**

- Use the MVP fixture values: `yieldTenthsQQ: 60`, `scaScoreTenths: 845`, `priceCentsPerLb: 350`.
- The settlement intent does not move funds and does not mark the partnership settled.
- Do not let the client submit farmer or partner payout amounts.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/admin/settlements.ts` | Create | Settlement intent and reads |

---

### 6B — Funding Instruction and Pool Status

**Type:** Frontend
**Parallelizable:** Yes - independent of settlement execution button after settlement intent shape is stable.

**What:** Add custody/operator route that shows required funding, current settlement pool balance, exact shortfall, and a transaction recording path for pool funding.

**Why:** Settlement should be blocked until the testnet pool can pay the computed farmer and partner shares.

**Where:**

- `packages/nextjs/app/custody/settlement-funding/page.tsx` (new)
- `packages/nextjs/app/custody/settlement-funding/FundSettlementButton.tsx` (new)

**How:**

**Step 1: Show funding requirement and pool balance.**

```tsx
// Path: packages/nextjs/app/custody/settlement-funding/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "~~/services/convex/api";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useWalletSession } from "~~/services/siwe/useWalletSession";

export default function SettlementFundingPage() {
  const { sessionId } = useWalletSession();
  const intent = useQuery(api.admin.settlements.getActiveSettlementIntent, sessionId ? { sessionId } : "skip");
  const { data: distributor } = useDeployedContractInfo({ contractName: "SettlementDistributor" });
  const { data: balance } = useScaffoldReadContract({
    contractName: "MockUSDC",
    functionName: "balanceOf",
    args: [distributor?.address],
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Settlement funding</h1>
      <div className="mt-6 rounded-lg bg-base-100 p-6 shadow-sm">
        <p className="text-sm text-base-content/70">Required demo MockUSDC units</p>
        <p className="mt-2 break-all font-mono">{intent?.requiredUsdcUnits ?? "Loading"}</p>
        <p className="mt-4 text-sm text-base-content/70">Current pool balance: {balance?.toString() ?? "0"}</p>
      </div>
    </main>
  );
}
```

**Step 2: Add a pool funding transaction button if the custodian wallet funds from the UI.**

```tsx
// Path: packages/nextjs/app/custody/settlement-funding/FundSettlementButton.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "~~/services/convex/api";
import type { Id } from "~~/services/convex/dataModel";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function FundSettlementButton({
  sessionId,
  settlementId,
  distributorAddress,
  amount,
}: {
  sessionId: string;
  settlementId: Id<"settlements">;
  distributorAddress: `0x${string}`;
  amount: bigint;
}) {
  const recordSubmitted = useMutation(api.chain.transactions.recordSubmitted);
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "MockUSDC" });

  const onFund = async () => {
    const txHash = await writeContractAsync({ functionName: "transfer", args: [distributorAddress, amount] });
    if (txHash) {
      await recordSubmitted({ sessionId, txHash, txType: "fund_settlement", settlementId });
    }
  };

  return (
    <button className="btn btn-secondary" disabled={isMining} onClick={onFund}>
      {isMining ? "Funding..." : "Fund settlement pool"}
    </button>
  );
}
```

**Key implementation notes:**

- Do not require a real custodian integration for MVP; this is a testnet MockUSDC funding path.
- Avoid putting settlement distributor address only in `NEXT_PUBLIC_*`; prefer generated deployment data where possible.
- Display shortfall in base units and human USDC units to reduce operator mistakes.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/custody/settlement-funding/page.tsx` | Create | Funding instruction and pool status |
| `packages/nextjs/app/custody/settlement-funding/FundSettlementButton.tsx` | Create | Optional pool funding transaction |

---

### 6C — Settlement Execution UI

**Type:** Frontend
**Parallelizable:** Yes - depends on 6A intent shape and `SettlementDistributor` ABI, independent from final proof page.

**What:** Add admin/operator settlement page and button that calls `SettlementDistributor.settle` with the exact contract input tuple.

**Why:** The operator wallet must express settlement execution intent. Convex prepares and verifies; it does not sign.

**Where:**

- `packages/nextjs/app/admin/settlement/page.tsx` (new)
- `packages/nextjs/app/admin/settlement/SettleButton.tsx` (new)

**How:**

**Step 1: Add the settlement button.**

```tsx
// Path: packages/nextjs/app/admin/settlement/SettleButton.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "~~/services/convex/api";
import type { Id } from "~~/services/convex/dataModel";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

export function SettleButton({
  sessionId,
  settlementId,
  input,
}: {
  sessionId: string;
  settlementId: Id<"settlements">;
  input: {
    partnershipId: bigint;
    yieldTenthsQQ: bigint;
    priceCentsPerLb: bigint;
    agronomicCostCents: bigint;
    evidenceHash: `0x${string}`;
  };
}) {
  const recordSubmitted = useMutation(api.chain.transactions.recordSubmitted);
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "SettlementDistributor" });

  const onSettle = async () => {
    try {
      const txHash = await writeContractAsync({ functionName: "settle", args: [input] });
      if (txHash) {
        await recordSubmitted({ sessionId, txHash, txType: "settlement", settlementId });
      }
    } catch (error) {
      notification.error(getParsedError(error));
    }
  };

  return (
    <button className="btn btn-primary" disabled={isMining} onClick={onSettle}>
      {isMining ? "Settling..." : "Execute settlement"}
    </button>
  );
}
```

**Step 2: Render preview and role/chain state before the button.**

```tsx
// Path: packages/nextjs/app/admin/settlement/page.tsx
<section className="rounded-lg bg-base-100 p-6 shadow-sm">
  <h1 className="text-2xl font-bold">Execute deterministic settlement</h1>
  <div className="stats mt-6 w-full">
    <div className="stat">
      <div className="stat-title">Partner share</div>
      <div className="stat-value text-primary">${partnerDollars}</div>
    </div>
    <div className="stat">
      <div className="stat-title">Farmer share</div>
      <div className="stat-value">${farmerDollars}</div>
    </div>
  </div>
  <SettleButton sessionId={sessionId} settlementId={settlementId} input={contractInput} />
</section>
```

**Key implementation notes:**

- Use contract preview reads where possible to display onchain-computed amounts before settlement.
- Disable execution when the pool is underfunded or the wallet lacks the operator role.
- Keep exact cents and base-unit conversion visible for operators.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/admin/settlement/page.tsx` | Create | Settlement intent and execution route |
| `packages/nextjs/app/admin/settlement/SettleButton.tsx` | Create | Operator settlement transaction button |

---

### 6D — Funding and Settlement Reconciliation

**Type:** Convex Backend
**Parallelizable:** Yes - extends existing chain sync while proof UI is built.

**What:** Reconcile `fund_settlement` and `settlement` transactions, update settlement status, and mark partnership settled only after verified events.

**Why:** Final proof must come from chain receipts and decoded events, not client-submitted status.

**Where:**

- `convex/chain/events.ts` (modify)
- `convex/admin/settlements.ts` (modify)

**How:**

**Step 1: Add internal settlement status mutation.**

```typescript
// Path: convex/admin/settlements.ts
import { internalMutation } from "../_generated/server";

export const markSettlementConfirmed = internalMutation({
  args: {
    settlementId: v.id("settlements"),
    settlementTxHash: v.string(),
    signedByWallet: v.string(),
  },
  handler: async (ctx, args) => {
    const settlement = await ctx.db.get(args.settlementId);
    if (!settlement) throw new Error("Settlement missing");

    await ctx.db.patch(settlement._id, {
      status: "confirmed",
      settlementTxHash: args.settlementTxHash,
      signedByWallet: args.signedByWallet.toLowerCase(),
      updatedAt: Date.now(),
    });
    await ctx.db.patch(settlement.partnershipId, { status: "settled", updatedAt: Date.now() });
  },
});
```

**Step 2: Extend event sync verification.**

```typescript
// Path: convex/chain/events.ts
// Decode SettlementExecuted and verify:
// - log address equals active SettlementDistributor deployment
// - partnershipId equals the settlement's partnership onchain ID
// - evidenceHash equals settlements.harvestEvidenceHash
// - revenue/profit/farmer/partner cents equal Convex preview
// - receipt status is success
// Then call internal.admin.settlements.markSettlementConfirmed.
```

**Key implementation notes:**

- Funding transaction confirmation should mark settlement `funded` only after balance/receipt checks pass.
- Settlement event reconciliation should not trust calldata alone; verify emitted values and current contract state where practical.
- Use one event-sync infrastructure across Phases 4-6 to avoid duplicated polling behavior.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/chain/events.ts` | Modify | Funding and settlement event reconciliation |
| `convex/admin/settlements.ts` | Modify | Internal status updates |

---

### 6E — Final Demo Proof Views

**Type:** Frontend
**Parallelizable:** Yes - can start from settlement intent shape and finish after reconciliation fields are stable.

**What:** Extend partner/admin dashboards with exact settlement amounts, transaction hashes, evidence hash, explorer links, and final demo disclaimers.

**Why:** The MVP value is a 5-minute proof: wallet-signed partnership, accountable evidence, and deterministic settlement.

**Where:**

- `packages/nextjs/app/partner/dashboard/page.tsx` (modify)
- `packages/nextjs/app/admin/page.tsx` (new)
- `packages/nextjs/app/admin/settlement/SettlementProofPanel.tsx` (new)

**How:**

**Step 1: Add a reusable settlement proof panel.**

```tsx
// Path: packages/nextjs/app/admin/settlement/SettlementProofPanel.tsx
export function SettlementProofPanel({
  settlement,
}: {
  settlement: {
    revenueCents: number;
    profitCents: number;
    farmerCents: number;
    partnerCents: number;
    harvestEvidenceHash: string;
    fundingTxHash?: string;
    settlementTxHash?: string;
  };
}) {
  return (
    <section className="rounded-lg bg-base-100 p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Settlement proof</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="stat rounded-lg bg-base-200">
          <div className="stat-title">Partner share</div>
          <div className="stat-value">${(settlement.partnerCents / 100).toFixed(2)}</div>
        </div>
        <div className="stat rounded-lg bg-base-200">
          <div className="stat-title">Farmer share</div>
          <div className="stat-value">${(settlement.farmerCents / 100).toFixed(2)}</div>
        </div>
      </div>
      <p className="mt-4 break-all font-mono text-xs">{settlement.harvestEvidenceHash}</p>
      {settlement.settlementTxHash ? <p className="mt-2 break-all text-xs">{settlement.settlementTxHash}</p> : null}
    </section>
  );
}
```

**Key implementation notes:**

- Show exact cents, not rounded-only summaries.
- Keep "testnet demo" and "deterministic settlement example" visible.
- Include explorer links using the active Scaffold-ETH target network where available.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/partner/dashboard/page.tsx` | Modify | Partner final proof |
| `packages/nextjs/app/admin/page.tsx` | Create | Demo operator overview |
| `packages/nextjs/app/admin/settlement/SettlementProofPanel.tsx` | Create | Reusable settlement proof display |

---

### 6F — End-to-End QA and Demo Script

**Type:** QA
**Parallelizable:** No - final integration gate.

**What:** Run the complete MVP path locally and, if chosen, on the selected public testnet. Produce a short operator checklist for the 5-minute demo.

**Why:** Settlement is the final proof path and depends on every earlier phase. This gate catches cross-role, cross-package, and chain-state failures.

**Where:**

- `plans/first-product-design/phases/parallelization-strategy.md` (modify if timing/ownership changed)
- `plans/first-product-design/phases/demo-runbook.md` (new, optional)
- All app/contract/Convex paths from Phases 1-6 (verify)

**How:**

**Step 1: Run the static and contract gates.**

```bash
pnpm compile
pnpm hardhat:test
pnpm next:check-types
pnpm hardhat:check-types
pnpm next:build
```

**Step 2: Run the full local rehearsal.**

```text
1. Start local chain, deploy contracts, register deployments, and seed Convex.
2. Partner reviews lot and creates proposal.
3. Partner approves MockUSDC and opens partnership.
4. Admin records and attests M1-M6 evidence fixtures.
5. Admin closes compressed milestones.
6. Operator creates settlement intent.
7. Custodian/operator funds settlement pool.
8. Operator executes settlement.
9. Partner dashboard shows final proof.
```

**Step 3: Test failure paths.**

```text
Wrong chain, missing MockUSDC balance, expired proposal, non-attester evidence wallet,
underfunded settlement pool, duplicate settlement, and rejected wallet prompt.
```

**Key implementation notes:**

- Use browser automation for desktop and mobile screenshots before demo freeze.
- Keep public-testnet verification separate from local correctness; local must pass first.
- No real funds, production custody, guarantees, or transferable investment language are allowed.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `plans/first-product-design/phases/parallelization-strategy.md` | Modify | Update final timing/critical path if needed |
| `plans/first-product-design/phases/demo-runbook.md` | Create | Optional demo operator checklist |

---

## Phase Summary

| File | Action | Subphase |
| --- | --- | --- |
| `convex/admin/settlements.ts` | Create / Modify | 6A, 6D |
| `packages/nextjs/app/custody/settlement-funding/page.tsx` | Create | 6B |
| `packages/nextjs/app/custody/settlement-funding/FundSettlementButton.tsx` | Create | 6B |
| `packages/nextjs/app/admin/settlement/page.tsx` | Create | 6C |
| `packages/nextjs/app/admin/settlement/SettleButton.tsx` | Create | 6C |
| `convex/chain/events.ts` | Modify | 6D |
| `packages/nextjs/app/partner/dashboard/page.tsx` | Modify | 6E |
| `packages/nextjs/app/admin/page.tsx` | Create | 6E |
| `packages/nextjs/app/admin/settlement/SettlementProofPanel.tsx` | Create | 6E |
| `plans/first-product-design/phases/parallelization-strategy.md` | Modify | 6F |
| `plans/first-product-design/phases/demo-runbook.md` | Create | 6F |
