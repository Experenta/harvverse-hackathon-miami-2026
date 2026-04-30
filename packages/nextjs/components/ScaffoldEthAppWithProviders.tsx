"use client";

import { useEffect } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { notification } from "~~/utils/scaffold-eth";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    let hasNotifiedLocalRpcDown = false;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      let reasonText = "";
      if (typeof reason === "string") {
        reasonText = reason;
      } else {
        try {
          reasonText = JSON.stringify(reason);
        } catch {
          reasonText = String(reason);
        }
      }
      const fullText = `${reasonText} ${reason?.message ?? ""}`.toLowerCase();
      const isLocalRpcFetchError =
        fullText.includes("failed to fetch") &&
        (fullText.includes("127.0.0.1:8545") || fullText.includes("localhost:8545"));

      if (!isLocalRpcFetchError) {
        return;
      }

      event.preventDefault();

      if (hasNotifiedLocalRpcDown) {
        return;
      }

      hasNotifiedLocalRpcDown = true;
      notification.error(
        <>
          <p className="font-bold mt-0 mb-1">No se pudo conectar al nodo local</p>
          <p className="m-0">
            Inicia la blockchain local con <code className="italic bg-base-300 text-base font-bold">pnpm chain</code>.
          </p>
        </>,
      );
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }, []);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster
        toastOptions={{
          style: {
            background: "#110f0d",
            color: "#f4ede4",
            border: "1px solid rgba(155, 194, 108, 0.25)",
            borderRadius: 2,
            fontFamily: "var(--font-geist-sans)",
          },
        }}
      />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const harvverseRainbowTheme = darkTheme({
  accentColor: "#9bc26c",
  accentColorForeground: "#0a0908",
  borderRadius: "small",
  fontStack: "system",
  overlayBlur: "small",
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider avatar={BlockieAvatar} theme={harvverseRainbowTheme}>
          <ProgressBar height="2px" color="#9bc26c" />
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
