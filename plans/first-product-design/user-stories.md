# Harvverse First Product — User Stories (EARS Format)

**Version:** 0.1 (Draft for Review)
**Source:** [`fpd.md`](./fpd.md) v0.1 (MVP)
**Status:** Draft — pending review for completeness and correctness
**Purpose:** Translate the First Product Design Specification into atomic, testable requirements using the Easy Approach to Requirements Syntax (EARS). Each story should map to one or more acceptance tests during implementation.

---

## Table of Contents

1. [How to Read This Document](#1-how-to-read-this-document)
2. [Actor Index](#2-actor-index)
3. [Phase 1 — Repository Baseline & Contract Foundation](#3-phase-1--repository-baseline--contract-foundation)
4. [Phase 2 — Plan Data & Evidence Baseline](#4-phase-2--plan-data--evidence-baseline)
5. [Phase 3 — Discovery, Proposal & AI Explanation](#5-phase-3--discovery-proposal--ai-explanation)
6. [Phase 4 — Partner Signing & Certificate Mint](#6-phase-4--partner-signing--certificate-mint)
7. [Phase 5 — Milestone Attestations](#7-phase-5--milestone-attestations)
8. [Phase 6 — Settlement & Demo Proof](#8-phase-6--settlement--demo-proof)
9. [Cross-Cutting Requirements](#9-cross-cutting-requirements)
10. [Traceability Matrix](#10-traceability-matrix)
11. [Open Items & Ambiguities to Resolve](#11-open-items--ambiguities-to-resolve)

---

## 1. How to Read This Document

### 1.1 EARS Pattern Legend

| Tag | Pattern | Template |
| --- | --- | --- |
| **U** | Ubiquitous | The `<system>` shall `<response>`. |
| **E** | Event-driven | When `<trigger>`, the `<system>` shall `<response>`. |
| **S** | State-driven | While `<state>`, the `<system>` shall `<response>`. |
| **O** | Optional feature | Where `<feature is enabled>`, the `<system>` shall `<response>`. |
| **Un** | Unwanted behavior | If `<condition>`, then the `<system>` shall `<response>`. |
| **C** | Complex | Combinations of the above (annotated inline). |

### 1.2 Story ID Convention

`US-<phase>.<index>` for phase-scoped stories, `US-X.<index>` for cross-cutting requirements. IDs are stable; do not renumber when stories are added — append.

### 1.3 Source Linking

Every story carries a `Source:` reference back to the section of `fpd.md` it derives from. If a story has no source, it is an editorial inference and should be reviewed before acceptance.

---

## 2. Actor Index

| Actor | Definition (per `fpd.md` §2.1) |
| --- | --- |
| Digital Partner | Demo buyer backing a coffee lot via connected wallet + SIWE session. |
| Farmer | Coffee producer / recipient wallet. |
| Verifier / Agronomist | Plan or evidence attester (allowlisted wallet + Convex role). |
| Harvverse Admin | Demo operator (allowlisted wallet + Convex `admin` role). |
| Settlement Operator | Admin sub-role authorized for `SettlementDistributor.settle`. |
| Custodian / FI Escrow | Testnet custody wallet that funds the settlement pool. |
| Contract Deployer | Technical operator running Hardhat deploy scripts. |
| Convex System | Backend functions, scheduled jobs, internal actions. |
| Public Viewer / Judge | Read-only observer, no auth. |

---

## 3. Phase 1 — Repository Baseline & Contract Foundation

> **Source:** `fpd.md` §4

### 3.1 Contract Deployment

- **US-1.1 (E)** — When the Contract Deployer runs `pnpm contracts:deploy` against the active Hardhat network, the system shall deploy `MockUSDC`, `LotCertificate`, `PartnershipFactory`, `EvidenceRegistry`, and `SettlementDistributor`, and shall regenerate `packages/nextjs/contracts/deployedContracts.ts`.
  *Source: §4.3, §11.1*

- **US-1.2 (E)** — When deployment completes, the system shall grant `DEFAULT_ADMIN_ROLE`, `CONFIGURATOR_ROLE`, `MINTER_ROLE`, `ATTESTER_ROLE`, and `SETTLEMENT_OPERATOR_ROLE` to the configured admin/operator wallets.
  *Source: §4.4, §4.5, §5.3, §9.2*

- **US-1.3 (U)** — The Contract Deployer shall be able to register every active deployment (`chainKey`, `chainId`, `contractName`, `address`, `abiHash`, `deployTxHash`) into the Convex `contractDeployments` table so that Convex never trusts client-supplied contract addresses.
  *Source: §10 (`contractDeployments`), §12.1 (`registerDeployment`)*

- **US-1.4 (Un)** — If a post-deploy admin call (e.g. `configureLotTerms`, `transferOwnership`, role grants) is required, then the deploy script shall use `estimateGas` plus a 20% margin at the call site rather than modifying global `blockGasLimit`.
  *Source: §11.1, AGENTS.md "Gas limit in deploy scripts"*

### 3.2 Lot Configuration

- **US-1.5 (E)** — When the Admin invokes `PartnershipFactory.configureLotTerms(lotId, ticketUsdcUnits, farmerWallet, planHash)` with valid arguments, the contract shall persist the lot terms, mark the lot as `active`, and emit `LotTermsConfigured`.
  *Source: §4.5*

- **US-1.6 (Un)** — If `ticketUsdcUnits == 0`, `farmerWallet == address(0)`, or `planHash == bytes32(0)`, then `configureLotTerms` shall revert.
  *Source: §4.5 (require statements)*

- **US-1.7 (Un)** — If the caller of `configureLotTerms` does not hold `CONFIGURATOR_ROLE`, then the call shall revert with an OpenZeppelin AccessControl error.
  *Source: §4.5 (`onlyRole`)*

### 3.3 Frontend Network Configuration

- **US-1.8 (E)** — When `NEXT_PUBLIC_ACTIVE_CHAIN_KEY` is set to one of `hardhat`, `celoSepolia`, `baseSepolia`, or `polygonAmoy`, the Next.js app shall target that chain via `scaffold.config.ts`.
  *Source: §4.2*

- **US-1.9 (S)** — While the active chain is `hardhat`, the system shall enable burner-wallet mode `localNetworksOnly`; otherwise burner-wallet mode shall be `disabled`.
  *Source: §4.2*

- **US-1.10 (S)** — While the active chain is L2 or testnet (non-`hardhat`), the system shall set the wagmi polling interval to `5000ms`; while on `hardhat` it shall be `3000ms`.
  *Source: §4.2*

---

## 4. Phase 2 — Plan Data & Evidence Baseline

> **Source:** `fpd.md` §5

### 4.1 Plan Seeding

- **US-2.1 (E)** — When the Admin calls `seedFirstLot` with a valid session, plan hash, source URI, farmer wallet, and escrow wallet, the system shall insert one `lots` row, one `plans` row with status `approved_for_demo`, patch `lots.activePlanId`, and insert one `custodyAccounts` row of type `demo_escrow`.
  *Source: §5.2*

- **US-2.2 (Un)** — If the caller of `seedFirstLot` does not hold the `admin` role, then the mutation shall reject with an authorization error.
  *Source: §5.2 (`requireRole`)*

- **US-2.3 (U)** — The system shall never store `undefined` in any Convex document; optional fields shall be omitted at insert time and patched only when defined values exist.
  *Source: §5.2 narrative*

- **US-2.4 (U)** — Wallet addresses persisted in Convex shall be normalized to lowercase before insertion.
  *Source: §5.2 (`.toLowerCase()` calls)*

### 4.2 Plan Hash Anchoring

- **US-2.5 (E)** — When the Admin or Verifier calls `EvidenceRegistry.attestEvidence(planHash, lotId, 0, "HarvversePlan")`, the contract shall emit `EvidenceAttested`, and Convex shall reconcile the transaction into the `chainTransactions` and `evidenceRecords` tables.
  *Source: §3 (Phase 2 sequence), §5.3*

- **US-2.6 (Un)** — If the caller of `attestEvidence` does not hold `ATTESTER_ROLE` or supplies `evidenceHash == bytes32(0)`, then the call shall revert.
  *Source: §5.3 (require + `onlyRole`)*

### 4.3 Evidence as Accountable Claims

- **US-2.7 (U)** — Every evidence record shall identify an `attesterUserId` and `attesterRole`, and shall be flagged `demoOnly: true` only when its source is fixture data.
  *Source: §5.1 evidence model*

- **US-2.8 (U)** — The UI shall make visible the boundary between a recorded attester claim (what is proven) and the underlying farm condition (what is not proven by the chain).
  *Source: §5.1 evidence decision*

---

## 5. Phase 3 — Discovery, Proposal & AI Explanation

> **Source:** `fpd.md` §6

### 5.1 Public Discovery

- **US-3.1 (U)** — The system shall expose a public lot detail page that displays the active lot summary, plan constants, deterministic preview, and demo-status banner without requiring any wallet connection.
  *Source: §6.1, §13.1 (`page.tsx`)*

- **US-3.2 (Un)** — If a public viewer attempts to read private proposal data, wallet-session data, or evidence internals, then the system shall deny access.
  *Source: §2.3 access map*

### 5.2 Wallet Session (SIWE)

- **US-3.3 (E)** — When a Digital Partner connects a wallet and signs a SIWE nonce, the system shall verify the signature using `viem/siwe` and create an active `walletSessions` row containing `userId`, `walletAddress`, `nonce`, `sessionIdHash`, and `chainId`.
  *Source: §10 (`walletSessions`), §13.3*

- **US-3.4 (Un)** — If the SIWE signature is invalid or the `Host` header is missing, then the verification route shall return HTTP 400 or 401 and shall not create a session.
  *Source: §13.3*

- **US-3.5 (U)** — The system shall scope partner-private queries by the verified wallet of the active session, and shall never trust client-supplied wallet IDs or user IDs.
  *Source: §2.3, §14.1*

- **US-3.6 (U)** — The system shall not install the `siwe` npm package; SIWE verification shall use `viem/siwe` only.
  *Source: §13.3, §17.1*

### 5.3 Proposal Creation

- **US-3.7 (E)** — When a Digital Partner with an active `partner` session calls `createProposal` for an `available` lot whose plan is `approved_for_demo` and whose `onchainLotId` is set, the system shall compute a deterministic preview, compute `proposalHash` matching the contract's `expectedProposalHash`, and insert a `proposals` row with status `pending` and a 10-minute TTL (`expiresAt = now + 10 * 60 * 1000`).
  *Source: §6.3*

- **US-3.8 (Un)** — If the lot is not `available`, the plan is not `approved_for_demo`, the active `PartnershipFactory` deployment is missing, or `onchainLotId` is undefined, then `createProposal` shall throw a descriptive error.
  *Source: §6.3 (guard clauses)*

- **US-3.9 (U)** — The `proposalHash` produced by Convex shall be byte-identical to `PartnershipFactory.expectedProposalHash(lotId, partner)` for the same inputs (`chainId`, factory address, lot ID, partner wallet, ticket, farmer wallet, plan hash).
  *Source: §4.5, §6.2, §6.3*

### 5.4 AI Explanation

- **US-3.10 (O)** — Where an LLM provider key (`LLM_API_KEY`) is configured, when the Partner requests an explanation for a proposal, the system shall pass only locked facts to the LLM and return generated text along with an `explanation_complete` event in `agentEvents`.
  *Source: §6.4*

- **US-3.11 (Un)** — If the LLM action times out, fails, or returns a disallowed claim, then the system shall return deterministic fallback copy and append a `fallback_used` event in `agentEvents`.
  *Source: §6.4 catch branch, §15 ("AI timeout or disallowed claim")*

- **US-3.12 (U)** — The LLM shall never compute proposal terms, proposal hashes, payout amounts, eligibility, or legal advice; it shall only render text from precomputed JSON.
  *Source: §6.1 AI boundary decision*

---

## 6. Phase 4 — Partner Signing & Certificate Mint

> **Source:** `fpd.md` §7

### 6.1 Approval & Partnership Flow

- **US-4.1 (E)** — When the Partner clicks "Confirm partnership" on the proposal page, the UI shall request `MockUSDC.approve(PartnershipFactory, ticketUsdcUnits)` from the Partner's connected wallet.
  *Source: §7.2*

- **US-4.2 (E)** — When the approval transaction is broadcast, the UI shall call Convex `recordSubmitted` with `txType: "mock_usdc_approval"` and the related `proposalId`.
  *Source: §7.2, §7.3*

- **US-4.3 (E)** — When the approval succeeds, the UI shall request `PartnershipFactory.openPartnership(onchainLotId, proposalHash)` from the Partner's connected wallet.
  *Source: §7.2*

- **US-4.4 (E)** — When `openPartnership` succeeds, the contract shall transfer `ticketUsdcUnits` from the Partner to the configured escrow wallet via `safeTransferFrom`, mint a non-transferable `LotCertificate` to the Partner, and emit both `PartnershipOpened` and an ERC-721 `Transfer` mint event.
  *Source: §4.5, §3 sequence*

### 6.2 Onchain Guards

- **US-4.5 (Un)** — If the supplied `proposalHash` does not equal `expectedProposalHash(lotId, msg.sender)`, then `openPartnership` shall revert with `"proposal mismatch"`.
  *Source: §4.5*

- **US-4.6 (Un)** — If `proposalHash` has already been used, then `openPartnership` shall revert with `"proposal already used"`.
  *Source: §4.5*

- **US-4.7 (Un)** — If the targeted `lotId` is not active in `lotTerms`, then `openPartnership` shall revert with `"lot inactive"`.
  *Source: §4.5*

### 6.3 Wallet & UI Edge Cases

- **US-4.8 (Un)** — If the Partner's MockUSDC balance is below `ticketUsdcUnits`, then the UI shall surface a "Get demo USDC" action and shall disable the partnership button.
  *Source: §15 ("Missing MockUSDC balance")*

- **US-4.9 (Un)** — If MockUSDC allowance is below `ticketUsdcUnits`, then the UI shall present an "Approve demo USDC" step before "Confirm partnership".
  *Source: §15 ("Approval missing")*

- **US-4.10 (Un)** — If the connected wagmi chain differs from `scaffold.config.ts.targetNetworks[0]`, then the UI shall disable the confirm button and prompt the user to switch chains.
  *Source: §15 ("Wrong chain")*

- **US-4.11 (Un)** — If the Partner rejects the wallet prompt, then the proposal shall remain `pending` until its TTL and the UI shall show a parsed wallet-error toast via `getParsedError` + `notification`.
  *Source: §7.2, §15 ("Wallet signature rejected")*

- **US-4.12 (Un)** — If the proposal expires (`Date.now() > expiresAt`), then the proposal page shall reload with a freshly created proposal and hash.
  *Source: §15 ("Proposal expired")*

### 6.4 Certificate (Non-Transferability)

- **US-4.13 (U)** — `LotCertificate` shall be non-transferable: any transfer attempt between two non-zero addresses shall revert with the custom error `NonTransferable`.
  *Source: §4.4*

- **US-4.14 (U)** — Only an address holding `MINTER_ROLE` on `LotCertificate` shall be able to call `mintCertificate`.
  *Source: §4.4*

- **US-4.15 (U)** — Each minted certificate shall record both `partnershipId` and `proposalHash` on-chain in `partnershipIdOf` and `proposalHashOf`.
  *Source: §4.4*

- **US-4.16 (U)** — `LotCertificate` shall update token state before invoking `_safeMint` to prevent reentrancy through the recipient callback.
  *Source: §4.4 ERC-721 decision*

### 6.5 Convex Reconciliation

- **US-4.17 (E)** — When Convex's internal event-sync action observes `PartnershipOpened`, the system shall verify chainId, contract address (against `contractDeployments`), `proposalHash`, partner wallet, lot ID, and ticket amount, then mark the proposal `signed` and create the `partnerships` row in status `active`.
  *Source: §7.3 reconciliation table*

- **US-4.18 (Un)** — If any reconciliation check fails (chain, address, sender, amount, event), then the transaction shall be marked `unknown` or `reverted` and the proposal shall remain unresolved with a UI warning banner.
  *Source: §7.3, §15 ("Submitted tx mismatches intent")*

- **US-4.19 (U)** — Convex shall never sign or submit Partner, Admin, Operator, Custodian, or FI-Escrow transactions.
  *Source: §1.2, §14.1*

- **US-4.20 (U)** — `recordSubmitted` shall only accept calls from sessions whose role is one of `partner`, `admin`, `verifier`, `settlement_operator`, or `custodian`.
  *Source: §7.3*

---

## 7. Phase 5 — Milestone Attestations

> **Source:** `fpd.md` §8

### 7.1 Compressed Demo Time

- **US-5.1 (E)** — When the Admin clicks "Fast-forward milestone fixture" on the admin milestone page, the UI shall display the fixture as compressed demo time and shall expose evidence-creation actions.
  *Source: §8.1*

- **US-5.2 (U)** — The system shall label every fixture-derived evidence record as compressed demo time wherever it is rendered in the UI.
  *Source: §8.1*

### 7.2 Evidence Records

- **US-5.3 (E)** — When a Verifier or Admin calls `recordMilestoneEvidence` with a valid session, partnership ID, milestone number, evidence type, and artifact hash, the system shall insert an `evidenceRecords` row with `attesterUserId`, `attesterRole`, status `recorded`, and `demoOnly` set to `true` if and only if `evidenceType == "demo_fixture"`.
  *Source: §8.2*

- **US-5.4 (Un)** — If the caller does not hold the `verifier` or `admin` role, then `recordMilestoneEvidence` shall reject.
  *Source: §8.2 (`requireWalletSession`)*

### 7.3 Onchain Attestation

- **US-5.5 (E)** — When the Verifier or Admin calls `EvidenceRegistry.attestEvidence(evidenceHash, subjectId, milestoneNumber, schemaName)`, the contract shall emit `EvidenceAttested`, and Convex shall update the corresponding `evidenceRecords` row to status `attested` with the `registryTxHash`.
  *Source: §5.3, §8.3*

- **US-5.6 (Un)** — If `evidenceHash == bytes32(0)`, then `attestEvidence` shall revert.
  *Source: §5.3*

- **US-5.7 (Un)** — If the caller of `attestEvidence` does not hold `ATTESTER_ROLE`, then the call shall revert with an AccessControl error.
  *Source: §5.3*

### 7.4 Optional EAS Backend

- **US-5.8 (O)** — Where EAS is enabled and a stable EAS deployment exists on the active chain, the system shall record `easUid` on the evidence record; otherwise the system shall fall back to `EvidenceRegistry` and label the attestation as "local registry" in the UI.
  *Source: §8 EAS decision, §15 ("EAS unavailable")*

---

## 8. Phase 6 — Settlement & Demo Proof

> **Source:** `fpd.md` §9

### 8.1 Settlement Intent

- **US-6.1 (E)** — When the Admin or Settlement Operator submits the harvest fixture (`yieldTenthsQQ`, `scaScoreTenths`, `harvestEvidenceHash`) for a partnership in status `awaiting_settlement`, the system shall compute a deterministic preview using `computePreview` and insert a `settlements` row with status `intent_created`.
  *Source: §9.3*

- **US-6.2 (Un)** — If the partnership is not in status `awaiting_settlement` or its plan is missing, then `createSettlementIntent` shall throw `"Partnership is not ready for settlement"` or `"Plan missing"`.
  *Source: §9.3*

- **US-6.3 (Un)** — If the caller does not hold the `admin` or `settlement_operator` role, then `createSettlementIntent` shall reject.
  *Source: §9.3*

### 8.2 Pool Funding

- **US-6.4 (E)** — When a settlement intent is created, the custody page shall display the exact required funding amount and the `SettlementDistributor` contract address.
  *Source: §13.1, §15 ("Settlement pool underfunded")*

- **US-6.5 (E)** — When the Custodian transfers MockUSDC to the `SettlementDistributor`, the UI shall record the funding tx via `recordSubmitted` with `txType: "fund_settlement"` and the related `settlementId`.
  *Source: §3 sequence, §7.3 txType list*

- **US-6.6 (Un)** — If the contract balance is below the required payout at execution time, then settlement shall be blocked and the custody page shall display the exact shortfall.
  *Source: §15 ("Settlement pool underfunded")*

### 8.3 Settlement Execution

- **US-6.7 (E)** — When the Settlement Operator calls `SettlementDistributor.settle(input)` for a not-yet-settled partnership, the contract shall recompute revenue, profit, farmer share, and partner share using its own constants, transfer exact USDC base units to the farmer and partner addresses fetched from `PartnershipFactory`, mark the partnership as `settled`, and emit `SettlementExecuted`.
  *Source: §9.2*

- **US-6.8 (Un)** — If `settled[partnershipId]` is already `true`, then `settle` shall revert with `"already settled"`.
  *Source: §9.2*

- **US-6.9 (Un)** — If the resolved `farmer` or `partner` address is `address(0)`, then `settle` shall revert with `"bad partnership"`.
  *Source: §9.2*

- **US-6.10 (Un)** — If the caller of `settle` does not hold `SETTLEMENT_OPERATOR_ROLE`, then the call shall revert with an AccessControl error.
  *Source: §9.2*

- **US-6.11 (U)** — `SettlementDistributor.settle` shall cap effective yield at `YIELD_CAP_Y1_TENTHS` and floor effective price at `PRICE_FLOOR_CENTS` before computing revenue.
  *Source: §9.2 `preview`*

- **US-6.12 (Un)** — If revenue is less than or equal to agronomic cost, then profit, farmer share, and partner share shall all be zero, and no transfers shall occur.
  *Source: §9.2 `preview`, §15 ("Negative profit")*

- **US-6.13 (U)** — `SettlementDistributor` shall use `SafeERC20.safeTransfer` and `ReentrancyGuard.nonReentrant` for all payout transfers.
  *Source: §9.2*

### 8.4 Reconciliation & Proof UI

- **US-6.14 (E)** — When `SettlementExecuted` is reconciled by Convex, the system shall update the `settlements` row to `confirmed` and the `partnerships` row to `settled`, and the partner dashboard shall display exact farmer and partner amounts plus block-explorer links.
  *Source: §3 sequence, §9.4 state machine*

- **US-6.15 (U)** — The system shall display block-explorer links for `LotTermsConfigured`, `PartnershipOpened`, certificate-mint `Transfer`, every `EvidenceAttested`, and `SettlementExecuted`.
  *Source: §3 sequence, §13.4*

### 8.5 Partnership State Machine

- **US-6.16 (U)** — The system shall enforce the partnership state machine in §9.4: `proposal_pending → tx_submitted → active → milestones_attested → awaiting_settlement → settlement_intent_created → funded → settled`, with `expired` and `failed` as terminal failure transitions.
  *Source: §9.4*

---

## 9. Cross-Cutting Requirements

### 9.1 Authorization

- **US-X.1 (U)** — Every public Convex mutation, query, and action that touches private state shall validate arguments with `v.*` validators and shall call `requireWalletSession` or `requireRole`.
  *Source: §12.1, §14.3*

- **US-X.2 (U)** — Sensitive orchestration (event reconciliation, agent fact reads, agent event writes, session expiry) shall be implemented as `internalQuery`, `internalMutation`, or `internalAction` and shall not be exposed publicly.
  *Source: §12.1 Convex decision*

- **US-X.3 (U)** — Wallet connection alone shall not grant authorization; SIWE shall prove wallet control, Convex role checks shall decide what the wallet may do, and contract roles shall enforce privileged on-chain methods.
  *Source: §13.3 authorization decision*

### 9.2 Data Integrity

- **US-X.4 (U)** — All financial math shall use exact USDC base units and cents; UI rounding shall be display-only.
  *Source: §1.3, §14.4*

- **US-X.5 (U)** — `MockUSDC` shall be visibly labeled as testnet demo currency anywhere it appears in the UI.
  *Source: §14.4, §14.5*

- **US-X.6 (U)** — Convex `proposals.proposalHash`, contract `expectedProposalHash`, and minted `LotCertificate.proposalHashOf[tokenId]` shall match for any opened partnership.
  *Source: §4.4, §4.5, §6.3*

- **US-X.7 (U)** — Client-submitted hashes shall not be treated as final proof; Convex shall reconcile receipts and decoded logs from registered active deployments before changing canonical state.
  *Source: §14.1*

### 9.3 Demo & Legal Boundaries

- **US-X.8 (U)** — The UI shall use the approved phrasing list ("testnet demo", "demo MockUSDC", "deterministic settlement example", "not an offer, not financial advice", "evidence attestation records accountable claims").
  *Source: §14.5*

- **US-X.9 (U)** — The UI shall avoid the prohibited phrasing list ("guaranteed return", "risk-free", "bounded downside" without funded reserve, "trustless investment", "Harvverse never touches money" without context, "NFT profit rights", secondary-market language).
  *Source: §14.5*

### 9.4 Secrets Management

- **US-X.10 (U)** — No Partner, Farmer, Admin, Settlement Operator, Custodian, or FI-Escrow private key shall be stored in Convex env, `.env*` files, or any checked-in artifact.
  *Source: §14.2, §17.3*

- **US-X.11 (U)** — LLM provider keys, coffee/reference API keys, and EAS configuration shall live in Convex env and shall never be exposed to the Next.js client.
  *Source: §14.2*

### 9.5 Resilience & Recovery

- **US-X.12 (E)** — When a Convex write fails after a successful on-chain transaction, the next event-sync run shall recover state from the tx hash and decoded logs without manual intervention.
  *Source: §15 ("Convex write fails after tx")*

- **US-X.13 (Un)** — If a wallet does not render the certificate NFT due to testnet metadata caching, then the demo shall still display certificate ownership via the in-app certificate view and explorer events.
  *Source: §15 ("Wallet NFT not displayed")*

- **US-X.14 (E)** — When a proposal exceeds `expiresAt`, the proposal page shall reload with a freshly created proposal and a fresh hash.
  *Source: §15 ("Proposal expired")*

### 9.6 Contract Hygiene

- **US-X.15 (U)** — All Solidity contracts shall use OpenZeppelin v5 named imports (e.g. `import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";`).
  *Source: §14.4, AGENTS.md openzeppelin skill*

- **US-X.16 (U)** — `PartnershipFactory` and `SettlementDistributor` shall use `SafeERC20` for all ERC-20 transfers and `ReentrancyGuard.nonReentrant` for state-changing entrypoints that move funds.
  *Source: §4.5, §9.2, §14.4*

### 9.7 Observability

- **US-X.17 (U)** — Every chain transaction submitted by the UI shall be persisted to `chainTransactions` with `txHash`, `chainKey`, `type`, `status`, `submittedByWallet`, and the relevant related ID (`relatedProposalId`, `relatedPartnershipId`, or `relatedSettlementId`).
  *Source: §10 (`chainTransactions`), §7.3*

- **US-X.18 (U)** — The system shall provide a scheduled cron (per `convex/crons.ts`) that expires stale proposals and reconciles pending submitted transactions.
  *Source: §12 architecture (`crons.ts`)*

---

## 10. Traceability Matrix

| FPD Section | User Stories |
| --- | --- |
| §4 Phase 1 | US-1.1, US-1.2, US-1.3, US-1.4, US-1.5, US-1.6, US-1.7, US-1.8, US-1.9, US-1.10 |
| §5 Phase 2 | US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-2.6, US-2.7, US-2.8 |
| §6 Phase 3 | US-3.1, US-3.2, US-3.3, US-3.4, US-3.5, US-3.6, US-3.7, US-3.8, US-3.9, US-3.10, US-3.11, US-3.12 |
| §7 Phase 4 | US-4.1 — US-4.20 |
| §8 Phase 5 | US-5.1, US-5.2, US-5.3, US-5.4, US-5.5, US-5.6, US-5.7, US-5.8 |
| §9 Phase 6 | US-6.1 — US-6.16 |
| §10 Data Model | US-1.3, US-2.1, US-2.3, US-2.4, US-X.17 |
| §11 Contracts | US-1.1, US-1.4, US-X.15, US-X.16 |
| §12 Convex Functions | US-X.1, US-X.2, US-X.18 |
| §13 Routing & Auth | US-3.1, US-3.3 — US-3.6, US-X.3 |
| §14 Security | US-X.1 — US-X.11, US-X.15, US-X.16 |
| §15 Edge Cases | US-3.11, US-4.8 — US-4.12, US-4.18, US-5.8, US-6.6, US-6.12, US-X.12, US-X.13, US-X.14 |

---

## 11. Open Items & Ambiguities to Resolve

These items were flagged while drafting the user stories. Resolve before treating this document as the acceptance source of truth.

1. **Platform fee base (§16 Q4)** — The seed sets `platformFeeCents: 16_400`, which is ~10% of `agronomicCostCents + contingencyCents`, not 10% of the ticket. No story can lock this until the definition is chosen.
2. **One vs two wallet prompts (§16 Q6)** — US-4.1 and US-4.3 assume two prompts. If the demo moves to a single prompt (e.g. EIP-5792 batch), Phase 4 stories will change shape.
3. **Settlement payout unit (§9.2 contract)** — `settle` transfers `farmerCents * 10_000` and `partnerCents * 10_000`. That maps cents to USDC 6-decimal base units assuming `$1 = 100 cents = 1_000_000 base units`. Confirm before locking US-6.7.
4. **Milestone count and cadence** — The FPD references "compressed milestone fixture" but does not enumerate milestones. Phase 5 stories are intentionally generic. If you want one story per milestone, add them.
5. **`AttestEvidenceButton` argument typing (§8.3)** — The component passes `evidenceRecordId` into `recordSubmitted` as `partnershipId`. Either it is a code bug or the requirement should explicitly say "evidence attestation tx is keyed by evidence record". US-5.5 currently states the intent loosely; clarify before implementation.
6. **Final testnet selection (§16 Q1)** — Phase 1 stories cover all four supported chain keys. If Celo Sepolia is locked, US-1.8 / US-1.9 / US-1.10 can collapse to a single chain.
7. **R2 yield floor (§16 Q5)** — Currently treated as deferred. No story claims a guaranteed return; confirm UI never implies one (US-X.9 covers the prohibition).
8. **Convex Auth vs MVP wallet sessions (§16 Q3)** — US-3.3 specifies the MVP `walletSessions` table approach. If Convex Auth/JWT is adopted, US-3.3 / US-3.5 / US-X.1 need to be re-derived using `ctx.auth.getUserIdentity()`.

---

_This document is the requirements companion to `fpd.md`. Implementation acceptance tests should reference user-story IDs from this file. When `fpd.md` is amended, update the affected stories here and append new IDs rather than renumbering._
