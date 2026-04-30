"use client";

import Link from "next/link";
import { GlassCard } from "~~/components/harvverse/GlassCard";
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
        eyebrow="Partner dashboard"
        title="Connect your wallet to see your partnerships"
        description="Once you sign a partnership, your certificate proof and milestone evidence will live here."
      >
        <GlassCard padding="lg" className="text-center">
          <p className="text-sm text-muted-harv">
            Use the Connect Wallet button in the header. This is a testnet demo with deterministic settlement only.
          </p>
          <Link href="/" className="btn btn-primary mt-5 inline-flex items-center gap-2">
            Browse lots
          </Link>
        </GlassCard>
      </Section>
    );
  }

  return <>{children}</>;
};
