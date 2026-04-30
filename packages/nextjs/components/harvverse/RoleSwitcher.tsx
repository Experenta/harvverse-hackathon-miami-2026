"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export type ViewerRole = "guest" | "partner" | "admin" | "settlement_operator" | "custodian";

type RoleStore = {
  role: ViewerRole;
  setRole: (role: ViewerRole) => void;
};

export const useViewerRole = create<RoleStore>()(
  persist(
    set => ({
      role: "partner",
      setRole: role => set({ role }),
    }),
    { name: "harvverse-viewer-role" },
  ),
);

const roles: { id: ViewerRole; label: string }[] = [
  { id: "guest", label: "Guest" },
  { id: "partner", label: "Partner" },
  { id: "admin", label: "Admin" },
  { id: "settlement_operator", label: "Operator" },
  { id: "custodian", label: "Custodian" },
];

export const RoleSwitcher = ({ className }: { className?: string }) => {
  const role = useViewerRole(state => state.role);
  const setRole = useViewerRole(state => state.setRole);
  const current = roles.find(r => r.id === role) ?? roles[1];

  return (
    <div className={`relative ${className ?? ""}`}>
      <details className="dropdown dropdown-end">
        <summary
          className="flex cursor-pointer list-none items-center gap-2 border border-honey/30 bg-honey/8 px-3 py-1.5 text-xs text-honey transition hover:bg-honey/15"
          style={{ borderRadius: 2 }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-honey/70">DEV · ROLE</span>
          <span className="font-medium">{current.label}</span>
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </summary>
        <ul
          className="dropdown-content menu z-50 mt-2 w-44 border border-rule bg-ink-1 p-1 text-sm shadow-xl"
          style={{ borderRadius: 2, backgroundColor: "var(--color-ink-1)" }}
        >
          {roles.map(r => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex w-full justify-between px-2 py-1.5 text-left ${
                  r.id === role ? "bg-leaf/10 text-leaf" : "text-paper hover:bg-ink-2"
                }`}
                style={{ borderRadius: 1 }}
              >
                {r.label}
                {r.id === role ? <span className="text-leaf">●</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};
