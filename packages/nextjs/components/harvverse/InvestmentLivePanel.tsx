import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export type InvestmentLiveRow = {
  label: string;
  value: string;
  highlight?: boolean;
};

export type InvestmentLivePanelProps = {
  titleSuffix?: string;
  rows: InvestmentLiveRow[];
  ctaHref: string;
  ctaLabel?: string;
  className?: string;
};

export const InvestmentLivePanel = ({
  titleSuffix = "LIVE",
  rows,
  ctaHref,
  ctaLabel = "Lock terms and review",
  className,
}: InvestmentLivePanelProps) => {
  return (
    <section
      className={`flex min-h-[380px] flex-col rounded-xl border border-[color:var(--color-harv-mint)] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--color-harv-purple)_18%,var(--color-harv-bg))_0%,var(--color-harv-bg)_100%)] p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-harv-mint)_14%,transparent)] sm:p-5 ${className ?? ""}`}
    >
      <h3 className="text-sm font-semibold tracking-tight text-[color:var(--color-harv-text)]">
        Your investment · <span className="text-[color:var(--color-harv-mint)]">{titleSuffix}</span>
      </h3>

      <dl className="mt-5 flex flex-1 flex-col gap-0 text-sm">
        {rows.map(row => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-b-0"
          >
            <dt className="text-[color:var(--color-harv-text)]">{row.label}</dt>
            <dd
              className={`mono-hash max-w-[55%] text-right ${row.highlight ? "text-[color:var(--color-harv-mint)]" : "text-[color:var(--color-harv-text)]"}`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Link href={ctaHref} className="btn btn-primary mt-6 inline-flex w-full items-center justify-center gap-2">
        {ctaLabel}
        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
      </Link>
    </section>
  );
};
