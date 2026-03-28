"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Flame,
  Tractor,
  Eye,
  AlertTriangle,
  Filter,
  Plus,
  ArrowLeft,
  Clock,
  MapPin,
  Cpu,
  X,
  ChevronRight,
  Zap,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import {
  initialMissions,
  initialDrones,
  Mission,
  MissionType,
  missionTypeLabels,
  missionStatusLabels,
  droneTypeLabels,
} from "@/lib/data";

function typeIcon(t: MissionType) {
  switch (t) {
    case "cargo": return Package;
    case "agricultural": return Tractor;
    case "fire": return Flame;
    case "traffic": return Eye;
  }
}

function typeGradient(t: MissionType) {
  switch (t) {
    case "cargo": return "from-[#18181B] to-[#60A5FA]";
    case "agricultural": return "from-[#18181B] to-[#34D399]";
    case "fire": return "from-[#18181B] to-[#F87171]";
    case "traffic": return "from-[#18181B] to-[#FBBF24]";
  }
}

function typeBadgeColor(t: MissionType) {
  switch (t) {
    case "cargo": return "bg-[#18181B] text-[#60A5FA] border-[#27272A]";
    case "agricultural": return "bg-[#18181B] text-[#34D399] border-[#27272A]";
    case "fire": return "bg-[#18181B] text-[#F87171] border-[#27272A]";
    case "traffic": return "bg-[#18181B] text-[#FBBF24] border-[#27272A]";
  }
}

/* ─── CREATE MISSION MODAL ─── */
function CreateMissionModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [mType, setMType] = useState<MissionType>("cargo");

  const types: { type: MissionType; icon: any; desc: string }[] = [
    { type: "cargo", icon: Package, desc: "Paket veya kargo teslimatı" },
    { type: "agricultural", icon: Tractor, desc: "Tarla ilaçlama veya sulama" },
    { type: "fire", icon: Flame, desc: "Yangın tespiti ve müdahale" },
    { type: "traffic", icon: Eye, desc: "Trafik izleme ve analiz" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card !rounded-2xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Yeni Görev Oluştur</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Görev tipini seçin:</p>
            <div className="grid grid-cols-2 gap-3">
              {types.map((t) => (
                <button
                  key={t.type}
                  onClick={() => { setMType(t.type); setStep(2); }}
                  className={`p-4 rounded-xl border transition-all text-left hover:scale-[1.02] ${
                    mType === t.type
                      ? "border-accent-cyan bg-accent-cyan/10"
                      : "border-border bg-white/5 hover:border-border"
                  }`}
                >
                  <t.icon className={`w-6 h-6 mb-2 ${mType === t.type ? "text-accent-cyan" : "text-text-secondary"}`} />
                  <div className="font-medium text-sm">{missionTypeLabels[t.type]}</div>
                  <div className="text-xs text-text-muted mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <button onClick={() => setStep(1)} className="text-xs text-accent-cyan flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Geri
            </button>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1.5 ml-1">Görev Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Alsancak → Bornova Paket"
                  className="w-full bg-[#111111] border border-[#27272A] hover:border-[#3F3F46] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#EDEDED] transition-all text-[#EDEDED] placeholder-[#71717A]"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1.5 ml-1">Açıklama</label>
                <textarea
                  placeholder="Görev detaylarını yazın..."
                  rows={3}
                  className="w-full bg-[#111111] border border-[#27272A] hover:border-[#3F3F46] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#EDEDED] transition-all resize-none text-[#EDEDED] placeholder-[#71717A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1.5 ml-1">Başlangıç Koordinatı</label>
                  <input
                    type="text"
                    placeholder="38.4350, 27.1420"
                    className="w-full bg-[#111111] border border-[#27272A] hover:border-[#3F3F46] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#EDEDED] transition-all text-[#EDEDED] placeholder-[#71717A]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] block mb-1.5 ml-1">Varış Koordinatı</label>
                  <input
                    type="text"
                    placeholder="38.4700, 27.2200"
                    className="w-full bg-[#111111] border border-[#27272A] hover:border-[#3F3F46] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#EDEDED] transition-all text-[#EDEDED] placeholder-[#71717A]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1.5 ml-1">Ödeme (MON)</label>
                <input
                  type="number"
                  placeholder="2.5"
                  className="w-full bg-[#111111] border border-[#27272A] hover:border-[#3F3F46] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#EDEDED] transition-all text-[#EDEDED] placeholder-[#71717A]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="priority" className="accent-accent-cyan" />
                <label htmlFor="priority" className="text-sm text-text-secondary">
                  Öncelikli Görev (Acil)
                </label>
              </div>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full btn-primary !py-3 rounded-xl mt-4"
            >
              <span className="flex items-center justify-center gap-2">
                Görev Oluştur & Escrow Kilitle
                <Zap className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8 space-y-4 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-bold">Görev Oluşturuldu!</h3>
            <p className="text-sm text-text-secondary">
              Escrow ödemeniz kilitlendi. Drone ataması bekleniyor...
            </p>
            <div className="bg-white/5 rounded-lg p-3 text-xs font-mono text-text-muted">
              TX: 0x7f2a...c3d1 | Blok: #4,521,879
            </div>
            <button onClick={onClose} className="btn-secondary !py-2.5 text-sm rounded-lg">
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MISSION CARD ─── */
function MissionCard({ mission, onTake }: { mission: Mission; onTake?: (id: number) => void }) {
  const Icon = typeIcon(mission.type);
  const drone = mission.droneId
    ? initialDrones.find((d) => d.id === mission.droneId)
    : null;

  return (
    <div className="glass-card !rounded-xl overflow-hidden group">
      {/* Gradient top */}
      <div className={`h-1 bg-gradient-to-r ${typeGradient(mission.type)}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${typeBadgeColor(mission.type)}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${typeBadgeColor(mission.type)}`}>
                {missionTypeLabels[mission.type]}
              </span>
              {mission.priority && (
                <span className="text-xs px-2.5 py-1 mt-1.5 rounded-full border border-[#521313] bg-[#2E0A0A] text-[#F87171] inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Öncelikli
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-accent-cyan tabular-nums">{mission.payment}</div>
            <div className="text-xs text-text-muted">MON</div>
          </div>
        </div>

        <h3 className="font-semibold mb-1 group-hover:text-accent-cyan transition-colors">
          {mission.title}
        </h3>
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">{mission.description}</p>

        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <MapPin className="w-3 h-3" />
          <span className="font-mono">
            {mission.fromLat.toFixed(2)}°N → {mission.toLat.toFixed(2)}°N
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full border ${
              mission.status === "in-progress"
                ? "bg-[#062E1C] border-[#0A472A] text-[#34D399]"
                : mission.status === "open"
                ? "bg-[#2E1A05] border-[#4D2D0B] text-[#FBBF24]"
                : "bg-white/5 border-white/10 text-text-muted"
            }`}
          >
            {missionStatusLabels[mission.status]}
          </span>

          {drone ? (
            <span className="text-xs text-[#60A5FA] flex items-center gap-1">
              <Navigation className="w-3 h-3" /> {drone.name}
            </span>
          ) : (
            <button onClick={() => onTake && onTake(mission.id)} className="text-xs btn-primary !py-1.5 !px-3 rounded-lg hover:scale-105">
              <span>Görevi Al</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════ MARKETPLACE PAGE ═══════ */
export default function MarketplacePage() {
  const [filter, setFilter] = useState<MissionType | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(initialMissions);

  // Otomatik görev alma simulasyonu (Agent Simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setMissions((prev) => {
        const openMissions = prev.filter((m) => m.status === "open");
        if (openMissions.length === 0) return prev;
        
        // Rastgele bir açık görevi al
        const randomMission = openMissions[Math.floor(Math.random() * openMissions.length)];
        const droneId = initialDrones[Math.floor(Math.random() * initialDrones.length)].id;
        
        return prev.map((m) =>
          m.id === randomMission.id
            ? { ...m, status: "in-progress", droneId }
            : m
        );
      });
    }, 12000); // 12 saniyede bir otonom drone görev alır

    return () => clearInterval(interval);
  }, []);

  const handleTakeMission = (id: number) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: "in-progress", droneId: initialDrones[Math.floor(Math.random() * initialDrones.length)].id }
          : m
      )
    );
    
    // Simüle edilmiş görev tamamlanması
    setTimeout(() => {
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "completed" } : m))
      );
    }, 8000);
  };

  const filtered =
    filter === "all"
      ? missions.filter(m => m.status !== "completed")
      : missions.filter((m) => m.type === filter && m.status !== "completed");

  const tabs: { key: MissionType | "all"; label: string; icon: any }[] = [
    { key: "all", label: "Tümü", icon: Filter },
    { key: "cargo", label: "Kargo", icon: Package },
    { key: "agricultural", label: "Ziraat", icon: Tractor },
    { key: "fire", label: "Yangın", icon: Flame },
    { key: "traffic", label: "Trafik", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-text-muted hover:text-accent-cyan transition-colors">
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
                  <ShoppingCart className="w-4 h-4 text-accent-cyan" />
                  Görev Pazarı
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary !py-2 !px-4 text-sm rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Görev Oluştur
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Açık Görevler", value: missions.filter((m) => m.status === "open").length, color: "text-[#FBBF24]" },
            { label: "Aktif Görevler", value: missions.filter((m) => m.status === "in-progress").length, color: "text-[#34D399]" },
            { label: "Toplam Ödeme", value: `${missions.reduce((a, m) => a + m.payment, 0).toFixed(1)} MON`, color: "text-[#60A5FA]" },
            { label: "Tamamlanan", value: missions.filter(m => m.status === "completed").length, color: "text-[#A78BFA]" },
          ].map((s) => (
            <div key={s.label} className="glass-card !rounded-xl p-4">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === t.key
                  ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                  : "bg-white/5 text-text-secondary border border-transparent hover:bg-white/10"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <MissionCard key={m.id} mission={m} onTake={handleTakeMission} />
          ))}
        </div>
      </div>

      {showCreate && <CreateMissionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
