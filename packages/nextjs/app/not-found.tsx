import Link from "next/link";
import { Panel } from "~~/components/harvverse/Panel";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <Panel padding="xl" className="text-center" crosshair>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">ERR · 404</div>
        <h1
          className="font-display mt-4 text-[clamp(4rem,8vw,7rem)] leading-none tracking-tight text-leaf"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 80' }}
        >
          off-grid.
        </h1>
        <p className="mt-3 text-paper-2">No lot, plan, or partnership lives at this coordinate.</p>
        <Link href="/" className="btn btn-primary mt-6 inline-flex items-center gap-2">
          Return to discovery
        </Link>
      </Panel>
    </div>
  );
}
