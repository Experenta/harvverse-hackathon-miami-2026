"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

interface AgronomicPlanDisplayProps {
  lotCode: string;
}

export function AgronomicPlanDisplay({ lotCode }: AgronomicPlanDisplayProps) {
  const planData = useQuery(api.ai.tools.getAgronomicPlanByLot, { lotCode });

  if (!planData || !planData.success) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const plan = planData.plan as any;

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 backdrop-blur">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.farmName}</h3>
        <p className="text-slate-400 text-sm mb-4">{plan.planId}</p>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 text-xs">Ticket</p>
            <p className="text-2xl font-bold text-lime-400">${plan.ticketUsd}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Profile</p>
            <p className="text-lg font-semibold text-white">{plan.profile}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Variety</p>
            <p className="text-lg font-semibold text-white">{plan.variety}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Altitude</p>
            <p className="text-lg font-semibold text-white">{plan.altitudeMsnm} msnm</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 backdrop-blur">
        <h4 className="text-sm font-semibold text-white mb-4">Cost Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Agronomic Plan</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lime-500 to-lime-400"
                  style={{ width: `${(plan.totalCostAgronomic / plan.ticketUsd) * 100}%` }}
                ></div>
              </div>
              <span className="text-white font-semibold text-sm">${plan.totalCostAgronomic}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">IoT Service</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                  style={{ width: `${(plan.totalCostIotService / plan.ticketUsd) * 100}%` }}
                ></div>
              </div>
              <span className="text-white font-semibold text-sm">${plan.totalCostIotService}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Platform Commission</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                  style={{ width: `${((plan.ticketUsd * plan.platformCommission) / plan.ticketUsd) * 100}%` }}
                ></div>
              </div>
              <span className="text-white font-semibold text-sm">
                ${(plan.ticketUsd * plan.platformCommission).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 backdrop-blur">
        <h4 className="text-sm font-semibold text-white mb-4">6 Milestones</h4>
        <div className="space-y-2">
          {plan.milestones.map((m: any) => (
            <div key={m.number} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{m.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                <p className="text-xs text-slate-400">
                  Months {m.monthStart}-{m.monthEnd}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-lime-400">${m.total}k</p>
                <p className="text-xs text-slate-400">{m.pct}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yield Projection */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 backdrop-blur">
        <h4 className="text-sm font-semibold text-white mb-4">3-Year Yield Projection</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">Year 1</p>
            <p className="text-2xl font-bold text-cyan-400">{plan.yieldY1Qq}</p>
            <p className="text-xs text-slate-500">quintales</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">Year 2</p>
            <p className="text-2xl font-bold text-lime-400">{plan.yieldY2Qq}</p>
            <p className="text-xs text-slate-500">quintales</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">Year 3</p>
            <p className="text-2xl font-bold text-orange-400">{plan.yieldY3Qq}</p>
            <p className="text-xs text-slate-500">quintales</p>
          </div>
        </div>
      </div>

      {/* Contract Rules */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 backdrop-blur">
        <h4 className="text-sm font-semibold text-white mb-4">Contract Rules</h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Price per Lb</p>
            <p className="text-lg font-bold text-white">
              ${plan.contractRules.priceFixed} (Floor: ${plan.contractRules.priceFloorRule})
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Split</p>
            <p className="text-white">
              Farmer: {(plan.splitFarmer * 100).toFixed(0)}% | Partner: {(plan.splitPartner * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Upside Formula</p>
            <p className="text-white">{plan.contractRules.upsideFormula}</p>
          </div>
        </div>
      </div>

      {/* Validator Info */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-5 backdrop-blur">
        <p className="text-xs text-slate-400 mb-1">Agronomic Validator</p>
        <p className="text-sm font-semibold text-white">{plan.validatorName}</p>
        <p className="text-xs text-slate-400 mt-1">{plan.validatorTitle}</p>
      </div>
    </div>
  );
}
