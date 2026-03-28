"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Crosshair,
  ArrowLeft,
  ChevronRight,
  Cpu,
  ArrowUp,
  ArrowDown,
  ArrowLeftIcon,
  ArrowRightIcon,
  RotateCcw,
  Navigation,
  Pause,
  Plane,
  ChevronUp,
  ChevronDown,
  Radio,
  Clock,
  Zap,
  Battery,
  Gauge,
} from "lucide-react";
import { initialDrones, DroneAgent, droneTypeLabels, statusLabels, randomTxHash } from "@/lib/data";

type Command = "TakeOff" | "Land" | "North" | "South" | "East" | "West" | "Up" | "Down" | "Hover" | "RTB";

interface CommandRecord {
  command: Command;
  txHash: string;
  timestamp: Date;
  latency: number; // ms
}

const commandLabels: Record<Command, string> = {
  TakeOff: "Kalkış",
  Land: "İniş",
  North: "Kuzeye Git",
  South: "Güneye Git",
  East: "Doğuya Git",
  West: "Batıya Git",
  Up: "İrtifa Artır",
  Down: "İrtifa Azalt",
  Hover: "Havada Kal",
  RTB: "Üsse Dön",
};

const commandColors: Record<Command, string> = {
  TakeOff: "text-success",
  Land: "text-warning",
  North: "text-accent-cyan",
  South: "text-accent-cyan",
  East: "text-accent-cyan",
  West: "text-accent-cyan",
  Up: "text-accent-violet",
  Down: "text-accent-violet",
  Hover: "text-text-secondary",
  RTB: "text-danger",
};

/* ═══════ CONTROL PAGE ═══════ */
export default function ControlPage() {
  const [selectedDroneId, setSelectedDroneId] = useState(1);
  const [commands, setCommands] = useState<CommandRecord[]>([]);
  const [lastLatency, setLastLatency] = useState(0);
  const [sending, setSending] = useState(false);
  const [pos, setPos] = useState({ lat: 38.4237, lng: 27.1428, alt: 120 });

  const drone = initialDrones.find((d) => d.id === selectedDroneId)!;

  const sendCommand = useCallback(
    (cmd: Command) => {
      setSending(true);
      const latency = 200 + Math.floor(Math.random() * 400); // Simulate Monad speed

      setTimeout(() => {
        const record: CommandRecord = {
          command: cmd,
          txHash: randomTxHash(),
          timestamp: new Date(),
          latency,
        };
        setCommands((prev) => [...prev, record]);
        setLastLatency(latency);
        setSending(false);

        // Update position
        setPos((prev) => {
          const step = 0.002;
          switch (cmd) {
            case "North": return { ...prev, lat: prev.lat + step };
            case "South": return { ...prev, lat: prev.lat - step };
            case "East": return { ...prev, lng: prev.lng + step };
            case "West": return { ...prev, lng: prev.lng - step };
            case "Up": return { ...prev, alt: prev.alt + 20 };
            case "Down": return { ...prev, alt: Math.max(0, prev.alt - 20) };
            default: return prev;
          }
        });
      }, latency);
    },
    []
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (sending) return;
      switch (e.key.toLowerCase()) {
        case "w": sendCommand("North"); break;
        case "s": sendCommand("South"); break;
        case "d": sendCommand("East"); break;
        case "a": sendCommand("West"); break;
        case "q": sendCommand("Up"); break;
        case "e": sendCommand("Down"); break;
        case " ": e.preventDefault(); sendCommand("Hover"); break;
        case "r": sendCommand("RTB"); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sendCommand, sending]);

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
                    <Cpu className="w-4 h-4 text-[#0A0E1A]" />
                  </div>
                  <span className="font-bold gradient-text">NeuralAir</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-accent-violet" />
                  Blockchain Kontrol
                </span>
              </div>
            </div>
            {/* Latency badge */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${lastLatency > 0 ? "bg-success/15 text-success" : "bg-white/5 text-text-muted"}`}>
                <Gauge className="w-3.5 h-3.5" />
                {lastLatency > 0 ? `${lastLatency}ms` : "Bekliyor..."}
              </div>
              <div className="flex items-center gap-2 text-xs text-success">
                <span className="status-dot status-active" />
                Monad Testnet
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Drone selector */}
        <div className="mb-6">
          <label className="text-xs text-text-muted block mb-2">Drone Seçin:</label>
          <div className="flex flex-wrap gap-2">
            {initialDrones.filter((d) => d.status !== "charging").slice(0, 8).map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelectedDroneId(d.id); setPos({ lat: d.lat, lng: d.lng, alt: d.altitude }); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedDroneId === d.id
                    ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                    : "bg-white/5 text-text-secondary border border-transparent hover:bg-white/10"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left - Control pad + Drone status */}
          <div className="space-y-6">
            {/* Drone Info */}
            <div className="glass-card !rounded-xl p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-accent-cyan" />
                {drone.name}
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
                  {droneTypeLabels[drone.type]}
                </span>
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Enlem</div>
                  <div className="text-sm font-mono font-bold tabular-nums">{pos.lat.toFixed(4)}°N</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Boylam</div>
                  <div className="text-sm font-mono font-bold tabular-nums">{pos.lng.toFixed(4)}°E</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">İrtifa</div>
                  <div className="text-sm font-mono font-bold tabular-nums">{pos.alt}m</div>
                </div>
              </div>
            </div>

            {/* Control Pad */}
            <div className="glass-card !rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-center">On-Chain Kontrol Paneli</h3>
              <p className="text-xs text-text-muted text-center mb-6">
                Her buton bir Monad işlemi gönderir. Klavye: W/A/S/D + Q/E
              </p>

              {/* D-pad */}
              <div className="flex flex-col items-center gap-2 mb-6">
                <button
                  disabled={sending}
                  onClick={() => sendCommand("North")}
                  className="w-16 h-16 rounded-xl bg-white/5 border border-border hover:border-accent-cyan hover:bg-accent-cyan/10 transition-all flex items-center justify-center disabled:opacity-30"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                  <button
                    disabled={sending}
                    onClick={() => sendCommand("West")}
                    className="w-16 h-16 rounded-xl bg-white/5 border border-border hover:border-accent-cyan hover:bg-accent-cyan/10 transition-all flex items-center justify-center disabled:opacity-30"
                  >
                    <ArrowLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    disabled={sending}
                    onClick={() => sendCommand("Hover")}
                    className="w-16 h-16 rounded-xl bg-accent-violet/10 border border-accent-violet/30 hover:bg-accent-violet/20 transition-all flex items-center justify-center disabled:opacity-30"
                  >
                    <Pause className="w-6 h-6 text-accent-violet" />
                  </button>
                  <button
                    disabled={sending}
                    onClick={() => sendCommand("East")}
                    className="w-16 h-16 rounded-xl bg-white/5 border border-border hover:border-accent-cyan hover:bg-accent-cyan/10 transition-all flex items-center justify-center disabled:opacity-30"
                  >
                    <ArrowRightIcon className="w-6 h-6" />
                  </button>
                </div>
                <button
                  disabled={sending}
                  onClick={() => sendCommand("South")}
                  className="w-16 h-16 rounded-xl bg-white/5 border border-border hover:border-accent-cyan hover:bg-accent-cyan/10 transition-all flex items-center justify-center disabled:opacity-30"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-4 gap-2">
                {(["TakeOff", "Land", "Up", "Down", "RTB"] as Command[]).map((cmd) => (
                  <button
                    key={cmd}
                    disabled={sending}
                    onClick={() => sendCommand(cmd)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                      cmd === "RTB" 
                        ? "bg-danger/10 border-danger/30 text-danger hover:bg-danger/20" 
                        : cmd === "TakeOff"
                        ? "bg-success/10 border-success/30 text-success hover:bg-success/20"
                        : "bg-white/5 border-border text-text-secondary hover:bg-white/10"
                    } disabled:opacity-30`}
                  >
                    {commandLabels[cmd]}
                  </button>
                ))}
              </div>

              {/* Latency display */}
              {sending && (
                <div className="mt-4 text-center text-sm text-accent-cyan animate-glow-pulse">
                  <Radio className="w-4 h-4 inline mr-2" />
                  Komut Monad&apos;a gönderiliyor...
                </div>
              )}

              {lastLatency > 0 && !sending && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30">
                    <Zap className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      Komut → On-Chain: {lastLatency}ms
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Command log */}
          <div className="terminal flex flex-col" style={{ maxHeight: 700 }}>
            <div className="terminal-header">
              <div className="terminal-dot bg-danger" />
              <div className="terminal-dot bg-warning" />
              <div className="terminal-dot bg-success" />
              <span className="text-xs text-text-muted ml-2">command_log.chain</span>
              <span className="ml-auto text-xs text-accent-cyan tabular-nums">
                {commands.length} TX
              </span>
            </div>
            <div className="terminal-body flex-1 overflow-y-auto no-scrollbar relative">
              <div className="terminal-scanline" />
              {commands.length === 0 ? (
                <div className="text-text-muted text-sm text-center py-12">
                  Henüz komut gönderilmedi.
                  <br />
                  <span className="text-xs">Kontrol butonlarını veya WASD tuşlarını kullanın.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {commands.map((c, i) => (
                    <div key={i} className="bg-white/3 rounded-lg p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${commandColors[c.command]}`}>
                          {commandLabels[c.command]}
                        </span>
                        <span className="text-success tabular-nums font-mono">{c.latency}ms</span>
                      </div>
                      <div className="flex items-center justify-between text-text-muted">
                        <span className="font-mono">{c.txHash}</span>
                        <span>{c.timestamp.toLocaleTimeString("tr-TR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
