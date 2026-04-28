# First Product Design Fixes

## FPD-FIX-001: Plan-Defined Coffee Price Must Be Contract-Enforced

**Status:** Proposed  
**Priority:** Required before Phase 6 settlement implementation  
**Related plan:** `plans/first-product-design/fpd.md` sections 1.3, 4, 5, 6, and 9

### Problem

The first product design correctly says Chainlink must not determine ROI or settlement in the MVP. The MVP coffee price is a fixed plan term: `$3.50/lb`.

The current contract shape still has a deviation: `SettlementDistributor.SettlementInput` accepts `priceCentsPerLb` as calldata. That means the backend/operator can pass a different settlement price at execution time. Convex may preview `$3.50/lb`, but the contract is not the source of truth for that price.

This is not acceptable for the demo story. The plan can define the price, but once the plan is approved for a lot, the contract must enforce the plan price.

### Design Decision

Coffee price is **plan-defined and contract-enforced**.

The price is not hardcoded as a Solidity constant. Instead:

1. The approved Harvverse plan defines `fixedPriceCentsPerLb`.
2. The admin/configurator registers that plan term onchain when configuring the lot.
3. The contract stores the price as part of the lot's economic terms.
4. Opening a partnership snapshots those terms for that partnership.
5. Settlement reads the snapshotted onchain terms and does not accept price from calldata.

Convex and the UI can compute previews, but they must read from contract state or mirror contract events. They are not authoritative for settlement price.

### Contract Shape

Update `PartnershipFactory` so lot terms include the plan economics, not only ticket amount:

```solidity
struct PlanEconomics {
    uint256 fixedPriceCentsPerLb;
    uint256 priceFloorCentsPerLb;
    uint256 agronomicCostCents;
    uint256 yieldCapY1TenthsQQ;
    uint16 farmerShareBps;
}

struct LotTerms {
    bool active;
    uint256 ticketUsdcUnits;
    address farmerWallet;
    bytes32 planHash;
    PlanEconomics economics;
}
```

`configureLotTerms` should accept the economics from the approved plan and validate:

- `fixedPriceCentsPerLb > 0`
- `priceFloorCentsPerLb > 0`
- `fixedPriceCentsPerLb >= priceFloorCentsPerLb`
- `agronomicCostCents > 0`
- `yieldCapY1TenthsQQ > 0`
- `farmerShareBps <= 10_000`
- `planHash != bytes32(0)`

The `LotTermsConfigured` event must emit the economic fields, including `fixedPriceCentsPerLb`, so block explorer proof shows the enforced price.

### Partnership Snapshot

When `openPartnership` succeeds, snapshot the economics by `partnershipId`:

```solidity
mapping(uint256 partnershipId => PlanEconomics) public partnershipEconomics;
```

This prevents later lot reconfiguration from changing already-opened partnerships.

If the plan changes, create a new plan version and configure a new lot version or deactivate/reconfigure only before any partnership exists. Do not mutate economic terms for active partnerships.

### Proposal Hash

`expectedProposalHash` must include the economic terms:

```solidity
keccak256(
    abi.encode(
        block.chainid,
        address(this),
        lotId,
        partner,
        terms.ticketUsdcUnits,
        terms.farmerWallet,
        terms.planHash,
        terms.economics.fixedPriceCentsPerLb,
        terms.economics.priceFloorCentsPerLb,
        terms.economics.agronomicCostCents,
        terms.economics.yieldCapY1TenthsQQ,
        terms.economics.farmerShareBps
    )
);
```

This makes the wallet-signed proposal commit to the same economics that settlement will enforce.

### Settlement Contract Change

`SettlementDistributor.SettlementInput` must not include `priceCentsPerLb` or `agronomicCostCents`.

Use:

```solidity
struct SettlementInput {
    uint256 partnershipId;
    uint256 yieldTenthsQQ;
    bytes32 evidenceHash;
}
```

`SettlementDistributor` should fetch the partnership economics from `PartnershipFactory`:

```solidity
function economicsOf(uint256 partnershipId)
    external
    view
    returns (
        uint256 fixedPriceCentsPerLb,
        uint256 priceFloorCentsPerLb,
        uint256 agronomicCostCents,
        uint256 yieldCapY1TenthsQQ,
        uint16 farmerShareBps
    );
```

Settlement math uses:

- `yieldTenthsQQ`, capped by `yieldCapY1TenthsQQ`
- `fixedPriceCentsPerLb` from the onchain partnership snapshot
- `agronomicCostCents` from the onchain partnership snapshot
- `farmerShareBps` from the onchain partnership snapshot

For MVP, do not compute settlement from Chainlink reference data and do not accept an operator-provided coffee price.

### Convex and UI Rule

Convex remains the plan authoring and explanation backend, but after onchain configuration:

- Proposal creation must read `expectedProposalHash` or reproduce it exactly from onchain terms.
- Settlement preview may use Convex mirrors only if reconciled from `LotTermsConfigured` and `PartnershipOpened` events.
- The final settlement button must pass only `partnershipId`, `yieldTenthsQQ`, and `evidenceHash`.
- Any Chainlink reference price UI must be labeled as reference/informational and must not flow into settlement calldata.

### Demo Narrative

Use this story:

> The agronomic plan defines the commercial assumption: `$3.50/lb` fixed for this demo plan. That plan term is registered onchain before the partner signs. When the partner opens the partnership, the contract snapshots the plan economics. At settlement, the contract enforces the snapshotted price. Convex and the AI agent explain the plan, but they cannot change settlement price.

Chainlink remains a parallel proof signal:

> Chainlink Functions fetches a reference market value and the UI shows it as a visual toast. It demonstrates oracle connectivity, but it does not determine the plan price or payout.

### Implementation Tasks

1. Update `PartnershipFactory` with `PlanEconomics`, expanded `configureLotTerms`, expanded events, and partnership economics snapshots.
2. Update `SettlementDistributor` to remove price/cost from calldata and read economics from the registry.
3. Update deploy/config scripts so the approved plan registers `fixedPriceCentsPerLb: 350`.
4. Update generated ABIs and frontend transaction calldata.
5. Update Convex planned mutations so `priceCentsPerLb` is mirrored from contract events after configuration.
6. Update tests.

### Required Tests

- `configureLotTerms` stores `fixedPriceCentsPerLb = 350` and emits it.
- `expectedProposalHash` changes if `fixedPriceCentsPerLb` changes.
- `openPartnership` snapshots economics.
- Updating lot terms after opening does not alter an existing partnership's settlement economics.
- `SettlementDistributor.preview` and `settle` use the snapshotted onchain price.
- There is no settlement path that accepts `priceCentsPerLb` from calldata.
- A settlement fixture with `yieldTenthsQQ = 60`, `fixedPriceCentsPerLb = 350`, and `agronomicCostCents = 149_000` produces the expected cents outputs.

### Acceptance Criteria

- The contract, not Convex, is the final source of truth for settlement coffee price.
- The price is configurable from the approved plan, not hardcoded in Solidity.
- The partner's proposal hash commits to the enforced price.
- The settlement transaction cannot substitute another coffee price.
- Chainlink reference data cannot influence MVP settlement.
