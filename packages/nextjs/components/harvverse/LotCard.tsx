import Link from "next/link";
import { LotMapPreview } from "./LotMapPreview";
import { Panel } from "./Panel";
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

/**
 * LotCard — catalog card for a coffee lot.
 * Map preview lives in a sharp panel; lot facts arranged as a tight grid.
 */
export const LotCard = ({ lot, plan, layout = "default", className }: LotCardProps) => {
  const isFeature = layout === "feature";
  const isAvailable = lot.status === "available";

  return (
    <Panel
      padding="none"
      variant={isFeature ? "elevated" : "default"}
      className={`group overflow-hidden transition hover:border-leaf/50 ${className ?? ""}`}
    >
      <div className={`grid ${isFeature ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <LotMapPreview
          lotCode={lot.code}
          hectares={lot.hectares}
          altitude={lot.altitudeMasl}
          coordinates={lot.coordinates}
          className={isFeature ? "min-h-[260px]" : "h-44 sm:h-48"}
        />

        <div className={`flex flex-col gap-4 p-5 ${isFeature ? "lg:p-7" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">{lot.code}</span>
                <span className="coordinate">·· {lot.region}</span>
              </div>
              <h3
                className={`mt-2 font-display ${
                  isFeature ? "text-[clamp(1.75rem,2.6vw,2.4rem)]" : "text-[clamp(1.4rem,2vw,1.75rem)]"
                } leading-[0.98] tracking-[-0.02em] text-paper`}
              >
                {lot.farmName}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-paper-2">
                {lot.varietal} · {lot.process} · SCA {(lot.scaScoreTenths / 10).toFixed(1)}
              </p>
            </div>
            <StatusPill status={lot.status} />
          </div>

          {isFeature ? <p className="text-sm leading-relaxed text-paper-2">{lot.summary}</p> : null}

          <div className="grid grid-cols-3 gap-3 border-t border-rule pt-4">
            <div>
              <div className="eyebrow">Ticket</div>
              <div className="font-mono mt-1 text-base text-paper">{plan ? formatCurrency(plan.ticketCents) : "—"}</div>
            </div>
            <div>
              <div className="eyebrow">Yield cap</div>
              <div className="font-mono mt-1 text-base text-paper">
                {plan ? `${(plan.yieldCapY1TenthsQQ / 10).toFixed(1)} qq` : "—"}
              </div>
            </div>
            <div>
              <div className="eyebrow">Farmer split</div>
              <div className="font-mono mt-1 text-base text-paper">
                {plan ? `${(plan.splitFarmerBps / 100).toFixed(0)}%` : "—"}
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper-3">local · MockUSDC</span>
            <Link
              href={`/partner/lots/${lot.code}`}
              className="group/link inline-flex items-center gap-1.5 text-sm text-leaf hover:text-paper"
            >
              {isAvailable ? "Review lot" : "Open lot"}
              <ArrowRightIcon className="h-4 w-4 transition group-hover/link:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </Panel>
  );
};
