"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

interface SensorStatsProps {
  moduleId: string;
  weeks?: number;
}

export function SensorStats({ moduleId, weeks = 4 }: SensorStatsProps) {
  const metrics = useQuery(api.ai.tools.calculateGrowthMetrics, {
    moduleId,
    weeks,
  });

  const stats = useQuery(api.ai.tools.calculateStatistics, {
    moduleId,
    weeks,
  });

  const anomalies = useQuery(api.ai.tools.detectAnomalies, {
    moduleId,
    weeks: weeks * 2,
  });

  const yieldPred = useQuery(api.ai.tools.predictYield, {
    moduleId,
    historicalWeeks: 12,
  });

  if (!metrics || !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Health Status - Prominent Card */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 backdrop-blur">
        <p className="text-sm text-slate-400 mb-2">Farm Health</p>
        <p className="text-3xl font-bold text-cyan-400">{metrics.success ? metrics.healthStatus : "Unknown"}</p>
        <div className="mt-3 h-1 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
      </div>

      {/* Temperature Card */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🌡️</span>
          <h4 className="text-sm font-semibold text-slate-300">Temperature</h4>
        </div>
        {stats.success && stats.temperature ? (
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-slate-400 text-sm">Average</span>
              <span className="text-2xl font-bold text-white">{stats.temperature.mean}°C</span>
            </div>
            <div className="h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Min</p>
                <p className="text-slate-200 font-semibold">{stats.temperature.min}°C</p>
              </div>
              <div>
                <p className="text-slate-500">Max</p>
                <p className="text-slate-200 font-semibold">{stats.temperature.max}°C</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No data available</p>
        )}
      </div>

      {/* Humidity Card */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💧</span>
          <h4 className="text-sm font-semibold text-slate-300">Humidity</h4>
        </div>
        {stats.success && stats.humidity ? (
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-slate-400 text-sm">Average</span>
              <span className="text-2xl font-bold text-white">{stats.humidity.mean}%</span>
            </div>
            <div className="h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Min</p>
                <p className="text-slate-200 font-semibold">{stats.humidity.min}%</p>
              </div>
              <div>
                <p className="text-slate-500">Max</p>
                <p className="text-slate-200 font-semibold">{stats.humidity.max}%</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No data available</p>
        )}
      </div>

      {/* Yield Prediction */}
      {yieldPred && yieldPred.success && (
        <div className="rounded-xl border border-lime-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-5 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📈</span>
            <h4 className="text-sm font-semibold text-slate-300">Yield Prediction</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-slate-400 text-sm">Predicted</span>
              <span className="text-2xl font-bold text-lime-400">{(yieldPred as any).predictedYieldQQ} qq</span>
            </div>
            <div className="h-1 bg-gradient-to-r from-lime-500 to-transparent rounded-full"></div>
            <p className="text-xs text-slate-400">{(yieldPred as any).recommendation}</p>
          </div>
        </div>
      )}

      {/* Anomalies Alert */}
      {anomalies && anomalies.success && (anomalies as any).anomaliesDetected > 0 && (
        <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-5 backdrop-blur">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <h4 className="text-sm font-semibold text-orange-400">{(anomalies as any).anomaliesDetected} Anomalies</h4>
          </div>
          <p className="text-xs text-orange-300">{(anomalies as any).recommendation}</p>
        </div>
      )}

      {/* Data Info */}
      <div className="text-xs text-slate-500 text-center pt-2">Based on {metrics.success ? metrics.period : "N/A"}</div>
    </div>
  );
}
