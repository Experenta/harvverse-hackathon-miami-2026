import Link from "next/link";
import { GridBackdrop } from "~~/components/harvverse/GridBackdrop";

const PARTNER_LINKS: { href: string; label: string }[] = [
  { href: "/partner/lots", label: "Lots" },
  { href: "/partner/dashboard", label: "Dashboard" },
];

const PartnerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative isolate flex min-h-[calc(100vh-3.5rem)] flex-col">
      <GridBackdrop variant="sparse" className="opacity-40" />
      <div className="relative border-b border-white/5 bg-[color:var(--color-harv-bg)]/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Partner workspace</span>
            <span className="hidden text-muted-harv sm:inline">·</span>
            <span className="hidden text-xs text-muted-harv sm:inline">Sign coffee partnerships from your wallet</span>
          </div>
          <nav className="flex items-center gap-1">
            {PARTNER_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-xs text-harv-text/80 hover:bg-white/5 hover:text-harv-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="relative flex-1">{children}</div>
    </div>
  );
};

export default PartnerLayout;
