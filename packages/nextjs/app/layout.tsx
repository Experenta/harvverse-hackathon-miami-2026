import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

/** Plus Jakarta Sans approximates the Trenda family from the Harvverse design PDF; swap for local Trenda via @font-face when licensed. */
const harvSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-harv-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata = getMetadata({
  title: "Harvverse — Coffee Lot Partnerships",
  description:
    "Testnet demo: review specialty coffee lots, sign on-chain partnerships, and inspect deterministic settlement proofs. Not financial advice.",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="harvverse"
      className={`${harvSans.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="harvverse" forcedTheme="harvverse" enableSystem={false}>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
