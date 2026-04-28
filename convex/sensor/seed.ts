import { mutation } from "../_generated/server";

const SENSOR_DATA = {
  module: {
    id: "50e963ae-6454-436f-b8b3-4a3740b22572",
    name: "Sensores Planta Prueba Harvverse",
  },
  weeklyAverages: {
    ambientTemperature: [
      { week: "2025-W16", year: 2025, weekNumber: 16, average: 17.50428573057143, count: 70 },
      { week: "2025-W17", year: 2025, weekNumber: 17, average: 16.747290662857143, count: 203 },
      { week: "2025-W18", year: 2025, weekNumber: 18, average: 17.969841328650794, count: 252 },
      { week: "2025-W19", year: 2025, weekNumber: 19, average: 19.64174754883495, count: 103 },
    ],
    ambientHumidity: [
      { week: "2025-W16", year: 2025, weekNumber: 16, average: 31.832967113109888, count: 91 },
      { week: "2025-W17", year: 2025, weekNumber: 17, average: 51.71079792737559, count: 213 },
      { week: "2025-W18", year: 2025, weekNumber: 18, average: 15.593089502479675, count: 246 },
      { week: "2025-W19", year: 2025, weekNumber: 19, average: 1.0, count: 98 },
    ],
    soilHumidity: [
      { week: "2025-W16", year: 2025, weekNumber: 16, average: 68.4453781512605, count: 119 },
      { week: "2025-W17", year: 2025, weekNumber: 17, average: 68.30913978494624, count: 372 },
      { week: "2025-W18", year: 2025, weekNumber: 18, average: 62.37027027027027, count: 370 },
      { week: "2025-W19", year: 2025, weekNumber: 19, average: 50.05035971223022, count: 139 },
    ],
  },
} as const;

type WeekEntry = {
  week: string;
  year: number;
  weekNumber: number;
  ambientTemperature: number;
  ambientHumidity: number;
  soilHumidity: number;
  ambientTemperatureCount: number;
  ambientHumidityCount: number;
  soilHumidityCount: number;
};

export const seedSensorData = mutation({
  args: {},
  handler: async (ctx) => {
    const moduleId = SENSOR_DATA.module.id;
    const moduleName = SENSOR_DATA.module.name;

    const existingModule = await ctx.db
      .query("modules")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .first();

    let modulesInserted = 0;
    if (!existingModule) {
      await ctx.db.insert("modules", {
        moduleId,
        name: moduleName,
        createdAt: Date.now(),
      });
      modulesInserted = 1;
    }

    const merged = new Map<string, WeekEntry>();

    const ensureEntry = (week: string, year: number, weekNumber: number): WeekEntry => {
      const existing = merged.get(week);
      if (existing) return existing;
      const entry: WeekEntry = {
        week,
        year,
        weekNumber,
        ambientTemperature: 0,
        ambientHumidity: 0,
        soilHumidity: 0,
        ambientTemperatureCount: 0,
        ambientHumidityCount: 0,
        soilHumidityCount: 0,
      };
      merged.set(week, entry);
      return entry;
    };

    for (const row of SENSOR_DATA.weeklyAverages.ambientTemperature) {
      const e = ensureEntry(row.week, row.year, row.weekNumber);
      e.ambientTemperature = row.average;
      e.ambientTemperatureCount = row.count;
    }
    for (const row of SENSOR_DATA.weeklyAverages.ambientHumidity) {
      const e = ensureEntry(row.week, row.year, row.weekNumber);
      e.ambientHumidity = row.average;
      e.ambientHumidityCount = row.count;
    }
    for (const row of SENSOR_DATA.weeklyAverages.soilHumidity) {
      const e = ensureEntry(row.week, row.year, row.weekNumber);
      e.soilHumidity = row.average;
      e.soilHumidityCount = row.count;
    }

    let weeksInserted = 0;
    let weeksSkipped = 0;
    const now = Date.now();

    for (const entry of merged.values()) {
      const existing = await ctx.db
        .query("sensorData")
        .withIndex("by_module_and_week", (q) =>
          q.eq("moduleId", moduleId).eq("week", entry.week),
        )
        .first();

      if (existing) {
        weeksSkipped += 1;
        continue;
      }

      await ctx.db.insert("sensorData", {
        moduleId,
        week: entry.week,
        year: entry.year,
        weekNumber: entry.weekNumber,
        ambientTemperature: entry.ambientTemperature,
        ambientHumidity: entry.ambientHumidity,
        soilHumidity: entry.soilHumidity,
        ambientTemperatureCount: entry.ambientTemperatureCount,
        ambientHumidityCount: entry.ambientHumidityCount,
        soilHumidityCount: entry.soilHumidityCount,
        createdAt: now,
      });
      weeksInserted += 1;
    }

    return { modulesInserted, weeksInserted, weeksSkipped };
  },
});
