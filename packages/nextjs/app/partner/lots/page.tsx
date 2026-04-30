import Link from "next/link";
import { ArrowRightIcon, BellAlertIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { LotCard } from "~~/components/harvverse/LotCard";
import { Panel } from "~~/components/harvverse/Panel";
import { Section } from "~~/components/harvverse/Section";
import { listLots } from "~~/lib/mock/lots";
import { getPlanByCode } from "~~/lib/mock/plans";

const FILTERS: { label: string; value: string; active?: boolean }[] = [
  { label: "Origin", value: "Central America", active: true },
  { label: "Process", value: "All" },
  { label: "Harvest", value: "2025" },
  { label: "Status", value: "Available" },
  { label: "Altitude", value: "≥ 1,500 masl" },
];

const LotDiscoveryPage = () => {
  const lots = listLots();
  const available = lots.filter(l => l.status === "available");
  const upcoming = lots.filter(l => l.status !== "available");

  return (
    <>
      <Section
        index="§ CATALOG"
        eyebrow="Discovery · published lots"
        eyebrowTone="leaf"
        coordinate="feed live · 4 lots"
        title="Pick a lot. Read the plan. Sign with your wallet."
        description="Each lot has a single locked plan and a target chain. Filters are decorative for the demo, live in production."
      >
        <div className="mb-10 flex flex-wrap items-center gap-2 border-y border-rule py-4">
          <MapPinIcon className="h-4 w-4 text-leaf" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">FILTERS</span>
          {FILTERS.map(filter => (
            <button
              type="button"
              key={filter.label}
              data-active={filter.active ? "true" : undefined}
              className="btn-tag"
            >
              <span className="text-paper-3">{filter.label}</span>
              <span className="text-paper">{filter.value}</span>
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">
            {available.length} available · {upcoming.length} upcoming
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {lots.map(lot => (
            <LotCard key={lot.code} lot={lot} plan={getPlanByCode(lot.activePlanCode)} />
          ))}
        </div>
      </Section>

      <Section
        index="§ NEXT"
        eyebrow="Next harvest cycle"
        eyebrowTone="honey"
        title="Get notified when a new lot opens."
        description="Subscribe with your wallet to be the first to know."
      >
        <Panel padding="xl" crosshair className="bg-[color:var(--color-ink-1)]">
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-honey">
                <BellAlertIcon className="h-5 w-5" />
                <span className="eyebrow-honey">DEMO · NEW-LOT NOTIFY</span>
              </div>
              <h3 className="font-display mt-3 text-[clamp(2rem,3.4vw,3rem)] leading-none tracking-[-0.025em] text-paper">
                Three more lots are <em className="not-italic text-gradient-honey">in onboarding</em>.
              </h3>
              <p className="mt-3 max-w-xl text-paper-2">
                Marcala (LP), Copán Pacas, and a Cup of Excellence finalist from Santa Bárbara are queued. Each will
                publish a locked plan, a verifier identity, and a single ticket size.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="you@partnership.coffee"
                className="border border-rule bg-ink-2 px-4 py-3 font-mono text-sm text-paper placeholder:text-paper-3 focus:border-leaf focus:outline-none"
                style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
              />
              <Link href="/partner/dashboard" className="btn btn-primary inline-flex items-center justify-center gap-2">
                Notify me
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-paper-3">No spam. Decorative form on the demo.</p>
            </div>
          </div>
        </Panel>
      </Section>
    </>
  );
};

export default LotDiscoveryPage;
