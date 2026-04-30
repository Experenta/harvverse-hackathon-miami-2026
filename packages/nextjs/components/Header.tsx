"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { HarvverseLogo } from "~~/components/harvverse/HarvverseLogo";
import { LiveDot } from "~~/components/harvverse/LiveDot";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

const RoleSwitcher = dynamic(() => import("~~/components/harvverse/RoleSwitcher").then(module => module.RoleSwitcher), {
  ssr: false,
  loading: () => null,
});

const RainbowKitCustomConnectButton = dynamic(
  () =>
    import("~~/components/scaffold-eth/RainbowKitCustomConnectButton").then(
      module => module.RainbowKitCustomConnectButton,
    ),
  {
    ssr: false,
    loading: () => (
      <button className="btn btn-ghost btn-sm" type="button">
        Wallet
      </button>
    ),
  },
);

type HeaderMenuLink = {
  label: string;
  href: string;
  matches?: (path: string) => boolean;
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Discover", href: "/", matches: path => path === "/" || path.startsWith("/partner/lots") },
  { label: "Dashboard", href: "/partner/dashboard", matches: path => path.startsWith("/partner/dashboard") },
  { label: "Admin", href: "/admin", matches: path => path.startsWith("/admin") },
  { label: "Custody", href: "/custody/settlement-funding", matches: path => path.startsWith("/custody") },
];

const HeaderMenuLinks = ({ inDrawer = false }: { inDrawer?: boolean }) => {
  const pathname = usePathname();
  return (
    <>
      {menuLinks.map(({ label, href, matches }) => {
        const isActive = matches ? matches(pathname) : pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              className={`relative inline-flex items-center gap-2 px-2 py-1 text-[12px] font-mono uppercase tracking-[0.18em] transition ${
                inDrawer ? "w-full" : ""
              } ${isActive ? "text-leaf" : "text-paper-2 hover:text-paper"}`}
              style={{ borderRadius: 1 }}
            >
              {label}
              {isActive ? <span className="absolute -bottom-1 left-2 right-2 h-px bg-leaf" /> : null}
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef as React.RefObject<HTMLElement>, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky top-0 z-30 w-full border-b border-rule bg-[color:var(--color-ink-0)]/85 backdrop-blur-xl">
      {/* Top tactical strip */}
      <div className="hidden h-6 items-center justify-between border-b border-rule px-4 sm:flex sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">
          <span>HARVVERSE · DEMO REL.04.29.26</span>
          <span className="hidden md:inline">··</span>
          <span className="hidden md:inline">⌖ 14°56′47.4″N · 88°05′10.7″W</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">
          <span>NOT FINANCIAL ADVICE</span>
          <span>· LOCAL ONLY</span>
        </div>
      </div>

      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-6">
          <details className="dropdown lg:hidden" ref={burgerMenuRef}>
            <summary className="btn btn-ghost btn-sm px-2">
              <Bars3Icon className="h-5 w-5" />
            </summary>
            <ul
              className="menu dropdown-content z-50 mt-2 w-56 border border-rule bg-ink-1 p-2 text-sm shadow-xl"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-1)" }}
              onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
            >
              <HeaderMenuLinks inDrawer />
              <div className="divider-harv my-2" />
              <li>
                <Link href="/debug" className="inline-flex items-center gap-2 px-2 py-1.5 text-xs text-paper-3">
                  <BugAntIcon className="h-4 w-4" />
                  Debug Contracts
                </Link>
              </li>
            </ul>
          </details>

          <Link href="/" className="flex shrink-0 items-center">
            <HarvverseLogo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            <HeaderMenuLinks />
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="inline-flex items-center gap-1.5 border border-rule bg-ink-2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3"
              style={{ borderRadius: 2, backgroundColor: "var(--color-ink-2)" }}
            >
              <LiveDot tone={isLocalNetwork ? "leaf" : "honey"} />
              {targetNetwork.name}
            </span>
          </div>
          <RoleSwitcher className="hidden md:block" />
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </div>
  );
};
