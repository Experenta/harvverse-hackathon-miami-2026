import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const seedLots = mutation({
  args: {},
  handler: async (ctx) => {
    const lots = [
      {
        code: "zafiro-001",
        farmName: "Finca Zafiro",
        farmerWallet: "0x4C8B7F2E9D1A3C5B6E7F8A9B0C1D2E3F",
        region: "Comayagua",
        country: "Honduras",
        varietal: "Parainema",
        process: "Washed",
        altitudeMasl: "1,300",
        hectares: 0.7,
        scaScoreTenths: 845,
        coordinates: "14.9465, -88.0863",
        harvestYear: 2026,
        summary:
          "Finca Zafiro - Parainema SHG a 1,300 msnm en Comayagua, Honduras. Manejo Premium con IoT completo. Validado por Jorge Alberto Lanza, Cup of Excellence Honduras 2013 Champion (92.75 pts). Perfil C-Premium con 6 milestones agronómicos y beneficiado controlado.",
        status: "available" as const,
        onchainLotId: 1,
        activePlanCode: "zafiro-001-y1",
        cover: "/harvverse/lots/zafiro.svg",
      },
      {
        code: "zafiro-002",
        farmName: "Finca La Esmeralda",
        farmerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        region: "Boquete",
        country: "Panama",
        varietal: "Caturra",
        process: "Washed",
        altitudeMasl: "1,650",
        hectares: 6.2,
        scaScoreTenths: 862,
        coordinates: "8.7771° N, 82.4358° W",
        harvestYear: 2025,
        summary:
          "Volcanic loam, high-altitude caturra. Slow-fermented and washed, transparent honey + jasmine cup profile.",
        status: "available" as const,
        onchainLotId: 2,
        activePlanCode: "zafiro-002-y1",
        cover: "/harvverse/lots/esmeralda.svg",
      },
      {
        code: "zafiro-003",
        farmName: "Finca El Mirador",
        farmerWallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        region: "Antigua",
        country: "Guatemala",
        varietal: "Bourbon",
        process: "Honey",
        altitudeMasl: "1,540",
        hectares: 3.1,
        scaScoreTenths: 851,
        coordinates: "14.5586° N, 90.7294° W",
        harvestYear: 2025,
        summary:
          "South-east facing slope with shaded canopy. Honey process produces a balanced cup with chocolate and orange peel.",
        status: "active" as const,
        onchainLotId: 3,
        activePlanCode: "zafiro-003-y1",
        cover: "/harvverse/lots/mirador.svg",
      },
      {
        code: "zafiro-004",
        farmName: "Finca Cerro Azul",
        farmerWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        region: "Tarrazú",
        country: "Costa Rica",
        varietal: "SL28",
        process: "Carbonic Maceration",
        altitudeMasl: "1,720",
        hectares: 5.4,
        scaScoreTenths: 868,
        coordinates: "9.6532° N, 84.0167° W",
        harvestYear: 2025,
        summary: "Experimental carbonic maceration on SL28 trees. Bright cup with red berry and tropical notes.",
        status: "available" as const,
        onchainLotId: 4,
        activePlanCode: "zafiro-004-y1",
        cover: "/harvverse/lots/cerroazul.svg",
      },
    ];

    let count = 0;
    for (const lot of lots) {
      await ctx.db.insert("lots", lot);
      count++;
    }

    return { success: true, lotsCreated: count };
  },
});
