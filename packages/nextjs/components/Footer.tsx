"use client";

import Link from "next/link";
import { hardhat } from "viem/chains";
import { ArrowTopRightOnSquareIcon, BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HarvverseLogo } from "~~/components/harvverse/HarvverseLogo";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="relative mt-20 border-t border-white/5 bg-[color:var(--color-harv-bg)]/80">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:gap-12 lg:px-10">
        <div>
          <HarvverseLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-harv">
            Coffee lot partnerships with deterministic settlement, accountable evidence, and on-chain proof. Built for
            the Harvverse hackathon.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-harv">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLocalNetwork ? "bg-[color:var(--color-harv-mint)]" : "bg-[color:var(--color-harv-accent)]"
              }`}
            />
            {targetNetwork.name}
            <span className="ml-1 text-harv-text">· Demo network</span>
          </div>
        </div>

        <div>
          <div className="eyebrow">Product</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-harv-text/80 hover:text-[color:var(--color-harv-mint)]" href="/">
                Discover lots
              </Link>
            </li>
            <li>
              <Link className="text-harv-text/80 hover:text-[color:var(--color-harv-mint)]" href="/partner/dashboard">
                Partner dashboard
              </Link>
            </li>
            <li>
              <Link className="text-harv-text/80 hover:text-[color:var(--color-harv-mint)]" href="/admin">
                Admin
              </Link>
            </li>
            <li>
              <Link
                className="text-harv-text/80 hover:text-[color:var(--color-harv-mint)]"
                href="/custody/settlement-funding"
              >
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
                  <Link
                    href="/blockexplorer"
                    className="inline-flex items-center gap-1.5 text-harv-text/80 hover:text-[color:var(--color-harv-mint)]"
                  >
                    <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                    Block explorer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/debug"
                    className="inline-flex items-center gap-1.5 text-harv-text/80 hover:text-[color:var(--color-harv-mint)]"
                  >
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
                className="inline-flex items-center gap-1.5 text-harv-text/80 hover:text-[color:var(--color-harv-mint)]"
              >
                Harvverse.com
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="eyebrow">Disclaimer</div>
          <p className="mt-3 text-xs leading-relaxed text-muted-harv">
            This is an MVP built for the hackathon and is for illustrative purposes only. Not financial advice. No
            guarantee of yield, performance, or transferable investment rights.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-muted-harv sm:px-6 lg:px-10">
          <span className="font-mono uppercase tracking-wider">© {new Date().getFullYear()} Harvverse · MVP</span>
          <span className="font-mono">build · hackathon-miami-2026</span>
        </div>
      </div>
    </footer>
  );
};
