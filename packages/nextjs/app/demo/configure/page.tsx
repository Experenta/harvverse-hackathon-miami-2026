"use client";

import { AIChat } from "../../../components/harvverse/AIChat";
import { AgronomicPlanDisplay } from "../../../components/harvverse/AgronomicPlanDisplay";
import { SensorStats } from "../../../components/harvverse/SensorStats";

export default function DemoConfigure() {
  const conversationId = `conv-${Date.now()}`;
  const moduleId = "50e963ae-6454-436f-b8b3-4a3740b22572";
  const lotCode = "zafiro-001";

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">AI Farm Assistant</h1>
          <p className="text-slate-400">Get expert insights on your farm&apos;s health, finances, and operations</p>
        </div>

        {/* Main Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Chat - Left (2 columns on xl) */}
          <div className="lg:col-span-1 xl:col-span-2 h-[calc(100vh-200px)]">
            <AIChat conversationId={conversationId} lotCode={lotCode} title="Farm Assistant Chat" />
          </div>

          {/* Sensor Stats - Middle (1 column) */}
          <div className="lg:col-span-1 xl:col-span-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white sticky top-0 bg-slate-950 py-2">Sensor Metrics</h2>
              <SensorStats moduleId={moduleId} weeks={4} />
            </div>
          </div>

          {/* Agronomic Plan - Right (1 column) */}
          <div className="lg:col-span-1 xl:col-span-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white sticky top-0 bg-slate-950 py-2">Agronomic Plan</h2>
              <AgronomicPlanDisplay lotCode={lotCode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
