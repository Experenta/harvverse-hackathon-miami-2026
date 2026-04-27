# Phase 1 — Repository Baseline and Contract Foundation

**Goal:** Establish the Harvverse contract foundation on the existing Scaffold-ETH 2 Hardhat flavor, including chain selection, core contracts, deploy scripts, generated ABIs, and minimal frontend/network smoke checks. After this phase, later Convex and frontend work can depend on stable contract names, events, roles, and generated TypeScript ABIs.

**Prerequisite:** Repository baseline only: `packages/hardhat`, `packages/nextjs`, root `convex/`, `pnpm` workspace, and the finalized design at `plans/first-product-design/fpd.md`. No Harvverse contracts, Convex schema, or Harvverse routes are assumed.

**Runs in PARALLEL with:** Nothing at the phase level - this is the shared foundation. Internally, chain config, Solidity implementation, and deploy-script drafting can overlap once constructor arguments and contract names are agreed.

**Skills to invoke:**

- `blockchain-developer` - Coordinate the end-to-end wallet-owned transaction architecture, demo custody boundaries, and testnet-only assumptions.
- `openzeppelin` - Implement `ERC20`, `ERC721`, `AccessControl`, `SafeERC20`, and `ReentrancyGuard` using the installed OpenZeppelin v5 source.
- `erc-721` - Implement `LotCertificate` as a non-transferable certificate and account for `_safeMint` reentrancy ordering.
- `next-best-practices` - Keep App Router/provider and environment changes compatible with the existing Next.js 15 app.
- `vercel-react-best-practices` - Keep any smoke UI/config reads low-waterfall and avoid unnecessary client bundles.
- `browser-use:browser` or `playwright` - Validate the local app, network state, and generated contract availability after deploy.

**Acceptance Criteria:**

1. `packages/hardhat/contracts/MockUSDC.sol`, `LotCertificate.sol`, `PartnershipFactory.sol`, `EvidenceRegistry.sol`, and `SettlementDistributor.sol` compile with Solidity `0.8.30`.
2. `LotCertificate` mints certificates only through `MINTER_ROLE` and rejects wallet-to-wallet transfers while still allowing mint and burn paths.
3. `PartnershipFactory.openPartnership` validates the onchain proposal hash, prevents duplicate hashes, pulls exact 6-decimal MockUSDC ticket units, records partner/farmer addresses, and mints a certificate.
4. `EvidenceRegistry.attestEvidence` emits an accountable event only for `ATTESTER_ROLE`.
5. `SettlementDistributor.preview` and `settle` use the same deterministic cents math as the design and reject duplicate settlements.
6. `pnpm contracts:deploy` creates Harvverse deployment artifacts and regenerates `packages/nextjs/contracts/deployedContracts.ts` with all five contract names.
7. `packages/nextjs/scaffold.config.ts` can target `hardhat` by default and one selected testnet through `NEXT_PUBLIC_ACTIVE_CHAIN_KEY` without enabling burner wallets on public testnets.
8. `pnpm compile && pnpm hardhat:test` passes without errors.
9. `pnpm next:check-types && pnpm hardhat:check-types` passes without errors.

---

## Subphase Dependency Graph

```
1A (network/config contract) ─────────────┐
                                          ├── 1D (deploy + role wiring) ──→ 1E (ABI smoke)
1B (core Solidity contracts) ─────────────┤
                                          │
1C (contract tests) ──────────────────────┘

1E complete ──→ 1F (foundation QA and handoff notes)
```

**Optimal execution:**

1. Start 1A and 1B together. They touch different packages and only need agreement on chain keys, contract names, and constructor inputs.
2. Start 1C as each contract stabilizes; tests can be split by file with one owner per contract.
3. Start 1D when constructor signatures are stable and all contract tests pass locally.
4. Start 1E after `pnpm contracts:deploy` generates ABIs.
5. Finish with 1F before Phase 2/3 work consumes generated artifacts.

**Estimated time:** 2-3 days

---

## Subphases

### 1A — Target Network and Frontend Chain Config

**Type:** Config
**Parallelizable:** Yes - independent of Solidity implementation once the supported chain keys are agreed.

**What:** Update `packages/nextjs/scaffold.config.ts` to select `hardhat`, `celoSepolia`, `baseSepolia`, or `polygonAmoy` through `NEXT_PUBLIC_ACTIVE_CHAIN_KEY`, keep local polling fast, and disable burner wallets outside local networks.

**Why:** Every frontend contract hook reads the target network from Scaffold-ETH config. If this is unstable, generated ABIs and wallet transactions can point at the wrong chain.

**Where:**

- `packages/nextjs/scaffold.config.ts` (modify)
- `packages/nextjs/.env.example` or local env documentation (modify if present)

**How:**

**Step 1: Replace the static hardhat-only network selection with a keyed map.**

```typescript
// Path: packages/nextjs/scaffold.config.ts
import * as chains from "viem/chains";

const chainByKey = {
  hardhat: chains.hardhat,
  celoSepolia: chains.celoSepolia,
  baseSepolia: chains.baseSepolia,
  polygonAmoy: chains.polygonAmoy,
} as const;

type SupportedChainKey = keyof typeof chainByKey;

const activeChainKey = (process.env.NEXT_PUBLIC_ACTIVE_CHAIN_KEY ?? "hardhat") as SupportedChainKey;
const activeChain = chainByKey[activeChainKey] ?? chains.hardhat;
const celoSepoliaRpcUrl = process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL;

const scaffoldConfig = {
  targetNetworks: [activeChain],
  pollingInterval: activeChain.id === chains.hardhat.id ? 3000 : 5000,
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,
  rpcOverrides: celoSepoliaRpcUrl ? { [chains.celoSepolia.id]: celoSepoliaRpcUrl } : {},
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  burnerWalletMode: activeChain.id === chains.hardhat.id ? "localNetworksOnly" : "disabled",
} as const satisfies ScaffoldConfig;
```

**Step 2: Verify the chain exists in `packages/hardhat/hardhat.config.ts`.**

```bash
rg -n "celoSepolia|baseSepolia|polygonAmoy" packages/hardhat/hardhat.config.ts
```

**Step 3: Keep the initial deployment target local.**

```bash
NEXT_PUBLIC_ACTIVE_CHAIN_KEY=hardhat pnpm next:check-types
```

**Key implementation notes:**

- Do not add a second app-level source of truth for wallet networks.
- Do not enable burner wallets on public testnets.
- Add Celo Alfajores only if sponsor or Chainlink requirements force it; it is not in the current Hardhat config.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/scaffold.config.ts` | Modify | Environment-selected target network and burner wallet behavior |
| `packages/nextjs/.env.example` | Modify | Optional documentation for `NEXT_PUBLIC_ACTIVE_CHAIN_KEY` and RPC override |

---

### 1B — Core Solidity Contract Set

**Type:** Smart Contract
**Parallelizable:** Yes - contract files can be owned separately, but shared interfaces/events must be frozen before deploy scripts and frontend hooks depend on them.

**What:** Create the five MVP contracts: `MockUSDC`, `LotCertificate`, `PartnershipFactory`, `EvidenceRegistry`, and `SettlementDistributor`.

**Why:** Later phases require onchain lot terms, wallet-owned partnership opening, certificate minting, evidence events, and deterministic settlement execution.

**Where:**

- `packages/hardhat/contracts/MockUSDC.sol` (new)
- `packages/hardhat/contracts/LotCertificate.sol` (new)
- `packages/hardhat/contracts/PartnershipFactory.sol` (new)
- `packages/hardhat/contracts/EvidenceRegistry.sol` (new)
- `packages/hardhat/contracts/SettlementDistributor.sol` (new)

**How:**

**Step 1: Add a 6-decimal demo token with explicit mint authority.**

```solidity
// SPDX-License-Identifier: MIT
// Path: packages/hardhat/contracts/MockUSDC.sol
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address admin) ERC20("Harvverse Demo USDC", "hvUSDC") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
```

**Step 2: Add the non-transferable certificate using OpenZeppelin v5 `_update`.**

```solidity
// SPDX-License-Identifier: MIT
// Path: packages/hardhat/contracts/LotCertificate.sol
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LotCertificate is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error NonTransferable();

    uint256 public nextTokenId = 1;
    mapping(uint256 tokenId => bytes32 proposalHash) public proposalHashOf;
    mapping(uint256 tokenId => uint256 partnershipId) public partnershipIdOf;

    constructor(address admin) ERC721("Harvverse Lot Certificate", "HVLOT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mintCertificate(address to, uint256 partnershipId, bytes32 proposalHash)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 tokenId)
    {
        tokenId = nextTokenId++;
        proposalHashOf[tokenId] = proposalHash;
        partnershipIdOf[tokenId] = partnershipId;
        _safeMint(to, tokenId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address previousOwner) {
        previousOwner = _ownerOf(tokenId);
        if (previousOwner != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

**Step 3: Add factory, evidence, and settlement contracts from the design, preserving event names.**

```solidity
// SPDX-License-Identifier: MIT
// Path: packages/hardhat/contracts/EvidenceRegistry.sol
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract EvidenceRegistry is AccessControl {
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");

    event EvidenceAttested(
        bytes32 indexed evidenceHash,
        uint256 indexed subjectId,
        uint256 indexed milestoneNumber,
        address attester,
        string schemaName
    );

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ATTESTER_ROLE, admin);
    }

    function attestEvidence(bytes32 evidenceHash, uint256 subjectId, uint256 milestoneNumber, string calldata schemaName)
        external
        onlyRole(ATTESTER_ROLE)
    {
        require(evidenceHash != bytes32(0), "evidence required");
        emit EvidenceAttested(evidenceHash, subjectId, milestoneNumber, msg.sender, schemaName);
    }
}
```

**Key implementation notes:**

- Use named OpenZeppelin v5 imports, verified from `packages/hardhat/node_modules/@openzeppelin/contracts/`.
- `LotCertificate.mintCertificate` updates all local state before `_safeMint` to avoid recipient reentrancy surprises.
- `PartnershipFactory` must compute `expectedProposalHash` using the same ABI tuple as `convex/model/proposalHash.ts` in Phase 3.
- `SettlementDistributor` must derive farmer and partner addresses from `PartnershipFactory`, never operator-submitted recipients.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/hardhat/contracts/MockUSDC.sol` | Create | Testnet-only 6-decimal demo stablecoin |
| `packages/hardhat/contracts/LotCertificate.sol` | Create | Non-transferable ERC-721 certificate |
| `packages/hardhat/contracts/PartnershipFactory.sol` | Create | Lot terms, ticket transfer, certificate mint |
| `packages/hardhat/contracts/EvidenceRegistry.sol` | Create | Local attestation event fallback |
| `packages/hardhat/contracts/SettlementDistributor.sol` | Create | Deterministic settlement and payout transfer |

---

### 1C — Contract Tests

**Type:** QA
**Parallelizable:** Yes - one test file per contract can be implemented by different owners after shared fixture helpers are stable.

**What:** Add focused Hardhat tests for role enforcement, proposal hash parity, non-transferability, duplicate prevention, settlement math, and underfunding behavior.

**Why:** These contracts move demo MockUSDC and produce proof events. Later frontend and Convex reconciliation work is unsafe without exact event and revert behavior.

**Where:**

- `packages/hardhat/test/MockUSDC.ts` (new)
- `packages/hardhat/test/LotCertificate.ts` (new)
- `packages/hardhat/test/PartnershipFactory.ts` (new)
- `packages/hardhat/test/EvidenceRegistry.ts` (new)
- `packages/hardhat/test/SettlementDistributor.ts` (new)
- `packages/hardhat/test/harvverseFixture.ts` (new, optional helper)

**How:**

**Step 1: Create a reusable fixture for the core deployment.**

```typescript
// Path: packages/hardhat/test/harvverseFixture.ts
import { ethers } from "hardhat";

export async function deployHarvverseFixture() {
  const [deployer, partner, farmer, escrow, verifier] = await ethers.getSigners();

  const usdc = await ethers.deployContract("MockUSDC", [deployer.address]);
  const certificate = await ethers.deployContract("LotCertificate", [deployer.address]);
  const factory = await ethers.deployContract("PartnershipFactory", [
    await usdc.getAddress(),
    await certificate.getAddress(),
    escrow.address,
    deployer.address,
  ]);
  const registry = await ethers.deployContract("EvidenceRegistry", [deployer.address]);
  const settlement = await ethers.deployContract("SettlementDistributor", [
    await usdc.getAddress(),
    await factory.getAddress(),
    deployer.address,
  ]);

  await certificate.grantRole(await certificate.MINTER_ROLE(), await factory.getAddress());
  await registry.grantRole(await registry.ATTESTER_ROLE(), verifier.address);

  return { deployer, partner, farmer, escrow, verifier, usdc, certificate, factory, registry, settlement };
}
```

**Step 2: Test the certificate transfer lock.**

```typescript
// Path: packages/hardhat/test/LotCertificate.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployHarvverseFixture } from "./harvverseFixture";

describe("LotCertificate", function () {
  it("mints through MINTER_ROLE and rejects transfer", async function () {
    const { certificate, partner, farmer } = await deployHarvverseFixture();
    const proposalHash = ethers.keccak256(ethers.toUtf8Bytes("proposal"));

    await certificate.mintCertificate(partner.address, 1n, proposalHash);

    await expect(
      certificate.connect(partner).transferFrom(partner.address, farmer.address, 1n),
    ).to.be.revertedWithCustomError(certificate, "NonTransferable");
  });
});
```

**Step 3: Test deterministic settlement cents.**

```typescript
// Path: packages/hardhat/test/SettlementDistributor.ts
import { expect } from "chai";
import { deployHarvverseFixture } from "./harvverseFixture";

describe("SettlementDistributor", function () {
  it("computes the MVP fixture from capped yield and fixed price", async function () {
    const { settlement } = await deployHarvverseFixture();

    const preview = await settlement.preview({
      partnershipId: 1n,
      yieldTenthsQQ: 60n,
      priceCentsPerLb: 350n,
      agronomicCostCents: 149_000n,
      evidenceHash: "0x" + "11".repeat(32),
    });

    expect(preview.revenueCents).to.equal(174_930n);
    expect(preview.profitCents).to.equal(25_930n);
    expect(preview.farmerCents).to.equal(15_558n);
    expect(preview.partnerCents).to.equal(10_372n);
  });
});
```

**Key implementation notes:**

- Use `ethers.solidityPackedKeccak256` or ABI coder helpers when checking proposal hash parity.
- Test access-control custom errors where practical instead of string matching.
- Include a duplicate `openPartnership` and duplicate `settle` test.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/hardhat/test/harvverseFixture.ts` | Create | Shared deployment helper |
| `packages/hardhat/test/MockUSDC.ts` | Create | Decimals and mint role tests |
| `packages/hardhat/test/LotCertificate.ts` | Create | Mint and non-transferability tests |
| `packages/hardhat/test/PartnershipFactory.ts` | Create | Proposal hash, transfer, duplicate tests |
| `packages/hardhat/test/EvidenceRegistry.ts` | Create | Attester role and event tests |
| `packages/hardhat/test/SettlementDistributor.ts` | Create | Math, funding, duplicate tests |

---

### 1D — Hardhat Deployment and Role Wiring

**Type:** Config
**Parallelizable:** No - depends on final constructor signatures and must be serialized before ABI smoke checks.

**What:** Add Harvverse deploy scripts with tags, deploy all core contracts, grant `LotCertificate.MINTER_ROLE` to the factory, and configure the first lot terms from env values.

**Why:** The Next.js app reads generated ABIs from deployment output. Later Convex deployment registration also needs stable addresses and transaction hashes.

**Where:**

- `packages/hardhat/deploy/01_deploy_harvverse_core.ts` (new)
- `packages/hardhat/deploy/02_configure_harvverse_lot.ts` (new)
- `packages/nextjs/contracts/deployedContracts.ts` (generated)

**How:**

**Step 1: Deploy all core contracts in one tagged deploy script.**

```typescript
// Path: packages/hardhat/deploy/01_deploy_harvverse_core.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployHarvverseCore: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const usdc = await deploy("MockUSDC", { from: deployer, args: [deployer], log: true, autoMine: true });
  const certificate = await deploy("LotCertificate", { from: deployer, args: [deployer], log: true, autoMine: true });
  const escrowWallet = process.env.DEMO_ESCROW_WALLET ?? deployer;

  const factory = await deploy("PartnershipFactory", {
    from: deployer,
    args: [usdc.address, certificate.address, escrowWallet, deployer],
    log: true,
    autoMine: true,
  });

  await deploy("EvidenceRegistry", { from: deployer, args: [deployer], log: true, autoMine: true });
  await deploy("SettlementDistributor", {
    from: deployer,
    args: [usdc.address, factory.address, deployer],
    log: true,
    autoMine: true,
  });

  const lotCertificate = await hre.ethers.getContract("LotCertificate", deployer);
  const minterRole = await lotCertificate.MINTER_ROLE();
  const hasRole = await lotCertificate.hasRole(minterRole, factory.address);
  if (!hasRole) {
    const gas = await lotCertificate.grantRole.estimateGas(minterRole, factory.address);
    await lotCertificate.grantRole(minterRole, factory.address, { gasLimit: (gas * 120n) / 100n });
  }
};

export default deployHarvverseCore;
deployHarvverseCore.tags = ["HarvverseCore"];
```

**Step 2: Configure the first lot terms separately.**

```typescript
// Path: packages/hardhat/deploy/02_configure_harvverse_lot.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const configureHarvverseLot: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const factory = await hre.ethers.getContract("PartnershipFactory", deployer);

  const farmerWallet = process.env.DEMO_FARMER_WALLET;
  const planHash = process.env.DEMO_PLAN_HASH;
  if (!farmerWallet || !planHash) throw new Error("DEMO_FARMER_WALLET and DEMO_PLAN_HASH are required");

  const args = [1n, 342_500n * 10_000n, farmerWallet, planHash] as const;
  const gas = await factory.configureLotTerms.estimateGas(...args);
  await factory.configureLotTerms(...args, { gasLimit: (gas * 120n) / 100n });
};

export default configureHarvverseLot;
configureHarvverseLot.tags = ["HarvverseLotConfig"];
```

**Step 3: Run deployment and verify generated ABIs.**

```bash
pnpm contracts:deploy --tags HarvverseCore,HarvverseLotConfig
rg -n "MockUSDC|LotCertificate|PartnershipFactory|EvidenceRegistry|SettlementDistributor" packages/nextjs/contracts/deployedContracts.ts
```

**Key implementation notes:**

- Use gas estimation plus a small margin for role grants and lot configuration.
- Keep `YourContract` deploy script untouched until a later cleanup decision; do not break default debug tooling accidentally.
- Do not put private keys or custody keys into Convex or committed env files.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/hardhat/deploy/01_deploy_harvverse_core.ts` | Create | Deploy core contract set and grant mint role |
| `packages/hardhat/deploy/02_configure_harvverse_lot.ts` | Create | Configure first onchain lot terms |
| `packages/nextjs/contracts/deployedContracts.ts` | Modify | Generated by Hardhat deploy task |

---

### 1E — Generated ABI and Frontend Smoke

**Type:** Frontend
**Parallelizable:** No - depends on deployment artifacts from 1D.

**What:** Confirm the Next.js package can resolve all generated Harvverse contract names through existing Scaffold-ETH hooks.

**Why:** Phases 3-6 use `useDeployedContractInfo`, `useScaffoldReadContract`, `useScaffoldWriteContract`, and event hooks. A naming mismatch here blocks all wallet UX.

**Where:**

- `packages/nextjs/contracts/deployedContracts.ts` (generated)
- `packages/nextjs/hooks/scaffold-eth/index.ts` (inspect only)
- `packages/nextjs/app/debug/page.tsx` (manual verification through existing route)

**How:**

**Step 1: Confirm existing hook exports.**

```bash
rg -n "useScaffoldReadContract|useScaffoldWriteContract|useDeployedContractInfo" packages/nextjs/hooks/scaffold-eth
```

**Step 2: Add no permanent UI unless needed; use a throwaway branch or debug page for smoke reads.**

```tsx
// Path: packages/nextjs/app/debug/_components/HarvverseSmoke.tsx
"use client";

import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export function HarvverseSmoke() {
  const { data: factory } = useDeployedContractInfo({ contractName: "PartnershipFactory" });
  return <span className="badge badge-outline">{factory?.address ?? "PartnershipFactory missing"}</span>;
}
```

**Step 3: Run type checks.**

```bash
pnpm next:check-types
```

**Key implementation notes:**

- Prefer deleting any throwaway smoke component before merging if the debug page already proves ABI availability.
- Use the exact hook names exported by `packages/nextjs/hooks/scaffold-eth`.
- Do not use older `useScaffoldContractRead` or `useScaffoldContractWrite` names.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/nextjs/contracts/deployedContracts.ts` | Modify | Generated contract names and ABIs |
| `packages/nextjs/app/debug/_components/HarvverseSmoke.tsx` | Create / Delete | Temporary smoke helper only if needed |

---

### 1F — Foundation QA and Handoff

**Type:** QA
**Parallelizable:** No - final gate before dependent phases consume contracts and ABIs.

**What:** Run the compile/test/typecheck gate, document deployed addresses, and freeze the contract event names and file ownership handoff for Phase 2-6 work.

**Why:** Parallel streams become expensive if they build against stale contract names, events, or generated ABI paths.

**Where:**

- `plans/first-product-design/phases/parallelization-strategy.md` (created after all phase plans)
- `packages/nextjs/contracts/deployedContracts.ts` (generated)
- `packages/hardhat/deployments/` (generated, not manually edited)

**How:**

**Step 1: Run the foundation commands.**

```bash
pnpm compile
pnpm hardhat:test
pnpm contracts:deploy
pnpm next:check-types
pnpm hardhat:check-types
```

**Step 2: Capture the stable contract interface list for parallel streams.**

```text
MockUSDC.approve(spender, amount)
MockUSDC.mint(to, amount)
PartnershipFactory.configureLotTerms(lotId, ticketUsdcUnits, farmerWallet, planHash)
PartnershipFactory.expectedProposalHash(lotId, partner)
PartnershipFactory.openPartnership(lotId, proposalHash)
EvidenceRegistry.attestEvidence(evidenceHash, subjectId, milestoneNumber, schemaName)
SettlementDistributor.preview(input)
SettlementDistributor.settle(input)
```

**Step 3: Mark the generated ABI handoff as the dependency for frontend transaction work.**

```text
Phase 3 may build proposal UI after Phase 2 lot/plan queries exist.
Phase 4 may build transaction buttons only after Phase 1 generated ABIs include MockUSDC and PartnershipFactory.
Phase 5 may build attestation buttons only after EvidenceRegistry ABI exists.
Phase 6 may build settlement buttons only after SettlementDistributor ABI exists.
```

**Key implementation notes:**

- Generated files should be reviewed but not hand-edited.
- If Phase 1 contract events change after this handoff, all event reconciliation subphases must be rescheduled.
- Public-testnet verification is a separate release gate; local Hardhat passing is the MVP implementation gate.

**Files touched:**

| File | Action | Notes |
| --- | --- | --- |
| `packages/hardhat/deployments/` | Create / Modify | Generated deployment artifacts |
| `packages/nextjs/contracts/deployedContracts.ts` | Modify | Generated ABI handoff to frontend |
| `plans/first-product-design/phases/parallelization-strategy.md` | Create | Records dependency and ownership handoff |

---

## Phase Summary

| File | Action | Subphase |
| --- | --- | --- |
| `packages/nextjs/scaffold.config.ts` | Modify | 1A |
| `packages/nextjs/.env.example` | Modify | 1A |
| `packages/hardhat/contracts/MockUSDC.sol` | Create | 1B |
| `packages/hardhat/contracts/LotCertificate.sol` | Create | 1B |
| `packages/hardhat/contracts/PartnershipFactory.sol` | Create | 1B |
| `packages/hardhat/contracts/EvidenceRegistry.sol` | Create | 1B |
| `packages/hardhat/contracts/SettlementDistributor.sol` | Create | 1B |
| `packages/hardhat/test/harvverseFixture.ts` | Create | 1C |
| `packages/hardhat/test/MockUSDC.ts` | Create | 1C |
| `packages/hardhat/test/LotCertificate.ts` | Create | 1C |
| `packages/hardhat/test/PartnershipFactory.ts` | Create | 1C |
| `packages/hardhat/test/EvidenceRegistry.ts` | Create | 1C |
| `packages/hardhat/test/SettlementDistributor.ts` | Create | 1C |
| `packages/hardhat/deploy/01_deploy_harvverse_core.ts` | Create | 1D |
| `packages/hardhat/deploy/02_configure_harvverse_lot.ts` | Create | 1D |
| `packages/nextjs/contracts/deployedContracts.ts` | Modify | 1D, 1E, 1F |
| `packages/nextjs/app/debug/_components/HarvverseSmoke.tsx` | Create / Delete | 1E |
| `packages/hardhat/deployments/` | Create / Modify | 1F |
| `plans/first-product-design/phases/parallelization-strategy.md` | Create | 1F |
