import type { Lot } from "./types";

export const mockLots: Lot[] = [
  {
    code: "zafiro-001",
    farmName: "Finca Zafiro",
    farmerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    region: "Huehuetenango",
    country: "Guatemala",
    varietal: "Geisha",
    process: "Anaerobic Natural",
    altitudeMasl: "1,820",
    hectares: 4.6,
    scaScoreTenths: 875,
    coordinates: "15.3173° N, 91.4707° W",
    harvestYear: 2025,
    summary:
      "A microlot of geisha trees on the southern slope of Sierra de los Cuchumatanes. Anaerobic natural process, hand-picked at peak ripeness, dried on raised beds.",
    status: "available",
    onchainLotId: 1,
    activePlanCode: "zafiro-001-y1",
    cover: "/harvverse/lots/zafiro-cover.jpg",
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
    status: "available",
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
    status: "active",
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
    status: "available",
    onchainLotId: 4,
    activePlanCode: "zafiro-004-y1",
    cover: "/harvverse/lots/cerroazul.svg",
  },
];

export const getActiveLot = () => mockLots.find(lot => lot.status === "available") ?? mockLots[0];

export const listLots = () => mockLots;

export const getLotByCode = (code: string) => mockLots.find(lot => lot.code === code);
