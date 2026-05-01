"use client";

import Link from "next/link";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { GlassCard } from "~~/components/harvverse/GlassCard";
import { useViewerRole } from "~~/components/harvverse/RoleSwitcher";

type PartnerDashboardRoleGateProps = {
  children: React.ReactNode;
};

/** Restricts partner dashboard UX unless dev-role switcher is on Partner (guest/admin workflows redirect explicitly). */
export const PartnerDashboardRoleGate = ({ children }: PartnerDashboardRoleGateProps) => {
  const role = useViewerRole(s => s.role);

  if (role !== "partner") {
    return (
      <div className="relative isolate px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-lg">
          <GlassCard padding="lg">
            <div className="flex gap-3">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-harv-accent)]" />
              <div className="space-y-2">
                <div className="eyebrow">Partner dashboard · restricted view</div>
                <p className="text-sm leading-relaxed text-muted-harv">
                  Switch the header role dropdown to <span className="text-harv-text">Partner</span> to browse
                  partnerships, milestones, and settlement proofs.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link href="/" className="btn btn-primary btn-sm">
                    Discover lots
                  </Link>
                  <Link href="/partner/lots" className="btn btn-ghost btn-sm border border-white/10">
                    Browse lots
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
