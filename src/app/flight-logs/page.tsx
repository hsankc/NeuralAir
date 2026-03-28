"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  ChevronRight,
  Cpu,
  Search,
  Filter,
  Plane,
  MapPin,
  Battery,
  ExternalLink,
  Package,
  Tractor,
  Flame,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { initialFlightLogs, FlightLog, MissionType, missionTypeLabels } from "@/lib/data";

function typeIcon(t: MissionType) {
  switch (t) {
    case "cargo": return Package;
    case "agricultural": return Tractor;
    case "fire": return Flame;
    case "traffic": return Eye;
  }
}

function typeBadgeColor(t: MissionType) {
  switch (t) {
    case "cargo": return "bg-accent-cyan/15 text-accent-cyan";
    case "agricultural": return "bg-success/15 text-success";
    case "fire": return "bg-danger/15 text-danger";
    case "traffic": return "bg-warning/15 text-warning";
  }
}

/* ═══════ FLIGHT LOGS PAGE ═══════ */
export default function FlightLogsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MissionType | "all">("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = initialFlightLogs
    .filter((l) => filter === "all" || l.missionType === filter)
    .filter(
      (l) =>
        l.droneName.toLowerCase().includes(search.toLowerCase()) ||
        l.txHash.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-text-muted hover:text-accent-cyan">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold gradient-text">NeuralAir</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent-cyan" />
                  Uçuş Kayıtları (On-Chain)
                </span>
              </div>
            </div>
            <div className="text-xs text-text-muted flex items-center gap-2">
              <span className="status-dot status-active" />
              {initialFlightLogs.length} Kayıt Zincirde
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Toplam Uçuş", value: initialFlightLogs.length, color: "text-accent-cyan" },
            { label: "Toplam Süre", value: `${initialFlightLogs.reduce((a, l) => a + l.duration, 0)} dk`, color: "text-accent-violet" },
            { label: "Toplam Enerji", value: `${initialFlightLogs.reduce((a, l) => a + l.energyUsed, 0).toFixed(1)} kWh`, color: "text-warning" },
            { label: "On-Chain TX", value: initialFlightLogs.length, color: "text-success" },
          ].map((s) => (
            <div key={s.label} className="glass-card !rounded-xl p-4">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Drone adı veya TX hash ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent-cyan transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "cargo", "agricultural", "fire", "traffic"] as (MissionType | "all")[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === t
                    ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                    : "bg-white/5 text-text-secondary border border-transparent hover:bg-white/10"
                }`}
              >
                {t === "all" ? "Tümü" : missionTypeLabels[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card !rounded-xl overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-7 gap-4 px-5 py-3 text-xs font-medium text-text-muted border-b border-border bg-white/3">
            <div>ID</div>
            <div>Drone</div>
            <div>Rota</div>
            <div>Tip</div>
            <div>Süre & Enerji</div>
            <div>TX Hash</div>
            <div>Zaman</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filtered.map((log) => {
              const Icon = typeIcon(log.missionType);
              return (
                <div
                  key={log.id}
                  className="hover:bg-white/3 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-7 gap-4 px-5 py-4 items-center text-sm">
                    <div className="font-mono text-text-muted">#{log.id}</div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-accent-cyan" />
                      <span className="font-medium">{log.droneName}</span>
                    </div>
                    <div className="font-mono text-xs text-text-secondary">
                      {log.startLat.toFixed(2)}° → {log.endLat.toFixed(2)}°
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor(log.missionType)}`}>
                        {missionTypeLabels[log.missionType]}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {log.duration}dk / {log.energyUsed}kWh
                    </div>
                    <div className="font-mono text-xs text-accent-cyan flex items-center gap-1">
                      {log.txHash}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                    <div className="text-xs text-text-muted">
                      {log.timestamp.toLocaleTimeString("tr-TR")}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-accent-cyan" />
                        <span className="font-medium">{log.droneName}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor(log.missionType)}`}>
                        {missionTypeLabels[log.missionType]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-text-muted">
                      <span>{log.duration}dk / {log.energyUsed}kWh</span>
                      <span className="font-mono text-xs text-accent-cyan">{log.txHash}</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === log.id && (
                    <div className="px-5 pb-4 animate-fade-in-up">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/3 rounded-lg text-sm">
                        <div>
                          <div className="text-xs text-text-muted mb-1">Kalkış</div>
                          <div className="font-mono text-xs">{log.startLat.toFixed(4)}°N, {log.startLng.toFixed(4)}°E</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted mb-1">Varış</div>
                          <div className="font-mono text-xs">{log.endLat.toFixed(4)}°N, {log.endLng.toFixed(4)}°E</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted mb-1">Süre</div>
                          <div className="font-bold">{log.duration} dakika</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted mb-1">Enerji</div>
                          <div className="font-bold">{log.energyUsed} kWh</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-text-muted text-center">
                        Bu veri Monad blokzincirine değiştirilemez şekilde yazılmıştır — Havacılık Kara Kutusu 🔒
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
