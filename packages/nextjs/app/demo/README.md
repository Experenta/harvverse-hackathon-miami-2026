# Harvverse Demo Flow

## Overview

The demo simulator at `/demo` walks the full Harvverse partnership lifecycle on Celo Sepolia in eight scripted steps. It exercises lot configuration, proposal hashing, USDC funding, soulbound certificate minting, evidence attestation, and profit settlement against the live deployed contracts — useful for end-to-end validation of the on-chain flow before wiring it into the production UI.

## Prerequisites

- `pnpm hardhat node --network hardhat` running in one terminal (only required if you want to fork-test locally; the demo targets Celo Sepolia by default)
- `pnpm dev` running inside `packages/nextjs`
- MetaMask with two accounts imported:
  - **Admin**: `0x686EE65b45Aa460CbAE7e53AAE91B481a73ed63f`
  - **Maria**: `0x2078f502C81D3467F56041b394b1dFcDe60D7192`
- Both accounts funded with CELO on Celo Sepolia for gas

## Celo Sepolia Deployed Contracts

| Contract | Address |
| --- | --- |
| MockUSDC | `0xc61D150cF924054d564183B53E35f546C676A0F9` |
| LotCertificate | `0x4aFBB4F2737E739B833E99C7a6b3d3dEd7fbB39c` |
| PartnershipFactory | `0x5Cfb45ed81b805063030B446515Bc240Ec32fa0e` |
| SettlementDistributor | `0xFE2fD8ae12c908902074Ed57bb76E8DBd8382919` |
| EvidenceRegistry | `0x55023170FbA41c8F298Fe8fad8b53d0eFa6eaC5b` |

All contracts verified at https://sepolia.celoscan.io

## Demo Steps

| # | Name | Signer | On-chain effect |
| --- | --- | --- | --- |
| 1 | Configure Lot | Admin | `PartnershipFactory.setLot(LOT_ID, ...)` registers lot params |
| 2 | Register Proposal Hash | Admin | `setExpectedProposalHash` binds proposal to partner + ticket |
| 3 | Mint USDC to Maria | Admin | `MockUSDC.mint` funds Maria's wallet for the ticket |
| 4 | Approve USDC | Maria | `MockUSDC.approve(factory, ticket)` |
| 5 | Open Partnership | Maria | `openPartnership` pulls USDC to escrow and mints soulbound NFT |
| 6 | Attest Evidence | Admin | `EvidenceRegistry.attest` emits milestone event |
| 7 | Fund Distributor | Admin | Transfers USDC from escrow to `SettlementDistributor` |
| 8 | Settle Partnership | Admin | `settle` splits 60/40, updates certificate metadata |

## Important Notes

- Each run **must use a fresh `LOT_ID`** to avoid `"hash used"` reverts — the factory marks proposal hashes as consumed.
- **Do not use Hardhat default accounts on Celo Sepolia.** Their private keys are public and any funds sent there will be swept.
- The `/demo` page is a testing tool. It is not part of the production user-facing frontend and bypasses normal UX guards.
- After Step 8, the certificate's `Status`, `Yield`, and `SCA Score` attributes are updated on-chain. MetaMask only renders `name` and `description`, so to verify attributes call `tokenURI(tokenId)` on the LotCertificate contract via Celoscan and decode the JSON.

## Sensor Pipeline Endpoints

- Latest reading: https://academic-shepherd-483.convex.site/api/sensor/latest
- History: https://academic-shepherd-483.convex.site/api/sensor/history
