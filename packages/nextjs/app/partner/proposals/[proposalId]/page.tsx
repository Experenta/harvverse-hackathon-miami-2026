import { notFound } from "next/navigation";
import { ProposalCTA } from "./ProposalCTA";
import { AIExplanationCard } from "~~/components/harvverse/AIExplanationCard";
import { GlassCard } from "~~/components/harvverse/GlassCard";
import { MetricCard } from "~~/components/harvverse/MetricCard";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Section } from "~~/components/harvverse/Section";
import { StatusPill } from "~~/components/harvverse/StatusPill";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { getLotByCode } from "~~/lib/mock/lots";
import { getPlanByCode } from "~~/lib/mock/plans";
// TODO(phase3D/4B): replace with useQuery(api.partner.proposals.getMyProposal)
import { getProposalById } from "~~/lib/mock/proposals";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);

type ProposalPageProps = { params: Promise<{ proposalId: string }> };

const ProposalPage = async ({ params }: ProposalPageProps) => {
  const { proposalId } = await params;
  const proposal = getProposalById(proposalId);
  if (!proposal) notFound();

  const lot = getLotByCode(proposal.lotCode);
  const plan = getPlanByCode(proposal.planCode);
  if (!lot || !plan) notFound();

  const fallbackText =
    `This is a testnet demo for lot ${lot.code} (${lot.farmName}). The ticket is ${formatCents(proposal.ticketCents)}, ` +
    `paid in demo MockUSDC. Settlement is computed deterministically from locked plan terms (yield cap ` +
    `${(plan.yieldCapY1TenthsQQ / 10).toFixed(1)} qq, fixed price $${(plan.priceCentsPerLb / 100).toFixed(2)}/lb, ` +
    `farmer split ${(plan.splitFarmerBps / 100).toFixed(0)}%) and harvest evidence. ` +
    `No yield is guaranteed. This summary is informational and is not financial advice.`;

  return (
    <Section
      eyebrow={`Proposal · ${proposal.id}`}
      title={
        <>
          Confirm testnet partnership <span className="text-muted-harv">· {lot.farmName}</span>
        </>
      }
      description="Review the immutable proposal details below. Two wallet prompts are required: approve MockUSDC, then open partnership."
      actions={<StatusPill status={proposal.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <GlassCard padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Proposal hash · canonical</div>
                <h3 className="mt-2 text-2xl font-light tracking-tight text-harv-text">Locked terms</h3>
                <p className="mt-1 text-sm text-muted-harv">
                  Computed in Convex from lot, plan and active factory deployment. Identical to{" "}
                  <span className="mono-hash text-harv-text">PartnershipFactory.expectedProposalHash</span>.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <MonoHash label="PROPOSAL HASH" value={proposal.proposalHash} />
              <MonoHash label="PLAN HASH" value={plan.planHash} />
              <MonoHash label="FACTORY" value={proposal.factoryAddress} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Ticket" value={formatCents(proposal.ticketCents)} mono />
              <MetricCard
                label="Ticket (units)"
                value={Number(proposal.ticketUsdcUnits).toLocaleString("en-US")}
                tone="muted"
                mono
                hint="6-decimal MockUSDC base units"
              />
              <MetricCard label="Chain" value="Hardhat" tone="gold" mono />
              <MetricCard label="Onchain lot ID" value={`#${proposal.onchainLotId}`} tone="mint" mono />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                <div className="eyebrow">Partner wallet</div>
                <div className="mt-2">
                  <WalletPillMock address={proposal.walletAddress} />
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                <div className="eyebrow">Farmer wallet</div>
                <div className="mt-2">
                  <WalletPillMock address={lot.farmerWallet} />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Deterministic preview · year 1</div>
                <h3 className="mt-1 text-xl font-light tracking-tight text-harv-text">Settlement projection</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Revenue" value={formatCents(proposal.revenueCents)} mono />
              <MetricCard label="Profit" value={formatCents(proposal.profitCents)} mono />
              <MetricCard label="Farmer share" value={formatCents(proposal.farmerCents)} tone="gold" mono />
              <MetricCard label="Partner share" value={formatCents(proposal.partnerCents)} tone="mint" mono />
            </div>
            <p className="mt-4 text-xs text-muted-harv">
              Numbers above are computed from locked plan terms. Actual settlement depends on harvest evidence and is
              never adjusted by the AI assistant.
            </p>
          </GlassCard>

          <AIExplanationCard text={fallbackText} mode="fallback" />
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ProposalCTA proposal={proposal} />
        </aside>
      </div>
    </Section>
  );
};

export default ProposalPage;
