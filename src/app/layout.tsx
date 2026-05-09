import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClientProviders } from "./providers";

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
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* CesiumJS CSS */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/cesium/1.114.0/Widgets/widgets.min.css" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <ClientProviders>{children}</ClientProviders>
        {/* CesiumJS Core Script */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/cesium/1.114.0/Cesium.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
