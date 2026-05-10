import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "NeuralAir — SkyAgent Protocol | Otonom Drone Ağı",
  description:
    "Solana blokzinciri üzerinde merkeziyetsiz otonom havacılık ağı. DePIN şarj, AI görev dağıtımı, gerçek zamanlı drone takibi ve on-chain uçuş kontrol.",
  keywords: [
    "drone",
    "blockchain",
    "Solana",
    "DePIN",
    "AI",
    "otonom uçuş",
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
