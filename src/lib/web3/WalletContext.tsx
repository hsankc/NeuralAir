"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

// ── Phantom window.solana tip tanımı ──
interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toString: () => string } | null;
  isConnected: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

function getPhantom(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const phantom = (window as any)?.phantom?.solana ?? (window as any)?.solana;
  if (phantom?.isPhantom) return phantom as PhantomProvider;
  return null;
}

// Solana Devnet bakiye çek
async function fetchSolBalance(address: string): Promise<string> {
  try {
    const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const data = await res.json();
    const lamports = data?.result?.value ?? 0;
    return (lamports / 1e9).toFixed(4);
  } catch {
    return "0.0000";
  }
}

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  isCorrectChain: boolean;
  isConnecting: boolean;
  balance: string | null;
  error: string | null;
  walletType: "phantom" | "demo" | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToMonad: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
  deductBalance: (amount: number) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: 101,
    isCorrectChain: true,
    isConnecting: false,
    balance: null,
    error: null,
    walletType: null,
  });

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));
    const phantom = getPhantom();

    // Kullanıcı manuel bağlan dediği için engeli kaldır
    if (typeof window !== "undefined") {
      localStorage.removeItem("manuallyDisconnected");
    }

    if (phantom) {
      try {
        const resp = await phantom.connect();
        const address = resp.publicKey.toString();
        const balance = await fetchSolBalance(address);
        setState({
          address,
          isConnected: true,
          chainId: 101,
          isCorrectChain: true,
          isConnecting: false,
          balance: `${balance} SOL`,
          error: null,
          walletType: "phantom",
        });
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: err.message === "User rejected the request."
            ? "Bağlantı iptal edildi"
            : err.message || "Phantom bağlantı hatası",
        }));
      }
      return;
    }

    // Phantom yüklü değilse demo mod
    setTimeout(() => {
      setState({
        address: "DemoWa11et...SoLaNa",
        isConnected: true,
        chainId: 101,
        isCorrectChain: true,
        isConnecting: false,
        balance: "10.0000 SOL",
        error: null,
        walletType: "demo",
      });
    }, 600);
  }, []);

  const disconnect = useCallback(async () => {
    const phantom = getPhantom();
    if (phantom && state.walletType === "phantom") {
      await phantom.disconnect().catch(() => {});
    }
    
    // Manuel çıkış yapıldığını kaydet ki otomatik geri bağlanmasın
    if (typeof window !== "undefined") {
      localStorage.setItem("manuallyDisconnected", "true");
    }

    setState({
      address: null, isConnected: false, chainId: null,
      isCorrectChain: true, isConnecting: false,
      balance: null, error: null, walletType: null,
    });
  }, [state.walletType]);

  const switchToMonad = useCallback(async () => {
    setState((prev) => ({ ...prev, isCorrectChain: true }));
  }, []);

  const sendTransaction = useCallback(async (to: string, amount: string): Promise<string | null> => {
    // Demo modda fake TX
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }, []);

  const deductBalance = useCallback((amount: number) => {
    setState((prev) => {
      if (!prev.balance) return prev;
      const num = parseFloat(prev.balance.replace(" SOL", "").replace(/,/g, ""));
      const next = Math.max(0, num - amount).toFixed(4);
      return { ...prev, balance: `${next} SOL` };
    });
  }, []);

  // Phantom daha önce bağlıysa otomatik bağlan
  useEffect(() => {
    const phantom = getPhantom();
    if (!phantom) return;
    
    // Eğer kullanıcı manuel çıkış yaptıysa otomatik bağlanma
    const isManuallyDisconnected = typeof window !== "undefined" && localStorage.getItem("manuallyDisconnected") === "true";
    if (isManuallyDisconnected) return;

    const handleDisconnect = () => disconnect();
    phantom.on("disconnect", handleDisconnect);
    phantom.connect({ onlyIfTrusted: true })
      .then(async (resp) => {
        const address = resp.publicKey.toString();
        const balance = await fetchSolBalance(address);
        setState((prev) => ({
          ...prev, address, isConnected: true,
          isConnecting: false, balance: `${balance} SOL`, walletType: "phantom",
        }));
      })
      .catch(() => {});
    return () => { phantom.off("disconnect", handleDisconnect); };
  }, [disconnect]);

  return (
    <WalletContext.Provider value={{
      ...state, connect, disconnect,
      switchToMonad, sendTransaction, deductBalance,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
