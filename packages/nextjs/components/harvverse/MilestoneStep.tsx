import { MonoHash } from "./MonoHash";
import { Panel } from "./Panel";
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

/**
 * MilestoneStep — single row of the milestone timeline.
 * Sharp panel, monospace milestone marker, optional artifact/tx hashes.
 */
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
  const isAttested = status === "attested";
  return (
    <Panel padding="md" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center border ${
              isAttested
                ? "border-leaf bg-leaf/15 text-leaf"
                : status === "recorded"
                  ? "border-honey bg-honey/10 text-honey"
                  : "border-rule text-paper-3"
            }`}
            style={{ borderRadius: 1 }}
          >
            <span className="font-mono text-xs">M{number}</span>
          </div>
          <div>
            <div className="text-base text-paper">{label}</div>
            {completedAt ? <div className="eyebrow mt-1">{completedAt}</div> : null}
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      {notes ? <p className="mt-3 text-sm text-paper-2">{notes}</p> : null}

      {(artifactHash || registryTxHash) && (
        <div className="mt-4 grid gap-2">
          {artifactHash ? <MonoHash label="ARTIFACT" value={artifactHash} truncate={6} /> : null}
          {registryTxHash ? <MonoHash label="REGISTRY TX" value={registryTxHash} truncate={6} /> : null}
        </div>
      )}
    </Panel>
  );
};
