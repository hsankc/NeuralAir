"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { MONAD_TESTNET } from "./config";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  isCorrectChain: boolean;
  isConnecting: boolean;
  balance: string | null;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToMonad: () => Promise<void>;
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
    chainId: null,
    isCorrectChain: false,
    isConnecting: false,
    balance: null,
    error: null,
  });

  const getEthereum = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return null;
  }, []);

  const updateBalance = useCallback(async (address: string) => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      const balance = await ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const balInMon = (parseInt(balance, 16) / 1e18).toFixed(4);
      setState((prev) => ({ ...prev, balance: balInMon }));
    } catch (e) {
      // silently fail
    }
  }, [getEthereum]);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask yüklü değil! Lütfen metamask.io'dan yükleyin.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainIdHex = await ethereum.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex, 16);

      const address = accounts[0];
      setState({
        address,
        isConnected: true,
        chainId,
        isCorrectChain: chainId === MONAD_TESTNET.chainId,
        isConnecting: false,
        balance: null,
        error: null,
      });

      updateBalance(address);
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || "Bağlantı reddedildi",
      }));
    }
  }, [getEthereum, updateBalance]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      chainId: null,
      isCorrectChain: false,
      isConnecting: false,
      balance: null,
      error: null,
    });
  }, []);

  const switchToMonad = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET.chainIdHex }],
      });
    } catch (switchError: any) {
      // Chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: MONAD_TESTNET.chainIdHex,
                chainName: MONAD_TESTNET.name,
                nativeCurrency: MONAD_TESTNET.currency,
                rpcUrls: [MONAD_TESTNET.rpcUrl],
                blockExplorerUrls: [MONAD_TESTNET.explorerUrl],
              },
            ],
          });
        } catch (addError: any) {
          setState((prev) => ({
            ...prev,
            error: addError.message || "Ağ eklenemedi",
          }));
        }
      }
    }
  }, [getEthereum]);

  // Listen for account/chain changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState((prev) => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }));
        updateBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setState((prev) => ({
        ...prev,
        chainId,
        isCorrectChain: chainId === MONAD_TESTNET.chainId,
      }));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    // Check if already connected
    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          ethereum.request({ method: "eth_chainId" }).then((chainIdHex: string) => {
            const chainId = parseInt(chainIdHex, 16);
            setState({
              address: accounts[0],
              isConnected: true,
              chainId,
              isCorrectChain: chainId === MONAD_TESTNET.chainId,
              isConnecting: false,
              balance: null,
              error: null,
            });
            updateBalance(accounts[0]);
          });
        }
      })
      .catch(() => {});

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [getEthereum, disconnect, updateBalance]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        switchToMonad,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
