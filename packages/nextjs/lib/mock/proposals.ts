import type { Proposal } from "./types";

const FACTORY = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PARTNER_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export const mockProposals: Proposal[] = [
  {
    id: "prop_zafiro_001_pending",
    lotCode: "zafiro-001",
    planCode: "zafiro-001-y1",
    status: "pending",
    walletAddress: PARTNER_WALLET,
    ticketCents: 342_500,
    ticketUsdcUnits: "3425000000",
    proposalHash: "0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
    partnershipType: "phygital",
    revenueCents: 1_866_000,
    profitCents: 916_000,
    farmerCents: 549_600,
    partnerCents: 366_400,
    expiresAt: Date.now() + 1000 * 60 * 6,
    createdAt: Date.now() - 1000 * 60 * 4,
    chainKey: "hardhat",
    factoryAddress: FACTORY,
    onchainLotId: 1,
  },
  {
    id: "prop_zafiro_003_signed",
    lotCode: "zafiro-003",
    planCode: "zafiro-003-y1",
    status: "signed",
    walletAddress: PARTNER_WALLET,
    ticketCents: 285_000,
    ticketUsdcUnits: "2850000000",
    proposalHash: "0xc0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
    partnershipType: "phygital",
    revenueCents: 1_493_300,
    profitCents: 773_300,
    farmerCents: 502_600,
    partnerCents: 270_700,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24,
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    chainKey: "hardhat",
    factoryAddress: FACTORY,
    onchainLotId: 3,
    partnershipId: "ptn_zafiro_003",
  },
  {
    id: "prop_zafiro_002_expired",
    lotCode: "zafiro-002",
    planCode: "zafiro-002-y1",
    status: "expired",
    walletAddress: PARTNER_WALLET,
    ticketCents: 410_000,
    ticketUsdcUnits: "4100000000",
    proposalHash: "0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
    partnershipType: "phygital",
    revenueCents: 2_073_600,
    profitCents: 953_600,
    farmerCents: 524_500,
    partnerCents: 429_100,
    expiresAt: Date.now() - 1000 * 60 * 30,
    createdAt: Date.now() - 1000 * 60 * 40,
    chainKey: "hardhat",
    factoryAddress: FACTORY,
    onchainLotId: 2,
  },
];

export const getProposalById = (id: string) => mockProposals.find(proposal => proposal.id === id) ?? mockProposals[0];

export const getActivePendingProposal = () => mockProposals.find(proposal => proposal.status === "pending");

export const listProposals = () => mockProposals;
