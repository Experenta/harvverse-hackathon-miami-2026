# Chainlink Functions Reference Price Plan

**Status:** Proposed  
**Purpose:** Add a Chainlink Functions-powered reference price signal for the demo UI without giving Chainlink authority over coffee contract economics.

## 1. Decision

Use Chainlink Functions as a **reference price oracle**, not as settlement authority.

The plan-defined coffee price is enforced by Harvverse contracts as described in `plans/first-product-design/fixes.md`. Chainlink Functions runs in parallel and publishes a reference value that the UI can display while the AI agent presents the agronomic plan.

Required separation:

- `PartnershipFactory` / `SettlementDistributor`: enforce plan-defined coffee price.
- `ReferencePriceOracle`: fetches and stores a reference value through Chainlink Functions.
- Next.js UI: reads `ReferencePriceOracle` and shows a toast or compact verification badge.
- Convex / AI agent: may mention the reference value as evidence of oracle connectivity, but must not use it to compute payouts.

## 2. Demo Narrative

Use this product narrative:

> The AI Agent reads the agronomic plan from the Harvverse API: six milestones, 35 activities, costs, yield projection, and the fixed `$3.50/lb` plan price. In parallel, a Chainlink Functions consumer fetches a reference market value and writes it onchain. The UI shows a toast: `Chainlink Functions reference: CELO/USD $X.XX verified`. This proves oracle connectivity, but settlement remains controlled by the plan terms already registered in the contract.

Avoid saying the Chainlink value is the contract price unless the value is actually wired into contract economics in a later phase.

## 3. Naming

Prefer the label **Chainlink Functions reference price**.

Do not call it a canonical **Chainlink Price Feed** unless the implementation uses Chainlink Data Feeds directly. Chainlink Functions can fetch prices from APIs and return them onchain, but that is not the same product surface as Chainlink Data Feeds.

## 4. Network Reality Check

As of 2026-04-28, the Chainlink Functions supported-network docs list these relevant testnets:

| Network | Router | DON ID | Repo Fit |
| --- | --- | --- | --- |
| Base Sepolia | `0xf9B8fc078197181C841c296C876945aaa425B278` | `fun-base-sepolia-1` | Already listed in the current Hardhat plan. Best low-friction Functions option. |
| Polygon Amoy | `0xC22a79eBA640940ABB6dF0f7982cc119578E11De` | `fun-polygon-amoy-1` | Already listed in the current Hardhat plan. |
| Celo Alfajores | `0x53BA5D8E5aab0cf9589aCE139666Be2b9Fd268e2` | `fun-celo-alfajores-1` | Best Celo-specific Functions option, but must be added to repo network config if not present. |

Important: the current first-product plan mentions Celo Sepolia, but the Chainlink Functions docs list Celo Alfajores, not Celo Sepolia. If Chainlink Functions is mandatory for the demo, choose Base Sepolia for fastest execution or add Celo Alfajores explicitly.

Verify router and DON ID again before deployment.

## 5. Reference Price Choice

MVP should fetch `CELO/USD` if the demo runs on Celo Alfajores, because it is easy to explain visually and does not conflict with the fixed coffee price.

Fallback choices:

- `ETH/USD` or `BTC/USD` on Base Sepolia using a public crypto price API.
- A Harvverse-hosted `coffee_reference_usd_per_lb` endpoint only if API availability is reliable.

Recommended MVP response format:

```solidity
struct ReferencePrice {
    bytes32 symbol;          // e.g. "CELO/USD"
    uint256 price;           // integer price
    uint8 decimals;          // e.g. 8
    uint256 updatedAt;       // block timestamp of fulfillment
    bytes32 requestId;
    bytes32 sourceHash;      // hash of source identifier / API path
}
```

For a UI toast, keep the output small and decodeable:

```solidity
abi.decode(response, (uint256, uint8, bytes32))
```

Where the tuple is:

- `price`
- `decimals`
- `sourceHash`

## 6. Contract Design

Create `packages/hardhat/contracts/ReferencePriceOracle.sol`.

Responsibilities:

- Inherit `FunctionsClient`.
- Store Chainlink Functions config: router address, DON ID, subscription ID, callback gas limit.
- Let only `ORACLE_OPERATOR_ROLE` send a request.
- Let only the Chainlink Functions router fulfill a response through the inherited fulfillment path.
- Store the latest reference price.
- Emit request and fulfillment events.
- Expose read methods for the UI.

Sketch:

```solidity
contract ReferencePriceOracle is FunctionsClient, AccessControl {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public constant ORACLE_OPERATOR_ROLE = keccak256("ORACLE_OPERATOR_ROLE");

    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit;

    bytes32 public latestRequestId;
    bytes32 public latestSymbol;
    uint256 public latestPrice;
    uint8 public latestDecimals;
    uint256 public latestUpdatedAt;
    bytes32 public latestSourceHash;
    bytes public latestError;

    event ReferencePriceRequested(bytes32 indexed requestId, bytes32 indexed symbol);
    event ReferencePriceUpdated(
        bytes32 indexed requestId,
        bytes32 indexed symbol,
        uint256 price,
        uint8 decimals,
        bytes32 sourceHash
    );
    event ReferencePriceFailed(bytes32 indexed requestId, bytes error);
}
```

The oracle contract must not expose any method that writes to `PartnershipFactory`, `SettlementDistributor`, or plan economics.

## 7. Request Flow

1. Deploy `ReferencePriceOracle` with the network router.
2. Create and fund a Chainlink Functions subscription with LINK.
3. Add the deployed oracle as a subscription consumer.
4. Configure `subscriptionId`, `donId`, and `callbackGasLimit`.
5. Operator calls `requestReferencePrice(symbol, args)`.
6. Chainlink DON executes JavaScript source code and fulfills the contract.
7. Contract stores the latest reference price and emits `ReferencePriceUpdated`.
8. UI watches the event or polls the read method and shows a toast.

## 8. JavaScript Source Design

Start with a public API and no secrets. Add DON-hosted secrets only if a paid data source is required.

Source behavior:

1. Read `args[0]` as the symbol, e.g. `CELO/USD`.
2. Call a single reference API endpoint.
3. Validate response shape.
4. Convert decimal price to an integer with 8 decimals.
5. Return ABI-encoded `(uint256 price, uint8 decimals, bytes32 sourceHash)`.

Pseudo-source:

```javascript
import { ethers } from "npm:ethers@6.10.0";

const symbol = args[0];
const response = await Functions.makeHttpRequest({
  url: `https://api.harvverse.example/reference-prices/${symbol}`,
});

if (response.error) {
  throw Error("Reference price request failed");
}

const price = Number(response.data.price);
if (!Number.isFinite(price) || price <= 0) {
  throw Error("Invalid reference price");
}

const decimals = 8;
const scaled = BigInt(Math.round(price * 10 ** decimals));
const sourceHash = ethers.keccak256(
  ethers.toUtf8Bytes(`${symbol}:${response.data.source}:${response.data.asOf}`)
);

const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
  ["uint256", "uint8", "bytes32"],
  [scaled, decimals, sourceHash]
);

return ethers.getBytes(encoded);
```

Replace `api.harvverse.example` with the real endpoint or use a public crypto price API for the hackathon demo.

## 9. UI Integration

Add a small client component:

- Reads latest reference price with `useScaffoldReadContract`.
- Watches `ReferencePriceUpdated` with `useScaffoldWatchContractEvent`.
- Uses `notification` from `~~/utils/scaffold-eth`.
- Shows a one-time toast while the AI agent displays the plan.

Toast copy:

```text
Chainlink Functions reference: CELO/USD $X.XX verified
```

If the request fails:

```text
Chainlink reference unavailable. Plan terms remain contract-enforced.
```

The failed state should not block proposal creation, partnership opening, or settlement.

## 10. Implementation Files

Planned files:

- `packages/hardhat/contracts/ReferencePriceOracle.sol`
- `packages/hardhat/deploy/03_deploy_reference_price_oracle.ts`
- `packages/hardhat/scripts/requestReferencePrice.ts`
- `packages/hardhat/test/ReferencePriceOracle.ts`
- `packages/nextjs/app/_components/ReferencePriceToast.tsx`
- Optional: `packages/nextjs/utils/harvverse/referencePrice.ts`

Environment variables:

- `CHAINLINK_FUNCTIONS_ROUTER`
- `CHAINLINK_FUNCTIONS_DON_ID`
- `CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID`
- `CHAINLINK_FUNCTIONS_CALLBACK_GAS_LIMIT`
- Optional API key variables only if secrets are required.

## 11. Limits and Guardrails

Chainlink Functions has practical request limits, including callback gas limits, request size limits, return size limits, execution time limits, and HTTP request limits. Keep the MVP function small:

- One HTTP request if possible.
- Return only one packed response tuple.
- Callback gas under the documented maximum.
- No settlement writes in the callback.
- No dependency on the reference response for the core demo flow.

If a paid or authenticated API is used, use Chainlink Functions secrets instead of putting API keys onchain or in client code.

## 12. Acceptance Criteria

- A Functions request can be sent on the selected testnet.
- `ReferencePriceUpdated` appears onchain with a readable symbol and price.
- The frontend shows the Chainlink toast from contract state or events.
- Failure to fetch the reference price does not block the Harvverse flow.
- No settlement or proposal code reads from `ReferencePriceOracle`.
- The demo can explain clearly: plan price is contract-enforced; Chainlink reference is informational.

## 13. Source Notes

Official Chainlink docs consulted on 2026-04-28:

- Chainlink Functions overview: https://docs.chain.link/chainlink-functions
- Getting started and subscription flow: https://docs.chain.link/chainlink-functions/getting-started
- Supported networks, routers, and DON IDs: https://docs.chain.link/chainlink-functions/supported-networks
- FunctionsClient API reference: https://docs.chain.link/chainlink-functions/api-reference/functions-client
- Service limits: https://docs.chain.link/chainlink-functions/resources/service-limits
