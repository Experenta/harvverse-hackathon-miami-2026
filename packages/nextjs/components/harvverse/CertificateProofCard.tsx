import Link from "next/link";
import { GlassCard } from "./GlassCard";
import { MonoHash } from "./MonoHash";
import { StatusPill } from "./StatusPill";
import { WalletPillMock } from "./WalletPillMock";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { Partnership } from "~~/lib/mock/types";

type CertificateProofCardProps = {
  partnership: Partnership;
  lotName: string;
  className?: string;
};

export const CertificateProofCard = ({ partnership, lotName, className }: CertificateProofCardProps) => {
  return (
    <GlassCard padding="lg" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="eyebrow">Certificate · LotCertificate ERC-721</div>
          <h3 className="mt-1 text-2xl font-light tracking-tight text-harv-text">{lotName}</h3>
          <p className="mt-1 text-sm text-muted-harv">
            Non-transferable proof of partnership · onchain ID #{partnership.onchainPartnershipId}
          </p>
        </div>
        <StatusPill status={partnership.status} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <div className="eyebrow">Partner wallet</div>
          <div className="mt-2">
            <WalletPillMock address={partnership.partnerWallet} />
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <div className="eyebrow">Farmer wallet</div>
          <div className="mt-2">
            <WalletPillMock address={partnership.farmerWallet} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <MonoHash label="OPENED TX" value={partnership.openedTxHash} />
        <MonoHash label="PROPOSAL" value={partnership.proposalHash} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <span className="eyebrow">Demo MockUSDC · Hardhat testnet</span>
        <Link
          href={`/blockexplorer/transaction/${partnership.openedTxHash}`}
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-harv-mint)] hover:text-harv-text"
        >
          View on explorer
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>
      </div>
    </GlassCard>
  );
};
