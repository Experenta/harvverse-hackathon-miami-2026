import Link from "next/link";
import { GlassCard } from "./GlassCard";
import { LotMapPreview } from "./LotMapPreview";
import { StatusPill } from "./StatusPill";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { Lot, Plan } from "~~/lib/mock/types";

type LotCardProps = {
  lot: Lot;
  plan?: Plan;
  layout?: "default" | "feature";
  className?: string;
};

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

export const LotCard = ({ lot, plan, layout = "default", className }: LotCardProps) => {
  const isFeature = layout === "feature";

  return (
    <GlassCard padding="none" className={`overflow-hidden ${className ?? ""}`}>
      <div className={`grid ${isFeature ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <LotMapPreview
          lotCode={lot.code}
          hectares={lot.hectares}
          altitude={lot.altitudeMasl}
          coordinates={lot.coordinates}
          className={isFeature ? "min-h-[260px]" : "h-44"}
        />

        <div className={`flex flex-col gap-4 p-6 ${isFeature ? "lg:p-8" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">{lot.region}</div>
              <h3
                className={`mt-2 ${isFeature ? "text-2xl lg:text-3xl" : "text-xl"} font-light tracking-tight text-harv-text`}
              >
                {lot.farmName}
              </h3>
              <p className="mt-1 text-sm text-muted-harv">
                {lot.varietal} · {lot.process} · SCA {(lot.scaScoreTenths / 10).toFixed(1)}
              </p>
            </div>
            <StatusPill status={lot.status} />
          </div>

          {isFeature ? <p className="text-sm leading-relaxed text-muted-harv">{lot.summary}</p> : null}

          <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
            <div>
              <div className="eyebrow">Ticket</div>
              <div className="mono-hash mt-1 text-sm text-harv-text">
                {plan ? formatCurrency(plan.ticketCents) : "—"}
              </div>
            </div>
            <div>
              <div className="eyebrow">Yield cap</div>
              <div className="mono-hash mt-1 text-sm text-harv-text">
                {plan ? `${(plan.yieldCapY1TenthsQQ / 10).toFixed(1)} qq` : "—"}
              </div>
            </div>
            <div>
              <div className="eyebrow">Farmer split</div>
              <div className="mono-hash mt-1 text-sm text-harv-text">
                {plan ? `${(plan.splitFarmerBps / 100).toFixed(0)}%` : "—"}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="eyebrow">Testnet demo · Not financial advice</span>
            <Link
              href={`/partner/lots/${lot.code}`}
              className="group inline-flex items-center gap-1.5 text-sm text-[color:var(--color-harv-mint)] hover:text-harv-text"
            >
              Review lot
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
