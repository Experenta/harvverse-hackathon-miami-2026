import { v } from "convex/values";
import { query } from "../_generated/server";

export const getLatestWeekSensorData = query({
  args: { moduleId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("sensorData").withIndex("by_year_week").order("desc");
    if (args.moduleId !== undefined) {
      const moduleId = args.moduleId;
      const filtered = q.filter((f) => f.eq(f.field("moduleId"), moduleId));
      const result = await filtered.first();
      return result;
    }
    const result = await q.first();
    return result;
  },
});

export const getAllWeeklySensorData = query({
  args: { moduleId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("sensorData").withIndex("by_year_week").order("asc");
    if (args.moduleId !== undefined) {
      const moduleId = args.moduleId;
      return await q.filter((f) => f.eq(f.field("moduleId"), moduleId)).collect();
    }
    return await q.collect();
  },
});
