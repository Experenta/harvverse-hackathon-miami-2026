import { blo } from "blo";

type WalletPillMockProps = {
  address: string;
  label?: string;
  ens?: string;
  className?: string;
};

const truncate = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const WalletPillMock = ({ address, label, ens, className }: WalletPillMockProps) => {
  const avatar = blo(address as `0x${string}`);
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-2 py-1 ${className ?? ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar} alt="" className="h-5 w-5 rounded-full" />
      <div className="flex flex-col leading-tight">
        {label ? <span className="eyebrow text-[9px]">{label}</span> : null}
        <span className="mono-hash text-xs text-harv-text">{ens ?? truncate(address)}</span>
      </div>
    </div>
  );
};
