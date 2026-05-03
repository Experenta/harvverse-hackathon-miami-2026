import { mutation } from "../_generated/server";

export const seedModules = mutation({
  args: {},
  handler: async (ctx) => {
    const modules = [
      {
        moduleId: "50e963ae-6454-436f-b8b3-4a3740b22572",
        name: "Sensores Planta Prueba Harvverse",
        createdAt: Date.now(),
      },
    ];

    let count = 0;
    for (const module of modules) {
      await ctx.db.insert("modules", module);
      count++;
    }

    return { success: true, modulesCreated: count };
  },
});
