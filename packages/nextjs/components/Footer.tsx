"use client";

import Link from "next/link";
import { hardhat } from "viem/chains";
import { ArrowTopRightOnSquareIcon, BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HarvverseLogo } from "~~/components/harvverse/HarvverseLogo";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="relative mt-24 border-t border-rule bg-[color:var(--color-ink-0)]/85">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1.2fr] lg:gap-12 lg:px-10">
        <div>
          <HarvverseLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper-2">
            Coffee lot partnerships with deterministic settlement, accountable evidence, and onchain proof. Local-only
            demo for the Harvverse hackathon.
          </p>
          <div
            className="mt-4 inline-flex items-center gap-2 border border-rule bg-ink-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3"
            style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
          >
            <LiveDot tone={isLocalNetwork ? "leaf" : "honey"} />
            {targetNetwork.name}
            <span className="ml-1 text-paper">· demo network</span>
          </div>
        </div>

        <div>
          <div className="eyebrow">Product</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-paper hover:text-leaf" href="/">
                Discover lots
              </Link>
            </li>
            <li>
              <Link className="text-paper hover:text-leaf" href="/partner/dashboard">
                Partner dashboard
              </Link>
            </li>
            <li>
              <Link className="text-paper hover:text-leaf" href="/admin">
                Admin
              </Link>
            </li>
            <li>
              <Link className="text-paper hover:text-leaf" href="/custody/settlement-funding">
                Custody
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="eyebrow">Developer</div>
          <ul className="mt-3 space-y-2 text-sm">
            {isLocalNetwork ? (
              <>
                <li>
                  <Link href="/blockexplorer" className="inline-flex items-center gap-1.5 text-paper hover:text-leaf">
                    <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                    Block explorer
                  </Link>
                </li>
                <li>
                  <Link href="/debug" className="inline-flex items-center gap-1.5 text-paper hover:text-leaf">
                    <BugAntIcon className="h-3.5 w-3.5" />
                    Debug contracts
                  </Link>
                </li>
              </>
            ) : null}
            <li>
              <a
                href="https://www.harvverse.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-paper hover:text-leaf"
              >
                Harvverse.com
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="eyebrow">Disclaimer</div>
          <p className="mt-3 text-xs leading-relaxed text-paper-2">
            MVP built for the hackathon — illustrative purposes only. Not financial advice. No guarantee of yield, no
            transferable investment rights, no production custody. Demo MockUSDC on a local Hardhat chain.
          </p>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-paper-3 sm:px-6 lg:px-10">
          <span className="font-mono uppercase tracking-[0.18em]">© {new Date().getFullYear()} Harvverse · MVP</span>
          <span className="font-mono uppercase tracking-[0.18em]">build · hackathon-miami-2026</span>
        </div>
      </div>
    </footer>
  );
};
