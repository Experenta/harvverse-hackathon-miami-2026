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
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[color:var(--color-harv-accent)]/30 bg-[color:var(--color-harv-accent)]/8 px-3 py-1.5 text-xs text-[color:var(--color-harv-accent)] transition hover:bg-[color:var(--color-harv-accent)]/15">
          <span className="font-mono uppercase tracking-wider text-[10px] text-[color:var(--color-harv-accent)]/70">
            DEV · Role
          </span>
          <span className="font-medium">{current.label}</span>
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </summary>
        <ul className="dropdown-content menu glass z-50 mt-2 w-44 rounded-xl border-white/10 p-1 text-sm shadow-xl">
          {roles.map(r => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex w-full justify-between rounded-md px-2 py-1.5 text-left ${
                  r.id === role ? "bg-white/5 text-[color:var(--color-harv-mint)]" : "text-harv-text"
                }`}
              >
                {r.label}
                {r.id === role ? <span className="text-[color:var(--color-harv-mint)]">●</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};
