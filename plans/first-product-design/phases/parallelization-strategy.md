# Parallelization Strategy — Harvverse First Product

**Purpose:** This document defines the execution strategy across all six Harvverse MVP phases, identifying the critical path, dependency graph, maximum concurrency windows, file ownership boundaries, quality gates, and skills required per phase.

**Prerequisite:** The design document at `plans/first-product-design/fpd.md` is the implementation source of truth. The repo is the Scaffold-ETH 2 Hardhat flavor with `packages/hardhat`, `packages/nextjs`, root `convex/`, and existing Convex generated AI guidelines. Phase work starts from the baseline scaffold: no Harvverse contracts, Convex app schema, or Harvverse frontend routes are assumed.

---

## Phase Overview

| Phase | Name | Type | Estimated Complexity | Dependencies |
| --- | --- | --- | --- | --- |
| **1** | Repository Baseline and Contract Foundation | Smart Contract / Config / QA | High | None |
| **2** | Plan Data and Evidence Baseline | Convex Backend | Medium-High | Phase 1 contract names, chain keys, and `EvidenceRegistry` ABI |
| **3** | Discovery, Proposal, and AI Explanation | Full-Stack | High | Phase 1 generated `PartnershipFactory` ABI; Phase 2 schema, guards, lot/plan seed, deployment registration |
| **4** | Partner Signing and Certificate Mint | Full-Stack / Web3 Transactions | High | Phase 1 `MockUSDC`, `PartnershipFactory`, `LotCertificate` ABIs; Phase 3 proposal creation |
| **5** | Milestone Attestations | Full-Stack / Evidence | Medium-High | Phase 2 evidence model; Phase 4 active partnership for final QA |
| **6** | Settlement and Demo Proof | Full-Stack / QA | High | Phase 4 active partnership; Phase 5 `awaiting_settlement` partnership |

---

## Master Dependency Graph

```
                    ┌────────────────────────────────────────────────────────────┐
                    │                         PHASE 1                            │
                    │  Contracts, network config, deploy scripts, generated ABIs │
                    └───────────────┬────────────────────┬───────────────────────┘
                                    │                    │
                    ┌───────────────▼──────────────┐     │
                    │            PHASE 2            │     │
                    │  Convex schema, seed data,    │     │
                    │  evidence model, deployments  │     │
                    └───────────────┬──────────────┘     │
                                    │                    │
                    ┌───────────────▼──────────────┐     │
                    │            PHASE 3            │◄────┘
                    │  Discovery, SIWE, proposal,   │
                    │  proposal hash, explanation   │
                    └───────────────┬──────────────┘
                                    │
                    ┌───────────────▼──────────────┐
                    │            PHASE 4            │
                    │  Partner approval/open tx,    │
                    │  certificate, reconciliation  │
                    └───────────────┬──────────────┘
                                    │
                    ┌───────────────▼──────────────┐
                    │            PHASE 5            │
                    │  Milestone fixtures,          │
                    │  attestations, proof state    │
                    └───────────────┬──────────────┘
                                    │
                    ┌───────────────▼──────────────┐
                    │            PHASE 6            │
                    │  Settlement intent, funding,  │
                    │  execution, final proof       │
                    └──────────────────────────────┘
```

**Parallelism rule:** The graph shows hard phase dependencies. Within those boundaries, subphases can overlap when they own different files and do not depend on generated artifacts from one another.

---

## Maximum Parallelism Windows

### Window 1: Foundation Split

**Concurrency:** Up to 3 independent streams inside Phase 1.

Phase 1 is the only true global foundation. Later phases need stable contract names, events, role names, constructor signatures, network keys, deploy tags, and generated ABI names. Within Phase 1, config, contracts, and tests can overlap because they touch different files.

```
Timeline: █████████████████████████████

1A network config        ███████████
1B core contracts        █████████████████
1C contract tests             █████████████
1D deploy + roles                    ███████
1E ABI smoke                              ███
1F foundation QA                            ███
```

**Internal parallelism:**

```
1A (scaffold.config.ts) ─────────────┐
                                     ├── 1D (deploy + role wiring) ─→ 1E ─→ 1F
1B (contracts/*.sol) ────────────────┤
                                     │
1C (test/*.ts) ──────────────────────┘
```

**Independence rationale:** 1A owns `packages/nextjs/scaffold.config.ts`; 1B owns `packages/hardhat/contracts/`; 1C owns `packages/hardhat/test/`. They can run simultaneously if contract names and constructor arguments are agreed in the first implementation checkpoint.

---

### Window 2: Schema Freeze, Seed, and Discovery Shell

**Concurrency:** Up to 4 streams once 2A schema names are frozen.

This is the most important backend parallelization window. Phase 2A should be completed early and treated as a shared schema freeze. After that, guard helpers, seed data, lot reads, deployment registration, and Phase 3 UI shell work can run together.

```
Timeline:          █████████████████████████████████████

2A full schema     ███████
2B auth guards           ███████
2C lot/plan reads        ███████
2D seed/deployments      █████████
2E evidence records       ███████
3A provider/SIWE shell     ██████████
3D home/lot route shell      ███████████
```

**Internal parallelism:**

```
2A (schema.ts) ──┬── 2B (auth/guards.ts, auth/sessions.ts)
                 ├── 2C (partner/lots.ts)
                 ├── 2D (admin/seed.ts, admin/deployments.ts)
                 └── 2E (evidence/records.ts)

3A (providers + SIWE) ─────┐
                           ├── 3D (home, lot detail, proposal page shell)
2C (lot/plan reads) ───────┘
```

**Independence rationale:** Phase 2 backend files are split by directory. Phase 3 route shell touches `packages/nextjs/app/` and can call read-only lot queries once `api.partner.lots.*` references exist. Proposal creation waits for 2B/2D and 3B.

**Conflict control:** Only one owner edits `convex/schema.ts`. Any later table/index change must go through that owner or be sequenced through a schema checkpoint.

---

### Window 3: Proposal Core and Explanation

**Concurrency:** Up to 3 streams.

This window converts discovery into a signable proposal. Math/hash helpers, proposal mutations, and optional explanation can be developed with clear file boundaries.

```
Timeline:                    █████████████████████████

3B finance/hash helpers      ███████
3C proposal mutation              █████████
3E AI/fallback explanation         ████████
3D proposal UI wiring                 █████████
3F proposal QA                              ████
```

**Internal parallelism:**

```
3B (model/finance.ts + proposalHash.ts) ──┬── 3C (partner/proposals.ts)
                                          │
3E (agent/explainProposal.ts) ────────────┤
                                          └── 3D (proposal UI final wiring)
```

**Independence rationale:** The AI explanation action reads locked proposal facts and writes `agentEvents`; it does not control proposal creation or transactions. UI can render deterministic proposal panels before the explanation action is complete.

**Conflict control:** `convex/agent/internal.ts` is shared by 3C and 3E. Assign a single owner or sequence edits in a short handoff.

---

### Window 4: Signing and Evidence Skeleton

**Concurrency:** Up to 5 streams, with one final dependency on an active partnership.

Phase 4 and Phase 5 can overlap substantially. Phase 4 owns partner transaction execution and active partnership reconciliation. Phase 5 owns admin evidence fixtures and attestation UI. Phase 5 final event QA waits for Phase 4 to produce an `onchainPartnershipId`.

```
Timeline:                              █████████████████████████████████████

4A tx record model                     ███████
4B approve/open UI                          ███████████
4C partnership reconciliation              ███████████
4D dashboard reads                      ███████
4E certificate dashboard                    █████████

5A fixture hash helpers                 █████
5B fixture mutation                         ████████
5C admin milestone UI                    ███████████
5D attest button                              ████████
5E evidence reconciliation                       █████████
```

**Internal parallelism:**

```
4A (chain/transactions.ts) ─────┬── 4B (ConfirmPartnershipButton)
                                └── 5D (AttestEvidenceButton)

4C (PartnershipOpened sync) ────┬── 4E (partner dashboard)
                                └── 5E (EvidenceAttested sync structure reuse)

5A (evidence hash) ─────────────┬── 5B (fixture mutation)
                                └── 5C (admin milestone UI)
```

**Independence rationale:** Phase 4 transaction UI works under `packages/nextjs/app/partner/`. Phase 5 admin UI works under `packages/nextjs/app/admin/milestones/`. Convex ownership is also split: Phase 4 owns `convex/chain/transactions.ts`, `convex/partner/partnerships.ts`, and the partnership part of `convex/chain/events.ts`; Phase 5 owns `convex/evidence/*` and the evidence part of event reconciliation.

**Conflict control:** `convex/chain/events.ts` is a shared file. Use one event-sync owner, or split event-specific logic into separate internal helpers and keep the polling/action shell stable.

---

### Window 5: Settlement Prep While Evidence Finishes

**Concurrency:** Up to 4 streams.

Settlement intent and funding UI can start before Phase 5 is fully complete by using local fixture data. Actual execution and final proof wait for partnership status `awaiting_settlement`.

```
Timeline:                                                █████████████████████████████

5E evidence finalization                                 ████████
5F milestone proof QA                                           █████

6A settlement intent                                      █████████
6B funding UI                                             █████████
6D reconciliation extension                                    █████████
6C settlement execution UI                                      █████████
6E proof views                                                   █████████
```

**Internal parallelism:**

```
6A (admin/settlements.ts) ───────┬── 6B (custody funding route)
                                 ├── 6C (settlement execution UI)
                                 └── 6E (proof panels)

6D (chain/events.ts settlement) ─┘
```

**Independence rationale:** Settlement intent is Convex backend. Funding and execution screens are separate route trees. Proof panels can render intent state before final transaction hashes exist.

**Conflict control:** Phase 6 again touches `convex/chain/events.ts`. Coordinate with the Phase 5 event-sync owner to avoid competing edits.

---

### Window 6: Final Integrated Demo Gate

**Concurrency:** Low. This is intentionally serialized.

After all features land, the remaining work is end-to-end verification and demo hardening. Parallel work here should be limited to independent bug fixes discovered by QA, with explicit file ownership.

```
Timeline:                                                                  ███████████████

6F local rehearsal                                                          █████
6F failure-path rehearsal                                                        █████
public-testnet rehearsal, if selected                                             █████
demo runbook freeze                                                                   ██
```

**Internal parallelism:**

```
QA lead runs E2E ──────┬── contract bug owner
                       ├── Convex bug owner
                       └── frontend bug owner

All fixes return to one final full rehearsal.
```

**Independence rationale:** Bug fixes can be parallel only when they touch disjoint files. The final rehearsal itself is a single critical path.

---

## Critical Path Analysis

The longest sequential chain determining minimum delivery time is:

```
Phase 1
  │
  ▼
Phase 2A schema freeze + 2D deployment registration/seed
  │
  ▼
Phase 3B proposal hash + 3C proposal creation
  │
  ▼
Phase 4B partner tx UI + 4C PartnershipOpened reconciliation
  │
  ▼
Phase 5B fixture records + 5D attest tx + 5E evidence reconciliation
  │
  ▼
Phase 6A settlement intent + 6C settle tx + 6D settlement reconciliation
  │
  ▼
Phase 6F final E2E demo rehearsal
```

**Shorter alternative paths:**

```
Phase 3E AI explanation ───────────────┐
                                       ├── Useful but not critical; fallback text unblocks demo.
Phase 4E certificate dashboard ────────┘

Phase 6B funding UI ───────────────────┐
                                       ├── Can start early; final correctness waits for settlement intent.
Phase 6E proof panel shell ────────────┘
```

**Implication:** Protect the critical path by stabilizing `convex/schema.ts`, proposal hash parity, `convex/chain/events.ts`, and generated contract ABIs early. Optional AI provider work must never block proposal creation or settlement.

---

## File Ownership Boundaries

| Directory/File | Phase Owner | Notes |
| --- | --- | --- |
| `packages/hardhat/contracts/MockUSDC.sol` | Phase 1 | Do not modify in later phases without contract owner approval. |
| `packages/hardhat/contracts/LotCertificate.sol` | Phase 1 | Phase 4 may read generated ABI only; metadata changes require sequencing. |
| `packages/hardhat/contracts/PartnershipFactory.sol` | Phase 1 | Proposal hash tuple changes block Phases 3 and 4. |
| `packages/hardhat/contracts/EvidenceRegistry.sol` | Phase 1 | Phase 5 depends on event shape; avoid event rename after 5D starts. |
| `packages/hardhat/contracts/SettlementDistributor.sol` | Phase 1 | Phase 6 depends on tuple/event shape; harden tests instead of late ABI changes. |
| `packages/hardhat/deploy/01_deploy_harvverse_core.ts` | Phase 1 | Owns deploy order and role grants. |
| `packages/hardhat/deploy/02_configure_harvverse_lot.ts` | Phase 1 | Owns initial onchain lot terms. |
| `packages/hardhat/test/*` | Phase 1 primarily; Phase 6 for settlement edge additions | Split by contract file to avoid conflicts. |
| `packages/nextjs/scaffold.config.ts` | Phase 1 | Later phases consume target network config only. |
| `packages/nextjs/contracts/deployedContracts.ts` | Generated by Phase 1 deploy | No manual edits. Regenerate through `pnpm contracts:deploy`. |
| `convex/schema.ts` | Phase 2 | Single owner. Later changes require explicit schema checkpoint. |
| `convex/auth/*` | Phase 2 and Phase 3 | Phase 2 guards, Phase 3 SIWE/session lifecycle. Sequence same-file edits. |
| `convex/admin/seed.ts` | Phase 2 | Seed data source of truth. |
| `convex/admin/deployments.ts` | Phase 2 | Active deployment registration consumed by Phase 3-6. |
| `convex/partner/lots.ts` | Phase 2 | Read-only lot/plan queries for Phase 3 UI. |
| `convex/model/finance.ts` | Phase 3 | Shared by Phase 3 and Phase 6; freeze formula after parity tests. |
| `convex/model/proposalHash.ts` | Phase 3 | Shared with `PartnershipFactory.expectedProposalHash`; changes block signing. |
| `convex/partner/proposals.ts` | Phase 3 | Owns proposal lifecycle until Phase 4 status updates. |
| `convex/agent/*` | Phase 3 | Optional explanation; not on critical transaction path. |
| `convex/chain/transactions.ts` | Phase 4 | Shared transaction queue consumed by Phases 5 and 6. |
| `convex/chain/events.ts` | Shared Phase 4/5/6 | Prefer one event-sync owner; event-specific helpers can be split out. |
| `convex/partner/partnerships.ts` | Phase 4 | Partner dashboard data, extended carefully by proof views. |
| `convex/evidence/*` | Phase 5 | Evidence records, fixtures, and status transitions. |
| `convex/admin/settlements.ts` | Phase 6 | Settlement intent and final status. |
| `packages/nextjs/app/page.tsx` | Phase 3 | Replaces default SE-2 home. |
| `packages/nextjs/app/partner/lots/*` | Phase 3 | Lot detail and proposal CTA. |
| `packages/nextjs/app/partner/proposals/*` | Phase 3/4 | Phase 3 page shell; Phase 4 transaction button. Sequence same route edits. |
| `packages/nextjs/app/partner/dashboard/*` | Phase 4, extended Phase 5/6 | Certificate first, then milestone proof, then settlement proof. |
| `packages/nextjs/app/admin/milestones/*` | Phase 5 | Admin evidence fixture and attestation controls. |
| `packages/nextjs/app/admin/settlement/*` | Phase 6 | Settlement intent/execution/proof. |
| `packages/nextjs/app/custody/settlement-funding/*` | Phase 6 | Custody funding route. |

---

## Recommended Execution Strategies

### Solo Developer

**Estimated total time:** 13-18 focused days.

| Sprint | Work |
| --- | --- |
| 1 | Phase 1A-1F foundation, contract tests, deploy, ABI generation |
| 2 | Phase 2A schema freeze, then 2B-2F seed/read/evidence backend |
| 3 | Phase 3A-3F proposal flow and fallback explanation |
| 4 | Phase 4A-4F signing, reconciliation, dashboard |
| 5 | Phase 5A-5F milestone fixtures and attestations |
| 6 | Phase 6A-6F settlement, final proof, demo rehearsal |

**Solo guidance:** Keep a written handoff after each phase because the same developer will otherwise carry stale assumptions across packages. Run the quality gate at every phase boundary.

### Two Developers

**Estimated total time:** 9-12 focused days.

| Sprint | Developer A | Developer B |
| --- | --- | --- |
| 1 | Phase 1B contracts and tests | Phase 1A chain config, deploy scripts, ABI smoke |
| 2 | Phase 2A schema and 2B guards | Phase 2C reads, 2D seed/deployments, 2E evidence records |
| 3 | Phase 3B/3C proposal backend | Phase 3A/3D frontend and SIWE shell |
| 4 | Phase 4A/4C reconciliation | Phase 4B/4E transaction UI and dashboard |
| 5 | Phase 5B/5E evidence backend | Phase 5C/5D/5F admin UI and proof timeline |
| 6 | Phase 6A/6D settlement backend | Phase 6B/6C/6E settlement UI and final proof |

**Two-developer guidance:** Developer A should own shared backend/event sync. Developer B should own route trees and browser verification. Only one developer edits `convex/schema.ts` and `convex/chain/events.ts` at a time.

### Three+ Developers/Agents

**Estimated total time:** 7-9 focused days if handoffs are disciplined.

| Sprint | Agent A - Contracts/Chain | Agent B - Convex Backend | Agent C - Frontend/UI | Agent D - QA/Integration |
| --- | --- | --- | --- | --- |
| 1 | Phase 1B/1C contracts/tests | Phase 2A schema draft after contract names freeze | Phase 1A config and route planning | Verify AGENTS/skills, command gates |
| 2 | Phase 1D deploy/ABIs | Phase 2B-2E guards/seed/evidence/deployments | Phase 3A provider/SIWE shell and 3D home/lot UI | Check generated ABIs and Convex generated API |
| 3 | Hash parity support and tx fixture checks | Phase 3B/3C proposal backend | Phase 3D/3E proposal/explanation UI | Browser proposal QA |
| 4 | Verify role grants and chain events | Phase 4A/4C transaction/reconciliation | Phase 4B/4E signing dashboard | Wallet flow QA |
| 5 | Evidence role/event verification | Phase 5A/5B/5E evidence backend | Phase 5C/5D/5F admin/proof UI | Milestone attestation QA |
| 6 | Settlement contract edge tests | Phase 6A/6D settlement backend | Phase 6B/6C/6E funding/settlement/proof UI | Full E2E rehearsal and runbook |

**Three+ guidance:** Assign explicit write ownership. Agents are not isolated from one another; they must not revert or overwrite files owned by another stream. Shared files require a named integrator.

---

## Quality Gates

| Gate name | Trigger | Checks |
| --- | --- | --- |
| Foundation Gate | After Phase 1F | `pnpm compile`, `pnpm hardhat:test`, `pnpm contracts:deploy`, generated ABIs contain all five Harvverse contracts, `pnpm next:check-types`, `pnpm hardhat:check-types` |
| Schema Gate | After Phase 2A | `npx convex dev`, generated Convex types, indexes named correctly, no unbounded arrays for child records |
| Seed/Data Gate | After Phase 2F | Seed creates lot/plan/custody/milestones, deployment registration returns active `PartnershipFactory`, lot reads use indexes |
| Proposal Gate | After Phase 3F | SIWE/session works, proposal hash matches contract expectation, fallback explanation works without LLM key, `pnpm next:build` |
| Signing Gate | After Phase 4F | Partner can approve/open partnership locally, event sync creates active partnership, certificate proof appears |
| Evidence Gate | After Phase 5F | Six fixture records created, six attestation txs reconciled, partnership reaches `awaiting_settlement`, demo labels visible |
| Settlement Gate | After Phase 6E | Settlement intent, funding, execution, event reconciliation, and final proof all show exact amounts and hashes |
| Demo Freeze Gate | After Phase 6F | Full 5-minute rehearsal, failure paths tested, browser screenshots checked, public-testnet deployment verified if selected |

---

## Risk Mitigation

| Risk | Impact | Mitigation strategy |
| --- | --- | --- |
| `convex/schema.ts` churn blocks parallel backend/frontend work | High | Complete Phase 2A early, assign one schema owner, invoke `convex-migration-helper` after data exists. |
| Proposal hash mismatch between Convex and Solidity | Critical | Add parity tests, freeze tuple order, compare against `PartnershipFactory.expectedProposalHash` before Phase 4. |
| Generated ABIs missing or stale | High | Run `pnpm contracts:deploy` after contract changes; never hand-edit `deployedContracts.ts`. |
| Event reconciliation trusts client-submitted tx hash | Critical | Verify receipt status, chain ID, emitter address, decoded event fields, and expected Convex record values before state changes. |
| `convex/chain/events.ts` merge conflicts | High | Assign one event-sync owner or split event-specific logic into helper modules. |
| Admin/verifier/custodian roles confused in UI | High | Keep role checks in Convex and contract roles onchain; display expected wallet role in admin screens. |
| AI output makes financial/legal claims | Medium | Use deterministic fallback, restrict AI to locked facts, never let AI compute or alter terms. |
| Settlement pool underfunded during demo | High | Add pool balance/shortfall screen, run funding step in rehearsal, test underfunded revert path. |
| Wallet NFT metadata does not appear on testnet | Medium | App dashboard displays certificate proof from Convex and explorer links; do not depend on wallet NFT indexing. |
| Public-testnet chain selection changes late | Medium | Keep chain selection env-driven; choose from Hardhat-configured chains unless sponsor criteria require otherwise. |
| Frontend text overflows hashes/amounts on mobile | Medium | Use wrapping monospace text, stable panel dimensions, and browser/mobile QA before demo freeze. |
| Demo language implies real investment or guarantees | High | Use only "testnet demo", "demo MockUSDC", "deterministic settlement example", and "not financial advice" language. |

---

## Applicable Skills Per Phase

| Phase | Skills to Invoke | Reason |
| --- | --- | --- |
| **1** | `blockchain-developer`, `openzeppelin`, `erc-721`, `next-best-practices`, `vercel-react-best-practices`, `browser-use:browser` or `playwright` | Contract architecture, OpenZeppelin v5 patterns, non-transferable certificate, chain config, ABI smoke, browser verification. |
| **2** | `convex`, `convex-migration-helper`, `convex-performance-audit`, `next-best-practices`, `blockchain-developer`, `openzeppelin` | Convex schema/functions, future migration safety, indexes/bounded reads, evidence as accountable claims, registry role assumptions. |
| **3** | `siwe`, `convex`, `convex-setup-auth`, `next-best-practices`, `vercel-react-best-practices`, `frontend-design`, `openai-docs`, `browser-use:browser` or `playwright` | Wallet auth, proposal backend, optional formal Convex auth, App Router UI, performance, product-quality frontend, optional OpenAI provider docs, browser QA. |
| **4** | `blockchain-developer`, `openzeppelin`, `erc-721`, `convex`, `convex-performance-audit`, `next-best-practices`, `frontend-design`, `browser-use:browser` or `playwright` | Wallet-owned approval/open flow, SafeERC20 and roles, certificate display, transaction records/reconciliation, dashboard UX, wallet QA. |
| **5** | `convex`, `convex-performance-audit`, `blockchain-developer`, `openzeppelin`, `next-best-practices`, `frontend-design`, `browser-use:browser` or `playwright` | Evidence fixtures, attestation roles/events, indexed proof reads, admin UI, partner timeline, milestone QA. |
| **6** | `blockchain-developer`, `openzeppelin`, `convex`, `convex-performance-audit`, `next-best-practices`, `frontend-design`, `browser-use:browser` or `playwright` | Deterministic settlement, SafeERC20 payout execution, settlement intents/reconciliation, funding/proof UI, final E2E demo QA. |

**Deferred or intentionally unused skills:**

| Skill | Why not on the MVP critical path |
| --- | --- |
| `eip-5792` | Approval and open-partnership remain two explicit wallet prompts unless batching is intentionally added later. |
| `ponder` / `subgraph` | Convex event reconciliation is sufficient for the hackathon MVP. |
| `drizzle-neon` | Convex is the only application backend for this repo. |
| `x402` | No payment-gated API is part of the first product demo. |
| `convex-create-component` | No reusable Convex component boundary is needed for the MVP. |
| `convex-quickstart` | Convex already exists in the repository; use generated AI guidelines instead. |
