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
import { useWallet } from "@/lib/web3/WalletContext";

// USER TARGET ESCROW ADDRESS
const TARGET_ADDRESS = "0x67Ac41121F5dC8c0E86Be03028Db5Fd2e3A435Ab";

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
    case "cargo": return "bg-[#18181B] text-[#60A5FA] border-[#27272A]";
    case "agricultural": return "bg-[#18181B] text-[#34D399] border-[#27272A]";
    case "fire": return "bg-[#18181B] text-[#F87171] border-[#27272A]";
    case "traffic": return "bg-[#18181B] text-[#FBBF24] border-[#27272A]";
  }
}

/* ─── CREATE MISSION MODAL ─── */
interface CreateMissionModalProps {
  onClose: () => void;
  onCreate: (mission: Mission) => void;
}

function CreateMissionModal({ onClose, onCreate }: CreateMissionModalProps) {
  const { sendTransaction, balance, isConnected } = useWallet();
  const [step, setStep] = useState(1);
  const [mType, setMType] = useState<MissionType>("cargo");
  const [isAccepted, setIsAccepted] = useState(false);
  const [isTxProcessing, setIsTxProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.1"); // Small default for testing
  const [fromCoord, setFromCoord] = useState("38.4350, 27.1420");
  const [toCoord, setToCoord] = useState("38.4700, 27.2200");
  const [priority, setPriority] = useState(false);

  const types: { type: MissionType; icon: any; desc: string }[] = [
    { type: "cargo", icon: Package, desc: "Paket veya kargo teslimatı" },
    { type: "agricultural", icon: Tractor, desc: "Tarla ilaçlama veya sulama" },
    { type: "fire", icon: Flame, desc: "Yangın tespiti ve müdahale" },
    { type: "traffic", icon: Eye, desc: "Trafik izleme ve analiz" },
  ];

  const handleCreate = async () => {
    if (!isConnected) {
      alert("Lütfen önce Metamask cüzdanınızı bağlayın.");
      return;
    }

    const amount = parseFloat(price) || 0;
    if (amount <= 0) {
      alert("Geçerli bir MON miktarı girin.");
      return;
    }

    setIsTxProcessing(true);
    
    try {
      // 🚨 GERÇEK METAMASK İŞLEMİ (Monad Testnet) 🚨
      // Kullanıcının belirttiği adrese transfer yapılır
      const hash = await sendTransaction(TARGET_ADDRESS, price);
      
      if (hash) {
        setTxHash(hash);
        setIsTxProcessing(false);
        setStep(3);

        const coords = fromCoord.split(",").map(c => parseFloat(c.trim()));
        const toCoords = toCoord.split(",").map(c => parseFloat(c.trim()));
        
        const newMission: Mission = {
          id: Date.now(),
          type: mType,
          title: title || `${missionTypeLabels[mType]} Görevi`,
          description: description || "Aktif operasyonel görev detayı.",
          fromLat: coords[0] || 38.4350,
          fromLng: coords[1] || 27.1420,
          toLat: toCoords[0] || 38.4700,
          toLng: toCoords[1] || 27.2200,
          payment: amount,
          status: "open",
          droneId: null,
          createdAt: new Date(),
          priority,
        };

        onCreate(newMission);

        // 5 saniye sonra ajanın kabul etmesi simülasyonu
        setTimeout(() => {
          setIsAccepted(true);
        }, 5000);
      }
    } catch (err: any) {
      setIsTxProcessing(false);
      alert("Hata: " + (err.message || "İşlem reddedildi."));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div className="glass-card !rounded-2xl w-full max-w-lg p-6 animate-fade-in-up border-accent-cyan/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-cyan" /> Yeni Görev Oluştur
            </h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Hangi operasyon tipini başlatmak istiyorsunuz?</p>
              <div className="grid grid-cols-2 gap-3">
                {types.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => { setMType(t.type); setStep(2); }}
                    className={`p-4 rounded-xl border transition-all text-left hover:scale-[1.02] ${
                      mType === t.type
                        ? "border-accent-cyan bg-accent-cyan/10"
                        : "border-border bg-white/5"
                    }`}
                  >
                    <t.icon className={`w-6 h-6 mb-2 ${mType === t.type ? "text-accent-cyan" : "text-text-secondary"}`} />
                    <div className="font-bold text-sm tracking-tight">{missionTypeLabels[t.type]}</div>
                    <div className="text-[10px] text-text-muted mt-1 leading-tight">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="text-xs text-accent-cyan flex items-center gap-1 hover:underline mb-2">
                <ArrowLeft className="w-3 h-3" /> Geri Dön
              </button>
              
              <div className="space-y-3">
                <div className="bg-[#050505] border border-[#222222] p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-accent-cyan/60 uppercase tracking-widest block mb-2">Escrow Alıcısı (Hazine)</span>
                  <code className="text-[11px] text-[#A1A1AA] break-all">{TARGET_ADDRESS}</code>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">Görev Başlığı / Hedef</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: ALS-BRN-02 Ekspres"
                    className="w-full bg-[#050505] border border-[#222222] rounded-xl px-4 py-2.5 text-sm text-[#EDEDED] focus:border-accent-cyan outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">Ödeme (MON)</label>
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#050505] border border-accent-cyan/40 rounded-xl px-4 py-2.5 text-sm text-accent-cyan font-black"
                      />
                   </div>
                   <div className="flex items-center gap-2 pt-6">
                      <input 
                        type="checkbox" 
                        id="priority" 
                        checked={priority}
                        onChange={(e) => setPriority(e.target.checked)}
                        className="w-4 h-4 accent-accent-cyan" 
                      />
                      <label htmlFor="priority" className="text-xs text-text-secondary cursor-pointer">Acil İşlem</label>
                   </div>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={isTxProcessing}
                className={`w-full !py-4 rounded-xl mt-4 font-black text-sm uppercase tracking-widest transition-all ${
                   isTxProcessing ? "bg-accent-cyan/20 text-accent-cyan/50 cursor-not-allowed" : "btn-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                }`}
              >
                {isTxProcessing ? "Cüzdan Onayı Bekleniyor..." : "Gönder & Görevi Başlat"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-5 animate-fade-in-up">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all duration-700 bg-white/5 border border-white/10`}>
                {isAccepted ? (
                  <Cpu className="w-10 h-10 text-accent-cyan animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
                ) : (
                  <div className="relative">
                     <CheckCircle2 className="w-10 h-10 text-success" />
                     <div className="absolute inset-0 bg-success/20 blur-xl rounded-full" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black italic tracking-tighter uppercase">
                  {isAccepted ? "Ajan Görevi Devraldı" : "İşlem Gönderildi"}
                </h3>
                <p className="text-xs text-text-muted px-8 leading-relaxed">
                  {isAccepted 
                    ? "Bir otonom drone görevi onayladı. Telemetri verisi Sky-Sync kanalına aktarılıyor."
                    : "Transfer Metamask üzerinden doğrulandı. Ağ onayı bekleniyor..."}
                </p>
              </div>
              
              <div className="bg-black border border-white/10 p-4 rounded-xl max-w-[90%] mx-auto space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted uppercase">Hash:</span>
                  <a href={`https://testnet.monadexplorer.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline truncate ml-4">
                    {txHash}
                  </a>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted uppercase">Onay:</span>
                  <span className={isAccepted ? "text-accent-cyan" : "text-success"}>
                    {isAccepted ? "AGENT_SYNCED" : "TX_CONFIRMED"}
                  </span>
                </div>
              </div>

              <button onClick={onClose} className="btn-secondary !py-3 !px-12 text-xs rounded-xl hover:bg-white/10 uppercase tracking-widest font-bold">
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* METAMASK OVERLAY */}
      {isTxProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xl animate-fade-in">
           <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 relative">
                 <div className="absolute inset-0 border-4 border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin" />
                 <div className="absolute inset-4 bg-accent-cyan/10 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-accent-cyan animate-pulse" />
                 </div>
              </div>
              <div className="text-center space-y-1">
                 <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Metamask Onayı Lazım</h2>
                 <p className="text-xs text-text-muted px-10">Lütfen Metamask penceresinden işlemi onaylayın ve imzalayın.</p>
              </div>
           </div>
        </div>
      )}
    </>
  );
}

/* ─── MISSION CARD ─── */
function MissionCard({ mission, onTake }: { mission: Mission; onTake?: (id: number) => void }) {
  const Icon = typeIcon(mission.type);
  const drone = mission.droneId
    ? initialDrones.find((d) => d.id === mission.droneId)
    : null;

  return (
    <div className="glass-card !rounded-xl overflow-hidden group border-white/5 hover:border-accent-cyan/30 transition-all shadow-lg hover:shadow-accent-cyan/5">
      <div className={`h-1 bg-accent-cyan/20 group-hover:bg-accent-cyan transition-colors`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 ${typeBadgeColor(mission.type)}`}>
               <Icon className="w-5 h-5" />
             </div>
             <div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/5 ${typeBadgeColor(mission.type)}`}>
                  {missionTypeLabels[mission.type]}
                </span>
                <div className="text-[9px] text-text-muted font-mono mt-1 opacity-60">
                  {new Date(mission.createdAt).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} :: ID-{mission.id.toString().slice(-4)}
                </div>
             </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-accent-cyan tabular-nums leading-none tracking-tighter">{mission.payment} MON</div>
          </div>
        </div>

        <h3 className="font-bold text-[#EDEDED] text-sm mb-1.5 group-hover:text-accent-cyan transition-colors truncate">
          {mission.title}
        </h3>
        <p className="text-[11px] text-[#A1A1AA] mb-4 line-clamp-2 leading-relaxed opacity-80">{mission.description}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
              mission.status === "in-progress"
                ? "bg-[#34D399]/10 border-[#34D399]/20 text-[#34D399]"
                : "bg-white/5 border-white/10 text-text-muted"
            }`}
          >
            {missionStatusLabels[mission.status]}
          </span>

          {drone ? (
              <span className="text-[10px] font-bold text-accent-cyan flex items-center gap-1.5">
                <Navigation className="w-3 h-3 animate-pulse" /> {drone.name}
              </span>
          ) : (
            <button 
              onClick={() => onTake && onTake(mission.id)} 
              className="text-[10px] font-black uppercase tracking-widest text-[#EDEDED] bg-white/5 hover:bg-accent-cyan hover:text-black px-3 py-1.5 rounded transition-all transition-colors"
            >
              Görevi Al
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
  const { balance, isConnected } = useWallet();

  // Agent simulate update
  useEffect(() => {
    const interval = setInterval(() => {
      setMissions((prev) => {
        const openMissions = prev.filter((m) => m.status === "open");
        if (openMissions.length === 0) return prev;
        const randomMission = openMissions[Math.floor(Math.random() * openMissions.length)];
        const drone = initialDrones[Math.floor(Math.random() * initialDrones.length)];
        return prev.map((m) =>
          m.id === randomMission.id ? { ...m, status: "in-progress", droneId: drone.id } : m
        );
      });
    }, 8000); 
    return () => clearInterval(interval);
  }, []);

  const handleCreateMission = (newM: Mission) => {
    setMissions(prev => [newM, ...prev]);
  };

  const handleTakeMission = (id: number) => {
    setMissions((prev) =>
      prev.map((m) => m.id === id ? { ...m, status: "in-progress", droneId: initialDrones[0].id } : m )
    );
  };

  const filtered = filter === "all" ? missions : missions.filter((m) => m.type === filter);

  const tabs: { key: MissionType | "all"; label: string; icon: any }[] = [
    { key: "all", label: "Tümü", icon: Filter },
    { key: "cargo", label: "Kargo", icon: Package },
    { key: "agricultural", label: "Ziraat", icon: Tractor },
    { key: "fire", label: "Yangın", icon: Flame },
    { key: "traffic", label: "Trafik", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-bg-primary font-sans">
      <header className="border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-text-muted hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-sm font-black italic tracking-tighter uppercase text-[#EDEDED] flex items-center gap-2">
                 <ShoppingCart className="w-4 h-4 text-accent-cyan" /> Görev Pazarı
              </h1>
            </div>
            <div className="flex items-center gap-6">
                {isConnected && (
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[8px] text-text-muted uppercase font-black tracking-widest opacity-60">Monad Balance</span>
                    <span className="text-sm font-black text-accent-cyan tabular-nums tracking-tighter uppercase">{balance || '0.00'} MON</span>
                  </div>
                )}
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-primary !py-2 !px-8 text-xs font-black uppercase tracking-widest rounded transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] shadow-none"
                >
                  Görev Aç
                </button>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-white/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === t.key ? "bg-accent-cyan text-black" : "bg-white/5 text-[#A1A1AA] hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((m) => (
            <MissionCard key={m.id} mission={m} onTake={handleTakeMission} />
          ))}
        </div>
      </div>

      {showCreate && <CreateMissionModal onCreate={handleCreateMission} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
