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
  ChevronDown,
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
const WalletConnect = dynamic(() => import("@/components/WalletConnect"), { ssr: false });

/* ─── Drone Simulator Hook ─── */
function useDroneSimulator() {
  const [drones, setDrones] = useState(initialDrones);

  useEffect(() => {
    const handleAiCommand = ((e: CustomEvent) => {
      const cmd = e.detail;
      if (!cmd) return;

      setDrones((prev) => {
        let updated = [...prev];

        // 1. Send Command (Yönlendirme vb.)
        if (cmd.action === "sendCommand" && cmd.params?.droneId) {
          updated = updated.map((d) => {
            if (d.id === cmd.params.droneId) {
              const command = cmd.params.command;
              let newStatus = d.status;
              let newHeading = d.heading;
              let newAlt = d.altitude;

              if (command === "TakeOff") { newStatus = "in-flight"; newAlt = 150; }
              else if (command === "Land") { newStatus = "idle"; newAlt = 0; }
              else if (command === "Hover") { newStatus = "in-flight"; }
              else if (command === "North") newHeading = 270;
              else if (command === "South") newHeading = 90;
              else if (command === "East") newHeading = 0;
              else if (command === "West") newHeading = 180;
              else if (command === "Up") newAlt = Math.min(350, newAlt + 50);
              else if (command === "Down") newAlt = Math.max(20, newAlt - 50);
              else if (command === "RTB") { newStatus = "mission"; }

              return { ...d, status: newStatus, heading: newHeading, altitude: newAlt };
            }
            return d;
          });
        }

        // 2. Create Mission (Görev Atama)
        if (cmd.action === "createMission") {
          let assigned = false;
          updated = updated.map((d) => {
            if (!assigned && (d.status === "idle" || d.status === "charging")) {
              assigned = true;
              return { ...d, status: "mission" as const };
            }
            return d;
          });
        }

        // 3. Deploy Swarm (Sürü Gönderimi)
        if (cmd.action === "deploySwarm") {
          const count = cmd.params?.droneCount || 3;
          let assigned = 0;
          updated = updated.map((d) => {
            if (assigned < count && (d.status === "idle" || d.status === "charging" || d.type === "emergency")) {
              assigned++;
              return { ...d, status: "emergency" as const, heading: 225 }; // Move towards fire/emergency
            }
            return d;
          });
        }

        return updated;
      });
    }) as EventListener;

    window.addEventListener("ai-command", handleAiCommand);
    return () => window.removeEventListener("ai-command", handleAiCommand);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setDrones((prev) =>
        prev.map((d) => {
          // Şarjdaki dronelar şarj olsun (5 dk'da full)
          if (d.status === "charging") {
            const newBat = Math.min(100, d.battery + 0.7 + Math.random() * 0.3);
            if (newBat >= 98) {
              return { ...d, battery: 100, status: "idle" as const, altitude: 0, speed: 0 };
            }
            return { ...d, battery: newBat };
          }

          // Idle drone → 5 saniye (2-3 tick) sonra tekrar uçuşa
          if (d.status === "idle") {
            if (d.battery > 50 && Math.random() < 0.15) {
              return {
                ...d,
                status: "in-flight" as const,
                altitude: 80 + Math.round(Math.random() * 120),
                speed: 30 + Math.round(Math.random() * 30),
                heading: Math.round(Math.random() * 360),
              };
            }
            return d;
          }

          // === AKTİF UÇUŞ ===
          // Hareket: daha belirgin koordinat değişimi
          const moveSpeed = 0.0006 + Math.random() * 0.0006;
          const rad = (d.heading * Math.PI) / 180;
          let newLat = d.lat + Math.cos(rad) * moveSpeed;
          let newLng = d.lng + Math.sin(rad) * moveSpeed;

          // Batarya: ~0.17% per 2s tick → 100% / 0.17 = ~600 ticks × 2s = ~20 dakika
          let newBattery = Math.max(0, d.battery - 0.14 - Math.random() * 0.06);
          let newHeading = d.heading + (Math.random() - 0.5) * 12;
          let newStatus: DroneAgent["status"] = d.status;
          let newSpeed = d.speed + Math.round((Math.random() - 0.5) * 4);
          let newAlt = d.altitude + (Math.random() - 0.5) * 8;

          // Hız sınırları
          newSpeed = Math.max(15, Math.min(70, newSpeed));

          // %20 altına düşünce → otomatik iniş
          if (newBattery < 20 && d.battery >= 20) {
            newStatus = "emergency";
          } else if (newBattery < 20) {
            newSpeed = Math.max(0, d.speed - 5);
            newAlt = Math.max(0, d.altitude - 12);
            if (newAlt <= 3) {
              newStatus = "charging";
              newSpeed = 0;
              newAlt = 0;
            } else {
              newStatus = "emergency";
            }
          }

          if (newHeading < 0) newHeading += 360;
          if (newHeading > 360) newHeading -= 360;
          newAlt = Math.max(0, Math.min(350, newAlt));

          // İzmir sınırları
          newLat = Math.max(38.1, Math.min(38.7, newLat));
          newLng = Math.max(26.2, Math.min(27.5, newLng));

          return {
            ...d,
            lat: newLat,
            lng: newLng,
            battery: newBattery,
            heading: newHeading,
            altitude: Math.round(newAlt),
            speed: Math.round(newSpeed),
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
function useTerminalLogs(drones: DroneAgent[]) {
  const [logs, setLogs] = useState<
    { time: string; drone: string; level: string; msg: string }[]
  >([]);
  const prevBatRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    // Initial logs
    const initial = agentMessages.slice(0, 5).map((m) => ({
      time: new Date().toLocaleTimeString("tr-TR"),
      drone: initialDrones.find((d) => d.id === m.droneId)?.name || `Drone-${m.droneId}`,
      level: m.level,
      msg: m.msg,
    }));
    setLogs(initial);
  }, []);

  // Listen to drone state changes for dynamic logs
  useEffect(() => {
    const now = new Date().toLocaleTimeString("tr-TR");
    const newLogs: { time: string; drone: string; level: string; msg: string }[] = [];

    drones.forEach((d) => {
      const prevBat = prevBatRef.current.get(d.id) ?? d.battery + 1;

      // Batarya %20'nin altına ilk kez düştü
      if (prevBat >= 20 && d.battery < 20) {
        newLogs.push({
          time: now,
          drone: d.name,
          level: "error",
          msg: `🚨 BATARYA KRİTİK! %${d.battery.toFixed(1)} — Otomatik iniş protokolü başlatıldı!`,
        });
      }
      // İniş yapıyor
      if (d.battery < 20 && d.status === "emergency" && d.altitude > 0 && d.altitude < 50) {
        newLogs.push({
          time: now,
          drone: d.name,
          level: "warning",
          msg: `⚠ Acil iniş devam ediyor... İrtifa: ${d.altitude}m | Batarya: %${d.battery.toFixed(1)}`,
        });
      }
      // Şarj moduna geçti
      if (d.status === "charging" && d.battery < 25 && prevBat < 25 && d.altitude === 0) {
        newLogs.push({
          time: now,
          drone: d.name,
          level: "success",
          msg: `✅ İniş tamamlandı. En yakın şarj poduna bağlandı. Şarj başlatılıyor...`,
        });
      }
      // Şarjı tamamladı
      if (prevBat < 95 && d.battery >= 95 && d.status === "idle") {
        newLogs.push({
          time: now,
          drone: d.name,
          level: "success",
          msg: `🔋 Şarj tamamlandı! Batarya: %100. Yeni görev bekleniyor...`,
        });
      }

      prevBatRef.current.set(d.id, d.battery);
    });

    if (newLogs.length > 0) {
      setLogs((prev) => [...prev.slice(-30), ...newLogs]);
    }
  }, [drones]);

  // Regular random logs
  useEffect(() => {
    const iv = setInterval(() => {
      const m = agentMessages[Math.floor(Math.random() * agentMessages.length)];
      const newLog = {
        time: new Date().toLocaleTimeString("tr-TR"),
        drone: initialDrones.find((d) => d.id === m.droneId)?.name || `Drone-${m.droneId}`,
        level: m.level,
        msg: m.msg,
      };
      setLogs((prev) => [...prev.slice(-30), newLog]);
    }, 4000);

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
    case "cargo": return "bg-[#18181B] text-[#60A5FA] border-[#27272A]";
    case "agricultural": return "bg-[#18181B] text-[#34D399] border-[#27272A]";
    case "surveillance": return "bg-[#18181B] text-[#A78BFA] border-[#27272A]";
    case "emergency": return "bg-[#18181B] text-[#F87171] border-[#27272A]";
    case "fire": return "bg-[#18181B] text-[#F87171] border-[#27272A]";
    case "traffic": return "bg-[#18181B] text-[#FBBF24] border-[#27272A]";
    default: return "bg-[#18181B] text-[#A1A1AA] border-[#27272A]";
  }
}

function logLevelColor(l: string) {
  switch (l) {
    case "success": return "text-[#34D399]";
    case "warning": return "text-[#FBBF24]";
    case "error": return "text-[#F87171]";
    default: return "text-[#A1A1AA]";
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="glass-card p-5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
            <s.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums">{s.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
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
    <nav className="space-y-1.5">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            l.active
              ? "bg-accent-cyan/10 text-accent-cyan shadow-sm"
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
    <div className="glass-card p-6 space-y-5 animate-slide-in-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl">{drone.name}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className={`status-dot ${statusDotClass(drone.status)}`} />
        <span className={`text-sm font-semibold ${statusColor(drone.status)}`}>
          {statusLabels[drone.status]}
        </span>
        <span className={`text-xs ml-2 px-2.5 py-0.5 rounded-full border ${typeColor(drone.type)}`}>
          {droneTypeLabels[drone.type]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-2">
        <div className="bg-bg-tertiary/60 rounded-xl p-4">
          <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
            <Battery className="w-3.5 h-3.5" /> Batarya
          </div>
          <div className={`text-xl font-bold tabular-nums ${drone.battery < 20 ? "text-danger" : drone.battery < 50 ? "text-warning" : "text-success"}`}>
            %{drone.battery.toFixed(1)}
          </div>
        </div>
        <div className="bg-bg-tertiary/60 rounded-xl p-4">
          <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5" /> Hız
          </div>
          <div className="text-xl font-bold tabular-nums">{drone.speed} km/s</div>
        </div>
        <div className="bg-bg-tertiary/60 rounded-xl p-4">
          <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" /> İrtifa
          </div>
          <div className="text-xl font-bold tabular-nums">{drone.altitude}m</div>
        </div>
        <div className="bg-bg-tertiary/60 rounded-xl p-4">
          <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> İtibar
          </div>
          <div className="text-xl font-bold tabular-nums text-accent-cyan">{drone.reputation}</div>
        </div>
      </div>

      <div className="bg-bg-tertiary/60 rounded-xl p-4 flex justify-between items-center">
        <div className="text-text-muted text-xs flex items-center gap-1.5 font-medium uppercase tracking-wider">
          <MapIcon className="w-3.5 h-3.5" /> Koordinatlar
        </div>
        <div className="font-mono font-bold tracking-wide text-sm text-text-primary">
          {drone.lat.toFixed(5)}°N, {drone.lng.toFixed(5)}°E
        </div>
      </div>

      <div className="bg-bg-tertiary/60 rounded-xl p-4">
        <div className="text-text-muted text-xs mb-2 flex items-center gap-1.5 font-medium uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" /> Yapay Zeka Kişiliği
        </div>
        <div className="text-sm font-medium leading-relaxed">{drone.personality}</div>
      </div>

      <div className="flex gap-3 pt-2">
        <Link
          href="/control"
          className="flex-1 btn-primary !py-2.5 text-center text-sm rounded-xl font-semibold shadow-md inline-flex justify-center items-center gap-2"
        >
          <Crosshair className="w-4 h-4" />
          <span>Kontrol Et</span>
        </Link>
        <button className="flex-1 btn-secondary !py-2.5 text-sm rounded-xl font-semibold">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Aktif Görevler</h3>
        <Link href="/marketplace" className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
          Tümü <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {initialMissions.filter((m) => m.status !== "completed" && m.status !== "cancelled").slice(0, 5).map((m) => (
          <div key={m.id} className="bg-bg-tertiary/60 rounded-xl p-4 hover:bg-bg-tertiary transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${typeColor(m.type)}`}>
                  {missionTypeLabels[m.type]}
                </span>
                {m.priority && (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-[#521313] bg-[#2E0A0A] text-[#F87171] flex items-center gap-1 mt-1.5 sm:mt-0">
                    <AlertTriangle className="w-3 h-3" /> Öncelikli
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-accent-cyan tabular-nums ml-2 whitespace-nowrap">{m.payment} MON</span>
            </div>
            <div className="text-sm font-semibold mb-2">{m.title}</div>
            <div className="text-xs text-text-muted mb-3 leading-relaxed">{m.description.slice(0, 50)}...</div>
            <div className="flex items-center justify-end">
              <span className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full border ${
                m.status === "in-progress" ? "bg-[#062E1C] border-[#0A472A] text-[#34D399]" : "bg-[#2E1A05] border-[#4D2D0B] text-[#FBBF24]"
              }`}>
                {missionStatusLabels[m.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FLEET LIST (Accordion) ─── */
function FleetList({
  drones,
  selectedDroneId,
  onSelect,
}: {
  drones: DroneAgent[];
  selectedDroneId: number | null;
  onSelect: (drone: DroneAgent) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-1 py-3 mb-2 text-lg font-bold text-[#EDEDED] uppercase tracking-wide hover:text-white transition-colors"
      >
        <span>FİLO ({drones.length})</span>
        <ChevronDown className={`w-5 h-5 text-[#A1A1AA] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 pt-1 overflow-y-auto max-h-[500px] no-scrollbar">
          {drones.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelect(d)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                selectedDroneId === d.id
                  ? "bg-accent-cyan/10 text-accent-cyan shadow-sm"
                  : "hover:bg-white/5"
              }`}
            >
              <span className={`status-dot shrink-0 ${statusDotClass(d.status)}`} />
              <span className="flex-1 truncate font-medium">{d.name}</span>
              {/* Mini battery bar */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      d.battery < 20 ? "bg-danger" : d.battery < 50 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${d.battery}%` }}
                  />
                </div>
                <span className={`text-[11px] tabular-nums w-7 text-right ${
                  d.battery < 20 ? "text-danger font-bold" : "text-text-muted"
                }`}>
                  {d.battery.toFixed(0)}
                </span>
              </div>
            </button>
          ))}
        </div>
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
    <div className="glass-card p-4 flex items-center justify-between">
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
  const logs = useTerminalLogs(drones);
  const [selectedDroneId, setSelectedDroneId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Canlı drone verisi — her tick'te güncellenir
  const selectedDrone = selectedDroneId
    ? drones.find((d) => d.id === selectedDroneId) ?? null
    : null;

  const handleDroneSelect = useCallback((drone: DroneAgent) => {
    setSelectedDroneId(drone.id);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* ── Left Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-bg-secondary border-r border-border p-5 flex flex-col gap-6 transform transition-transform lg:translate-x-0 overflow-y-auto no-scrollbar ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-sm">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">NeuralAir</span>
          </Link>
          <button className="lg:hidden text-text-muted" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <DashboardNav />

        <WeatherWidget />

        {/* Drone fleet — accordion */}
        <FleetList
          drones={drones}
          selectedDroneId={selectedDroneId}
          onSelect={handleDroneSelect}
        />
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
            <WalletConnect />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          <NetworkStats drones={drones} />

          <div className="grid lg:grid-cols-3 gap-5" style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* Map - Takes 2 cols */}
            <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col" style={{ minHeight: 500 }}>
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
                  selectedDroneId={selectedDroneId ?? undefined}
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
