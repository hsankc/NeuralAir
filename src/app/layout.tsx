import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "NeuralAir — SkyAgent Protocol | Autonomous Drone Network",
  description:
    "Decentralized autonomous aviation network on the Solana blockchain. DePIN charging, AI mission dispatch, real-time drone tracking and on-chain flight control.",
  icons: {
    icon: "/neuralair-logo.png",
    apple: "/neuralair-logo.png",
  },
  keywords: [
    "drone",
    "blockchain",
    "Solana",
    "DePIN",
    "AI",
    "autonomous flight",
    "NeuralAir",
    "SkyAgent",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
