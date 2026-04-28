import type { Plan } from "./types";

export const mockPlans: Plan[] = [
  {
    planCode: "zafiro-001-y1",
    lotCode: "zafiro-001",
    status: "approved_for_demo",
    ticketCents: 342_500,
    priceCentsPerLb: 350,
    agronomicCostCents: 950_000,
    projectedYieldY1TenthsQQ: 64,
    yieldCapY1TenthsQQ: 80,
    splitFarmerBps: 6_000,
    planHash: "0x9c4a51a1b3e2f0d6f8a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
    termsSummary:
      "Year 1 plan with 60/40 farmer split, capped yield at 8.0 quintales, deterministic settlement on harvest evidence.",
  },
  {
    planCode: "zafiro-002-y1",
    lotCode: "zafiro-002",
    status: "approved_for_demo",
    ticketCents: 410_000,
    priceCentsPerLb: 320,
    agronomicCostCents: 1_120_000,
    projectedYieldY1TenthsQQ: 72,
    yieldCapY1TenthsQQ: 90,
    splitFarmerBps: 5_500,
    planHash: "0x4f8b2c1d3e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    termsSummary: "Higher ticket, 55/45 farmer split, 9.0 quintales cap.",
  },
  {
    planCode: "zafiro-003-y1",
    lotCode: "zafiro-003",
    status: "approved_for_demo",
    ticketCents: 285_000,
    priceCentsPerLb: 305,
    agronomicCostCents: 720_000,
    projectedYieldY1TenthsQQ: 56,
    yieldCapY1TenthsQQ: 70,
    splitFarmerBps: 6_500,
    planHash: "0x2d3a4f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f",
    termsSummary: "Smaller lot, 65/35 farmer split, 7.0 quintales cap.",
  },
  {
    planCode: "zafiro-004-y1",
    lotCode: "zafiro-004",
    status: "approved_for_demo",
    ticketCents: 365_000,
    priceCentsPerLb: 340,
    agronomicCostCents: 880_000,
    projectedYieldY1TenthsQQ: 60,
    yieldCapY1TenthsQQ: 78,
    splitFarmerBps: 5_800,
    planHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    termsSummary: "Carbonic maceration premium plan, 58/42 farmer split.",
  },
];

export const getPlanByCode = (code: string) => mockPlans.find(plan => plan.planCode === code);

export const getPlanForLot = (lotCode: string) => mockPlans.find(plan => plan.lotCode === lotCode);
