/**
 * Harvverse — Chainlink Functions DON source script
 *
 * What this does:
 *   Fetches the most recent weekly sensor average from the Harvverse Convex
 *   HTTP endpoint and returns the ambient temperature, scaled to a uint256, so
 *   it can be consumed by an onchain consumer contract.
 *
 * Data source:
 *   https://academic-shepherd-483.convex.site/api/sensor/latest
 *   (Convex deployment: academic-shepherd-483)
 *
 * Encoding convention:
 *   Floats are unsupported onchain. We multiply by 100 and round to integer
 *   "centi-units" before encoding. So 17.504°C becomes 1750. The same
 *   convention applies to humidityScaled and soilHumidityScaled when the
 *   payload grows to multi-value encoding (see commented examples below).
 */

const CONVEX_URL = "https://academic-shepherd-483.convex.site/api/sensor/latest";

try {
  const response = await Functions.makeHttpRequest({ url: CONVEX_URL });

  if (response.error) {
    throw new Error(`HTTP error: ${response.error}`);
  }

  const { ambientTemperature, ambientHumidity, soilHumidity } = response.data;

  if (typeof ambientTemperature !== "number") {
    throw new Error("ambientTemperature missing or not a number");
  }

  const tempScaled = Math.round(ambientTemperature * 100);

  // Future multi-value encoding (kept here as a reference for when the
  // consumer contract is ready to decode more than one field):
  //   const humidityScaled = Math.round(ambientHumidity * 100);
  //   const soilHumidityScaled = Math.round(soilHumidity * 100);
  // These would typically be packed (e.g. via abi.encode in a downstream
  // helper, or by returning a bytes blob produced by Functions.encodeUint256
  // calls concatenated and decoded by the consumer).

  return Functions.encodeUint256(BigInt(tempScaled));
} catch (error) {
  throw new Error(`Sensor fetch failed: ${error.message}`);
}
