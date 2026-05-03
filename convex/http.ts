import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { getLatestSensorHandler, getAllSensorHandler } from "./sensor/http";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/sensor/latest",
  method: "GET",
  handler: getLatestSensorHandler,
});

http.route({
  path: "/api/sensor/history",
  method: "GET",
  handler: getAllSensorHandler,
});

// Chat context endpoint - provides all data for AI chat
http.route({
  path: "/api/chat-context",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      // Parse request body
      const body = await (ctx as any).request.json();
      const { lotCode, moduleId } = body;

      // Fetch lot info
      const lotInfo = await ctx.runQuery(api.ai.tools.getLotInfo, { lotCode });

      // Fetch plan info
      const planInfo = await ctx.runQuery(api.ai.tools.getPlanInfo, {
        planCode: `${lotCode}-y1`,
      });

      // Fetch agronomic plan
      const agronomicPlanData = await ctx.runQuery(api.ai.tools.getAgronomicPlanByLot, {
        lotCode,
      });

      // Fetch sensor data
      const sensorData = await ctx.runQuery(api.ai.tools.getSensorData, {
        moduleId,
        weeks: 4,
      });

      // Fetch growth metrics
      const growthMetrics = await ctx.runQuery(api.ai.tools.calculateGrowthMetrics, {
        moduleId,
        weeks: 4,
      });

      // Fetch anomalies
      const anomalies = await ctx.runQuery(api.ai.tools.detectAnomalies, {
        moduleId,
        weeks: 8,
      });

      // Fetch yield prediction
      const yieldPred = await ctx.runQuery(api.ai.tools.predictYield, {
        moduleId,
        historicalWeeks: 12,
      });

      const result = {
        lot: lotInfo.success ? lotInfo.lot : null,
        plan: planInfo.success ? planInfo.plan : null,
        agronomicPlan: agronomicPlanData.success ? agronomicPlanData.plan : null,
        sensorData: sensorData.success ? sensorData.data : [],
        growthMetrics: growthMetrics.success ? growthMetrics : null,
        anomalies: anomalies.success ? anomalies : null,
        yieldPrediction: yieldPred.success ? yieldPred : null,
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in chat-context:", error);
      return new Response(
        JSON.stringify({ error: String(error) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
