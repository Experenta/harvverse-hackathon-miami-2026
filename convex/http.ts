import { httpRouter } from "convex/server";
import { getLatestSensorHandler, getAllSensorHandler } from "./sensor/http";

const http = httpRouter();

http.route({
  path: "/api/sensor/latest",
  method: "GET",
  handler: getLatestSensorHandler,
});

http.route({
  path: "/api/sensor/history",
  method: "GET",
  handler: getAllSensorHandler,
});

export default http;
