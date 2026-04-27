# Parallelization Strategy — Prompt & Template

**Purpose:** This document defines the prompt, structural template, and quality standards for creating a parallelization strategy in this repository. The parallelization strategy is a **standalone document** that sits alongside the phase plans and provides the execution roadmap — which phases and subphases can run simultaneously, the critical path, file ownership boundaries, agent/developer allocation, and quality gates across Solidity, Hardhat, Convex, and the Next.js Scaffold-ETH app.

---

## When to Use

Create a parallelization strategy when:

- The feature has 3+ phases
- Phases have internal subphases that can run concurrently
- Multiple developers or agents will work on the feature simultaneously
- You need to identify the critical path and optimize total delivery time
- The work crosses package boundaries such as `packages/hardhat/`, `convex/`, and `packages/nextjs/`

The parallelization strategy lives at:

```
plans/{feature-name}/phases/parallelization-strategy.md
```

---

## Prompt

Use the following prompt:

```
I need a parallelization strategy for the {FEATURE_NAME} implementation.

**Design document:** Read `plans/{feature-name}/{feature-name}-design.md` for the full scope.
**Phase plans:** Read `plans/{feature-name}/phases/phase*.md` for all phase details.

**Context:**
- Read `AGENTS.md` and follow the repo-specific Scaffold-ETH 2, Hardhat, Convex, frontend, and skill instructions.
- This repo is currently the Scaffold-ETH 2 Hardhat flavor because `packages/hardhat` exists.
- Read `plans/first-product-design/fpd.md` for the Harvverse product, demo, legal-risk, actor, settlement, and architecture baseline.
- If Convex work is in scope, account for `convex/_generated/ai/guidelines.md`, generated types, schema/index deployment, and public/internal function boundaries.
- If contract work is in scope, account for `packages/hardhat/contracts/`, `packages/hardhat/deploy/`, `packages/hardhat/test/`, generated ABIs, and `packages/nextjs/contracts/deployedContracts.ts`.
- If frontend work is in scope, account for route ownership under `packages/nextjs/app/`, Scaffold-ETH hooks, DaisyUI, and `@scaffold-ui/components`.
- This feature has {N} phases: {list phase names}.
- {Any constraints: "Phase 1 owns shared schema and deployments", "Phase 4 and 5 serve different user roles", "contract ABIs block frontend write hooks", "testnet only", "no real funds", etc.}

Produce a parallelization strategy at `plans/{feature-name}/phases/parallelization-strategy.md` following this exact structure:

1. **Header** — Purpose statement, prerequisite (what must exist before any phase starts).

2. **Phase Overview Table** — All phases in a single table. Columns: Phase number, Name, Type (Smart Contract / Convex Backend / Full-Stack / Frontend / Config / QA), Estimated Complexity (Low / Medium / Medium-High / High), Dependencies (which phases must complete first).

3. **Master Dependency Graph** — A large ASCII box diagram showing ALL phases and their dependency relationships. Each phase is a labeled box. Arrows show dependencies. Phases at the same horizontal level can run in parallel.

4. **Maximum Parallelism Windows** — Numbered windows (Window 1, Window 2, etc.), each representing a time period where specific phases/subphases can run simultaneously. For each window:
   - Window name and description.
   - **Concurrency:** How many independent streams run simultaneously.
   - Explanation of why the phases in this window are independent (different packages, different directories, different route trees, different contract files, no shared state).
   - ASCII timeline diagram showing the phases in this window.
   - **Internal parallelism:** Sub-diagram showing which subphases within each phase can run in parallel.

5. **Critical Path Analysis** — The longest sequential chain that determines minimum delivery time. Show it as an ASCII diagram with the phases on the critical path. Identify the shorter alternative paths. State the implication (e.g., "Start Phase 4 as early as possible — generated ABIs and transaction UX depend on it").

6. **File Ownership Boundaries** — A table showing which phase "owns" each directory or file, to prevent merge conflicts during parallel execution. Columns: Directory/File, Phase Owner, Notes. This is critical for parallel work — if two phases touch the same file, they cannot truly run in parallel unless the work is sequenced or split.

7. **Recommended Execution Strategies** — Three subsections:
   - **Solo Developer:** Optimal sequence leveraging within-phase parallelism.
   - **Two Developers:** Sprint-by-sprint allocation table (Sprint | Dev A | Dev B).
   - **Three+ Developers/Agents:** Sprint-by-sprint allocation table with more columns.
   Each includes an estimated total time.

8. **Quality Gates** — A table of checkpoints after each major milestone. Columns: Gate name, Trigger (after which phase), Checks (what to verify). These are the "stop and verify" points before proceeding.

9. **Risk Mitigation** — A table of risks. Columns: Risk, Impact (Critical / High / Medium), Mitigation strategy.

10. **Applicable Skills Per Phase** — A table mapping skills to phases. Columns: Phase, Skills to Invoke, Reason.

**Formatting rules:**
- ASCII art for all diagrams (no Mermaid in this document — it should render in any markdown viewer).
- Box-drawing characters for the master dependency graph.
- Timeline bars (████) for window diagrams.
- Tables with aligned pipes.
```

---

## Template Structure

````markdown
# Parallelization Strategy — {Feature Name}

**Purpose:** This document defines the parallelization strategy across all {N} implementation phases, identifying the critical path, dependency graph, file ownership boundaries, and maximum concurrency opportunities.

**Prerequisite:** {What must exist before any phase starts — prior features, design doc, contract/network decisions, Convex project setup, env vars, seeded demo data, etc.}

---

## Phase Overview

| Phase | Name | Type | Estimated Complexity | Dependencies |
|---|---|---|---|---|
| **1** | Foundation, Chain Config, and Contracts | Smart Contract / Config | Medium-High | {Prior feature phases or "None"} |
| **2** | Plan Normalization and Evidence Model | Convex Backend | Medium | Phase 1 schema/network decisions |
| **3** | Discovery, Proposal, and AI Explanation | Full-Stack | High | Phase 1 + Phase 2 data shape |
| **4** | Partner Signing and Certificate Mint | Full-Stack | High | Phase 1 contracts + Phase 3 proposals |
| **5** | Milestone Evidence and Attestations | Full-Stack | Medium-High | Phase 2 evidence model + Phase 4 certificate state |
| **6** | Settlement and Demo Proof | Full-Stack / QA | High | Phase 4 + Phase 5 |

---

## Master Dependency Graph

```
                    ┌──────────────────────────────────────────────────────────────────┐
                    │                         PHASE 1                                  │
                    │  Foundation, Chain Config, Contracts, Generated ABIs             │
                    └──────────┬───────────────────┬───────────────────────────────────┘
                               │                   │
                    ┌──────────▼──────────┐ ┌──────▼──────────┐
                    │     PHASE 2         │ │    PHASE 3      │
                    │  Evidence Model     │ │  Proposal + AI  │
                    │  (Convex Backend)   │ │  (Full-Stack)   │
                    └──────────┬──────────┘ └──────┬──────────┘
                               │                   │
                               │            ┌──────▼──────────┐
                               │            │    PHASE 4      │
                               │            │ Partner Signing │
                               │            │ Certificate Mint│
                               │            └──────┬──────────┘
                               │                   │
                    ┌──────────▼──────────┐        │
                    │     PHASE 5         │◄───────┘
                    │ Milestone Evidence  │
                    │ Attestations        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     PHASE 6         │
                    │ Settlement + Demo   │
                    │ Proof / QA          │
                    └─────────────────────┘
```

---

## Maximum Parallelism Windows

### Window 1: Foundation Split (Shared Artifacts — Must Stabilize First)

**Concurrency:** Up to {N} subphases in parallel within Phase 1.

Phase 1 is the critical foundation. Later phases need stable contract names, generated ABIs, target network config, and Convex schema decisions. Within Phase 1, Solidity contracts/tests and Convex schema can run in parallel if they do not import from each other. Frontend route work waits for generated ABIs and config.

```
Timeline: ████████████████████████████
          1A (chain config) ───────────────────────────────┐
          1B (contracts + tests) ───────┐                  │
                                        ├── 1D (deploy + generated ABIs) ─┐
          1C (Convex schema) ───────────┘                                  ├── 1E (frontend config smoke)
                                                                           └── 1F (foundation QA)
```

---

### Window 2: Backend/Data Parallelism

**Concurrency:** {N} independent streams running simultaneously.

After Phase 1 stabilizes shared artifacts, backend-heavy streams can run in parallel when they touch different directories and tables:

- **Phase 2** works in `convex/lots/`, `convex/evidence/`, and `convex/schema.ts` only if schema ownership was not already frozen.
- **Phase 3** works in `convex/proposals/`, optional AI actions, and `packages/nextjs/app/lots/`.

If both phases need `convex/schema.ts`, sequence the schema edits first or split all schema work into Phase 1. No phase should modify another phase's files without updating file ownership.

```
Timeline:                    ██████████████████████████████████████
                             Phase 2 (evidence model) ───────────────┐
                             Phase 3 (proposal + AI) ─────────────────┤
                                                                      ▼
                                                              Window 3
```

**Within Phase 2 (internal parallelism):**
```
2A (schema/indexes) ──────────────────────┐
                                          ├── 2C (evidence mutations)
2B (lot/plan queries) ────────────────────┤
                                          └── 2D (evidence validation helpers)

2C + 2D complete ──→ 2E (backend tests + seed data)
```

**Within Phase 3 (internal parallelism):**
```
3A (proposal data shape) ─────────────────┐
                                          ├── 3D (lot/proposal page)
3B (AI explanation action) ───────────────┤
                                          ├── 3E (fallback copy/states)
3C (what-if calculator) ──────────────────┘
```

---

### Window 3: Full-Stack Transaction Streams

**Concurrency:** {N} streams with explicit contract/frontend boundaries.

Phase 4 and Phase 5 may overlap only where file ownership is separate. Phase 4 owns partner signing and certificate mint. Phase 5 owns milestone evidence and attestations. If Phase 5 depends on a certificate minted in Phase 4, it can still build backend and UI skeletons against the agreed interface while final transaction testing waits.

```
Timeline:                                         ████████████████████████████████████████
                                                  Phase 4 (signing + certificate) ───────┐
                                                  Phase 5 (evidence + attestations) ─────┤
                                                                                          ▼
                                                                                   Window 4
```

**Within Phase 4:**
```
4A (certificate contract/tests) ──────────┐
4B (proposal signature persistence) ──────┤── 4D (partner signing UI)
4C (deployment/ABI update) ───────────────┘
                                           └── 4E (wallet/browser QA)
```

**Within Phase 5:**
```
5A (evidence tables/functions) ───────────┐
5B (attestation contract/events) ─────────┤── 5D (admin evidence UI)
5C (event reconciliation) ────────────────┘
                                           └── 5E (attestation QA)
```

---

### Window 4+: Settlement and Demo Hardening

Settlement and final demo proof usually sit on the critical path because they depend on prior proposal, certificate, evidence, and funding state.

```
Timeline:                                                                          ██████████████████████
                                                                                   6A (settlement contract/tests) ───┐
                                                                                   6B (Convex settlement preview) ───┤
                                                                                                                     ├── 6D (demo proof UI)
                                                                                   6C (event reconciliation) ───────┤
                                                                                                                     └── 6E (end-to-end QA)
```

---

## Critical Path Analysis

The **critical path** (longest sequential chain determining minimum implementation time):

```
Phase 1 → Phase 3 → Phase 4 → Phase 5 → Phase 6
  │          │          │         │         │
  │          │          │         │         └── Settlement and final demo proof
  │          │          │         └── Milestone evidence required before settlement
  │          │          └── Partner signing and certificate state
  │          └── Proposal and terms accepted by partner
  └── Contract/network/schema foundation and generated artifacts
```

**Alternative shorter path:**

```
Phase 1 → Phase 2 → Phase 5
```

This path lets evidence and attestation work start earlier, but final verification still waits for the partner signing/certificate state from Phase 4.

**Implication:** Start Phase 3 and Phase 4 as early as their prerequisites allow. They drive the user-visible wallet flow and determine when settlement can be tested end to end.

---

## File Ownership Boundaries (Merge Conflict Prevention)

When running phases in parallel, each phase owns specific directories to prevent conflicts:

| Directory/File | Phase Owner | Notes |
|---|---|---|
| `convex/schema.ts` | **Phase 1 or explicitly scheduled schema subphase** | Prefer grouping all schema changes early. If later phases need schema edits, sequence them. |
| `convex/lots/` | **Phase 2** | Lot/plan reads and normalization. |
| `convex/evidence/` | **Phase 2 -> Phase 5 extends with new files** | Phase 5 adds attestation-specific files; avoid modifying Phase 2 files in parallel. |
| `convex/proposals/` | **Phase 3** | Proposal creation, preview, and what-if state. |
| `convex/settlement/` | **Phase 6** | Settlement preview, tx reconciliation, proof state. |
| `packages/hardhat/contracts/PartnershipFactory.sol` | **Phase 1 / Phase 4** | Phase 1 creates foundation; Phase 4 extends only if explicitly planned. |
| `packages/hardhat/contracts/LotCertificate.sol` | **Phase 4** | Certificate mint and transfer restrictions. |
| `packages/hardhat/contracts/EvidenceRegistry.sol` | **Phase 5** | Evidence/attestation event surface. |
| `packages/hardhat/contracts/SettlementDistributor.sol` | **Phase 6** | Settlement math and transfer execution. |
| `packages/hardhat/deploy/` | **Owning contract phase** | Each contract gets its own deploy file. Coordinate deploy ordering. |
| `packages/hardhat/test/` | **Owning contract phase** | Tests live beside the phase that owns the contract behavior. |
| `packages/nextjs/contracts/deployedContracts.ts` | **Generated by deployment** | Do not hand-edit unless the repo pattern explicitly requires it. |
| `packages/nextjs/scaffold.config.ts` | **Phase 1** | Target network config. Later phases consume it. |
| `packages/nextjs/app/lots/` | **Phase 3 / Phase 4 by route file** | Proposal route and signing route must have distinct file ownership. |
| `packages/nextjs/app/partner/` | **Phase 4** | Partner wallet/certificate dashboard. |
| `packages/nextjs/app/admin/evidence/` | **Phase 5** | Evidence review and attestation UI. |
| `packages/nextjs/app/admin/settlement/` | **Phase 6** | Settlement operator UI. |
| `packages/nextjs/components/` | **Shared component owner per component** | Shared components block dependent pages; create them before parallel page work. |

---

## Recommended Execution Strategies

### Solo Developer

Execute in order, leveraging within-phase parallelism for efficient context switching:

1. **Phase 1** — chain config, contracts, schema, deploy, generated ABIs
2. **Phase 2** — evidence/plan backend while contract context is fresh
3. **Phase 3** — proposal backend and lot/proposal UI
4. **Phase 4** — partner signing, certificate contract, wallet flow
5. **Phase 5** — milestone evidence and attestations
6. **Phase 6** — settlement, demo proof, end-to-end QA

**Estimated time:** {N-M} days

### Two Developers (Contracts/Backend + Frontend)

| Sprint | Developer A (Contracts / Convex) | Developer B (Frontend / QA) |
|---|---|---|
| 1 | Phase 1 contracts, deploy scripts, schema | Phase 1 frontend config smoke and route shells after ABIs |
| 2 | Phase 2 evidence backend + Phase 3 proposal backend | Phase 3 lot/proposal UI with agreed data shapes |
| 3 | Phase 4 certificate/signing backend + contract tests | Phase 4 partner wallet UX and browser testing |
| 4 | Phase 5 evidence/attestation backend + contract events | Phase 5 admin evidence UI |
| 5 | Phase 6 settlement contract/backend | Phase 6 settlement/demo proof UI + end-to-end QA |

**Estimated time:** {N-M} days

### Three+ Developers / Agents

| Sprint | Agent A (Contracts) | Agent B (Convex Backend) | Agent C (Frontend / QA) |
|---|---|---|---|
| 1 | Phase 1 contracts/tests/deploy | Phase 1 schema + seed data | Phase 1 route/config smoke |
| 2 | Phase 4 certificate contract prep | Phase 2 evidence + Phase 3 proposals | Phase 3 lot/proposal UI |
| 3 | Phase 5 attestation events | Phase 4 signature persistence + event sync | Phase 4 partner signing UI |
| 4 | Phase 6 settlement contract | Phase 5 evidence backend + Phase 6 preview | Phase 5 admin UI |
| 5 | Integration fixes | Reconciliation and fallback fixes | Phase 6 demo proof + browser QA |

**Estimated time:** {N-M} days

---

## Quality Gates

| Gate | Trigger | Checks |
|---|---|---|
| **Gate 1** | After Phase 1 | `pnpm compile` succeeds. `pnpm hardhat:test` passes for foundation contracts. `pnpm contracts:deploy` updates generated ABIs. `npx convex dev` runs without schema errors. |
| **Gate 2** | After Phase 2 + 3 | Lot/proposal data loads from Convex or seeded fixtures. Proposal preview is deterministic. AI/fallback behavior does not alter canonical math. |
| **Gate 3** | After Phase 4 | Connected partner wallet can sign the intended transaction on the target testnet/local chain. Certificate mint/event is visible in app state and explorer/debug UI. |
| **Gate 4** | After Phase 5 | Evidence or attestation records can be created, read, and reconciled without duplicate processing. Admin-only actions reject non-admin wallets. |
| **Gate 5** | After Phase 6 | Settlement preview matches contract behavior. End-to-end demo path runs from lot view through settlement proof. `pnpm next:build`, `pnpm next:check-types`, and `pnpm hardhat:check-types` pass. |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Shared schema edits block parallel Convex work | **Critical** | Group schema changes in Phase 1 or a dedicated schema subphase; run `npx convex dev` immediately. |
| Contract ABI drift breaks frontend hooks | **Critical** | Treat `packages/nextjs/contracts/deployedContracts.ts` as generated; deploy after contract changes before frontend integration. |
| Wrong network or wallet signer causes failed demo transactions | High | Configure target network in both Hardhat and Next.js; add visible wrong-network states and browser QA. |
| Partial transaction flow leaves proposal stuck | High | Store tx hashes, reconcile receipts, and define retry/idempotency behavior per phase. |
| Event sync duplicates or misses records | High | Use idempotency keys based on chain ID + tx hash + log index; include reconciliation checks. |
| RPC/API limits slow testing | Medium | Cache reads where appropriate, bound historical event queries, and keep demo fallback mode available. |
| Frontend built against missing backend | Medium | Phase plans list the exact Convex functions and contract methods each route consumes; use agreed fixture data only when explicitly allowed. |
| Component complexity exceeds estimate | Medium | Use DaisyUI and `@scaffold-ui/components`; avoid unnecessary third-party UI dependencies for MVP. |
| Legal/demo claims drift into real-funds language | High | Keep copy and docs explicit: testnet only, no real funds, no production custody, no investment promises. |

---

## Applicable Skills Per Phase

| Phase | Skills to Invoke | Reason |
|---|---|---|
| **1** | `openzeppelin`, `convex-quickstart` if backend setup is incomplete | Contract primitives, access control, and initial Convex setup. |
| **2** | `convex`, `convex-migration-helper` if existing data must change | Schema, validators, indexes, evidence tables, and safe data migration. |
| **3** | `convex-performance-audit` if proposal reads become hot, `playwright` for UI verification | Proposal data flow, subscription/read cost, and browser checks. |
| **4** | `openzeppelin`, `erc-721`, `siwe`, `eip-5792` if batching is required | Certificate minting, wallet-authenticated sessions, and wallet transaction UX. |
| **5** | `openzeppelin`, `convex`, `ponder` or `subgraph` if event indexing outgrows Convex sync | Evidence/attestation events and backend reconciliation. |
| **6** | `openzeppelin`, `convex-performance-audit`, `playwright` | Settlement math, read/write contention, and end-to-end demo QA. |

---

*This strategy maximizes parallelization while respecting critical dependencies. The key insight: identify pairs of phases that touch entirely different packages, directories, contract files, route trees, or roles — these can run in parallel only when generated artifacts and shared schema are stable.*
````

---

## Key Principles

These principles are tailored to this Harvverse Scaffold-ETH 2 repository and should be applied to every parallelization strategy.

### 1. Three Questions for Every Subphase

Before deciding if a subphase can run in parallel, ask:

1. **Does it depend on generated code or artifacts from another subphase?** (Convex generated types, deployed contracts, generated ABIs, TypeChain types)
   - Yes -> must wait until that subphase merges and generation succeeds
   - No -> can start immediately

2. **Does it modify the same file as another subphase?** (merge conflict risk)
   - Yes -> sequence them or split the file
   - No -> can run in parallel

3. **Does it read/write the same state boundary?** (Convex table/index, contract storage, route-level state, deployment config)
   - Yes -> coordinate schema/interface first and sequence risky writes
   - No -> can run in parallel

### 2. Parallelism Patterns in Our Codebase

**Contract-Contract Parallelism:** Contract phases can run in parallel when they own different `.sol`, deploy, and test files and share only stable interfaces.
- Example: `LotCertificate.sol` work can overlap with `EvidenceRegistry.sol` work after role/interface decisions are stable.

**Convex-Convex Parallelism:** Backend phases that touch different `convex/` directories with no shared schema edits can run in parallel.
- Example: `convex/proposals/` can overlap with `convex/evidence/` after shared `convex/schema.ts` changes are complete.

**Frontend-Frontend Parallelism:** Phases that build different `packages/nextjs/app/` route trees for different workflows can run in parallel.
- Example: `packages/nextjs/app/partner/` can overlap with `packages/nextjs/app/admin/evidence/` if shared components are stable.

**Contract/Convex-then-Frontend within a Phase:** Contract and Convex subphases usually run first, then frontend subphases run in parallel consuming those interfaces.
- Example: contract events + Convex reconciliation -> partner route + admin route + QA.

### 3. File Ownership is Non-Negotiable

The file ownership table is the most important section for preventing merge conflicts. Rules:

- `convex/schema.ts` should be owned by Phase 1 or by a dedicated schema subphase. Later schema edits must be explicitly sequenced.
- Each new `convex/{feature}/` directory is owned by the phase that creates it. Later phases add **new files** where possible instead of modifying existing files from other phases.
- Each contract file under `packages/hardhat/contracts/` has one owning phase. Shared interfaces should be created early.
- Each deploy script under `packages/hardhat/deploy/` is owned by the phase that owns the contract deployment.
- `packages/nextjs/contracts/deployedContracts.ts` is generated by deployment; avoid hand edits and coordinate regeneration.
- `packages/nextjs/scaffold.config.ts` is foundation-owned because target network config affects every contract hook.
- Each `packages/nextjs/app/{route}/` directory is owned by one phase unless the strategy explicitly splits files.
- Shared components under `packages/nextjs/components/` must have a named owner and be created before dependent route work starts.

### 4. Quality Gates are Deployment Checkpoints

Each quality gate verifies that the system is in a known-good state before proceeding. The gate checks should be:

- **Automated where possible:** `pnpm compile`, `pnpm hardhat:test`, `npx convex dev`, `pnpm next:check-types`, `pnpm hardhat:check-types`, `pnpm next:build`
- **Manual where necessary:** "Connect wallet, submit transaction, verify event and UI state"
- **Feature-specific:** "Settlement preview matches contract result", "certificate event appears in the block explorer/debug UI", "admin-only action rejects partner wallet"
- **Demo-boundary aware:** "UI still says testnet/demo only and never implies real custody or investment returns"

---

## Quality Checklist

Before considering the parallelization strategy complete, verify:

- [ ] Phase Overview table includes all phases with type, complexity, and dependencies
- [ ] Master Dependency Graph shows all phases as boxes with arrows
- [ ] Every parallelism window explains WHY the phases are independent (different packages, dirs, contracts, routes, or roles)
- [ ] Internal parallelism diagrams exist for each window (showing subphase-level concurrency)
- [ ] Critical path is identified and annotated with the implication ("Start X early")
- [ ] Alternative shorter paths are noted
- [ ] File ownership table covers every shared/contested file, including generated artifacts
- [ ] Three execution strategies exist (solo, two devs, three+ devs) with estimated timelines
- [ ] Quality gates have concrete checks (not just "verify it works")
- [ ] Risk mitigation covers: schema errors, ABI drift, wallet/network failures, transaction partial failures, event sync issues, RPC/API limits, stale frontend, complexity overrun, and demo/legal copy drift
- [ ] Applicable skills are mapped to phases and exist in the available skills list
- [ ] ASCII art diagrams render correctly in plain markdown (no Mermaid in this document)
