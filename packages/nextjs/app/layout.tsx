import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

// Body — clean, contemporary, neutral
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

// Mono — terminal/cryptographic precision
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Display — soft optical serif, organic for a coffee/agronomy product
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata = getMetadata({
  title: "Harvverse — Coffee Lot Partnerships",
  description:
    "Local-only demo: review specialty coffee lots, sign onchain partnerships, and inspect deterministic settlement proofs. Not financial advice.",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="harvverse"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}
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
