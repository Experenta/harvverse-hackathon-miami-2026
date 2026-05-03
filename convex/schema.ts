import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. sensors table
  modules: defineTable({
    moduleId: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_moduleId", ["moduleId"]),

  sensorData: defineTable({
    moduleId: v.string(),
    week: v.string(),
    year: v.number(),
    weekNumber: v.number(),
    ambientTemperature: v.number(),
    ambientHumidity: v.number(),
    soilHumidity: v.number(),
    ambientTemperatureCount: v.number(),
    ambientHumidityCount: v.number(),
    soilHumidityCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_module_and_week", ["moduleId", "week"])
    .index("by_year_week", ["year", "weekNumber"]),

  // 2. agronomicPlans table
  agronomicPlans: defineTable({
    planId: v.string(),
    lotCode: v.string(),
    farmCode: v.string(),
    farmName: v.string(),
    variety: v.string(),
    altitudeMsnm: v.number(),
    areaManzanas: v.number(),
    areaHectares: v.number(),
    cycleYear: v.number(),
    ticketUsd: v.number(),
    totalCostAgronomic: v.number(),
    totalCostIotService: v.number(),
    totalPlan: v.number(),
    iotInfrastructureHarvverse: v.number(),
    splitFarmer: v.number(),
    splitPartner: v.number(),
    platformCommission: v.number(),
    pricePerLbFixed: v.number(),
    priceFloor: v.number(),
    yieldY1Qq: v.number(),
    yieldY2Qq: v.number(),
    yieldY3Qq: v.number(),
    yieldCeilingQq: v.number(),
    phygitalCoffeeLb: v.number(),
    phygitalDelivery: v.string(),
    profile: v.string(),
    validatorName: v.string(),
    validatorTitle: v.string(),
    milestones: v.array(v.object({
      number: v.number(),
      name: v.string(),
      monthStart: v.number(),
      monthEnd: v.number(),
      cash: v.number(),
      marketplace: v.number(),
      total: v.number(),
      pct: v.number(),
    })),
    activities: v.optional(v.array(v.object({
      milestone: v.number(),
      code: v.string(),
      name: v.string(),
      icon: v.string(),
      cash: v.number(),
      mkt: v.number(),
    }))),
    contractRules: v.object({
      yieldCeiling: v.object({
        y1: v.number(),
        y2: v.number(),
        y3: v.number(),
        absolute: v.number(),
      }),
      yieldFloor: v.object({
        normal: v.number(),
        forceMajeure: v.number(),
        severe: v.number(),
        catastrophe: v.number(),
      }),
      priceFixed: v.number(),
      priceFloorRule: v.number(),
      priceCap: v.optional(v.number()),
      upsideFormula: v.string(),
    }),
    createdAt: v.number(),
  }).index("by_plan_id", ["planId"]).index("by_lot_code", ["lotCode"]),

  // 3. Lots table
  lots: defineTable({
    code: v.string(),
    farmName: v.string(),
    farmerWallet: v.string(),
    region: v.string(),
    country: v.string(),
    varietal: v.string(),
    process: v.string(),
    altitudeMasl: v.string(),
    hectares: v.number(),
    scaScoreTenths: v.number(),
    coordinates: v.string(),
    harvestYear: v.number(),
    summary: v.string(),
    status: v.union(v.literal("available"), v.literal("reserved"), v.literal("active"), v.literal("settled")),
    onchainLotId: v.number(),
    activePlanCode: v.string(),
    cover: v.string(),
  }).index("by_code", ["code"]),

  // 4. Plans table
  plans: defineTable({
    planCode: v.string(),
    lotCode: v.string(),
    status: v.union(v.literal("approved_for_demo"), v.literal("draft")),
    ticketCents: v.number(),
    priceCentsPerLb: v.number(),
    agronomicCostCents: v.number(),
    projectedYieldY1TenthsQQ: v.number(),
    yieldCapY1TenthsQQ: v.number(),
    splitFarmerBps: v.number(),
    planHash: v.string(),
    termsSummary: v.string(),
  }).index("by_plan_code", ["planCode"]).index("by_lot_code", ["lotCode"]),

  // 5. AI Chat table
  chatMessages: defineTable({
    conversationId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    rule: v.optional(v.string()),
    toolsUsed: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_time", ["conversationId", "createdAt"]),

  conversations: defineTable({
    conversationId: v.string(),
    lotCode: v.optional(v.string()),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_conversation_id", ["conversationId"])
    .index("by_lot_code", ["lotCode"]),
});