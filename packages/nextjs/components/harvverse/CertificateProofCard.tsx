import Link from "next/link";
import { MonoHash } from "./MonoHash";
import { Panel } from "./Panel";
import { StatusPill } from "./StatusPill";
import { WalletPillMock } from "./WalletPillMock";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { Partnership } from "~~/lib/mock/types";

type CertificateProofCardProps = {
  partnership: Partnership;
  lotName: string;
  className?: string;
};

/**
 * CertificateProofCard — compact summary of a non-transferable LotCertificate.
 * Renders the partnership ID, both wallets, and the opened/proposal hashes.
 */
export const CertificateProofCard = ({ partnership, lotName, className }: CertificateProofCardProps) => {
  return (
    <Panel padding="lg" className={className} crosshair>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="eyebrow-leaf">CERTIFICATE · LotCertificate ERC-721</div>
          <h3 className="font-display mt-2 text-3xl font-light leading-none tracking-tight text-paper">{lotName}</h3>
          <p className="mt-2 text-sm text-paper-2">
            Non-transferable proof of partnership · onchain ID #{partnership.onchainPartnershipId}
          </p>
        </div>
        <StatusPill status={partnership.status} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div
          className="border border-rule bg-ink-2 p-4"
          style={{ backgroundColor: "var(--color-ink-2)", borderRadius: 2 }}
        >
          <div className="eyebrow">Partner wallet</div>
          <div className="mt-2">
            <WalletPillMock address={partnership.partnerWallet} />
          </div>
        </div>
        <div
          className="border border-rule bg-ink-2 p-4"
          style={{ backgroundColor: "var(--color-ink-2)", borderRadius: 2 }}
        >
          <div className="eyebrow">Farmer wallet</div>
          <div className="mt-2">
            <WalletPillMock address={partnership.farmerWallet} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <MonoHash label="OPENED TX" value={partnership.openedTxHash} truncate={6} />
        <MonoHash label="PROPOSAL" value={partnership.proposalHash} truncate={6} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
        <span className="eyebrow">Demo MockUSDC · Hardhat 31337</span>
        <Link
          href={`/blockexplorer/transaction/${partnership.openedTxHash}`}
          className="inline-flex items-center gap-1.5 text-sm text-leaf hover:text-paper"
        >
          View on local explorer
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>
      </div>
    </Panel>
  );
};
