"use client";

import { WalletProvider } from "@/lib/web3/WalletContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import dynamic from "next/dynamic";

const AIChat = dynamic(() => import("@/components/AIChat"), { ssr: false });

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <LanguageProvider>
        {children}
        <AIChat />
      </LanguageProvider>
    </WalletProvider>
  );
}
