"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Map as MapIcon,
  Radio,
  Activity,
  Battery,
  Cpu,
  Zap,
  ArrowLeft,
  Navigation,
  Crosshair,
  Wind,
  Thermometer,
  Eye,
  ChevronRight,
  Plane,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  initialDrones,
  initialPods,
  initialMissions,
  agentMessages,
  DroneAgent,
  droneTypeLabels,
  statusLabels,
  missionTypeLabels,
  missionStatusLabels,
  randomTxHash,
} from "@/lib/data";

const SkyMap = dynamic(() => import("@/components/SkyMap"), { ssr: false });

/* ─── Drone Simulator Hook ─── */
function useDroneSimulator() {
  const [drones, setDrones] = useState(initialDrones);

  useEffect(() => {
    const iv = setInterval(() => {
      setDrones((prev) =>
        prev.map((d) => {
          if (d.status === "charging" || d.status === "idle") return d;

          const speed = 0.0003 + Math.random() * 0.0004;
          const rad = (d.heading * Math.PI) / 180;
          let newLat = d.lat + Math.cos(rad) * speed;
          let newLng = d.lng + Math.sin(rad) * speed;
          let newBattery = Math.max(0, d.battery - 0.02 - Math.random() * 0.03);
          let newHeading = d.heading + (Math.random() - 0.5) * 10;
          let newStatus = d.status;
          let newAlt = d.altitude + (Math.random() - 0.5) * 5;

          if (newBattery < 10) {
            newStatus = "charging";
          }
          if (newHeading < 0) newHeading += 360;
          if (newHeading > 360) newHeading -= 360;
          newAlt = Math.max(20, Math.min(350, newAlt));

          // Keep drones within İzmir bounds
          newLat = Math.max(38.1, Math.min(38.7, newLat));
          newLng = Math.max(26.2, Math.min(27.5, newLng));

          return {
            ...d,
            lat: newLat,
            lng: newLng,
            battery: newBattery,
            heading: newHeading,
            altitude: Math.round(newAlt),
            status: newStatus as DroneAgent["status"],
          };
        })
      );
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return drones;
}

/* ─── Terminal Log Hook ─── */
function useTerminalLogs() {
  const [logs, setLogs] = useState<
    { time: string; drone: string; level: string; msg: string }[]
  >([]);

  useEffect(() => {
    // Initial logs
    const initial = agentMessages.slice(0, 5).map((m) => ({
      time: new Date().toLocaleTimeString("tr-TR"),
      drone: initialDrones.find((d) => d.id === m.droneId)?.name || `Drone-${m.droneId}`,
      level: m.level,
      msg: m.msg,
    }));
    setLogs(initial);

    const iv = setInterval(() => {
      const m = agentMessages[Math.floor(Math.random() * agentMessages.length)];
      const newLog = {
        time: new Date().toLocaleTimeString("tr-TR"),
        drone: initialDrones.find((d) => d.id === m.droneId)?.name || `Drone-${m.droneId}`,
        level: m.level,
        msg: m.msg,
      };
      setLogs((prev) => [...prev.slice(-30), newLog]);
    }, 3000);

    return () => clearInterval(iv);
  }, []);

  return logs;
}

/* ─── Status Color ─── */
function statusColor(s: string) {
  switch (s) {
    case "in-flight": return "text-accent-cyan";
    case "mission": return "text-accent-violet";
    case "charging": return "text-warning";
    case "emergency": return "text-danger";
    default: return "text-text-muted";
  }
}

function statusDotClass(s: string) {
  switch (s) {
    case "in-flight": return "status-active";
    case "mission": return "status-active";
    case "charging": return "status-charging";
    case "emergency": return "status-emergency";
    default: return "status-idle";
  }
}

function typeColor(t: string) {
  switch (t) {
    case "cargo": return "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30";
    case "agricultural": return "bg-success/15 text-success border-success/30";
    case "surveillance": return "bg-accent-violet/15 text-accent-violet border-accent-violet/30";
    case "emergency": return "bg-danger/15 text-danger border-danger/30";
    case "fire": return "bg-danger/15 text-danger border-danger/30";
    case "traffic": return "bg-warning/15 text-warning border-warning/30";
    default: return "bg-white/10 text-white border-white/20";
  }
}

function logLevelColor(l: string) {
  switch (l) {
    case "success": return "text-success";
    case "warning": return "text-warning";
    case "error": return "text-danger";
    default: return "text-text-secondary";
  }
}

/* ─── NETWORK STATS ─── */
function NetworkStats({ drones }: { drones: DroneAgent[] }) {
  const active = drones.filter((d) => d.status === "in-flight" || d.status === "mission").length;
  const charging = drones.filter((d) => d.status === "charging").length;
  const avgBattery = Math.round(drones.reduce((a, d) => a + d.battery, 0) / drones.length);

  const stats = [
    { icon: Plane, label: "Aktif Uçuş", value: active, color: "text-accent-cyan" },
    { icon: Zap, label: "Şarjda", value: charging, color: "text-warning" },
    { icon: Battery, label: "Ort. Batarya", value: `%${avgBattery}`, color: "text-success" },
    { icon: TrendingUp, label: "Görev", value: initialMissions.filter((m) => m.status === "in-progress").length, color: "text-accent-violet" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {stats.map((s) => (
        <div key={s.label} className="glass-card !rounded-xl p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${s.color}`}>
            <s.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold tabular-nums">{s.value}</div>
            <div className="text-xs text-text-muted">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SIDEBAR NAV ─── */
function DashboardNav() {
  const links = [
    { href: "/dashboard", label: "Gösterge Paneli", icon: Activity, active: true },
    { href: "/marketplace", label: "Görev Pazarı", icon: MapIcon },
    { href: "/sky-charge", label: "Sky-Charge", icon: Zap },
    { href: "/control", label: "Kontrol", icon: Crosshair },
    { href: "/flight-logs", label: "Uçuş Kayıtları", icon: Clock },
  ];

  return (
    <nav className="space-y-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            l.active
              ? "bg-accent-cyan/10 text-accent-cyan"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <l.icon className="w-4.5 h-4.5" />
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

/* ─── DRONE PANEL ─── */
function DronePanel({ drone, onClose }: { drone: DroneAgent; onClose: () => void }) {
  return (
    <div className="glass-card !rounded-xl p-5 space-y-4 animate-slide-in-right">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">{drone.name}</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className={`status-dot ${statusDotClass(drone.status)}`} />
        <span className={`text-sm font-medium ${statusColor(drone.status)}`}>
          {statusLabels[drone.status]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor(drone.type)}`}>
          {droneTypeLabels[drone.type]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-text-muted text-xs mb-1 flex items-center gap-1">
            <Battery className="w-3 h-3" /> Batarya
          </div>
          <div className={`font-bold tabular-nums ${drone.battery < 20 ? "text-danger" : drone.battery < 50 ? "text-warning" : "text-success"}`}>
            %{drone.battery.toFixed(1)}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-text-muted text-xs mb-1 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> Hız
          </div>
          <div className="font-bold tabular-nums">{drone.speed} km/s</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-text-muted text-xs mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> İrtifa
          </div>
          <div className="font-bold tabular-nums">{drone.altitude}m</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-text-muted text-xs mb-1 flex items-center gap-1">
            <Eye className="w-3 h-3" /> İtibar
          </div>
          <div className="font-bold tabular-nums text-accent-cyan">{drone.reputation}</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 text-sm">
        <div className="text-text-muted text-xs mb-1">Koordinatlar</div>
        <div className="font-mono text-xs">
          {drone.lat.toFixed(4)}°N, {drone.lng.toFixed(4)}°E
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 text-sm">
        <div className="text-text-muted text-xs mb-1">Kişilik</div>
        <div className="text-sm">{drone.personality}</div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/control"
          className="flex-1 btn-primary !py-2 text-center text-sm rounded-lg"
        >
          <span>Kontrol Et</span>
        </Link>
        <button className="flex-1 btn-secondary !py-2 text-sm rounded-lg">
          Görev Ata
        </button>
      </div>
    </div>
  );
}

/* ─── AGENT TERMINAL ─── */
function AgentTerminal({
  logs,
}: {
  logs: { time: string; drone: string; level: string; msg: string }[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal h-full flex flex-col">
      <div className="terminal-header">
        <div className="terminal-dot bg-danger" />
        <div className="terminal-dot bg-warning" />
        <div className="terminal-dot bg-success" />
        <span className="text-xs text-text-muted ml-2">agent_terminal.log</span>
        <span className="ml-auto text-xs text-success animate-glow-pulse flex items-center gap-1">
          <Radio className="w-3 h-3" /> CANLI
        </span>
      </div>
      <div ref={scrollRef} className="terminal-body flex-1 overflow-y-auto no-scrollbar relative min-h-0">
        <div className="terminal-scanline" />
        <div className="space-y-1.5">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="text-text-muted shrink-0">[{log.time}]</span>
              <span className="text-accent-cyan shrink-0">{log.drone}</span>
              <span className="text-text-muted">→</span>
              <span className={logLevelColor(log.level)}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MISSION FEED ─── */
function MissionFeed() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Aktif Görevler</h3>
        <Link href="/marketplace" className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
          Tümü <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {initialMissions.filter((m) => m.status !== "completed" && m.status !== "cancelled").slice(0, 5).map((m) => (
          <div key={m.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor(m.type)}`}>
                  {missionTypeLabels[m.type]}
                </span>
                {m.priority && (
                  <span className="text-xs text-danger flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Öncelikli
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-accent-cyan tabular-nums">{m.payment} MON</span>
            </div>
            <div className="text-sm font-medium mb-1">{m.title}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">{m.description.slice(0, 40)}...</span>
              <span className={`text-xs ${m.status === "in-progress" ? "text-success" : "text-warning"}`}>
                {missionStatusLabels[m.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── WEATHER WIDGET ─── */
function WeatherWidget() {
  const [weather, setWeather] = useState({ temp: 24, wind: 12, condition: "Açık" });

  useEffect(() => {
    const iv = setInterval(() => {
      setWeather({
        temp: 20 + Math.round(Math.random() * 10),
        wind: 5 + Math.round(Math.random() * 20),
        condition: ["Açık", "Parçalı Bulutlu", "Rüzgarlı", "Hafif Yağmur"][Math.floor(Math.random() * 4)],
      });
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="glass-card !rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Wind className="w-5 h-5 text-accent-cyan" />
        <div>
          <div className="text-sm font-medium">{weather.condition}</div>
          <div className="text-xs text-text-muted">İzmir Hava Durumu</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3.5 h-3.5 text-warning" />
          <span className="tabular-nums">{weather.temp}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="tabular-nums">{weather.wind} km/s</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN DASHBOARD PAGE ═══════════════════ */
export default function DashboardPage() {
  const drones = useDroneSimulator();
  const logs = useTerminalLogs();
  const [selectedDrone, setSelectedDrone] = useState<DroneAgent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDroneSelect = useCallback((drone: DroneAgent) => {
    setSelectedDrone(drone);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* ── Left Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-bg-secondary border-r border-border p-4 flex flex-col gap-6 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[#0A0E1A]" />
            </div>
            <span className="font-bold gradient-text">NeuralAir</span>
          </Link>
          <button className="lg:hidden text-text-muted" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <DashboardNav />

        <div className="mt-auto space-y-4">
          <WeatherWidget />

          {/* Drone list */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Filo ({drones.length})
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
              {drones.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleDroneSelect(d)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm hover:bg-white/5 transition-colors ${
                    selectedDrone?.id === d.id ? "bg-accent-cyan/10 text-accent-cyan" : ""
                  }`}
                >
                  <span className={`status-dot ${statusDotClass(d.status)}`} />
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className={`text-xs tabular-nums ${d.battery < 20 ? "text-danger" : "text-text-muted"}`}>
                    %{d.battery.toFixed(0)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-bg-secondary/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-text-muted" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-cyan" />
              Gösterge Paneli
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-success">
              <span className="status-dot status-active" />
              Monad Testnet
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <NetworkStats drones={drones} />

          <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* Map - Takes 2 cols */}
            <div className="lg:col-span-2 glass-card !rounded-xl overflow-hidden flex flex-col" style={{ minHeight: 500 }}>
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-accent-cyan" />
                  Canlı Gökyüzü Haritası — İzmir
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{drones.length} drone aktif</span>
                  <span className="status-dot status-active" />
                </div>
              </div>
              <div className="flex-1 relative">
                <SkyMap
                  drones={drones}
                  pods={initialPods}
                  onDroneClick={handleDroneSelect}
                />
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4 flex flex-col">
              {selectedDrone ? (
                <DronePanel drone={selectedDrone} onClose={() => setSelectedDrone(null)} />
              ) : (
                <div className="glass-card !rounded-xl p-5 text-center text-text-muted text-sm">
                  <Crosshair className="w-8 h-8 mx-auto mb-3 text-text-muted opacity-30" />
                  Bir drone seçerek detayları görüntüleyin
                </div>
              )}

              <MissionFeed />
            </div>
          </div>

          {/* Agent Terminal - Full width */}
          <div className="mt-4" style={{ height: 280 }}>
            <AgentTerminal logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
