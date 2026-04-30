import { GlassCard } from "./GlassCard";
import { MonoHash } from "./MonoHash";
import { StatusPill } from "./StatusPill";

type MilestoneStepProps = {
  number: number;
  label: string;
  status: "pending" | "recorded" | "attested";
  artifactHash?: string;
  registryTxHash?: string;
  notes?: string;
  completedAt?: string;
  className?: string;
};

export const MilestoneStep = ({
  number,
  label,
  status,
  artifactHash,
  registryTxHash,
  notes,
  completedAt,
  className,
}: MilestoneStepProps) => {
  return (
    <GlassCard padding="md" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-harv-mint)]/30 bg-[color:var(--color-harv-mint)]/8 font-mono text-sm text-[color:var(--color-harv-mint)]">
            M{number}
          </div>
          <div>
            <div className="text-base font-medium text-harv-text">{label}</div>
            {completedAt ? <div className="eyebrow mt-1">{completedAt}</div> : null}
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      {notes ? <p className="mt-3 text-sm text-muted-harv">{notes}</p> : null}

      {(artifactHash || registryTxHash) && (
        <div className="mt-4 grid gap-2">
          {artifactHash ? <MonoHash label="ARTIFACT" value={artifactHash} /> : null}
          {registryTxHash ? <MonoHash label="REGISTRY TX" value={registryTxHash} /> : null}
        </div>
      )}
    </GlassCard>
  );
};
