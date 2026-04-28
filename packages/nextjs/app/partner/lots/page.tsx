import { LotCard, Section } from "~~/components/harvverse";
// TODO(phase3D): replace with useQuery(api.partner.lots.listPublishedLots)
import { listLots } from "~~/lib/mock/lots";
import { getPlanByCode } from "~~/lib/mock/plans";

const FILTERS = [
  { label: "Origin", value: "Central America" },
  { label: "Process", value: "All" },
  { label: "Harvest year", value: "2025" },
  { label: "Status", value: "Available" },
];

const LotDiscoveryPage = () => {
  const lots = listLots();

  return (
    <Section
      eyebrow="Discovery · published lots"
      title="Pick a lot. Read the plan. Sign with your wallet."
      description="Each lot has a single locked plan and a target chain. Filters are decorative for the demo."
    >
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {FILTERS.map(filter => (
          <button
            type="button"
            key={filter.label}
            className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-harv-text/80 transition hover:border-[color:var(--color-harv-mint)]/30"
          >
            <span className="eyebrow">{filter.label}</span>
            <span className="font-mono text-[11px] text-harv-text">{filter.value}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {lots.map(lot => (
          <LotCard key={lot.code} lot={lot} plan={getPlanByCode(lot.activePlanCode)} />
        ))}
      </div>
    </Section>
  );
};

export default LotDiscoveryPage;
