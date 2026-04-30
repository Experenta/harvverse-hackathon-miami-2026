// Types here mirror the shapes phases 3-6 will return from Convex.
// Keep field names aligned with `convex/schema.ts` so the swap from mock data
// to `useQuery(api...)` is a one-line change per page.

export type Role = "guest" | "partner" | "admin" | "verifier" | "settlement_operator" | "custodian";

export type LotStatus = "available" | "reserved" | "active" | "settled";

export type Lot = {
  code: string;
  farmName: string;
  farmerWallet: string;
  region: string;
  country: string;
  varietal: string;
  process: string;
  altitudeMasl: string;
  hectares: number;
  scaScoreTenths: number;
  coordinates: string;
  harvestYear: number;
  summary: string;
  status: LotStatus;
  onchainLotId: number;
  activePlanCode: string;
  cover: string;
};

export type Plan = {
  planCode: string;
  lotCode: string;
  status: "approved_for_demo" | "draft";
  ticketCents: number;
  priceCentsPerLb: number;
  agronomicCostCents: number;
  projectedYieldY1TenthsQQ: number;
  yieldCapY1TenthsQQ: number;
  splitFarmerBps: number;
  planHash: string;
  termsSummary: string;
};

export type ProposalStatus = "pending" | "signed" | "expired" | "rejected";

export type Proposal = {
  id: string;
  lotCode: string;
  planCode: string;
  status: ProposalStatus;
  walletAddress: string;
  ticketCents: number;
  ticketUsdcUnits: string;
  proposalHash: string;
  partnershipType: "phygital";
  revenueCents: number;
  profitCents: number;
  farmerCents: number;
  partnerCents: number;
  expiresAt: number;
  createdAt: number;
  chainKey: "hardhat";
  factoryAddress: string;
  onchainLotId: number;
  partnershipId?: string;
};

export type PartnershipStatus = "active" | "milestones_attested" | "awaiting_settlement" | "settled";

export type Partnership = {
  id: string;
  proposalId: string;
  lotCode: string;
  planCode: string;
  partnerWallet: string;
  farmerWallet: string;
  status: PartnershipStatus;
  onchainPartnershipId: number;
  openedTxHash: string;
  proposalHash: string;
  certificateTokenId?: number;
  createdAt: number;
  ticketCents: number;
};

export type EvidenceStatus = "pending" | "recorded" | "attested";

export type EvidenceRecord = {
  id: string;
  partnershipId: string;
  milestoneNumber: number;
  milestoneLabel: string;
  evidenceType: "demo_fixture";
  artifactHash: string;
  registryTxHash?: string;
  status: EvidenceStatus;
  attesterWallet?: string;
  attesterRole?: "admin" | "verifier";
  notes: string;
  completedAtDemoLabel: string;
  evidenceKeys: string[];
  demoOnly: boolean;
  createdAt: number;
};

export type SettlementStatus = "intent_created" | "funded" | "confirmed";

export type Settlement = {
  id: string;
  partnershipId: string;
  status: SettlementStatus;
  year: number;
  yieldTenthsQQ: number;
  scaScoreTenths: number;
  priceCentsPerLb: number;
  revenueCents: number;
  profitCents: number;
  farmerCents: number;
  partnerCents: number;
  harvestEvidenceHash: string;
  fundingTxHash?: string;
  settlementTxHash?: string;
  signedByWallet?: string;
  requiredUsdcUnits: string;
  poolBalanceUsdcUnits: string;
};

export type MilestoneTemplate = {
  number: number;
  label: string;
  description: string;
  evidenceRequired: string[];
};
