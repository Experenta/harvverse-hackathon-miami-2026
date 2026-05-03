import { mutation } from "../_generated/server";

export const seedSensorData = mutation({
  args: {},
  handler: async (ctx) => {
    const moduleId = "50e963ae-6454-436f-b8b3-4a3740b22572";
    
    // Real sensor data from aggregated-sensor-data.json
    const sensorDataArray = [
      {
        moduleId,
        week: "2025-W16",
        year: 2025,
        weekNumber: 16,
        ambientTemperature: 17.50,
        ambientHumidity: 31.83,
        soilHumidity: 68.45,
        ambientTemperatureCount: 70,
        ambientHumidityCount: 91,
        soilHumidityCount: 119,
        createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
      },
      {
        moduleId,
        week: "2025-W17",
        year: 2025,
        weekNumber: 17,
        ambientTemperature: 16.75,
        ambientHumidity: 51.71,
        soilHumidity: 68.31,
        ambientTemperatureCount: 203,
        ambientHumidityCount: 213,
        soilHumidityCount: 372,
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
      },
      {
        moduleId,
        week: "2025-W18",
        year: 2025,
        weekNumber: 18,
        ambientTemperature: 17.97,
        ambientHumidity: 15.59,
        soilHumidity: 62.37,
        ambientTemperatureCount: 252,
        ambientHumidityCount: 246,
        soilHumidityCount: 370,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        moduleId,
        week: "2025-W19",
        year: 2025,
        weekNumber: 19,
        ambientTemperature: 19.64,
        ambientHumidity: 1.0,
        soilHumidity: 50.05,
        ambientTemperatureCount: 103,
        ambientHumidityCount: 98,
        soilHumidityCount: 139,
        createdAt: Date.now(),
      },
    ];

    let count = 0;
    for (const data of sensorDataArray) {
      await ctx.db.insert("sensorData", data);
      count++;
    }

    return { success: true, sensorDataCreated: count };
  },
});
