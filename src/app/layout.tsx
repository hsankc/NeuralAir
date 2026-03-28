import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuralAir — SkyAgent Protocol | Otonom Drone Ağı",
  description:
    "Monad blokzinciri üzerinde merkeziyetsiz otonom havacılık ağı. DePIN şarj, AI görev dağıtımı, gerçek zamanlı drone takibi ve on-chain uçuş kontrol.",
  keywords: [
    "drone",
    "blockchain",
    "Monad",
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
    <html lang="tr" className="dark">
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
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
