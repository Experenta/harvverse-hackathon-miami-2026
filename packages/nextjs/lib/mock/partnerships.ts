import type { Partnership } from "./types";

const PARTNER_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export const mockPartnerships: Partnership[] = [
  {
    id: "ptn_zafiro_003",
    proposalId: "prop_zafiro_003_signed",
    lotCode: "zafiro-003",
    planCode: "zafiro-003-y1",
    partnerWallet: PARTNER_WALLET,
    farmerWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    status: "awaiting_settlement",
    onchainPartnershipId: 7,
    openedTxHash: "0x4d3a9b2e8c1f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b",
    proposalHash: "0xc0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
    certificateTokenId: 7,
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    ticketCents: 285_000,
  },
  {
    id: "ptn_zafiro_004",
    proposalId: "prop_zafiro_004_signed",
    lotCode: "zafiro-004",
    planCode: "zafiro-004-y1",
    partnerWallet: PARTNER_WALLET,
    farmerWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    status: "active",
    onchainPartnershipId: 8,
    openedTxHash: "0x7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f",
    proposalHash: "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    certificateTokenId: 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    ticketCents: 365_000,
  },
  {
    id: "ptn_zafiro_seed",
    proposalId: "prop_zafiro_seed",
    lotCode: "zafiro-001",
    planCode: "zafiro-001-y1",
    partnerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    farmerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    status: "settled",
    onchainPartnershipId: 1,
    openedTxHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    proposalHash: "0x9c4a51a1b3e2f0d6f8a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
    certificateTokenId: 1,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    ticketCents: 342_500,
  },
];

export const getPartnershipById = (id: string) => mockPartnerships.find(partnership => partnership.id === id);

export const listPartnerships = () => mockPartnerships;

export const listPartnershipsForWallet = (wallet: string) =>
  mockPartnerships.filter(partnership => partnership.partnerWallet.toLowerCase() === wallet.toLowerCase());

export const listPartnershipsByStatus = (status: Partnership["status"]) =>
  mockPartnerships.filter(partnership => partnership.status === status);
