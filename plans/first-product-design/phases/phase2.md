# Phase 2 — Plan Data and Evidence Baseline

**Goal:** Convert the first Harvverse lot, agronomic plan, milestones, custody account, and evidence model into canonical Convex data. After this phase, frontend discovery, proposal creation, milestone fixtures, and settlement intent work can build against stable table names, indexes, validators, and seeded demo records.

**Prerequisite:** Phase 1 contract names and chain keys are frozen. `EvidenceRegistry` is deployed locally or available in generated ABIs. `convex/_generated/ai/guidelines.md` has been read before planning or implementing Convex schema, functions, indexes, or auth guards.

**Runs in PARALLEL with:** Phase 3 route shell and non-mutating UI can begin after 2A freezes schema names. Phase 5 admin evidence UI skeleton can begin after 2E freezes evidence record shape. Anything that writes proposals, partnerships, or settlements waits for the relevant schema and guard functions.

**Skills to invoke:**

- `convex` - Route Convex work and keep generated API, schema, validators, and internal/public function boundaries aligned.
- `convex-migration-helper` - Not needed for the initial greenfield schema, but invoke before changing deployed tables after seed data exists.
- `convex-performance-audit` - Review indexes, bounded reads, and event-sync write paths before demo freeze.
- `next-best-practices` - Keep any seed/admin route wrappers compatible with App Router conventions.
- `blockchain-developer` - Preserve the accountable-claims boundary between offchain evidence and onchain proof events.
- `openzeppelin` - Required only when checking `EvidenceRegistry` role/event behavior against Phase 1 contract output.

**Acceptance Criteria:**

1. `convex/schema.ts` defines all MVP tables from the design with validators, bounded child tables, and index names matching `by_<field1>_and_<field2>`.
2. Convex functions never accept `userId` for authorization; public functions derive access through wallet session and role guards.
3. `seedFirstLot` creates exactly one active Zafiro lot, one approved plan, one custody account, and six milestone rows totaling `$1,450`.
4. Seeded plan economics preserve `ticketCents: 342_500`, `agronomicCostCents: 149_000`, `splitFarmerBps: 6000`, and `splitPartnerBps: 4000`.
5. Evidence records store accountable claims with `artifactHash`, attester identity, role, status, optional registry proof, and `demoOnly`.
6. `registerDeployment` can mark exactly one active deployment per `(chainKey, contractName)` so Phase 3 proposal hashing can find `PartnershipFactory`.
7. Plan-level and milestone-level reads use indexes and bounded results; no new Convex query uses `.filter()` for indexed access or unbounded `.collect()`.
8. `npx convex dev` starts without schema or function validation errors.
9. `pnpm next:check-types && pnpm hardhat:check-types` passes without errors.

---

## Subphase Dependency Graph

```
2A (full MVP schema) ───────────────┬── 2B (auth/session guards)
                                    │
                                    ├── 2C (lot/plan reads)
                                    │
                                    ├── 2D (seed first lot + deployments)
                                    │
                                    └── 2E (evidence records)

2B + 2C + 2D + 2E complete ──→ 2F (Convex QA + seed verification)
```

**Optimal execution:**

1. Start 2A first and treat it as the schema freeze for parallel feature streams.
2. Start 2B, 2C, 2D, and 2E in parallel once table names and indexes are stable.
3. Keep one owner on `convex/schema.ts`; later phases propose schema changes through that owner.
4. Finish with 2F before Phase 3 proposal mutations or Phase 5 evidence fixtures are merged.

**Estimated time:** 2-3 days

---

## Subphases

### 2A — Full MVP Convex Schema

**Type:** Convex Backend
**Parallelizable:** No - schema ownership must be serialized to prevent downstream generated type conflicts.

**What:** Create `convex/schema.ts` with the full MVP data model: users, wallet sessions, custody accounts, lots, plans, milestones, proposals, partnerships, evidence records, agent events, settlements, chain transactions, and contract deployments.

**Why:** Parallel work in Phases 3-6 depends on generated `Id` and `Doc` types. Freezing the full table shape early avoids cross-phase schema conflicts.

**Where:**

- `convex/schema.ts` (new)

**How:**

**Step 1: Define shared validators at the top of the schema file.**

```typescript
// Path: convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const role = v.union(
  v.literal("partner"),
  v.literal("farmer"),
  v.literal("verifier"),
  v.literal("admin"),
  v.literal("settlement_operator"),
  v.literal("custodian"),
  v.literal("deployer"),
  v.literal("auditor"),
);

const chainKey = v.union(
  v.literal("hardhat"),
  v.literal("celoSepolia"),
  v.literal("baseSepolia"),
  v.literal("polygonAmoy"),
);
```

**Step 2: Add high-value tables and indexes exactly once.**

```typescript
// Path: convex/schema.ts
export default defineSchema({
  users: defineTable({
    displayName: v.string(),
    role,
    walletAddress: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_walletAddress", ["walletAddress"])
    .index("by_role", ["role"]),

  lots: defineTable({
    code: v.string(),
    farmName: v.string(),
    country: v.string(),
    region: v.string(),
    gpsLat: v.number(),
    gpsLng: v.number(),
    altitudeMsnm: v.number(),
    variety: v.string(),
    areaManzanas: v.number(),
    profile: v.string(),
    farmerWallet: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("reserved"),
      v.literal("active"),
      v.literal("settled"),
      v.literal("coming_soon"),
    ),
    activePlanId: v.optional(v.id("plans")),
    onchainLotId: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"]),

  plans: defineTable({
    lotId: v.id("lots"),
    planCode: v.string(),
    version: v.string(),
    sourceUri: v.string(),
    planHash: v.string(),
    status: v.union(v.literal("draft"), v.literal("approved_for_demo"), v.literal("revoked")),
    validatedByName: v.string(),
    validatedByCredential: v.string(),
    ticketCents: v.number(),
    agronomicCostCents: v.number(),
    contingencyCents: v.number(),
    platformFeeCents: v.number(),
    workingCapitalCents: v.number(),
    priceCentsPerLb: v.number(),
    priceFloorCentsPerLb: v.number(),
    yieldCapY1TenthsQQ: v.number(),
    projectedYieldY1TenthsQQ: v.number(),
    splitFarmerBps: v.number(),
    splitPartnerBps: v.number(),
    phygitalCoffeeLb: v.number(),
    phygitalDeliveryMonth: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lotId", ["lotId"])
    .index("by_planCode", ["planCode"]),

  milestones: defineTable({
    planId: v.id("plans"),
    number: v.number(),
    name: v.string(),
    monthStart: v.number(),
    monthEnd: v.number(),
    cashCents: v.number(),
    marketplaceCents: v.number(),
    totalCents: v.number(),
    evidenceRequired: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_planId_and_number", ["planId", "number"]),
});
```

**Step 3: Add the remaining operational tables from section 10 of the design.**

Add `walletSessions`, `custodyAccounts`, `proposals`, `partnerships`, `evidenceRecords`, `agentEvents`, `settlements`, `chainTransactions`, and `contractDeployments` in the same `defineSchema` object. Keep operational child records in separate tables, preserve the index names from the design, and do not split schema ownership across phases.

**Key implementation notes:**

- Do not store unbounded evidence arrays on `lots`, `plans`, or `partnerships`; evidence gets its own table.
- Use `v.optional(...)` only for fields that genuinely do not exist at creation time.
- Do not use `v.int64()` for cents unless all UI callers are prepared to pass BigInts; the design uses `number` cents for Convex records.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/schema.ts` | Create | Full MVP schema and indexes |

---

### 2B — Wallet Session and Role Guards

**Type:** Convex Backend
**Parallelizable:** Yes - depends on `users` and `walletSessions` table names from 2A, but does not touch lot/evidence seed logic.

**What:** Add role and wallet-session guard helpers used by admin seed functions, partner proposals, evidence mutations, and settlement intents.

**Why:** Wallet connection is not authorization. Every sensitive Convex function needs a shared access-control layer before parallel features add public mutations.

**Where:**

- `convex/auth/guards.ts` (new)

**How:**

**Step 1: Implement shared guard helpers with indexed session lookup.**

```typescript
// Path: convex/auth/guards.ts
import { v } from "convex/values";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;
type Role = Doc<"users">["role"];

export const roleValidator = v.union(
  v.literal("partner"),
  v.literal("farmer"),
  v.literal("verifier"),
  v.literal("admin"),
  v.literal("settlement_operator"),
  v.literal("custodian"),
  v.literal("deployer"),
  v.literal("auditor"),
);

export async function requireWalletSession(ctx: Ctx, sessionId: string, allowedRoles: Role[]) {
  const sessionIdHash = sessionId.toLowerCase();
  const session = await ctx.db
    .query("walletSessions")
    .withIndex("by_sessionIdHash", q => q.eq("sessionIdHash", sessionIdHash))
    .unique();
  if (!session || session.status !== "active" || session.expiresAt <= Date.now()) {
    throw new Error("Wallet session is not active");
  }

  const user = await ctx.db.get(session.userId);
  if (!user || user.status !== "active" || !allowedRoles.includes(user.role)) {
    throw new Error("Wallet role is not authorized");
  }

  return user;
}

export async function requireRole(ctx: Ctx, sessionId: string, allowedRoles: Role[]) {
  return await requireWalletSession(ctx, sessionId, allowedRoles);
}
```

**Step 2: Leave session lifecycle implementation to Phase 3.**

Phase 2 creates reusable guard helpers and the schema they need. Phase 3 owns `convex/auth/sessions.ts`, nonce generation, SIWE completion, and viewer state so no placeholder public auth API is merged before the UI can use it.

**Key implementation notes:**

- This MVP uses a wallet-session table. Do not call `ctx.auth.getUserIdentity()` unless `convex/auth.config.ts` and `ConvexProviderWithAuth` are implemented.
- Do not accept arbitrary `userId` arguments for role checks.
- Hash session IDs consistently before storing; Phase 3 should replace any local-only ID normalization with a real hash helper.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/auth/guards.ts` | Create | Shared role/session guard helpers |

---

### 2C — Public Lot and Plan Reads

**Type:** Convex Backend
**Parallelizable:** Yes - depends on 2A schema, independent from seed implementation after table fields are frozen.

**What:** Add indexed public queries for published lots, active lot detail, plan economics, and milestone templates.

**Why:** Phase 3 frontend discovery should read canonical Convex records instead of parsing Markdown or hardcoding plan fields.

**Where:**

- `convex/partner/lots.ts` (new)

**How:**

**Step 1: Add a bounded list query for available lots.**

```typescript
// Path: convex/partner/lots.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

export const listPublishedLots = query({
  args: {},
  handler: async ctx => {
    return await ctx.db
      .query("lots")
      .withIndex("by_status", q => q.eq("status", "available"))
      .take(10);
  },
});
```

**Step 2: Add a detail query using indexes and child-table reads.**

```typescript
// Path: convex/partner/lots.ts
export const getLotDetail = query({
  args: { lotCode: v.string() },
  handler: async (ctx, args) => {
    const lot = await ctx.db
      .query("lots")
      .withIndex("by_code", q => q.eq("code", args.lotCode))
      .unique();
    if (!lot || !lot.activePlanId) return null;

    const plan = await ctx.db.get(lot.activePlanId);
    if (!plan || plan.status !== "approved_for_demo") return null;

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_planId_and_number", q => q.eq("planId", plan._id))
      .take(12);

    return { lot, plan, milestones };
  },
});
```

**Key implementation notes:**

- Use `.take(10)` or another explicit bound for public list reads.
- Do not expose private proposal, settlement, or funding details through public lot queries.
- Keep evidence internals out of the public lot response unless intentionally summarized.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/partner/lots.ts` | Create | Public lot and plan reads |

---

### 2D — First Lot, Deployment, Plan, Custody, and Milestone Seeding

**Type:** Convex Backend
**Parallelizable:** Yes - depends on 2A and 2B, but independent from public read query implementation.

**What:** Implement `seedFirstLot` to create the Zafiro lot, canonical plan values, custody account, and six milestone templates from the design. Add deployment registration so Phase 3 can find the active `PartnershipFactory` address without hardcoding it.

**Why:** The app needs deterministic demo data that matches the agronomic plan and settlement math. Manual data entry would make proposal hashes and UI proofs fragile.

**Where:**

- `convex/admin/seed.ts` (new)
- `convex/admin/deployments.ts` (new)

**How:**

**Step 1: Create the admin-only seed mutation.**

```typescript
// Path: convex/admin/seed.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireRole } from "../auth/guards";

export const seedFirstLot = mutation({
  args: {
    sessionId: v.string(),
    planHash: v.string(),
    sourceUri: v.string(),
    farmerWallet: v.string(),
    escrowWallet: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionId, ["admin"]);

    const now = Date.now();
    const existing = await ctx.db
      .query("lots")
      .withIndex("by_code", q => q.eq("code", "HV-HN-ZAF-L02"))
      .unique();
    if (existing) return { lotId: existing._id, alreadySeeded: true };

    const lotId = await ctx.db.insert("lots", {
      code: "HV-HN-ZAF-L02",
      farmName: "Finca Zafiro",
      country: "HN",
      region: "Comayagua",
      gpsLat: 14.9465,
      gpsLng: -88.0863,
      altitudeMsnm: 1300,
      variety: "Parainema",
      areaManzanas: 1,
      profile: "C-Premium",
      farmerWallet: args.farmerWallet.toLowerCase(),
      status: "available",
      onchainLotId: 1,
      createdAt: now,
      updatedAt: now,
    });

    const planId = await ctx.db.insert("plans", {
      lotId,
      planCode: "HVPLAN-ZAF-L02-2026",
      version: "1.0",
      sourceUri: args.sourceUri,
      planHash: args.planHash,
      status: "approved_for_demo",
      validatedByName: "Jorge Alberto Lanza",
      validatedByCredential: "Cup of Excellence Honduras 2013 Champion, 92.75 pts",
      ticketCents: 342_500,
      agronomicCostCents: 149_000,
      contingencyCents: 14_900,
      platformFeeCents: 16_400,
      workingCapitalCents: 162_200,
      priceCentsPerLb: 350,
      priceFloorCentsPerLb: 250,
      yieldCapY1TenthsQQ: 80,
      projectedYieldY1TenthsQQ: 60,
      splitFarmerBps: 6000,
      splitPartnerBps: 4000,
      phygitalCoffeeLb: 5,
      phygitalDeliveryMonth: "2027-01",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(lotId, { activePlanId: planId, updatedAt: now });
    return { lotId, planId, alreadySeeded: false };
  },
});
```

**Step 2: Insert custody account and milestone rows in the same mutation.**

```typescript
// Path: convex/admin/seed.ts
await ctx.db.insert("custodyAccounts", {
  name: "Demo FI Escrow Wallet",
  custodyType: "demo_escrow",
  chainKey: "hardhat",
  walletAddress: args.escrowWallet.toLowerCase(),
  status: "active",
  createdAt: now,
  updatedAt: now,
});

const milestoneSeeds = [
  { number: 1, name: "Diagnostico & Linea Base", monthStart: 2, monthEnd: 2, cashCents: 2_500, marketplaceCents: 8_500, totalCents: 11_000, evidenceRequired: ["soil_lab_report", "sensor_install_photos", "gps_polygon"] },
  { number: 2, name: "Preparacion & Poda", monthStart: 3, monthEnd: 4, cashCents: 11_500, marketplaceCents: 15_500, totalCents: 27_000, evidenceRequired: ["before_after_pruning_photos", "input_receipts", "post_liming_ph_reading"] },
  { number: 3, name: "Nutricion Base", monthStart: 4, monthEnd: 5, cashCents: 5_000, marketplaceCents: 17_500, totalCents: 22_500, evidenceRequired: ["application_photos", "fertilizer_receipts", "soil_moisture_snapshot"] },
  { number: 4, name: "Mantenimiento & Sanidad", monthStart: 6, monthEnd: 8, cashCents: 11_000, marketplaceCents: 6_500, totalCents: 17_500, evidenceRequired: ["trap_photos", "rust_risk_iot_report", "fungicide_application_photos"] },
  { number: 5, name: "Nutricion Refuerzo & Pre-cosecha", monthStart: 8, monthEnd: 9, cashCents: 4_000, marketplaceCents: 17_000, totalCents: 21_000, evidenceRequired: ["cherry_development_photos", "day_night_temperature_snapshot", "cutting_plan"] },
  { number: 6, name: "Cosecha & Beneficiado Premium", monthStart: 10, monthEnd: 12, cashCents: 35_500, marketplaceCents: 10_500, totalCents: 46_000, evidenceRequired: ["harvest_pass_photos", "fermentation_iot_report", "drying_bed_photos", "sca_cupping_report"] },
] as const;

for (const milestone of milestoneSeeds) {
  await ctx.db.insert("milestones", { planId, ...milestone, evidenceRequired: [...milestone.evidenceRequired], createdAt: now });
}
```

**Step 3: Register active contract deployments through an admin-only mutation.**

```typescript
// Path: convex/admin/deployments.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireRole } from "../auth/guards";

const chainKey = v.union(
  v.literal("hardhat"),
  v.literal("celoSepolia"),
  v.literal("baseSepolia"),
  v.literal("polygonAmoy"),
);

export const registerDeployment = mutation({
  args: {
    sessionId: v.string(),
    chainKey,
    chainId: v.number(),
    contractName: v.string(),
    address: v.string(),
    abiHash: v.string(),
    deployTxHash: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionId, ["admin", "deployer"]);
    const existing = await ctx.db
      .query("contractDeployments")
      .withIndex("by_chainKey_and_contractName", q =>
        q.eq("chainKey", args.chainKey).eq("contractName", args.contractName),
      )
      .take(20);

    for (const deployment of existing) {
      if (deployment.active) await ctx.db.patch(deployment._id, { active: false });
    }

    return await ctx.db.insert("contractDeployments", {
      chainKey: args.chainKey,
      chainId: args.chainId,
      contractName: args.contractName,
      address: args.address.toLowerCase(),
      abiHash: args.abiHash,
      deployTxHash: args.deployTxHash,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const getActiveDeployment = query({
  args: { chainKey, contractName: v.string() },
  handler: async (ctx, args) => {
    const deployments = await ctx.db
      .query("contractDeployments")
      .withIndex("by_chainKey_and_contractName", q =>
        q.eq("chainKey", args.chainKey).eq("contractName", args.contractName),
      )
      .take(20);
    return deployments.find(deployment => deployment.active) ?? null;
  },
});
```

**Key implementation notes:**

- Use ASCII names in code if the source file is ASCII-only; UI copy can localize later.
- The six milestones total `$1,450`; the separate `$40` annual IoT service remains in `agronomicCostCents`.
- Make the seed mutation idempotent for the lot code to protect local rehearsals.
- Register `PartnershipFactory` before Phase 3 proposal creation; register all five contracts before Phase 4-6 transaction UI.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/admin/seed.ts` | Create | Admin seed for lot, plan, custody account, milestones |
| `convex/admin/deployments.ts` | Create | Admin deployment registration and active deployment reads |

---

### 2E — Evidence Record Baseline

**Type:** Convex Backend
**Parallelizable:** Yes - depends on 2A and 2B, independent of seed implementation after partnerships table is defined.

**What:** Add the evidence record mutation and read helpers needed for plan attestations and future milestone fixture attestations.

**Why:** Evidence must be represented as accountable claims before Phase 5 adds admin fast-forward controls and onchain attestation buttons.

**Where:**

- `convex/evidence/records.ts` (new)

**How:**

**Step 1: Add the evidence type validator and mutation.**

```typescript
// Path: convex/evidence/records.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireWalletSession } from "../auth/guards";

const evidenceType = v.union(
  v.literal("photo"),
  v.literal("sensor_snapshot"),
  v.literal("receipt"),
  v.literal("agronomist_review"),
  v.literal("harvest_result"),
  v.literal("demo_fixture"),
);

export const recordMilestoneEvidence = mutation({
  args: {
    sessionId: v.string(),
    partnershipId: v.id("partnerships"),
    milestoneNumber: v.number(),
    evidenceType,
    artifactHash: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireWalletSession(ctx, args.sessionId, ["admin", "verifier"]);
    const now = Date.now();

    return await ctx.db.insert("evidenceRecords", {
      partnershipId: args.partnershipId,
      milestoneNumber: args.milestoneNumber,
      evidenceType: args.evidenceType,
      artifactHash: args.artifactHash,
      attesterUserId: actor._id,
      attesterRole: actor.role,
      status: "recorded",
      demoOnly: args.evidenceType === "demo_fixture",
      ...(args.notes ? { notes: args.notes } : {}),
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

**Step 2: Add a bounded read for one partnership's evidence.**

```typescript
// Path: convex/evidence/records.ts
export const listForPartnership = query({
  args: { partnershipId: v.id("partnerships") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("evidenceRecords")
      .withIndex("by_partnershipId_and_milestoneNumber", q => q.eq("partnershipId", args.partnershipId))
      .take(50);
  },
});
```

**Key implementation notes:**

- `recordMilestoneEvidence` records the claim only; Phase 5 reconciles `EvidenceRegistry` transactions before marking records `attested`.
- Do not let the client mark milestones complete directly.
- Store `artifactHash` as a string with a single canonical hash format; use `0x`-prefixed bytes32 for values submitted onchain.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/evidence/records.ts` | Create | Evidence mutation and partnership read |

---

### 2F — Convex QA and Seed Verification

**Type:** QA
**Parallelizable:** No - verifies outputs from all Phase 2 subphases before frontend and transaction phases consume them.

**What:** Run Convex locally, verify generated API/types, validate seed behavior, and document the schema freeze for parallel streams.

**Why:** Most later phases import `api.*` references and typed IDs. A bad schema or missing validator becomes a cross-package blocker.

**Where:**

- `convex/_generated/api.ts` (generated)
- `convex/_generated/dataModel.d.ts` (generated)
- `plans/first-product-design/phases/parallelization-strategy.md` (created after all phase plans)

**How:**

**Step 1: Start Convex and confirm generated files update.**

```bash
npx convex dev
```

**Step 2: Inspect generated function references.**

```bash
rg -n "seedFirstLot|listPublishedLots|getLotDetail|recordMilestoneEvidence" convex/_generated/api.d.ts convex/_generated/api.ts
```

**Step 3: Run package type checks.**

```bash
pnpm next:check-types
pnpm hardhat:check-types
```

**Key implementation notes:**

- Convex actions must not use `ctx.db`; move reads/writes into queries/mutations.
- Public Convex functions always need validators.
- If seed data has already been deployed and schema changes are required, stop and invoke `convex-migration-helper`.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `convex/_generated/api.ts` | Modify | Generated by Convex |
| `convex/_generated/dataModel.d.ts` | Modify | Generated by Convex |
| `plans/first-product-design/phases/parallelization-strategy.md` | Modify | Records schema ownership handoff |

---

## Phase Summary

| File | Action | Subphase |
| --- | --- | --- |
| `convex/schema.ts` | Create | 2A |
| `convex/auth/guards.ts` | Create | 2B |
| `convex/partner/lots.ts` | Create | 2C |
| `convex/admin/seed.ts` | Create | 2D |
| `convex/admin/deployments.ts` | Create | 2D |
| `convex/evidence/records.ts` | Create | 2E |
| `convex/_generated/api.ts` | Modify | 2F |
| `convex/_generated/dataModel.d.ts` | Modify | 2F |
| `plans/first-product-design/phases/parallelization-strategy.md` | Modify | 2F |
