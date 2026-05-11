"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Zap,
  ArrowLeft,
  ChevronRight,
  Cpu,
  Plus,
  MapPin,
  TrendingUp,
  Battery,
  Clock,
  DollarSign,
  CheckCircle2,
  X,
  ArrowUpRight,
  BarChart3,
  Radio,
  Activity,
  Plane,
} from "lucide-react";
import { initialPods, ChargingPod } from "@/lib/data";

/* ─── LIVE CHARGING SESSION ─── */
interface ChargingSession {
  droneId: number;
  droneName: string;
  podId: number;
  podName: string;
  startTime: Date;
  solEarned: number;
  energyDelivered: number;
  batteryProgress: number;
}

function LiveChargingPanel() {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [totalMicroSol, setTotalMicroSol] = useState(0);
  const [agentLog, setAgentLog] = useState<{ time: string; msg: string; color: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simüle edilmiş şarj oturumları
  useEffect(() => {
    // Başlangıç oturumları: 2 drone şarjda
    const initialSessions: ChargingSession[] = [
      {
        droneId: 1, droneName: "Ege-01", podId: 1, podName: "Alsancak Hub",
        startTime: new Date(), solEarned: 0, energyDelivered: 0, batteryProgress: 23,
      },
    ];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions(initialSessions);

    const now = new Date().toLocaleTimeString("tr-TR");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgentLog([{
      time: now,
      msg: "[ChargingAgent] Ege-01 → Alsancak Hub connection established. Charging started.",
      color: "text-warning"
    }]);
  }, []);

  // Her 2 saniyede bir mikro SOL sayacı + enerji güncelle
  useEffect(() => {
    const iv = setInterval(() => {
      setSessions(prev => prev.map(s => {
        const microSol = 0.000012 + Math.random() * 0.000008;
        const energy = 0.05 + Math.random() * 0.03;
        const batteryGain = 0.8 + Math.random() * 0.4;
        const newBattery = Math.min(100, s.batteryProgress + batteryGain);

        return {
          ...s,
          solEarned: s.solEarned + microSol,
          energyDelivered: s.energyDelivered + energy,
          batteryProgress: newBattery,
        };
      }));
      setTotalMicroSol(prev => prev + 0.000012);
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // Şarj tamamlandığında log yaz
  useEffect(() => {
    sessions.forEach(s => {
      if (s.batteryProgress >= 98 && s.batteryProgress < 99) {
        const now = new Date().toLocaleTimeString("tr-TR");
        setAgentLog(prev => [...prev.slice(-8), {
          time: now,
          msg: `[ChargingAgent] ${s.droneName} charge complete! 100% → Awaiting mission. Pod: ${s.podName} earned: ${s.solEarned.toFixed(6)} SOL`,
          color: "text-success"
        }]);
      }
    });
  }, [sessions]);

  // Her 8 saniyede agent log ekle
  useEffect(() => {
    const iv = setInterval(() => {
      const messages = [
        "[ChargingAgent] Scanning pod statuses... 5/5 online ✓",
        "[ChargingAgent] Energy flow: stable. Voltage: nominal ✓",
        "[ChargingAgent] Micro-SOL payment sent to Solana Devnet",
        "[ChargingAgent] Cell temps in safe range (28-35°C)",
        "[EmergencyAgent] Scanning for critical battery drones... result: none ✓",
        "[FleetAgent] Checking fully charged drones...",
        "[ChargingAgent] Network bandwidth: optimal. Latency: <50ms",
        "[FleetAgent] Synchronizing fleet status for 15 drones...",
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date().toLocaleTimeString("tr-TR");
      setAgentLog(prev => [...prev.slice(-12), { time: now, msg, color: "text-text-secondary" }]);
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  // Dashboard'dan görev tamamlama eventini dinle
  useEffect(() => {
    const handler = ((e: CustomEvent) => {
      const { droneName, missionTitle } = e.detail;
      const now = new Date().toLocaleTimeString("tr-TR");
      setAgentLog(prev => [...prev.slice(-12), {
        time: now,
        msg: `[FleetSync] ✅ ${droneName} → Mission "${missionTitle}" complete. Assigning charging pod...`,
        color: "text-success"
      }]);
      // 3 saniye sonra şarj oturumu başlat
      setTimeout(() => {
        const pods = ["Alsancak Hub", "Bornova-01", "Konak Pod", "Karşıyaka İst.", "Bayraklı Merkez"];
        const podName = pods[Math.floor(Math.random() * pods.length)];
        setSessions(prev => [...prev, {
          droneId: e.detail.droneId,
          droneName,
          podId: Math.floor(Math.random() * 5) + 1,
          podName,
          startTime: new Date(),
          solEarned: 0,
          energyDelivered: 0,
          batteryProgress: 15 + Math.random() * 10,
        }]);
        const nowAfter = new Date().toLocaleTimeString("tr-TR");
        setAgentLog(prev => [...prev.slice(-12), {
          time: nowAfter,
          msg: `[ChargingAgent] ${droneName} → ${podName} connection established. Charging started.`,
          color: "text-warning"
        }]);
      }, 3000);
    }) as EventListener;
    window.addEventListener("mission-complete", handler);
    return () => window.removeEventListener("mission-complete", handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [agentLog]);

  return (
    <div className="space-y-6 mb-8">
      {/* Canlı SOL Sayacı */}
      <div className="glass-card !rounded-xl p-6 border-warning/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            <span className="font-bold text-lg">Live Charging Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-success flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          </div>
        </div>

        {/* Mikro SOL Toplam */}
        <div className="bg-black/40 rounded-xl p-4 mb-4 border border-warning/10">
          <div className="text-xs text-text-muted mb-1 uppercase tracking-wider font-medium">Total Micro-SOL Revenue (This Session)</div>
          <div className="text-3xl font-black text-warning tabular-nums font-mono tracking-tight">
            +{totalMicroSol.toFixed(8)} <span className="text-lg text-text-muted">SOL</span>
          </div>
          <div className="text-[10px] text-text-muted mt-1">Every 2 seconds +0.000012 SOL → Sent to pod owner</div>
        </div>

        {/* Aktif Oturumlar */}
        {sessions.map(s => (
          <div key={`${s.droneId}-${s.podId}`} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{s.droneName} ↔ {s.podName}</div>
                  <div className="text-[10px] text-text-muted">Session start: {s.startTime.toLocaleTimeString("tr-TR")}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-warning tabular-nums">+{s.solEarned.toFixed(6)} SOL</div>
                <div className="text-[10px] text-text-muted">{s.energyDelivered.toFixed(2)} kWh</div>
              </div>
            </div>
            {/* Batarya ilerleme çubuğu */}
            <div className="flex items-center gap-3">
              <Battery className="w-4 h-4 text-text-muted" />
              <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-warning to-success"
                  style={{ width: `${s.batteryProgress}%` }}
                />
              </div>
              <span className={`text-xs font-bold tabular-nums w-10 text-right ${
                s.batteryProgress > 80 ? "text-success" : s.batteryProgress > 50 ? "text-warning" : "text-danger"
              }`}>
                %{s.batteryProgress.toFixed(0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Log Terminal */}
      <div className="glass-card !rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold">ChargingAgent Terminal</span>
          </div>
          <span className="text-xs text-success flex items-center gap-1">
            <Radio className="w-3 h-3" /> LIVE
          </span>
        </div>
        <div ref={scrollRef} className="p-4 max-h-[180px] overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            {agentLog.map((l, i) => (
              <div key={i} className="flex gap-2 text-xs leading-relaxed animate-fade-in-up">
                <span className="text-text-muted shrink-0">[{l.time}]</span>
                <span className={l.color}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── REGISTER POD MODAL ─── */
function RegisterPodModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="glass-card !rounded-2xl w-full max-w-md p-6 animate-fade-in-up text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-bold">Pod Registered!</h3>
          <p className="text-sm text-text-secondary">
            Your charging pod is registered on the blockchain and available for drones.
          </p>
          <div className="bg-white/5 rounded-lg p-3 text-xs font-mono text-text-muted">
            TX: 0xd4e2...f8a1 | Pod NFT #49
          </div>
          <button onClick={onClose} className="btn-secondary !py-2 text-sm rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card !rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Register New Pod</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Pod Name</label>
            <input
              type="text"
              placeholder="e.g. Balcony Charging Station"
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Latitude</label>
              <input
                type="text"
                placeholder="38.4350"
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Longitude</label>
              <input
                type="text"
                placeholder="27.1420"
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Charging Rate (SOL/kWh)</label>
            <input
              type="number"
              placeholder="0.05"
              step="0.01"
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
            />
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="w-full btn-primary !py-3 rounded-xl"
          >
            <span className="flex items-center justify-center gap-2">
              Register Pod On-Chain <Zap className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── POD CARD ─── */
function PodCard({ pod, activeSessions }: { pod: ChargingPod; activeSessions: number }) {
  return (
    <div className="glass-card !rounded-xl overflow-hidden group">
      <div className={`h-1 bg-gradient-to-r ${activeSessions > 0 ? "from-success to-emerald-500 animate-pulse" : "from-yellow-500 to-amber-500"}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
              activeSessions > 0 ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"
            }`}>
              <Zap className={`w-6 h-6 ${activeSessions > 0 ? "text-success animate-pulse" : "text-warning"}`} />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-accent-cyan transition-colors">{pod.name}</h3>
              <div className="text-xs text-text-muted font-mono">{pod.owner}</div>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            activeSessions > 0 ? "bg-success/15 text-success" : pod.available ? "bg-warning/15 text-warning" : "bg-danger/15 text-danger"
          }`}>
            {activeSessions > 0 ? `${activeSessions} Charging` : pod.available ? "Available" : "Busy"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center mt-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Rate</div>
            <div className="text-sm font-bold text-accent-cyan tabular-nums">{pod.rate} SOL</div>
            <div className="text-[10px] text-text-muted">per kWh</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Energy</div>
            <div className="text-sm font-bold text-success tabular-nums">{pod.totalEnergy}</div>
            <div className="text-[10px] text-text-muted">kWh</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Earned</div>
            <div className="text-sm font-bold text-warning tabular-nums">{pod.totalEarned}</div>
            <div className="text-[10px] text-text-muted">SOL</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted mt-3">
          <MapPin className="w-3 h-3" />
          <span className="font-mono">{pod.lat.toFixed(4)}°N, {pod.lng.toFixed(4)}°E</span>
        </div>
      </div>
    </div>
  );
}

/* ─── EARNINGS CHART (simulated) ─── */
function EarningsChart() {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const data = [28.5, 34.2, 31.8, 42.6, 38.9, 52.3, 48.7, 61.4, 55.2, 72.8, 68.5, 84.3];
  const max = Math.max(...data);
  const total = data.reduce((a, b) => a + b, 0);
  const growth = ((data[11] - data[0]) / data[0] * 100).toFixed(0);

  return (
    <div className="glass-card !rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-cyan" />
          Monthly Earnings Chart
        </h3>
        <span className="text-xs text-text-muted">Last 12 months</span>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-6 mb-5 text-sm">
        <div>
          <span className="text-text-muted text-xs">Total: </span>
          <span className="font-bold text-accent-cyan tabular-nums">{total.toFixed(1)} SOL</span>
        </div>
        <div>
          <span className="text-text-muted text-xs">Growth: </span>
          <span className="font-bold text-success tabular-nums">+{growth}%</span>
        </div>
        <div>
          <span className="text-text-muted text-xs">Avg: </span>
          <span className="font-bold tabular-nums">{(total / 12).toFixed(1)} SOL</span>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-52">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            {/* Value on hover */}
            <span className="text-[10px] font-bold text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
              {d.toFixed(0)}
            </span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-blue-500/70 to-indigo-500/70 transition-all duration-500 group-hover:from-blue-500 group-hover:to-indigo-500 cursor-pointer relative"
              style={{ height: `${(d / max) * 100}%`, minHeight: 8 }}
            />
            <span className="text-[10px] text-text-muted font-medium">
              {months[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ SKY-CHARGE PAGE ═══════ */
export default function SkyChargePage() {
  const [showRegister, setShowRegister] = useState(false);

  const totalEnergy = initialPods.reduce((a, p) => a + p.totalEnergy, 0);
  const totalEarned = initialPods.reduce((a, p) => a + p.totalEarned, 0);
  const activePods = initialPods.filter((p) => p.available).length;

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
                  <Zap className="w-4 h-4 text-warning" />
                  Sky-Charge DePIN
                </span>
              </div>
            </div>
            <button onClick={() => setShowRegister(true)} className="btn-primary !py-2 !px-4 text-sm rounded-lg">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Register Pod
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: "Total Pods", value: initialPods.length, color: "text-warning" },
            { icon: Battery, label: "Available", value: activePods, color: "text-success" },
            { icon: TrendingUp, label: "Total Energy", value: `${totalEnergy.toLocaleString()} kWh`, color: "text-accent-cyan" },
            { icon: DollarSign, label: "Total Earned", value: `${totalEarned.toFixed(1)} SOL`, color: "text-accent-violet" },
          ].map((s) => (
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

        {/* LIVE Charging Sessions + Agent Terminal */}
        <LiveChargingPanel />

        {/* Earnings Chart */}
        <div className="mb-8">
          <EarningsChart />
        </div>

        {/* Pods Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Registered Charging Pods</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPods.map((p) => (
              <PodCard key={p.id} pod={p} activeSessions={p.id === 1 ? 1 : 0} />
            ))}
          </div>
        </div>
      </div>

      {showRegister && <RegisterPodModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
