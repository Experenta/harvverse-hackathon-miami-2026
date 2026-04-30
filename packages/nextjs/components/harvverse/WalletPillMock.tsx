import { blo } from "blo";

type WalletPillMockProps = {
  address: string;
  label?: string;
  ens?: string;
  status?: "live" | "static";
  className?: string;
};

const truncate = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/**
 * WalletPillMock — non-interactive pill displaying a wallet address.
 * Designed to look static and identifiable, not to drive transactions.
 */
export const WalletPillMock = ({ address, label, ens, status = "static", className }: WalletPillMockProps) => {
  const avatar = blo(address as `0x${string}`);
  return (
    <div
      className={`inline-flex items-center gap-2 border border-rule bg-ink-2 px-2 py-1 ${className ?? ""}`}
      style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar} alt="" className="h-4 w-4" style={{ borderRadius: 1 }} />
      <div className="flex flex-col leading-tight">
        {label ? <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-paper-3">{label}</span> : null}
        <span className="font-mono text-[11px] text-paper">{ens ?? truncate(address)}</span>
      </div>
      {status === "live" ? <span className="live-dot ml-0.5" aria-hidden /> : null}
    </div>
  );
};
