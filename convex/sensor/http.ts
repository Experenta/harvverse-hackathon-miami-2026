import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

export const getLatestSensorHandler = httpAction(async (ctx) => {
  const result = await ctx.runQuery(api.sensor.queries.getLatestWeekSensorData, {});
  if (result === null) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
});

export const getAllSensorHandler = httpAction(async (ctx) => {
  const result = await ctx.runQuery(api.sensor.queries.getAllWeeklySensorData, {});
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
});
