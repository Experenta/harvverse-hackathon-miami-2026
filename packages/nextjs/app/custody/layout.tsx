import Link from "next/link";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { GridBackdrop } from "~~/components/harvverse/GridBackdrop";

const CUSTODY_LINKS: { href: string; label: string }[] = [
  { href: "/custody/settlement-funding", label: "Settlement funding" },
];

const CustodyLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative isolate flex min-h-[calc(100vh-3.5rem)] flex-col">
      <GridBackdrop variant="sparse" className="opacity-30" />
      <div className="relative border-b border-rule bg-[color:var(--color-ink-0)]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-2 border border-proof/30 bg-proof/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-proof"
              style={{ borderRadius: 1 }}
            >
              <ShieldCheckIcon className="h-3 w-3" />
              CUSTODY · OPERATOR
            </span>
            <span className="text-xs text-paper-2">Local pool funding · MockUSDC only</span>
          </div>
          <nav className="flex items-center gap-1">
            {CUSTODY_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-2 transition hover:text-proof"
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

export default CustodyLayout;
