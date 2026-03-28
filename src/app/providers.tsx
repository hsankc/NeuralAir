"use client";

import { WalletProvider } from "@/lib/web3/WalletContext";
import dynamic from "next/dynamic";

const AIChat = dynamic(() => import("@/components/AIChat"), { ssr: false });

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      {children}
      <AIChat />
    </WalletProvider>
  );
}
