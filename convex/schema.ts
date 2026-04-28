import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
});
