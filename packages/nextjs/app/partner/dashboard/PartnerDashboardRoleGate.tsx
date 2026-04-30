"use client";

import Link from "next/link";
import { Panel } from "~~/components/harvverse/Panel";
import { useViewerRole } from "~~/components/harvverse/RoleSwitcher";
import { Section } from "~~/components/harvverse/Section";

type PartnerDashboardRoleGateProps = {
  children: React.ReactNode;
};

export const PartnerDashboardRoleGate = ({ children }: PartnerDashboardRoleGateProps) => {
  const role = useViewerRole(state => state.role);

  if (role === "guest") {
    return (
      <Section
        index="§ DASHBOARD"
        eyebrow="Partner dashboard"
        eyebrowTone="leaf"
        title="Connect your wallet to see your partnerships."
        description="Once you sign, your certificate proof and milestone evidence live here."
      >
        <Panel padding="xl" className="text-center" crosshair>
          <p className="text-sm text-paper-2">
            Use the Connect Wallet button in the header. This is a local demo with deterministic settlement only.
          </p>
          <Link href="/" className="btn btn-primary mt-5 inline-flex items-center gap-2">
            Browse lots
          </Link>
        </Panel>
      </Section>
    );
  }

  return <>{children}</>;
};
