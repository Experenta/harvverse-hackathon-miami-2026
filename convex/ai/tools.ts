import { v } from "convex/values";
import { query } from "../_generated/server";

// Tool: Get sensor data for a specific lot
export const getSensorData = query({
  args: { 
    moduleId: v.optional(v.string()),
    weeks: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("sensorData").withIndex("by_year_week").order("desc");
    
    if (args.moduleId) {
      q = q.filter((f) => f.eq(f.field("moduleId"), args.moduleId));
    }
    
    const limit = args.weeks || 4;
    const data = await q.take(limit);
    
    return {
      success: true,
      data,
      count: data.length,
      period: `Last ${limit} weeks`
    };
  }
});

// Tool: Get lot information
export const getLotInfo = query({
  args: { lotCode: v.string() },
  handler: async (ctx, args) => {
    const lot = await ctx.db
      .query("lots")
      .withIndex("by_code", (q) => q.eq("code", args.lotCode))
      .first();
    
    if (!lot) {
      return {
        success: false,
        error: `Lot ${args.lotCode} not found`
      };
    }
    
    return {
      success: true,
      lot: {
        code: lot.code,
        farmName: lot.farmName,
        region: lot.region,
        country: lot.country,
        varietal: lot.varietal,
        process: lot.process,
        altitudeMasl: lot.altitudeMasl,
        hectares: lot.hectares,
        scaScore: (lot.scaScoreTenths / 10).toFixed(1),
        harvestYear: lot.harvestYear,
        status: lot.status,
        summary: lot.summary
      }
    };
  }
});

// Tool: Get plan information
export const getPlanInfo = query({
  args: { planCode: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_plan_code", (q) => q.eq("planCode", args.planCode))
      .first();
    
    if (!plan) {
      return {
        success: false,
        error: `Plan ${args.planCode} not found`
      };
    }
    
    return {
      success: true,
      plan: {
        planCode: plan.planCode,
        lotCode: plan.lotCode,
        status: plan.status,
        ticketCents: plan.ticketCents,
        ticketUSD: (plan.ticketCents / 100).toFixed(2),
        priceCentsPerLb: plan.priceCentsPerLb,
        agronomicCostCents: plan.agronomicCostCents,
        projectedYieldY1: (plan.projectedYieldY1TenthsQQ / 10).toFixed(1),
        yieldCapY1: (plan.yieldCapY1TenthsQQ / 10).toFixed(1),
        splitFarmerBps: plan.splitFarmerBps,
        splitFarmerPercent: (plan.splitFarmerBps / 100).toFixed(1),
        termsSummary: plan.termsSummary
      }
    };
  }
});

// Tool: Calculate ROI
export const calculateROI = query({
  args: { 
    investmentCents: v.number(),
    projectedRevenueCents: v.number(),
    costsCents: v.number()
  },
  handler: async (ctx, args) => {
    const profit = args.projectedRevenueCents - args.costsCents;
    const roi = (profit / args.investmentCents) * 100;
    
    return {
      success: true,
      investment: args.investmentCents / 100,
      projectedRevenue: args.projectedRevenueCents / 100,
      costs: args.costsCents / 100,
      profit: profit / 100,
      roiPercentage: roi.toFixed(2),
      paybackMonths: (args.investmentCents / (profit / 12)).toFixed(1)
    };
  }
});

// Tool: Calculate growth metrics
export const calculateGrowthMetrics = query({
  args: { 
    moduleId: v.string(),
    weeks: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query("sensorData")
      .withIndex("by_module_and_week")
      .filter((f) => f.eq(f.field("moduleId"), args.moduleId))
      .order("desc");
    
    const limit = args.weeks || 4;
    const data = await q.take(limit);
    
    if (data.length === 0) {
      return { success: false, error: "No sensor data found" };
    }
    
    const avgTemp = data.reduce((sum, d) => sum + d.ambientTemperature, 0) / data.length;
    const avgHumidity = data.reduce((sum, d) => sum + d.ambientHumidity, 0) / data.length;
    const avgSoilHumidity = data.reduce((sum, d) => sum + d.soilHumidity, 0) / data.length;
    
    return {
      success: true,
      period: `${data.length} weeks`,
      averageTemperature: avgTemp.toFixed(1),
      averageHumidity: avgHumidity.toFixed(1),
      averageSoilHumidity: avgSoilHumidity.toFixed(1),
      temperatureRange: {
        min: Math.min(...data.map(d => d.ambientTemperature)).toFixed(1),
        max: Math.max(...data.map(d => d.ambientTemperature)).toFixed(1)
      },
      healthStatus: avgTemp > 15 && avgTemp < 25 && avgSoilHumidity > 40 ? "Optimal" : "Needs attention"
    };
  }
});

// Tool: Detect anomalies in sensor data
export const detectAnomalies = query({
  args: { 
    moduleId: v.string(),
    weeks: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query("sensorData")
      .withIndex("by_module_and_week")
      .filter((f) => f.eq(f.field("moduleId"), args.moduleId))
      .order("desc");
    
    const limit = args.weeks || 8;
    const data = await q.take(limit);
    
    if (data.length < 2) {
      return { success: false, error: "Insufficient data for anomaly detection" };
    }
    
    const temps = data.map(d => d.ambientTemperature);
    const avgTemp = temps.reduce((a, b) => a + b) / temps.length;
    const stdDev = Math.sqrt(
      temps.reduce((sum, t) => sum + Math.pow(t - avgTemp, 2), 0) / temps.length
    );
    
    const anomalies = data.filter(d => 
      Math.abs(d.ambientTemperature - avgTemp) > stdDev * 2
    );
    
    return {
      success: true,
      anomaliesDetected: anomalies.length,
      anomalies: anomalies.map(a => ({
        week: a.week,
        temperature: a.ambientTemperature,
        deviation: (a.ambientTemperature - avgTemp).toFixed(1)
      })),
      recommendation: anomalies.length > 0 ? "Review environmental controls" : "No anomalies detected"
    };
  }
});

// Tool: Calculate statistics
export const calculateStatistics = query({
  args: { 
    moduleId: v.string(),
    weeks: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query("sensorData")
      .withIndex("by_module_and_week")
      .filter((f) => f.eq(f.field("moduleId"), args.moduleId))
      .order("desc");
    
    const limit = args.weeks || 12;
    const data = await q.take(limit);
    
    if (data.length === 0) {
      return { success: false, error: "No data available" };
    }
    
    const temps = data.map(d => d.ambientTemperature).sort((a, b) => a - b);
    const humidities = data.map(d => d.ambientHumidity).sort((a, b) => a - b);
    
    return {
      success: true,
      temperature: {
        mean: (temps.reduce((a, b) => a + b) / temps.length).toFixed(1),
        median: temps[Math.floor(temps.length / 2)].toFixed(1),
        min: temps[0].toFixed(1),
        max: temps[temps.length - 1].toFixed(1)
      },
      humidity: {
        mean: (humidities.reduce((a, b) => a + b) / humidities.length).toFixed(1),
        median: humidities[Math.floor(humidities.length / 2)].toFixed(1),
        min: humidities[0].toFixed(1),
        max: humidities[humidities.length - 1].toFixed(1)
      },
      dataPoints: data.length
    };
  }
});

// Tool: Get agronomic plan by plan ID
export const getAgronomicPlan = query({
  args: { planId: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("agronomicPlans")
      .withIndex("by_plan_id", (q) => q.eq("planId", args.planId))
      .first();

    if (!plan) {
      return {
        success: false,
        error: `Plan ${args.planId} not found`,
      };
    }

    return {
      success: true,
      plan,
    };
  },
});

// Tool: Get agronomic plan by lot code
export const getAgronomicPlanByLot = query({
  args: { lotCode: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("agronomicPlans")
      .withIndex("by_lot_code", (q) => q.eq("lotCode", args.lotCode))
      .first();

    if (!plan) {
      return {
        success: false,
        error: `No agronomic plan found for lot ${args.lotCode}`,
      };
    }

    return {
      success: true,
      plan,
    };
  },
});

// Tool: Predict yield based on sensor data
export const predictYield = query({
  args: { 
    moduleId: v.string(),
    historicalWeeks: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query("sensorData")
      .withIndex("by_module_and_week")
      .filter((f) => f.eq(f.field("moduleId"), args.moduleId))
      .order("desc");
    
    const limit = args.historicalWeeks || 12;
    const data = await q.take(limit);
    
    if (data.length === 0) {
      return { success: false, error: "No sensor data found" };
    }
    
    const avgTemp = data.reduce((sum, d) => sum + d.ambientTemperature, 0) / data.length;
    const avgHumidity = data.reduce((sum, d) => sum + d.ambientHumidity, 0) / data.length;
    
    // Simple yield prediction based on environmental factors
    let baseYield = 6; // Base yield in quintales
    let tempImpact = 0;
    let humidityImpact = 0;
    
    // Temperature impact (optimal 18-22°C)
    if (avgTemp >= 18 && avgTemp <= 22) {
      tempImpact = 1.2;
    } else if (avgTemp >= 15 && avgTemp <= 25) {
      tempImpact = 1.0;
    } else {
      tempImpact = 0.8;
    }
    
    // Humidity impact (optimal 60-80%)
    if (avgHumidity >= 60 && avgHumidity <= 80) {
      humidityImpact = 1.2;
    } else if (avgHumidity >= 50 && avgHumidity <= 85) {
      humidityImpact = 1.0;
    } else {
      humidityImpact = 0.8;
    }
    
    const predictedYield = baseYield * tempImpact * humidityImpact;
    
    return {
      success: true,
      predictedYieldQQ: predictedYield.toFixed(1),
      confidence: "Medium",
      factors: {
        temperature: avgTemp.toFixed(1),
        humidity: avgHumidity.toFixed(1),
        tempImpact: tempImpact.toFixed(2),
        humidityImpact: humidityImpact.toFixed(2)
      },
      recommendation: predictedYield >= 6 ? "Conditions are favorable for good yield" : "Monitor environmental conditions closely"
    };
  }
});
