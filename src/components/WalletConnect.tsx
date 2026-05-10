"use client";

import { useState, useRef, useEffect } from "react";
import { Wallet, LogOut, ChevronDown, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { useWallet } from "@/lib/web3/WalletContext";


export default function WalletConnect() {
  const { address, isConnected, isConnecting, balance, error, connect, disconnect, walletType } = useWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (isConnecting) {
    return (
      <button 
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded bg-white/5 border border-border text-sm text-text-secondary transition-colors"
      >
        <Loader2 className="w-4 h-4 animate-spin text-accent-cyan" />
        <span className="opacity-80">Connecting...</span>
      </button>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={connect}
          className="flex items-center gap-2 btn-primary !py-2 !px-4 text-sm rounded shadow-sm hover:shadow-md"
        >
          <span className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </span>
        </button>
        {error && (
          <div className="absolute top-full mt-2 right-0 bg-danger/10 border border-danger/30 rounded p-3 text-xs text-danger max-w-xs animate-fade-in-up shadow-sm z-50">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  }

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-[#111111] border border-[#27272A] hover:border-[#60A5FA]/50 transition-colors text-sm shadow-sm"
      >
        {/* Network indicator */}
        <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399]" />
        <span className="font-mono text-[#EDEDED]">{shortAddr}</span>
        {balance && (
          <span className="text-xs text-[#34D399] font-medium tabular-nums border-l border-[#27272A] pl-2 ml-1">
            {balance}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full mt-2 right-0 w-[280px] bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-hidden z-50 animate-fade-in-up shadow-2xl">
          
          {/* Hazine / DePIN Alıcı Bilgisi */}
          <div className="p-4 border-b border-[#1A1A1A] bg-[#050505]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider">Mission / DePIN Revenue</div>
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981] animate-pulse" />
            </div>
            <div className="font-mono text-[11px] text-[#34D399] bg-[#062E1C] border border-[#0A472A] px-2 py-1.5 rounded truncate" title="0x864EdC950468f3d1e1F103fd13DaD7D79dcD8b0C">
              0x864E...8b0C
            </div>
          </div>

          <div className="p-4 border-b border-[#1A1A1A]">
            <div className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-1">Connected Operator</div>
            <div className="font-mono text-xs text-[#EDEDED] truncate" title={address || undefined}>{address}</div>
          </div>

          <div className="p-4 border-b border-[#1A1A1A]">
            <div className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider mb-1">Network Status</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span className="text-xs font-semibold text-[#EDEDED]">
                {walletType === "demo" ? "Demo Mode" : "Solana Devnet"}
              </span>
            </div>
          </div>

          {balance && (
            <div className="p-4 border-b border-[#1A1A1A] flex justify-between items-center">
              <div className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider">Balance</div>
              <div className="text-sm font-bold text-[#34D399] tabular-nums">{balance}</div>
            </div>
          )}

          <div className="p-1.5 flex gap-1">
            <a
              href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg hover:bg-[#18181B] text-[#A1A1AA] hover:text-[#EDEDED] transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <ExternalLink className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-semibold">Explorer</span>
            </a>
            <button
              onClick={() => { disconnect(); setDropdownOpen(false); }}
              className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg hover:bg-[#2E0A0A] text-[#F87171] transition-colors"
            >
              <LogOut className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-semibold">Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
