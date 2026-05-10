"use client";

import { WalletProvider } from "@/lib/web3/WalletContext";
import { DroneFleetProvider } from "@/lib/DroneFleetContext";
import dynamic from "next/dynamic";

const AIChat = dynamic(() => import("@/components/AIChat"), { ssr: false });

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <DroneFleetProvider>
        {children}
        <AIChat />
      </DroneFleetProvider>
    </WalletProvider>
  );
}
