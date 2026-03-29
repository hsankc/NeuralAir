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
      const balanceRaw = await ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const balInMon = (parseInt(balanceRaw, 16) / 1e18).toFixed(4);
      setState((prev) => ({ ...prev, balance: balInMon }));
    } catch (e) {
      // silently fail
    }
  }, [getEthereum]);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      // Fallback for presentation
      setTimeout(() => {
        setState({
          address: "0x864EdC950468f3d1e1F103fd13DaD7D79dcD8b0C",
          isConnected: true,
          chainId: MONAD_TESTNET.chainId,
          isCorrectChain: true,
          isConnecting: false,
          balance: "12450.00",
          error: null,
        });
      }, 800);
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

  // GERÇEK METAMASK İŞLEMİ (Monad Testnet)
  const sendTransaction = useCallback(async (to: string, amount: string) => {
    const ethereum = getEthereum();
    if (!ethereum || !state.address) {
      throw new Error("Metamask bağlı değil");
    }

    try {
      // Amount in Wei (Hex)
      const weiAmount = (parseFloat(amount) * 1e18).toString(16);
      const params = [
        {
          from: state.address,
          to: to,
          value: '0x' + (BigInt(Math.floor(parseFloat(amount) * 1e18))).toString(16),
          gas: '0x5208', // 21000 gas limit for simple transfer
        },
      ];

      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params,
      });
      
      // Update balance after a small delay
      setTimeout(() => updateBalance(state.address!), 5000);
      
      return txHash as string;
    } catch (err: any) {
      console.error("TX Error:", err);
      throw err;
    }
  }, [getEthereum, state.address, updateBalance]);

  const deductBalance = useCallback((amount: number) => {
    setState((prev) => {
      if (!prev.balance) return prev;
      const current = parseFloat(prev.balance.replace(/,/g, ""));
      const next = Math.max(0, current - amount).toFixed(2);
      return { ...prev, balance: next };
    });
  }, []);

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
    if (!ethereum) {
      setState((prev) => ({
        ...prev,
        chainId: MONAD_TESTNET.chainId,
        isCorrectChain: true,
        error: null,
      }));
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET.chainIdHex }],
      });
    } catch (switchError: any) {
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
        sendTransaction,
        deductBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
