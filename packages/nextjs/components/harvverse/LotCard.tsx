import Image from "next/image";
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

const isPhotoUrl = (url: string) => /\.(jpg|jpeg|png|webp|avif)$/i.test(url);

export const LotCard = ({ lot, plan, layout = "default", className }: LotCardProps) => {
  const isFeature = layout === "feature";
  const hasPhoto = isPhotoUrl(lot.cover ?? "");

  return (
    <GlassCard padding="none" className={`overflow-hidden ${className ?? ""}`}>
      <div className={`grid ${isFeature ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {isFeature && hasPhoto ? (
          <div className={`relative overflow-hidden ${isFeature ? "min-h-[300px] lg:min-h-[380px]" : "h-44"}`}>
            <Image
              src={lot.cover}
              alt={`${lot.farmName} – campo de café`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001020]/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 text-xs">
              <span className="eyebrow">{lot.code}</span>
              <span className="font-mono text-[10px] text-muted-harv">{lot.coordinates}</span>
            </div>
          </div>
        ) : (
          <LotMapPreview
            lotCode={lot.code}
            hectares={lot.hectares}
            altitude={lot.altitudeMasl}
            coordinates={lot.coordinates}
            className={isFeature ? "min-h-[260px]" : "h-44"}
          />
        )}

        <div className={`flex flex-col gap-4 p-6 ${isFeature ? "lg:p-8" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--color-harv-cyan)]">
                {lot.region}
              </div>
              <h3
                className={`mt-2 ${isFeature ? "text-2xl lg:text-3xl" : "text-xl"} font-light tracking-tight text-harv-text`}
              >
                {lot.farmName}
              </h3>
              {!isFeature ? (
                <p className="mt-1 text-sm text-muted-harv">
                  {lot.varietal} · {lot.process} · SCA {(lot.scaScoreTenths / 10).toFixed(1)}
                </p>
              ) : null}
              {isFeature ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[lot.varietal, lot.process, `SCA ${(lot.scaScoreTenths / 10).toFixed(1)}`].map(tag => (
                    <span
                      key={tag}
                      className="rounded border border-[color:var(--color-harv-mint)]/35 bg-[color:var(--color-harv-mint)]/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-harv-text)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <StatusPill status={lot.status} />
          </div>

          {isFeature ? (
            <p className="text-sm leading-relaxed text-[color:var(--color-harv-text)]/75">{lot.summary}</p>
          ) : null}

          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
            {[
              { label: isFeature ? "Ticket price" : "Ticket", value: plan ? formatCurrency(plan.ticketCents) : "—" },
              { label: "Yield cap", value: plan ? `${(plan.yieldCapY1TenthsQQ / 10).toFixed(1)} qq` : "—" },
              { label: "Farmer split", value: plan ? `${(plan.splitFarmerBps / 100).toFixed(0)}%` : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--color-harv-cyan)]">
                  {label}
                </div>
                <div className="mono-hash mt-1.5 text-base font-semibold text-harv-text">{value}</div>
              </div>
            ))}
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
