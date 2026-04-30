import type { Settlement } from "./types";

export const mockSettlements: Settlement[] = [
  {
    id: "stl_zafiro_003",
    partnershipId: "ptn_zafiro_003",
    status: "intent_created",
    year: 1,
    yieldTenthsQQ: 60,
    scaScoreTenths: 845,
    priceCentsPerLb: 305,
    revenueCents: 1_524_900,
    profitCents: 804_900,
    farmerCents: 523_185,
    partnerCents: 281_715,
    harvestEvidenceHash: "0xfae9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9",
    requiredUsdcUnits: "8049000000",
    poolBalanceUsdcUnits: "5200000000",
  },
  {
    id: "stl_zafiro_seed",
    partnershipId: "ptn_zafiro_seed",
    status: "confirmed",
    year: 1,
    yieldTenthsQQ: 72,
    scaScoreTenths: 875,
    priceCentsPerLb: 350,
    revenueCents: 2_099_160,
    profitCents: 1_149_160,
    farmerCents: 689_496,
    partnerCents: 459_664,
    harvestEvidenceHash: "0x80a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
    fundingTxHash: "0x90b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    settlementTxHash: "0xa0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    signedByWallet: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    requiredUsdcUnits: "11491600000",
    poolBalanceUsdcUnits: "0",
  },
];

export const getSettlementForPartnership = (partnershipId: string) =>
  mockSettlements.find(settlement => settlement.partnershipId === partnershipId);

export const getActiveSettlementIntent = () =>
  mockSettlements.find(settlement => settlement.status === "intent_created");

export const listSettlements = () => mockSettlements;
