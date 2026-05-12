"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Map as MapIcon, Activity, Crosshair, Radio, Menu, X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { BrandLogo } from "@/components/BrandLogo";
import { DroneAgent, DroneType, initialPods, initialObstacles } from "@/lib/data";
import { useDroneFleet } from "@/lib/DroneFleetContext";
import {
  NetworkStats, DashboardNav, WeatherWidget, FleetList,
  AgentTerminal, MissionFeed, DronePanel,
} from "@/components/dashboard";

const SkyMap = dynamic(() => import("@/components/SkyMap"), { ssr: false });
const WalletConnect = dynamic(() => import("@/components/WalletConnect"), { ssr: false });

/* ═══════════════════ MAIN DASHBOARD PAGE ═══════════════════ */
export default function DashboardPage() {
  const { drones, liveMissions, logs } = useDroneFleet();
  const [selectedDroneId, setSelectedDroneId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<DroneType | "all">("all");
  const [showRadar, setShowRadar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const selectedDrone = selectedDroneId
    ? drones.find((d) => d.id === selectedDroneId) ?? null
    : null;

  const handleDroneSelect = useCallback((drone: DroneAgent) => {
    setSelectedDroneId(drone.id);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.droneId) setSelectedDroneId(detail.droneId);
    };
    window.addEventListener("select-drone", handler);
    return () => window.removeEventListener("select-drone", handler);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-[#14F195]/30 flex items-center justify-center animate-pulse">
            <BrandLogo size={80} className="rounded-2xl" priority />
          </div>
          <div className="absolute -inset-4 border border-[#14F195]/20 rounded-3xl animate-spin" style={{animationDuration: '3s'}} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-[#EDEDED]">NeuralAir SkyAgent</h2>
          <div className="flex items-center gap-2 text-sm text-[#71717A]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
            Synchronizing fleet...
          </div>
        </div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#14F195] to-[#9945FF] rounded-full" style={{animation: 'loading-bar 1.5s ease-in-out'}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* ── Left Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-bg-secondary/80 backdrop-blur-xl border-r border-white/[0.06] p-5 flex flex-col gap-6 transform transition-transform lg:translate-x-0 overflow-y-auto no-scrollbar ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-sm shrink-0">
              <BrandLogo size={36} className="rounded-xl" />
            </div>
            <span className="text-lg font-bold gradient-text">NeuralAir</span>
          </Link>
          <button className="lg:hidden text-text-muted" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <DashboardNav />
        <WeatherWidget />
        <FleetList drones={drones} selectedDroneId={selectedDroneId} onSelect={handleDroneSelect} />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-white/[0.06] bg-bg-secondary/40 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-text-muted" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-cyan" />
              NeuralAir Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs font-bold tracking-wider">
              <span className="text-[#14F195]">EN</span>
            </span>
            <WalletConnect />
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <NetworkStats drones={drones} />

          <div className="grid lg:grid-cols-3 gap-6" style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* Map - Takes 2 cols */}
            <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col" style={{ minHeight: 500 }}>
              <div className="p-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-accent-cyan" />
                  Live Operation Map
                </h3>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as DroneType | "all")}
                    className="bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-text-secondary focus:outline-none focus:border-accent-cyan cursor-pointer"
                  >
                    <option value="all">All Fleet</option>
                    <option value="cargo">Cargo Drones</option>
                    <option value="emergency">Emergency</option>
                    <option value="agricultural">Agricultural</option>
                  </select>

                  <button
                    onClick={() => setShowRadar(!showRadar)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${showRadar ? "bg-accent-violet/20 text-accent-violet border border-accent-violet/30" : "bg-black/50 text-text-muted border border-white/10"}`}
                  >
                    <Radio className={`w-3 h-3 ${showRadar ? "animate-pulse" : ""}`} />
                    Radar Mode
                  </button>

                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-text-muted">{drones.length} Drones Active</span>
                    <span className="status-dot status-active" />
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <SkyMap
                  drones={drones}
                  pods={initialPods}
                  missions={liveMissions}
                  obstacles={initialObstacles}
                  onDroneClick={handleDroneSelect}
                  selectedDroneId={selectedDroneId ?? undefined}
                  filterType={filterType}
                  showRadar={showRadar}
                />
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-5 flex flex-col">
              {selectedDrone ? (
                <DronePanel drone={selectedDrone} onClose={() => setSelectedDroneId(null)} />
              ) : (
                <div className="glass-card p-5 text-center text-text-muted text-sm flex-1 flex flex-col items-center justify-center">
                  <Crosshair className="w-8 h-8 mx-auto mb-3 text-text-muted opacity-30" />
                  Select a drone to view details
                </div>
              )}
              <MissionFeed />
            </div>
          </div>

          {/* Agent Terminal */}
          <div className="mt-4" style={{ height: 280 }}>
            <AgentTerminal logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
