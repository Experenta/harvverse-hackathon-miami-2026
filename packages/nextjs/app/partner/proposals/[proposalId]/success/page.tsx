import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  CommandLineIcon,
  CpuChipIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { MonoHash } from "~~/components/harvverse/MonoHash";
import { Panel } from "~~/components/harvverse/Panel";
import { Stat } from "~~/components/harvverse/Stat";
import { WalletPillMock } from "~~/components/harvverse/WalletPillMock";
import { getLotByCode } from "~~/lib/mock/lots";
import { getProposalById } from "~~/lib/mock/proposals";

const formatCents = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);

type SuccessProps = { params: Promise<{ proposalId: string }> };

const SuccessPage = async ({ params }: SuccessProps) => {
  const { proposalId } = await params;
  const proposal = getProposalById(proposalId);
  if (!proposal) notFound();
  const lot = getLotByCode(proposal.lotCode);
  if (!lot) notFound();

  const TX_HASH = "0x9f3a82e1b7c6d4a59038f12e4b6c8d7e5f2a1b9c0d3e4f5a6b7c8d9e0f1a2bc12d";

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
      {/* Atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-12 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-leaf/20 blur-[120px]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-overlay opacity-30" />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="reveal reveal-1 flex items-center gap-3 border-b border-rule pb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">PARTNERSHIP · MINTED</span>
          <span className="ml-auto coordinate">⌖ blk #11,482,451 · 17:43 UTC</span>
        </div>

        {/* === HERO STATEMENT === */}
        <div className="reveal reveal-2 mt-12 flex flex-col items-center text-center">
          <div className="relative inline-flex h-20 w-20 items-center justify-center">
            {/* concentric pulse rings */}
            <span
              aria-hidden
              className="absolute inset-0 animate-pulse-glow border border-leaf"
              style={{ borderRadius: 1 }}
            />
            <span aria-hidden className="absolute inset-2 border border-leaf/40" style={{ borderRadius: 1 }} />
            <CheckCircleIcon className="relative h-10 w-10 text-leaf" />
          </div>
          <div className="mt-6 eyebrow-leaf">PARTNERSHIP LOCKED ONCHAIN</div>
          <h1 className="font-display mt-3 text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] tracking-[-0.035em] text-paper">
            Welcome to{" "}
            <em className="not-italic text-gradient-leaf">Finca {lot.farmName.split(" ")[1] ?? lot.farmName}</em>.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-paper-2">
            Your <span className="font-mono text-paper">{formatCents(proposal.ticketCents)}</span> USDC is in
            MilestoneEscrow custody. <span className="font-mono text-paper">LotNFT #001</span> is in your wallet. T0
            release fires now.
          </p>
        </div>

        {/* === Stat row === */}
        <div className="reveal reveal-3 mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Lot" value={lot.code.toUpperCase()} size="md" tone="leaf" />
          <Stat label="Certificate" value="#001" size="md" tone="proof" />
          <Stat label="Block" value="#11,482,451" size="sm" tone="muted" />
          <Stat label="Network" value="HARDHAT" size="sm" tone="honey" />
        </div>

        {/* === Onchain proof === */}
        <Panel padding="lg" className="reveal reveal-4 mt-8" crosshair>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CpuChipIcon className="h-4 w-4 text-leaf" />
              <span className="eyebrow-leaf">ONCHAIN PROOF · TX 0x9f3a…2bc1</span>
            </div>
            <LiveDot tone="proof" label="confirmed" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              className="border border-rule bg-ink-2 p-4"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
            >
              <span className="eyebrow">PARTNER</span>
              <div className="mt-2">
                <WalletPillMock address={proposal.walletAddress} status="live" label="receives certificate" />
              </div>
            </div>
            <div
              className="border border-rule bg-ink-2 p-4"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
            >
              <span className="eyebrow">FARMER</span>
              <div className="mt-2">
                <WalletPillMock address={lot.farmerWallet} label="receives funding" />
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <MonoHash label="TX HASH" value={TX_HASH} truncate={10} />
            <MonoHash label="PROPOSAL HASH" value={proposal.proposalHash} truncate={10} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/blockexplorer"
              className="inline-flex items-center justify-center gap-2 border border-rule px-4 py-2.5 text-sm text-paper hover:border-leaf hover:text-leaf"
              style={{ borderRadius: 2 }}
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              View on local explorer
            </Link>
            <Link
              href={`/partner/dashboard`}
              className="btn btn-primary inline-flex items-center justify-center gap-2 shimmer-cta"
            >
              See partnership dashboard
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Panel>

        {/* === T0 release === */}
        <Panel padding="lg" variant="hot" className="reveal reveal-5 mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center border border-leaf/40 bg-leaf/10 text-leaf"
              style={{ borderRadius: 1 }}
            >
              <DocumentCheckIcon className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="eyebrow-leaf">T0 · MILESTONE RELEASE</div>
              <div className="font-display mt-1 text-2xl leading-none tracking-tight text-paper">
                $380 USDC released to fiduciary
              </div>
              <p className="mt-1 text-sm text-paper-2">
                For M1 Diagnóstico + M2 Preparación. Next milestone (M2 attestation): Apr 2026.
              </p>
            </div>
            <Link
              href={`/partner/dashboard`}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-leaf hover:text-paper"
            >
              follow milestones →
            </Link>
          </div>
        </Panel>

        {/* === Footer chips === */}
        <div className="reveal reveal-6 mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6">
          <div className="flex items-center gap-2 text-paper-3">
            <CommandLineIcon className="h-4 w-4" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
              demo · MockUSDC · local Hardhat 31337
            </span>
          </div>
          <Link
            href="/partner/lots"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-3 hover:text-leaf"
          >
            browse other lots →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
