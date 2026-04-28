"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { HarvverseLogo } from "~~/components/harvverse/HarvverseLogo";
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
      <button className="btn btn-ghost btn-sm border border-white/10 text-muted-harv" type="button">
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
              className={`relative inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
                inDrawer ? "w-full" : ""
              } ${
                isActive ? "bg-white/5 text-[color:var(--color-harv-mint)]" : "text-harv-text/80 hover:text-harv-text"
              }`}
            >
              {label}
              {isActive ? (
                <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-[color:var(--color-harv-mint)]" />
              ) : null}
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
    <div className="sticky top-0 z-30 w-full border-b border-white/5 bg-[color:var(--color-harv-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-6">
          <details className="dropdown lg:hidden" ref={burgerMenuRef}>
            <summary className="btn btn-ghost btn-sm px-2">
              <Bars3Icon className="h-5 w-5" />
            </summary>
            <ul
              className="menu dropdown-content glass z-50 mt-2 w-56 rounded-xl border-white/10 p-2 text-sm shadow-xl"
              onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
            >
              <HeaderMenuLinks inDrawer />
              <div className="divider-harv my-2" />
              <li>
                <Link
                  href="/debug"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-harv"
                >
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-harv">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLocalNetwork
                    ? "bg-[color:var(--color-harv-mint)] animate-pulse-glow"
                    : "bg-[color:var(--color-harv-accent)]"
                }`}
              />
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
