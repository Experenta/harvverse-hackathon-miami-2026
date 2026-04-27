# Phase 5 — Milestone Attestations

**Goal:** Add compressed-time milestone evidence for the active partnership, let an authorized admin/verifier attest each artifact hash through `EvidenceRegistry`, and reconcile those events into Convex state. After this phase, the partnership can move from active to milestone-complete/awaiting-settlement based on six verified evidence attestations.

**Prerequisite:** Phase 1 generated ABIs include `EvidenceRegistry`. Phase 2 evidence tables and milestone templates exist. Phase 4 has an active partnership with `onchainPartnershipId`, or this phase is limited to backend/UI skeleton work until that state exists.

**Runs in PARALLEL with:** Phase 4 can run in parallel through 5A-5C because they touch separate admin/evidence files. Phase 5D final reconciliation and 5F end-to-end QA wait for a Phase 4 active partnership.

**Skills to invoke:**

- `convex` - Implement evidence fixture mutations, internal status updates, and guarded admin/verifier functions with validators.
- `convex-performance-audit` - Check evidence reads, milestone counts, and event sync polling before demo freeze.
- `blockchain-developer` - Keep evidence as accountable claims, not objective truth or escrow release authority.
- `openzeppelin` - Confirm `EvidenceRegistry.ATTESTER_ROLE` behavior when debugging rejected attestations.
- `next-best-practices` - Keep admin routes and client transaction buttons within App Router conventions.
- `frontend-design` - Build compressed-time admin controls and partner proof timeline with explicit demo labels.
- `browser-use:browser` or `playwright` - Verify admin fixture flow, attestation prompts, and proof timeline across desktop/mobile.

**Acceptance Criteria:**

1. Admin milestone page displays the active plan's six milestone templates and labels the flow as compressed demo time.
2. Admin/verifier can create one canonical `demo_fixture` evidence record per milestone for an active partnership.
3. Each fixture artifact JSON includes `planCode`, `lotCode`, `partnershipId`, `onchainPartnershipId`, `milestoneNumber`, `evidenceKeys`, `completedAtDemoLabel`, and `notes`.
4. `artifactHash` is the hash of canonical fixture JSON and is the same bytes32 submitted to `EvidenceRegistry.attestEvidence`.
5. Only admin/verifier roles can record evidence; only wallets with `ATTESTER_ROLE` can submit onchain attestations.
6. Reconciliation marks evidence records `attested` only after verifying the `EvidenceAttested` event emitter, hash, subject ID, milestone number, and attester.
7. After all six milestone records for a partnership are attested, Convex can move the partnership to `milestones_attested`, then `awaiting_settlement` through an admin-only close action.
8. Partner dashboard shows milestone proof hashes and explorer links without claiming the evidence proves physical truth.
9. `pnpm next:build && pnpm hardhat:test` passes without errors.
10. `pnpm next:check-types && pnpm hardhat:check-types` passes without errors.

---

## Subphase Dependency Graph

```
5A (fixture hash helpers) ───────────────┬── 5B (evidence fixture mutation)
                                         │
5C (admin milestone UI) ─────────────────┤
                                         ├── 5D (attestation button)
                                         │
5E (event reconciliation + state) ───────┘

5B + 5D + 5E complete ──→ 5F (proof timeline + QA)
```

**Optimal execution:**

1. Start 5A and 5C while Phase 4 is still stabilizing; they do not require a real active partnership.
2. Start 5B once evidence table and guard helpers are confirmed.
3. Start 5D when `EvidenceRegistry` ABI is available and transaction recording from Phase 4A is stable.
4. Start 5E after Phase 4 event-sync structure is merged to avoid duplicate receipt polling code.
5. Run 5F only after one partnership has `onchainPartnershipId`.

**Estimated time:** 2-3 days

---

## Subphases

### 5A — Canonical Fixture Hash Helpers

**Type:** Convex Backend
**Parallelizable:** Yes - independent of admin UI and onchain attestation buttons.

**What:** Add helper utilities to build canonical milestone fixture JSON and compute `artifactHash` values.

**Why:** The hash stored in Convex must match the bytes32 submitted onchain. Ad hoc JSON serialization would create non-reproducible hashes.

**Where:**

- `convex/model/evidenceHash.ts` (new)

**How:**

**Step 1: Define the fixture payload type and deterministic key ordering.**

```typescript
// Path: convex/model/evidenceHash.ts
import { keccak256, stringToBytes } from "viem";

export type MilestoneFixtureArtifact = {
  planCode: string;
  lotCode: string;
  partnershipId: string;
  onchainPartnershipId: number;
  milestoneNumber: number;
  evidenceKeys: string[];
  completedAtDemoLabel: string;
  notes: string;
};

export function canonicalMilestoneFixtureJson(input: MilestoneFixtureArtifact) {
  return JSON.stringify({
    planCode: input.planCode,
    lotCode: input.lotCode,
    partnershipId: input.partnershipId,
    onchainPartnershipId: input.onchainPartnershipId,
    milestoneNumber: input.milestoneNumber,
    evidenceKeys: [...input.evidenceKeys].sort(),
    completedAtDemoLabel: input.completedAtDemoLabel,
    notes: input.notes,
  });
}

export function hashMilestoneFixture(input: MilestoneFixtureArtifact) {
  return keccak256(stringToBytes(canonicalMilestoneFixtureJson(input)));
}
```

**Step 2: Validate root `viem` availability for Convex bundling.**

```bash
node -e "require.resolve('viem'); console.log('viem available')"
```

**Key implementation notes:**

- Sort evidence keys before hashing.
- Keep the canonical JSON payload small enough for Convex document and UI display constraints.
- If `viem` resolution fails during Convex deployment, add a root dependency pinned to the installed version.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/model/evidenceHash.ts` | Create | Canonical fixture JSON and hash helper |

---

### 5B — Demo Fixture Evidence Mutation

**Type:** Convex Backend
**Parallelizable:** Yes - depends on 5A helper and Phase 2 evidence table, independent from frontend buttons.

**What:** Add admin/verifier mutation that creates one `demo_fixture` evidence record per milestone for a specific active partnership.

**Why:** The hackathon demo compresses an agricultural timeline into fixture claims. The backend must own fixture creation and prevent duplicate milestone rows.

**Where:**

- `convex/evidence/fixtures.ts` (new)
- `convex/evidence/records.ts` (modify if reusing validators)

**How:**

**Step 1: Create fixture records from plan milestone templates.**

```typescript
// Path: convex/evidence/fixtures.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireWalletSession } from "../auth/guards";
import { hashMilestoneFixture } from "../model/evidenceHash";

export const createDemoFixtureForMilestone = mutation({
  args: {
    sessionId: v.string(),
    partnershipId: v.id("partnerships"),
    milestoneNumber: v.number(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireWalletSession(ctx, args.sessionId, ["admin", "verifier"]);
    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership || partnership.status !== "active") throw new Error("Partnership is not active");

    const plan = await ctx.db.get(partnership.planId);
    const lot = await ctx.db.get(partnership.lotId);
    if (!plan || !lot) throw new Error("Plan or lot missing");

    const milestone = await ctx.db
      .query("milestones")
      .withIndex("by_planId_and_number", q => q.eq("planId", plan._id).eq("number", args.milestoneNumber))
      .unique();
    if (!milestone) throw new Error("Milestone template missing");

    const existing = await ctx.db
      .query("evidenceRecords")
      .withIndex("by_partnershipId_and_milestoneNumber", q =>
        q.eq("partnershipId", partnership._id).eq("milestoneNumber", args.milestoneNumber),
      )
      .unique();
    if (existing) return { evidenceId: existing._id, artifactHash: existing.artifactHash, alreadyExists: true };

    const artifactHash = hashMilestoneFixture({
      planCode: plan.planCode,
      lotCode: lot.code,
      partnershipId: partnership._id,
      onchainPartnershipId: partnership.onchainPartnershipId,
      milestoneNumber: args.milestoneNumber,
      evidenceKeys: milestone.evidenceRequired,
      completedAtDemoLabel: `Demo fast-forward: M${args.milestoneNumber} completed`,
      notes: args.notes,
    });

    const now = Date.now();
    const evidenceId = await ctx.db.insert("evidenceRecords", {
      partnershipId: partnership._id,
      milestoneNumber: args.milestoneNumber,
      evidenceType: "demo_fixture",
      artifactHash,
      attesterUserId: actor._id,
      attesterRole: actor.role,
      status: "recorded",
      demoOnly: true,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return { evidenceId, artifactHash, alreadyExists: false };
  },
});
```

**Key implementation notes:**

- Do not infer fund releases from milestone evidence in the MVP.
- Treat duplicate fixture requests as idempotent if the same milestone record already exists.
- Keep all partnership state changes backend-owned.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/evidence/fixtures.ts` | Create | Demo fixture evidence creation |
| `convex/evidence/records.ts` | Modify | Shared validators/read helpers if needed |

---

### 5C — Admin Milestone Control Page

**Type:** Frontend
**Parallelizable:** Yes - can be built against mocked query data while Phase 4 produces an active partnership.

**What:** Add admin milestone page showing six milestones, fixture creation controls, evidence status, and explicit compressed-time labeling.

**Why:** The admin needs a fast, repeatable demo control that produces evidence records without implying live farm observation.

**Where:**

- `packages/nextjs/app/admin/layout.tsx` (new)
- `packages/nextjs/app/admin/milestones/page.tsx` (new)
- `packages/nextjs/app/admin/milestones/MilestoneFixturePanel.tsx` (new)

**How:**

**Step 1: Create an admin route shell.**

```tsx
// Path: packages/nextjs/app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-base-200">{children}</div>;
}
```

**Step 2: Render compressed demo controls.**

```tsx
// Path: packages/nextjs/app/admin/milestones/MilestoneFixturePanel.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "~~/services/convex/api";
import type { Id } from "~~/services/convex/dataModel";
import { notification } from "~~/utils/scaffold-eth";

export function MilestoneFixturePanel({
  sessionId,
  partnershipId,
  milestoneNumber,
}: {
  sessionId: string;
  partnershipId: Id<"partnerships">;
  milestoneNumber: number;
}) {
  const createFixture = useMutation(api.evidence.fixtures.createDemoFixtureForMilestone);

  const onCreate = async () => {
    const result = await createFixture({
      sessionId,
      partnershipId,
      milestoneNumber,
      notes: `Compressed demo evidence for milestone ${milestoneNumber}`,
    });
    notification.success(result.alreadyExists ? "Fixture already exists" : "Fixture recorded");
  };

  return (
    <button className="btn btn-secondary btn-sm" onClick={onCreate}>
      Record demo fixture
    </button>
  );
}
```

**Key implementation notes:**

- Make "compressed demo time" visible on the page.
- Do not show controls to partner/public roles.
- Keep cards compact; this is an operational admin tool, not a marketing surface.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/admin/layout.tsx` | Create | Admin route shell |
| `packages/nextjs/app/admin/milestones/page.tsx` | Create | Milestone control page |
| `packages/nextjs/app/admin/milestones/MilestoneFixturePanel.tsx` | Create | Fixture creation UI |

---

### 5D — Evidence Attestation Transaction Button

**Type:** Frontend
**Parallelizable:** Yes - depends on 4A transaction recording and `EvidenceRegistry` ABI, independent from event reconciliation implementation.

**What:** Add admin/verifier button to submit `EvidenceRegistry.attestEvidence` for a recorded fixture hash and save the submitted tx hash.

**Why:** Public proof comes from an authorized wallet attesting the exact artifact hash onchain.

**Where:**

- `packages/nextjs/app/admin/milestones/AttestEvidenceButton.tsx` (new)
- `packages/nextjs/app/admin/milestones/page.tsx` (modify)

**How:**

**Step 1: Use Scaffold-ETH write hook for the attestation.**

```tsx
// Path: packages/nextjs/app/admin/milestones/AttestEvidenceButton.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "~~/services/convex/api";
import type { Id } from "~~/services/convex/dataModel";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function AttestEvidenceButton({
  sessionId,
  partnershipId,
  evidenceHash,
  subjectId,
  milestoneNumber,
}: {
  sessionId: string;
  partnershipId: Id<"partnerships">;
  evidenceHash: `0x${string}`;
  subjectId: bigint;
  milestoneNumber: bigint;
}) {
  const recordSubmitted = useMutation(api.chain.transactions.recordSubmitted);
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "EvidenceRegistry" });

  const onAttest = async () => {
    const txHash = await writeContractAsync({
      functionName: "attestEvidence",
      args: [evidenceHash, subjectId, milestoneNumber, "HarvverseMilestoneEvidence"],
    });
    if (txHash) {
      await recordSubmitted({
        sessionId,
        txHash,
        txType: "evidence_attestation",
        partnershipId,
      });
    }
  };

  return (
    <button className="btn btn-secondary btn-sm" disabled={isMining} onClick={onAttest}>
      {isMining ? "Attesting..." : "Attest evidence"}
    </button>
  );
}
```

**Key implementation notes:**

- `subjectId` is the onchain partnership ID, not the Convex document ID.
- The connected wallet must hold `ATTESTER_ROLE`; show role errors through `getParsedError`.
- Use local `EvidenceRegistry` unless EAS is explicitly promoted into MVP.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/admin/milestones/AttestEvidenceButton.tsx` | Create | Onchain attestation button |
| `packages/nextjs/app/admin/milestones/page.tsx` | Modify | Wire attestation controls |

---

### 5E — Evidence Event Reconciliation and Partnership State

**Type:** Convex Backend
**Parallelizable:** Yes - should reuse Phase 4 event-sync infrastructure but owns evidence-specific state updates.

**What:** Extend event sync to handle `EvidenceAttested`, mark evidence rows attested, and move partnerships through `milestones_attested` and `awaiting_settlement`.

**Why:** The client cannot self-certify milestone completion. Backend state changes must follow verified onchain attestations.

**Where:**

- `convex/chain/events.ts` (modify)
- `convex/evidence/status.ts` (new)
- `convex/admin/demoFlags.ts` (new)

**How:**

**Step 1: Add evidence status mutation.**

```typescript
// Path: convex/evidence/status.ts
import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { requireWalletSession } from "../auth/guards";

export const markEvidenceAttested = internalMutation({
  args: {
    evidenceId: v.id("evidenceRecords"),
    registryTxHash: v.string(),
  },
  handler: async (ctx, args) => {
    const evidence = await ctx.db.get(args.evidenceId);
    if (!evidence) throw new Error("Evidence missing");

    await ctx.db.patch(args.evidenceId, {
      status: "attested",
      registryTxHash: args.registryTxHash,
      updatedAt: Date.now(),
    });
  },
});

export const closeCompressedMilestones = mutation({
  args: { sessionId: v.string(), partnershipId: v.id("partnerships") },
  handler: async (ctx, args) => {
    await requireWalletSession(ctx, args.sessionId, ["admin"]);
    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership || partnership.status !== "milestones_attested") {
      throw new Error("Milestones are not fully attested");
    }
    await ctx.db.patch(partnership._id, { status: "awaiting_settlement", updatedAt: Date.now() });
  },
});
```

**Step 2: Move partnership to `milestones_attested` after all six evidence rows are attested.**

```typescript
// Path: convex/evidence/status.ts
export const refreshPartnershipMilestoneStatus = internalMutation({
  args: { partnershipId: v.id("partnerships") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("evidenceRecords")
      .withIndex("by_partnershipId_and_milestoneNumber", q => q.eq("partnershipId", args.partnershipId))
      .take(12);
    const attestedNumbers = new Set(records.filter(row => row.status === "attested").map(row => row.milestoneNumber));
    if ([1, 2, 3, 4, 5, 6].every(number => attestedNumbers.has(number))) {
      await ctx.db.patch(args.partnershipId, { status: "milestones_attested", updatedAt: Date.now() });
    }
  },
});
```

**Key implementation notes:**

- Verify `EvidenceAttested.evidenceHash` against `evidenceRecords.artifactHash`.
- Verify `subjectId` against `partnerships.onchainPartnershipId`.
- Keep `awaiting_settlement` as an explicit admin close action so the demo can pause at proof state.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/chain/events.ts` | Modify | Decode and verify `EvidenceAttested` |
| `convex/evidence/status.ts` | Create | Evidence and partnership status transitions |
| `convex/admin/demoFlags.ts` | Create | Compressed-time controls if needed |

---

### 5F — Proof Timeline and QA

**Type:** Full-Stack
**Parallelizable:** No - final integrated gate after records, attestations, and reconciliation exist.

**What:** Add partner-visible milestone proof timeline and verify the admin fast-forward path end to end.

**Why:** The demo needs evidence-backed progression before settlement, and judges need to see which claims were fixture evidence.

**Where:**

- `packages/nextjs/app/partner/_components/MilestoneProofTimeline.tsx` (new)
- `packages/nextjs/app/partner/dashboard/page.tsx` (modify)
- `packages/nextjs/app/admin/milestones/page.tsx` (verify)

**How:**

**Step 1: Render milestone proof rows in the dashboard.**

```tsx
// Path: packages/nextjs/app/partner/_components/MilestoneProofTimeline.tsx
export function MilestoneProofTimeline({
  records,
}: {
  records: Array<{ milestoneNumber: number; status: string; artifactHash: string; registryTxHash?: string }>;
}) {
  return (
    <ol className="grid gap-3">
      {records.map(record => (
        <li key={record.milestoneNumber} className="rounded-lg border border-base-300 bg-base-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">M{record.milestoneNumber}</span>
            <span className="badge badge-outline">{record.status}</span>
          </div>
          <p className="mt-2 break-all font-mono text-xs">{record.artifactHash}</p>
          {record.registryTxHash ? <p className="mt-1 break-all text-xs">{record.registryTxHash}</p> : null}
        </li>
      ))}
    </ol>
  );
}
```

**Step 2: Run the end-to-end milestone rehearsal.**

```bash
pnpm chain
pnpm contracts:deploy
npx convex dev
pnpm start
```

**Step 3: Verify six milestones.**

```text
1. Open an active partnership.
2. Create fixture evidence for M1-M6.
3. Attest each evidence hash from an attester wallet.
4. Reconcile all six events.
5. Confirm partnership status reaches milestones_attested.
6. Close compressed milestones and confirm awaiting_settlement.
```

**Key implementation notes:**

- Browser test both admin and partner routes.
- Make fixture/demo labels visible in partner proof views.
- Keep the proof timeline readable on mobile; hashes must wrap.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/app/partner/_components/MilestoneProofTimeline.tsx` | Create | Partner evidence proof list |
| `packages/nextjs/app/partner/dashboard/page.tsx` | Modify | Include milestone proofs |
| `packages/nextjs/app/admin/milestones/page.tsx` | Verify | Admin fast-forward path |

---

## Phase Summary

| File | Action | Subphase |
| --- | --- | --- |
| `convex/model/evidenceHash.ts` | Create | 5A |
| `convex/evidence/fixtures.ts` | Create | 5B |
| `convex/evidence/records.ts` | Modify | 5B |
| `packages/nextjs/app/admin/layout.tsx` | Create | 5C |
| `packages/nextjs/app/admin/milestones/page.tsx` | Create / Modify | 5C, 5D, 5F |
| `packages/nextjs/app/admin/milestones/MilestoneFixturePanel.tsx` | Create | 5C |
| `packages/nextjs/app/admin/milestones/AttestEvidenceButton.tsx` | Create | 5D |
| `convex/chain/events.ts` | Modify | 5E |
| `convex/evidence/status.ts` | Create | 5E |
| `convex/admin/demoFlags.ts` | Create | 5E |
| `packages/nextjs/app/partner/_components/MilestoneProofTimeline.tsx` | Create | 5F |
| `packages/nextjs/app/partner/dashboard/page.tsx` | Modify | 5F |
