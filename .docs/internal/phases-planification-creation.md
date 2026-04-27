# Phase Plan Creation — Prompt & Template

**Purpose:** This document defines the prompt, structural template, and quality standards for creating detailed phase plans from a design document in this repository. Each phase plan "zooms in" on a single phase from the design, breaking it into parallelizable subphases with concrete implementation guidance across Solidity contracts, Hardhat deployment/tests, Convex backend functions, and the Next.js Scaffold-ETH frontend.

---

## When to Use

Create phase plans **after** the design document is finalized. Each major phase identified in the design becomes its own markdown file at:

```
plans/{feature-name}/phases/phase{N}.md
```

Use this for feature work that has multiple implementation steps, shared artifacts, or parallel work streams. Do not use it for one-off bug fixes, small copy changes, or isolated refactors.

---

## Prompt

Use the following prompt (adapt the `{placeholders}` to your phase):

```
I need a detailed phase plan for Phase {N} of the {FEATURE_NAME} feature.

**Design document:** Read `plans/{feature-name}/{feature-name}-design.md` — specifically
the section for Phase {N}, plus the Data Model, Smart Contract Architecture, Convex Function Architecture, Routing & Authorization, Security Considerations, and Dependencies sections.

**Context:**
- Read `AGENTS.md` and follow the repo-specific Scaffold-ETH 2, Hardhat, Convex, frontend, and skill instructions.
- This repo is currently the Scaffold-ETH 2 Hardhat flavor because `packages/hardhat` exists.
- Read `plans/first-product-design/fpd.md` for the Harvverse product, demo, legal-risk, actor, settlement, and architecture baseline.
- If Convex code is involved, read `convex/_generated/ai/guidelines.md` before planning schema, validators, indexes, auth, HTTP endpoints, public functions, or internal functions.
- If smart contracts are involved, inspect `packages/hardhat/contracts/`, `packages/hardhat/deploy/`, `packages/hardhat/test/`, and any installed OpenZeppelin contracts before proposing Solidity patterns.
- If frontend contract interactions are involved, inspect `packages/nextjs/hooks/scaffold-eth`, `packages/nextjs/contracts/deployedContracts.ts`, `packages/nextjs/contracts/externalContracts.ts`, and `packages/nextjs/scaffold.config.ts`.
- Use Context7 MCP or primary docs for version-specific behavior in Wagmi, Viem, RainbowKit, DaisyUI, Hardhat, Next.js, Convex, or related libraries.
- Read the existing codebase at {relevant directories} to understand the current state.
- This phase's design section describes {summary of what the phase covers}.
- {Any constraints: "schema must deploy first", "contracts must compile before frontend writes", "runs in parallel with Phase M", "testnet only", "no real funds", "no new packages", etc.}

Produce a phase plan at `plans/{feature-name}/phases/phase{N}.md` following this exact structure:

1. **Header** — `# Phase {N} — {Phase Name}` followed by:
   - **Goal:** 1-2 sentences describing what this phase accomplishes.
   - **Prerequisite:** What must be done before this phase starts (prior phases, deployed contracts, generated ABIs, schema deployment, env vars, seeded demo data).
   - **Runs in PARALLEL with:** Which other phases can execute simultaneously (or "Nothing" if this is a foundation phase).
   - **Skills to invoke:** List of repository/Codex skills relevant to this phase.

2. **Acceptance Criteria** — 5-10 numbered, testable, pass/fail statements. Each should be verifiable
   without reading implementation details — describe the observable behavior, generated artifact, transaction, UI state, or command result.
   Include scope-appropriate checks such as `pnpm compile`, `pnpm hardhat:test`, `npx convex dev`, `pnpm next:check-types`, `pnpm next:build`, and wallet/browser verification.
   Always end with: `N. pnpm next:check-types && pnpm hardhat:check-types passes without errors.`

3. **Subphase Dependency Graph** — An ASCII art diagram showing:
   - Which subphases can run in parallel (same horizontal level).
   - Which subphases block others (arrows).
   - Optimal execution order annotation below the diagram.
   - Estimated time for the phase.

4. **Subphases** — Break the phase into 4-7 focused subphases (labeled {N}A, {N}B, {N}C, etc.).
   Each subphase has this exact structure:

```

### {N}A — {Subphase Name}

**Type:** Smart Contract / Convex Backend / Frontend / Full-Stack / Manual / Config / QA
**Parallelizable:** Yes/No — {brief reason referencing what it depends on or what depends on it}

**What:** {Concrete deliverable — specific files, contracts, functions, components, scripts, tests.}

**Why:** {Motivation — what this enables, what breaks without it.}

**Where:**

- `{exact/file/path.ts}` ({new / modify})
- `{exact/file/path.tsx}` ({new / modify})
- `{exact/file/path.sol}` ({new / modify})

**How:**

{Step-by-step implementation with realistic Solidity, TypeScript, TSX, or bash examples.
Every code block has a `// Path: {file}` comment on the first line for TS/TSX, or an equivalent path comment for Solidity.
Show before/after pairs for modifications.
Include inline comments explaining decisions that are not obvious.}

**Key implementation notes:**

- {Important detail 1}
- {Important detail 2}
- {Edge case and how to handle it}

**Files touched:**

| File     | Action                   | Notes               |
| -------- | ------------------------ | ------------------- |
| `{path}` | Create / Modify / Delete | {Brief description} |

```

5. **Phase Summary** — A combined table showing all files modified/created across all subphases:

| File | Action | Subphase |
|---|---|---|
| `{path}` | Create | {N}A |
| `{path}` | Modify | {N}C |

**Formatting rules:**
- Use GitHub-flavored Markdown.
- Code blocks with `solidity`, `typescript`, `tsx`, `css`, `bash` language tags.
- Every TypeScript/TSX code example has a `// Path:` comment.
- Every Solidity example has a `// Path:` comment after the SPDX line or immediately before the contract code.
- Show complete, realistic code — not pseudo-code. Include types, validators, imports, hook names, and relevant arguments.
- For modifications, show the relevant section (not the entire file), with enough surrounding context to locate where the change goes.
- Step-by-step instructions within "How" should be numbered: **Step 1**, **Step 2**, etc.
```

---

## Template Structure

````markdown
# Phase {N} — {Phase Name}

**Goal:** {1-2 sentences on what this phase accomplishes and what state the system is in after completion.}

**Prerequisite:** {What must be done first — specific phases, contract deployments, generated ABIs, schema deployments, env vars, seeded demo data.}

**Runs in PARALLEL with:** {Other phases that can execute simultaneously, or "Nothing — all subsequent phases depend on this."}

**Skills to invoke:**

- `{skill-1}` — {why this skill is needed for this phase}
- `{skill-2}` — {why}

**Acceptance Criteria:**

1. {Observable behavior or state — e.g., "`pnpm compile` succeeds and generated ABIs are available to the Next.js app."}
2. {Observable behavior — e.g., "`npx convex dev` runs without schema or function validation errors."}
3. {Observable behavior — e.g., "Navigating to `/lots/{lotId}` renders the lot summary, partner action state, and network warning when on the wrong chain."}
4. {Observable behavior — e.g., "All new Convex indexes follow the naming convention (`by_<field1>_and_<field2>`)."}
   ...
   N. `pnpm next:check-types && pnpm hardhat:check-types` passes without errors.

---

## Subphase Dependency Graph

```
{N}A ({short name}) ───────────────────────────────────────┐
                                                           ├── {N}D ({short name} — depends on {N}B, {N}C)
{N}B ({short name}) ──────────────────────────────────────┤
                                                           │
{N}C ({short name}) ──────────────────────────────────────┘

{N}D complete ──→ {N}E ({short name — depends on {N}D})
```

**Optimal execution:**

1. Start {N}A, {N}B, {N}C all in parallel if they touch different files and do not depend on generated artifacts from each other.
2. Once {N}B and {N}C are done -> start {N}D.
3. Once {N}D is done -> start {N}E.

**Estimated time:** {N-M} days

---

## Subphases

### {N}A — {Subphase Name}

**Type:** Convex Backend
**Parallelizable:** No — must complete first if later subphases import generated Convex types or depend on deployed indexes.

**What:** {Concrete deliverable.}

**Why:** {Motivation. E.g., "Every subsequent phase imports typed IDs from `convex/_generated/dataModel`. Without these table definitions and indexes, queries and mutations cannot compile safely."}

**Where:**

- `convex/schema.ts` (new or modify)

**How:**

**Step 1: Add or update the schema**

```typescript
// Path: convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	lots: defineTable({
		lotCode: v.string(),
		farmerWallet: v.string(),
		planHash: v.string(),
		status: v.union(
			v.literal("draft"),
			v.literal("published"),
			v.literal("funded"),
			v.literal("settled"),
		),
		createdAt: v.number(),
	})
		.index("by_lotCode", ["lotCode"])
		.index("by_status", ["status"]),
});
```

**Step 2: Run Convex locally and verify generated types**

```bash
npx convex dev
```

Verify the schema loads without errors and generated files under `convex/_generated/` update as expected.

**Key implementation notes:**

- Keep high-churn event sync data in separate tables instead of unbounded arrays on a lot document.
- Use `v.optional(...)` only for fields that legitimately do not exist at record creation time.
- Keep all index names aligned with `by_<field1>_and_<field2>`.

**Files touched:**

| File               | Action          | Notes                          |
| ------------------ | --------------- | ------------------------------ |
| `convex/schema.ts` | Create / Modify | Add feature tables and indexes |

---

### {N}B — {Subphase Name}

**Type:** Smart Contract
**Parallelizable:** Yes — independent after the contract interface and state boundaries are agreed; blocks frontend write hooks until ABIs are generated.

**What:** {Concrete deliverable — e.g., "Contract method and event for opening a lot partnership."}

**Why:** {Motivation — e.g., "Partner wallet intent must be enforced onchain and produce an event Convex can reconcile."}

**Where:**

- `packages/hardhat/contracts/{ContractName}.sol` (new or modify)
- `packages/hardhat/deploy/{NN}_deploy_{contract}.ts` (new or modify)
- `packages/hardhat/test/{ContractName}.ts` (new or modify)

**How:**

**Step 1: Add the contract behavior**

```solidity
// SPDX-License-Identifier: MIT
// Path: packages/hardhat/contracts/PartnershipFactory.sol
pragma solidity ^0.8.20;

contract PartnershipFactory {
    event PartnershipOpened(uint256 indexed lotId, address indexed partner, bytes32 proposalHash);

    mapping(uint256 lotId => bool open) public isOpen;

    function openPartnership(uint256 lotId, bytes32 proposalHash) external {
        require(!isOpen[lotId], "Lot already opened");
        isOpen[lotId] = true;
        emit PartnershipOpened(lotId, msg.sender, proposalHash);
    }
}
```

**Step 2: Deploy with Hardhat**

```typescript
// Path: packages/hardhat/deploy/01_deploy_partnership_factory.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployPartnershipFactory: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment,
) {
	const { deployer } = await hre.getNamedAccounts();
	const { deploy } = hre.deployments;

	await deploy("PartnershipFactory", {
		from: deployer,
		args: [],
		log: true,
		autoMine: true,
	});
};

deployPartnershipFactory.tags = ["PartnershipFactory"];
export default deployPartnershipFactory;
```

**Step 3: Compile, deploy locally, and verify generated frontend contracts**

```bash
pnpm compile
pnpm contracts:deploy
```

Verify `packages/nextjs/contracts/deployedContracts.ts` includes the new contract for the active network.

**Key implementation notes:**

- Keep user financial intent wallet-signed; do not move partner funds from a backend signer.
- Add tests for duplicate calls, wrong signer/role, emitted events, and terminal states.
- Manual post-deploy calls such as `grantRole` should set gas at the call site if needed.

**Files touched:**

| File                                                | Action          | Notes                     |
| --------------------------------------------------- | --------------- | ------------------------- |
| `packages/hardhat/contracts/{ContractName}.sol`     | Create / Modify | Contract state and events |
| `packages/hardhat/deploy/{NN}_deploy_{contract}.ts` | Create / Modify | Deploy script             |
| `packages/hardhat/test/{ContractName}.ts`           | Create / Modify | Contract tests            |
| `packages/nextjs/contracts/deployedContracts.ts`    | Generated       | Updated after deployment  |

---

### {N}C — {Subphase Name}

**Type:** Frontend
**Parallelizable:** Yes — depends only on the relevant generated ABI and route data shape; no overlap with unrelated routes.

**What:** {E.g., "Lot detail page with wallet-signed action button at `packages/nextjs/app/lots/[lotId]/page.tsx`."}

**Why:** {E.g., "The Digital Partner needs a single place to review canonical lot terms and sign their own transaction."}

**Where:**

- `packages/nextjs/app/lots/[lotId]/page.tsx` (new)
- `packages/nextjs/app/lots/[lotId]/_components/LotAction.tsx` (new)

**How:**

**Step 1: Create the route wrapper**

```tsx
// Path: packages/nextjs/app/lots/[lotId]/page.tsx
import { LotAction } from "./_components/LotAction";
import type { NextPage } from "next";

type PageProps = {
	params: Promise<{ lotId: string }>;
};

const LotPage: NextPage<PageProps> = async (props) => {
	const { lotId } = await props.params;

	return <LotAction lotId={lotId} />;
};

export default LotPage;
```

**Step 2: Create the wallet interaction component**

```tsx
// Path: packages/nextjs/app/lots/[lotId]/_components/LotAction.tsx
"use client";

import {
	useScaffoldReadContract,
	useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export function LotAction({ lotId }: { lotId: string }) {
	const normalizedLotId = BigInt(lotId);
	const { data: isOpen } = useScaffoldReadContract({
		contractName: "PartnershipFactory",
		functionName: "isOpen",
		args: [normalizedLotId],
	});

	const { writeContractAsync, isPending } = useScaffoldWriteContract({
		contractName: "PartnershipFactory",
	});

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			<button
				className="btn btn-primary w-fit"
				disabled={isPending || Boolean(isOpen)}
				onClick={async () => {
					try {
						await writeContractAsync({
							functionName: "openPartnership",
							args: [
								normalizedLotId,
								"0x0000000000000000000000000000000000000000000000000000000000000000",
							],
						});
						notification.success("Transaction submitted");
					} catch (error) {
						notification.error("Transaction rejected or failed");
					}
				}}
			>
				{isPending ? "Confirming" : "Open partnership"}
			</button>
		</main>
	);
}
```

**Step 3: Verify in browser**

Run `pnpm start`, navigate to `/lots/{lotId}`, connect a wallet, and verify the button state changes after the transaction.

**Key implementation notes:**

- Use current Scaffold-ETH hooks from `packages/nextjs/hooks/scaffold-eth`; do not use deprecated `useScaffoldContractRead` or `useScaffoldContractWrite`.
- Use `notification` and `getParsedError` from `~~/utils/scaffold-eth` for user-facing errors.
- Use DaisyUI classes and `@scaffold-ui/components` for web3 UI primitives where applicable.

**Files touched:**

| File                                                         | Action | Notes                                          |
| ------------------------------------------------------------ | ------ | ---------------------------------------------- |
| `packages/nextjs/app/lots/[lotId]/page.tsx`                  | Create | Async route wrapper for Next.js dynamic params |
| `packages/nextjs/app/lots/[lotId]/_components/LotAction.tsx` | Create | Client wallet action using Scaffold-ETH hooks  |

---

## Phase Summary

| File                                                         | Action          | Subphase |
| ------------------------------------------------------------ | --------------- | -------- |
| `convex/schema.ts`                                           | Create / Modify | {N}A     |
| `packages/hardhat/contracts/{ContractName}.sol`              | Create / Modify | {N}B     |
| `packages/hardhat/deploy/{NN}_deploy_{contract}.ts`          | Create / Modify | {N}B     |
| `packages/hardhat/test/{ContractName}.ts`                    | Create / Modify | {N}B     |
| `packages/nextjs/contracts/deployedContracts.ts`             | Generated       | {N}B     |
| `packages/nextjs/app/lots/[lotId]/page.tsx`                  | Create          | {N}C     |
| `packages/nextjs/app/lots/[lotId]/_components/LotAction.tsx` | Create          | {N}C     |
````

---

## Structural Patterns Across Our Plans

These patterns are tailored to this Harvverse Scaffold-ETH 2 repository and the design baseline in `plans/first-product-design/fpd.md`.

### Foundation Phase Pattern

For phases that establish shared contracts, schema, generated artifacts, or network configuration:

- Subphases are typically: Contract interfaces -> Contract tests -> Deploy scripts -> Convex schema -> Generated ABI verification -> Frontend shell/config
- Contract compile/deploy blocks frontend write-hook integration because `packages/nextjs/contracts/deployedContracts.ts` must exist
- Convex schema blocks Convex queries/mutations that import generated table IDs or depend on indexes
- Network config in `packages/hardhat/hardhat.config.ts` and `packages/nextjs/scaffold.config.ts` should be coordinated in a single subphase to avoid chain mismatch

### Smart Contract Phase Pattern

For phases that are primarily Solidity and deployment work:

- Keep contract, deploy script, and tests in the same phase
- Add tests before or alongside frontend integration
- Use OpenZeppelin patterns from installed source when using access control, token standards, pausing, or reentrancy guards
- Run `pnpm compile`, `pnpm hardhat:test`, and `pnpm contracts:deploy` before frontend subphases consume ABIs

### Convex Backend Phase Pattern

For phases that are primarily Convex (e.g., lot metadata, proposal state, evidence records, event sync):

- Subphases are typically: Schema -> shared validators/auth helpers -> queries -> mutations -> actions/internal actions -> cron/HTTP endpoints
- Schema comes first if generated data model types or indexes are needed
- Public functions must have argument validators and role/scope checks
- Sensitive orchestration should use `internalQuery`, `internalMutation`, and `internalAction`
- High-churn sync/event data should live in separate tables, not arrays on a shared document

### Full-Stack Phase Pattern

For phases with backend, contract, and frontend work (e.g., partner signing flow, certificate mint, settlement admin panel):

- Contract and Convex subphases come first, usually in parallel if they touch disjoint files
- Frontend subphases come second and consume generated ABIs plus Convex APIs
- Browser/wallet verification comes last
- Frontend subphases are parallelizable when they own different routes or components

```
{N}A (contract method + tests) ─────┐
{N}B (Convex proposal queries) ─────┤── {N}D (frontend page — uses A, B)
{N}C (Convex tx reconciliation) ────┤── {N}E (admin panel — uses B, C)
                                    └── {N}F (browser QA — uses D, E)
```

### Frontend-Only Phase Pattern

For phases that modify only the frontend (e.g., homepage revamp, wallet UX, certificate view):

- Subphases are typically: route shell -> shared components -> contract/Convex data adapters -> interaction states -> browser QA
- Independent route directories can run in parallel
- Shared components and utility functions should be created before dependent pages

```
{N}A (shared component) ─────────────┐
{N}B (lot route) ───────────────────┤── {N}D (interaction states — depends on A, B, C)
{N}C (partner route) ───────────────┘
                                    └── {N}E (browser verification — depends on D)
```

---

## Subphase Sizing Guide

| Size   | Effort     | Lines of Code | Typical Content                                                                            |
| ------ | ---------- | ------------- | ------------------------------------------------------------------------------------------ |
| Small  | < 2 hours  | < 100 lines   | Single utility function, config change, simple query/mutation, small UI state              |
| Medium | 2-6 hours  | 100-400 lines | Contract method + tests, query/mutation pair, single page component, auth/session helper   |
| Large  | 6-12 hours | 400+ lines    | Full route workflow, multi-contract integration, event reconciliation, complex admin panel |

Aim for **4-7 subphases per phase**, with most being Small-Medium. If a subphase feels Large, split it by file ownership or dependency boundary.

---

## Cross-Phase Dependency Documentation

Every phase plan should include awareness of its position in the broader plan. The header section captures this:

```markdown
**Prerequisite:** Phase 1 complete (contracts compile, local deployment succeeds, generated ABIs are available, Convex schema deployed).
**Runs in PARALLEL with:** Phase 3 (AI explanation and proposal previews — zero shared files with settlement contracts).
```

If the phase is on the **critical path**, note it:

```markdown
> **Critical path:** This phase is on the critical path (Phase 1 -> Phase 4 -> Phase 6).
> Start as early as possible after the prerequisite completes because frontend and demo QA depend on its generated artifacts.
```

---

## Quality Checklist

Before considering a phase plan complete, verify:

- [ ] Goal is clear and describes the end state (not just "implement X")
- [ ] Prerequisite explicitly lists prior phases and any deployed/generated artifacts
- [ ] Acceptance criteria are numbered, testable, and end with `pnpm next:check-types && pnpm hardhat:check-types`
- [ ] Dependency graph is ASCII art showing parallel/sequential relationships
- [ ] Optimal execution order is described below the graph
- [ ] Estimated time is provided
- [ ] Each subphase has: Type, Parallelizable (with reason), What, Why, Where (file paths), How (with code)
- [ ] Every TypeScript/TSX code example has a `// Path:` comment and uses realistic TypeScript (not pseudo-code)
- [ ] Every Solidity code example has a path comment and includes relevant pragma/import/context
- [ ] Modifications show enough surrounding context to locate the change
- [ ] Each subphase has a "Files touched" table
- [ ] Phase Summary table lists all files across all subphases
- [ ] Key implementation notes call out edge cases and non-obvious decisions
- [ ] Skills to invoke are listed in the header and exist in the available skills list
- [ ] Contract phases include compile, deploy, ABI generation, and test expectations
- [ ] Convex phases follow `convex/_generated/ai/guidelines.md`, including validators and public/internal function boundaries
- [ ] Frontend phases use package-scoped paths under `packages/nextjs/app/` and current Scaffold-ETH hook names
- [ ] Harvverse demo/legal boundaries are explicit where relevant: testnet only, no real funds, no production custody, no investment promises
- [ ] The plan is self-contained — an implementer can follow it without re-reading the design document
