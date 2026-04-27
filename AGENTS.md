# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Project Overview

Scaffold-ETH 2 (SE-2) is a starter kit for building dApps on Ethereum. It comes in **two flavors** based on the Solidity framework:

- **Hardhat flavor**: Uses `packages/hardhat` with hardhat-deploy plugin
- **Foundry flavor**: Uses `packages/foundry` with Forge scripts

Both flavors share the same frontend package:

- **packages/nextjs**: React frontend (Next.js App Router, not Pages Router, RainbowKit, Wagmi, Viem, TypeScript, Tailwind CSS with DaisyUI)

### Detecting Which Flavor You're Using

Check which package exists in the repository:

- If `packages/hardhat` exists → **Hardhat flavor** (follow Hardhat instructions)
- If `packages/foundry` exists → **Foundry flavor** (follow Foundry instructions)

## Common Commands

Commands work the same for both flavors unless noted otherwise:

```bash
# Development workflow (run each in separate terminal)
pnpm chain          # Start local blockchain (Hardhat or Anvil)
pnpm contracts:deploy # Deploy contracts to local network
pnpm start          # Start Next.js frontend at http://localhost:3000

# Code quality
pnpm lint           # Lint both packages
pnpm format         # Format both packages

# Building
pnpm next:build     # Build frontend
pnpm compile        # Compile Solidity contracts

# Contract verification (works for both)
pnpm verify --network <network>

# Account management (works for both)
pnpm generate            # Generate new deployer account
pnpm account:import      # Import existing private key
pnpm account             # View current account info

# Deploy to live network
pnpm contracts:deploy --network <network>   # e.g., sepolia, mainnet, base

pnpm vercel:yolo --prod # for deployment of frontend
```

## Architecture

### Smart Contract Development

#### Hardhat Flavor

- Contracts: `packages/hardhat/contracts/`
- Deployment scripts: `packages/hardhat/deploy/` (uses hardhat-deploy plugin)
- Tests: `packages/hardhat/test/`
- Config: `packages/hardhat/hardhat.config.ts`
- Deploying specific contract:
  - If the deploy script has:
    ```typescript
    // In packages/hardhat/deploy/01_deploy_my_contract.ts
    deployMyContract.tags = ["MyContract"];
    ```
  - `pnpm contracts:deploy --tags MyContract`
  - **Gas limit in deploy scripts**: Manual post-deploy calls (e.g. `transferOwnership`, `grantRole`, `initialize`) can silently inherit `blockGasLimit` as their gas cap, causing failures. **Fix at the call site, not in `hardhat.config.ts`:**
    ```typescript
    // Preferred: estimateGas + 20% margin
    const gas = await myContract.myMethod.estimateGas(arg1, arg2);
    await myContract.myMethod(arg1, arg2, { gasLimit: (gas * 120n) / 100n });

    // Or: explicit limit for simple admin calls
    await myContract.transferOwnership(newOwner, { gasLimit: 100_000 });
    ```

#### Foundry Flavor

- Contracts: `packages/foundry/contracts/`
- Deployment scripts: `packages/foundry/script/` (uses custom deployment strategy)
  - Example: `packages/foundry/script/Deploy.s.sol` and `packages/foundry/script/DeployYourContract.s.sol`
- Tests: `packages/foundry/test/`
- Config: `packages/foundry/foundry.toml`
- Deploying a specific contract:
  - Create a separate deployment script and run `pnpm contracts:deploy --file DeployYourContract.s.sol`

#### Both Flavors

- After `pnpm contracts:deploy`, ABIs are auto-generated to `packages/nextjs/contracts/deployedContracts.ts`

### Frontend Contract Interaction

**Correct interact hook names (use these):**

- `useScaffoldReadContract` - NOT ~~useScaffoldContractRead~~
- `useScaffoldWriteContract` - NOT ~~useScaffoldContractWrite~~

Contract data is read from two files in `packages/nextjs/contracts/`:

- `deployedContracts.ts`: Auto-generated from deployments
- `externalContracts.ts`: Manually added external contracts

#### Reading Contract Data

```typescript
const { data: totalCounter } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "userGreetingCounter",
  args: ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"],
});
```

#### Writing to Contracts

```typescript
const { writeContractAsync, isPending } = useScaffoldWriteContract({
  contractName: "YourContract",
});

await writeContractAsync({
  functionName: "setGreeting",
  args: [newGreeting],
  value: parseEther("0.01"), // for payable functions
});
```

#### Reading Events

```typescript
const { data: events, isLoading } = useScaffoldEventHistory({
  contractName: "YourContract",
  eventName: "GreetingChange",
  watch: true,
  fromBlock: 31231n,
  blockData: true,
});
```

SE-2 also provides other hooks to interact with blockchain data: `useScaffoldWatchContractEvent`, `useScaffoldEventHistory`, `useDeployedContractInfo`, `useScaffoldContract`, `useTransactor`.

**IMPORTANT: Always use hooks from `packages/nextjs/hooks/scaffold-eth` for contract interactions. Always refer to the hook names as they exist in the codebase.**

### UI Components

**Always use `@scaffold-ui/components` library for web3 UI components:**

- `Address`: Display ETH addresses with ENS resolution, blockie avatars, and explorer links
- `AddressInput`: Input field with address validation and ENS resolution
- `Balance`: Show ETH balance in ether and USD
- `EtherInput`: Number input with ETH/USD conversion toggle
- `IntegerInput`: Integer-only input with wei conversion

### Notifications & Error Handling

Use `notification` from `~~/utils/scaffold-eth` for success/error/warning feedback and `getParsedError` for readable error messages.

### Styling

**Use DaisyUI classes** for building frontend components.

```tsx
// ✅ Good - using DaisyUI classes
<button className="btn btn-primary">Connect</button>
<div className="card bg-base-100 shadow-xl">...</div>

// ❌ Avoid - raw Tailwind when DaisyUI has a component
<button className="px-4 py-2 bg-blue-500 text-white rounded">Connect</button>
```

### Configure Target Network before deploying to testnet / mainnet.

#### Hardhat

Add networks in `packages/hardhat/hardhat.config.ts` if not present.

#### Foundry

Add RPC endpoints in `packages/foundry/foundry.toml` if not present.

#### NextJs

Add networks in `packages/nextjs/scaffold.config.ts` if not present. This file also contains configuration for polling interval, API keys. Remember to decrease the polling interval for L2 chains.

## Code Style Guide

### Identifiers

| Style            | Category                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `UpperCamelCase` | class / interface / type / enum / decorator / type parameters / component functions in TSX / JSXElement type parameter |
| `lowerCamelCase` | variable / parameter / function / property / module alias                                                              |
| `CONSTANT_CASE`  | constant / enum / global variables                                                                                     |
| `snake_case`     | for hardhat deploy files and foundry script files                                                                      |

### Import Paths

Use the `~~` path alias for imports in the nextjs package:

```tsx
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
```

### Creating Pages

```tsx
import type { NextPage } from "next";

const Home: NextPage = () => {
  return <div>Home</div>;
};

export default Home;
```

### TypeScript Conventions

- Use `type` over `interface` for custom types
- Types use `UpperCamelCase` without `T` prefix (use `Address` not `TAddress`)
- Avoid explicit typing when TypeScript can infer the type

### Comments

Make comments that add information. Avoid redundant JSDoc for simple functions.

## Documentation

Use **Context7 MCP** tools to fetch up-to-date documentation for any library (Wagmi, Viem, RainbowKit, DaisyUI, Hardhat, Next.js, etc.). Context7 is configured as an MCP server and provides access to indexed documentation with code examples.

## Skills & Agents Index

IMPORTANT: Prefer retrieval-led reasoning over pre-trained knowledge. Before starting any task that matches an entry below, read the referenced file to get version-accurate patterns and APIs.

**Where skills are stored**

- **Universal (this repo)**: `.agents/skills/<name>/SKILL.md` — versioned with the project; prefer this path when a skill exists here. Installed/locked third-party skills are recorded in `skills-lock.json` at the repo root.
- **Claude Code**: `.claude/skills/<name>/SKILL.md` — same skill *names* may be mirrored for Claude. If a skill exists in both trees, use the **`.agents`** copy unless a tool only loads from `.claude`.

**Skills — Scaffold-ETH, chains, and data**

- **openzeppelin** — OpenZeppelin Contracts integration, library-first development, pattern discovery from installed source (tokens, access control, security primitives)
- **erc-721** — NFT pitfalls: `_safeMint` reentrancy, on-chain SVG limits, metadata `attributes`, IPFS base URI trailing slash
- **eip-5792** — batch transactions, `wallet_sendCalls`, paymaster, ERC-7677
- **ponder** — Ponder event indexing, GraphQL, onchain queries
- **subgraph** — The Graph subgraphs, event indexing, GraphQL
- **siwe** — Sign-In with Ethereum, wallet auth, sessions, EIP-4361
- **x402** — HTTP 402 payment-gated routes, micropayments, API monetization
- **drizzle-neon** — Drizzle ORM, Neon PostgreSQL, off-chain storage
- **blockchain-developer** — production Web3 app patterns: contracts, DeFi, NFTs, DAOs, integrations (broader than SE-2-only tasks)

**Skills — Convex** (SKILL files here; for generated API rules use `convex/_generated/ai/guidelines.md` and the Convex note at the end of this file)

- **convex** — routing: which Convex workflow or sub-skill applies; use when the task is “Convex work” but not yet specific
- **convex-quickstart** — new Convex project or add Convex to an existing app, first deploy, provider wiring
- **convex-setup-auth** — Convex Auth, Clerk, WorkOS, Auth0, identity mapping, protected functions
- **convex-create-component** — `defineComponent`, isolated tables, app-facing wrappers, component boundaries
- **convex-migration-helper** — schema/data migrations, widen-migrate-narrow, `@convex-dev/migrations`
- **convex-performance-audit** — hot-path reads, write contention, subscription cost, function limits, OCC retries

**Skills — Next.js, React, and UI**

- **next-best-practices** — App Router file conventions, RSC boundaries, data patterns, async APIs, metadata, errors, route handlers, images/fonts, bundling
- **vercel-composition-patterns** — composition over boolean prop sprawl, compound components, context, React 19 API notes
- **vercel-react-best-practices** — React/Next performance: bundle, server/client, effects, rerenders, caching
- **vercel-react-view-transitions** — `ViewTransition` / View Transitions API, route and shared-element style animations
- **frontend-design** — build distinctive, production-grade interfaces (components, pages, dashboards); typography, color, motion, layout; avoid generic “AI” styling
- **web-design-guidelines** — UI/UX and accessibility review against web interface heuristics

**Agents** (in `.agents/agents/`):

- **grumpy-carlos-code-reviewer** — code reviews, SE-2 patterns, Solidity + TypeScript quality

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
