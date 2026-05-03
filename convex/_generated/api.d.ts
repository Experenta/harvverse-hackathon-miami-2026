/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_agent from "../ai/agent.js";
import type * as ai_chat from "../ai/chat.js";
import type * as ai_claudeIntegration from "../ai/claudeIntegration.js";
import type * as ai_index from "../ai/index.js";
import type * as ai_tools from "../ai/tools.js";
import type * as http from "../http.js";
import type * as rules_index from "../rules/index.js";
import type * as rules_types from "../rules/types.js";
import type * as seed_agronomicPlans from "../seed/agronomicPlans.js";
import type * as seed_lots from "../seed/lots.js";
import type * as seed_modules from "../seed/modules.js";
import type * as seed_plans from "../seed/plans.js";
import type * as seed_sensorData from "../seed/sensorData.js";
import type * as sensor_http from "../sensor/http.js";
import type * as sensor_queries from "../sensor/queries.js";
import type * as sensor_seed from "../sensor/seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/agent": typeof ai_agent;
  "ai/chat": typeof ai_chat;
  "ai/claudeIntegration": typeof ai_claudeIntegration;
  "ai/index": typeof ai_index;
  "ai/tools": typeof ai_tools;
  http: typeof http;
  "rules/index": typeof rules_index;
  "rules/types": typeof rules_types;
  "seed/agronomicPlans": typeof seed_agronomicPlans;
  "seed/lots": typeof seed_lots;
  "seed/modules": typeof seed_modules;
  "seed/plans": typeof seed_plans;
  "seed/sensorData": typeof seed_sensorData;
  "sensor/http": typeof sensor_http;
  "sensor/queries": typeof sensor_queries;
  "sensor/seed": typeof sensor_seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
