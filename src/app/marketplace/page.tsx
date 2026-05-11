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
  Radio,
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
import { pickRandomMission, generateInitialOpenMissions } from "@/lib/missions";
import { logMissionToSupabase, logAgentDecisionToSupabase } from "@/lib/supabase";
import { useWallet } from "@/lib/web3/WalletContext";
import { useDroneFleet } from "@/lib/DroneFleetContext";
import dynamic from "next/dynamic";

const AreaSelectMap = dynamic(() => import("@/components/AreaSelectMap"), { ssr: false });

// USER TARGET ESCROW ADDRESS
const TARGET_ADDRESS = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

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
    { type: "cargo", icon: Package, desc: "Package or cargo delivery" },
    { type: "agricultural", icon: Tractor, desc: "Field spraying or irrigation" },
    { type: "fire", icon: Flame, desc: "Fire detection and response" },
    { type: "traffic", icon: Eye, desc: "Traffic monitoring and analysis" },
  ];

  const handleCreate = async () => {
    if (!isConnected) {
      alert("Please connect your Phantom wallet first.");
      return;
    }

    const amount = parseFloat(price) || 0;
    if (amount <= 0) {
      alert("Please enter a valid SOL amount.");
      return;
    }

    setIsTxProcessing(true);
    
    try {
      // 🚨 GERÇEK PHANTOM İŞLEMİ (Solana Devnet) 🚨
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
          title: title || `${missionTypeLabels("en")[mType]} ${"Mission"}`,
          description: description || ("Active operational mission details."),
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
      alert(("Error: ") + (err.message || ("Transaction rejected.")));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div className="glass-card !rounded-2xl w-full max-w-lg p-6 animate-fade-in-up border-accent-cyan/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-cyan" /> {"Create New Mission"}
            </h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">{"Which operation type do you want to start?"}</p>
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
                    <div className="font-bold text-sm tracking-tight">{missionTypeLabels("en")[t.type]}</div>
                    <div className="text-[10px] text-text-muted mt-1 leading-tight">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
              <button onClick={() => setStep(1)} className="text-xs text-accent-cyan flex items-center gap-1 hover:underline mb-2">
                <ArrowLeft className="w-3 h-3" /> {"Go Back"}
              </button>
              
              <div className="space-y-3">
                {/* Escrow Bilgisi */}
                <div className="bg-[#050505] border border-[#222222] p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-accent-cyan/60 uppercase tracking-widest block mb-1">{"Mission Payment Address (Devnet)"}</span>
                  <code className="text-[10px] text-[#A1A1AA] break-all">{TARGET_ADDRESS}</code>
                </div>

                {/* Görev Başlığı */}
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">{"Mission Title"}</label>
                  <input
                    type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder={mType === "cargo" ? "e.g. Express Delivery" : mType === "agricultural" ? "e.g. Farm Spraying" : mType === "fire" ? "e.g. Fire Scanning" : "e.g. Highway Monitoring"}
                    className="w-full bg-[#050505] border border-[#222222] rounded-xl px-4 py-2.5 text-sm text-[#EDEDED] focus:border-accent-cyan outline-none"
                  />
                </div>

                {/* ═══ KARGO SPESİFİK ALANLARI ═══ */}
                {mType === "cargo" && (
                  <div className="space-y-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="text-[10px] font-bold text-[#60A5FA] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Package className="w-3 h-3" /> {"Cargo Details"}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Pickup Coordinates"}</label>
                        <input type="text" value={fromCoord} onChange={(e) => setFromCoord(e.target.value)}
                          placeholder="38.4350, 27.1420" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Delivery Coordinates"}</label>
                        <input type="text" value={toCoord} onChange={(e) => setToCoord(e.target.value)}
                          placeholder="38.4700, 27.2200" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Weight (grams)"}</label>
                        <input type="number" placeholder="2100" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Fragile"}</label>
                        <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                          <option value="no">{"No"}</option>
                          <option value="yes">{"Yes"}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Delivery Speed"}</label>
                        <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                          <option value="normal">{"Normal"}</option>
                          <option value="express">{"Express"}</option>
                          <option value="economy">{"Economy"}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ ZİRAAT SPESİFİK ALANLARI ═══ */}
                {mType === "agricultural" && (
                  <div className="space-y-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Tractor className="w-3 h-3" /> {"Agriculture Op Details"}
                    </div>

                    {/* ═══ HARİTA ALAN SEÇİMİ ═══ */}
                    <AreaSelectMap
                      onAreaSelect={(bounds) => {
                        setFromCoord(`${bounds.nw[1].toFixed(4)}, ${bounds.nw[0].toFixed(4)}`);
                        setToCoord(`${bounds.se[1].toFixed(4)}, ${bounds.se[0].toFixed(4)}`);
                      }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Operation Type"}</label>
                        <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                          <option value="spraying">{"Spraying"}</option>
                          <option value="irrigation">{"Irrigation"}</option>
                          <option value="fertilizing">{"Fertilizing"}</option>
                          <option value="mapping">{"Mapping"}</option>
                          <option value="seeding">{"Seeding"}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Chemical / Fertilizer Type"}</label>
                        <input type="text" placeholder="Kükürt bazlı" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Flight Altitude (m)"}</label>
                        <input type="number" placeholder="15" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Max Speed (km/h)"}</label>
                        <input type="number" placeholder="25" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Wind Tolerance"}</label>
                        <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                          <option value="low">{"Low (<15km/h)"}</option>
                          <option value="medium">{"Medium (<30km/h)"}</option>
                          <option value="high">{"High (<45km/h)"}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ YANGIN SPESİFİK ALANLARI ═══ */}
                {mType === "fire" && (
                  <div className="space-y-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="text-[10px] font-bold text-[#F87171] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Flame className="w-3 h-3" /> {"Emergency Operation"}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Zone Coordinate"}</label>
                        <input type="text" value={fromCoord} onChange={(e) => setFromCoord(e.target.value)}
                          placeholder="38.5200, 27.1000" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Scan Radius (m)"}</label>
                        <input type="number" placeholder="500" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Sensor Type"}</label>
                        <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                          <option value="thermal">{"Thermal Camera"}</option>
                          <option value="zoom">{"Zoom Camera"}</option>
                          <option value="multispectral">{"Multispectral"}</option>
                          <option value="normal">{"Normal Camera"}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Coordination Unit"}</label>
                        <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                          <option value="fire">{"Fire Dept"}</option>
                          <option value="forest">{"Forest Dept"}</option>
                          <option value="civil">{"Civil Defense"}</option>
                          <option value="coast">{"Coast Guard"}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">{"Priority Level"}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: "critical", label: "🔴 Critical", color: "border-red-500/50 bg-red-500/10 text-red-400" },
                          { val: "high", label: "🟠 High", color: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
                          { val: "normal", label: "🟢 Normal", color: "border-green-500/50 bg-green-500/10 text-green-400" },
                        ].map(p => (
                          <button key={p.val} type="button" onClick={() => setPriority(p.val === "critical")}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${priority && p.val === "critical" ? p.color : !priority && p.val === "normal" ? p.color : "border-[#222] bg-[#050505] text-text-muted"}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══ TRAFİK SPESİFİK ALANLARI ═══ */}
                {mType === "traffic" && (
                  <div className="space-y-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Eye className="w-3 h-3" /> {"Surveillance Params"}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Monitor Zone"}</label>
                        <input type="text" value={fromCoord} onChange={(e) => setFromCoord(e.target.value)}
                          placeholder="38.4100, 27.1200" className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1">{"Monitor Duration (hrs)"}</label>
                        <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                          <option value="1">1 {"hr"}</option>
                          <option value="2">2 {"hrs"}</option>
                          <option value="4">4 {"hrs"}</option>
                          <option value="8">8 {"hrs (full day)"}</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="plate" className="w-3.5 h-3.5 accent-accent-cyan" />
                        <label htmlFor="plate" className="text-xs text-text-secondary cursor-pointer">{"Plate Reading"}</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="livestream" className="w-3.5 h-3.5 accent-accent-cyan" />
                        <label htmlFor="livestream" className="text-xs text-text-secondary cursor-pointer">{"Live Stream"}</label>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">{"Reporting Frequency"}</label>
                      <select className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-accent-cyan outline-none">
                        <option value="5">{"Every 5 mins"}</option>
                        <option value="15">{"Every 15 mins"}</option>
                        <option value="30">{"Every 30 mins"}</option>
                        <option value="60">{"Hourly"}</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ═══ ÖDEME ═══ */}
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">{"Payment (SOL)"}</label>
                      <input
                        type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#050505] border border-accent-cyan/40 rounded-xl px-4 py-2.5 text-sm text-accent-cyan font-black"
                      />
                   </div>
                   <div className="flex items-center gap-2 pt-6">
                      <input 
                        type="checkbox" id="priority-main" checked={priority}
                        onChange={(e) => setPriority(e.target.checked)}
                        className="w-4 h-4 accent-accent-cyan" 
                      />
                      <label htmlFor="priority-main" className="text-xs text-text-secondary cursor-pointer">{"Priority Action"}</label>
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
                {isTxProcessing ? ("Waiting Wallet Approval...") : ("Send & Start Mission")}
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
                  {isAccepted ? ("Agent Took Mission") : ("Transaction Sent")}
                </h3>
                <p className="text-xs text-text-muted px-8 leading-relaxed">
                  {isAccepted 
                    ? ("An autonomous drone approved the mission. Telemetry data is streamed to Sky-Sync.")
                    : ("Transaction simulated. DEMO TX - No real transfer occurred.")}
                </p>
              </div>
              
              <div className="bg-black border border-white/10 p-4 rounded-xl max-w-[90%] mx-auto space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted uppercase">{"Hash:"}</span>
                  <a href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline truncate ml-4">
                    {txHash}
                  </a>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted uppercase">{"Confirm:"}</span>
                  <span className={isAccepted ? "text-accent-cyan" : "text-success"}>
                    {isAccepted ? "AGENT_SYNCED" : "TX_CONFIRMED"}
                  </span>
                </div>
              </div>

              <button onClick={onClose} className="btn-secondary !py-3 !px-12 text-xs rounded-xl hover:bg-white/10 uppercase tracking-widest font-bold">
                {"Close"}
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
                 <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Phantom Onayı Lazım</h2>
                 <p className="text-xs text-text-muted px-10">Lütfen Phantom cüzdanınızdan işlemi onaylayın ve imzalayın.</p>
              </div>
           </div>
        </div>
      )}
    </>
  );
}

/* ─── MISSION CARD ─── */
function MissionCard({ mission, onTake, liveDrones }: { mission: Mission; onTake?: (id: number) => void; liveDrones?: typeof initialDrones }) {
  const MissionIcon = typeIcon(mission.type);
  const dronePool = liveDrones || initialDrones;
  const drone = mission.droneId
    ? dronePool.find((d) => d.id === mission.droneId)
    : null;

  return (
    <div className="glass-card !rounded-xl overflow-hidden group border-white/5 hover:border-accent-cyan/30 transition-all shadow-lg hover:shadow-accent-cyan/5">
      <div className={`h-1 bg-accent-cyan/20 group-hover:bg-accent-cyan transition-colors`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 ${typeBadgeColor(mission.type)}`}>
               <MissionIcon className="w-5 h-5" />
             </div>
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/5 ${typeBadgeColor(mission.type)}`}>
                  {missionTypeLabels("en")[mission.type]}
                </span>
                <div className="text-[9px] text-text-muted font-mono mt-1 opacity-60">
                  {new Date(mission.createdAt).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} :: ID-{mission.id.toString().slice(-4)}
                </div>
             </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-accent-cyan tabular-nums leading-none tracking-tighter">{mission.payment} SOL</div>
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
            {missionStatusLabels("en")[mission.status]}
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
              Take Mission
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
  const [missions, setMissions] = useState<Mission[]>(() => generateInitialOpenMissions());
  const { balance, isConnected } = useWallet();
  const { drones: liveDrones } = useDroneFleet();

  // Agent Decision Log
  const [agentLog, setAgentLog] = useState<{ time: string; msg: string }[]>([]);

  // Dinamik Görev Döngüsü
  useEffect(() => {
    // İlk görevleri yükle
    // setMissions(generateInitialOpenMissions());

    const interval = setInterval(() => {
      setMissions((prev) => {
        let newMissions = [...prev];
        const now = new Date().toLocaleTimeString("tr-TR");

        // Rastgele bir olay tetikle (0: Yeni görev, 1: Görev Tamamla, 2: Görev Ata)
        const eventType = Math.floor(Math.random() * 3);

        if (eventType === 0 && newMissions.length < 12) {
          // Yeni Görev Ekle
          const newMission = pickRandomMission();
          newMissions = [newMission, ...newMissions];
          setAgentLog(l => [...l.slice(-6), { time: now, msg: `[DataBroker] New mission added to pool: "${newMission.title}"` }]);
        } 
        else if (eventType === 1) {
          // Devam eden rastgele bir görevi tamamla
          const inProgress = newMissions.filter(m => m.status === "in-progress");
          if (inProgress.length > 0) {
            const m = inProgress[Math.floor(Math.random() * inProgress.length)];
            newMissions = newMissions.map(x => x.id === m.id ? { ...x, status: "completed" } : x);
            setAgentLog(l => [...l.slice(-6), { time: now, msg: `[FleetAgent] Mission successfully completed: "${m.title}" ✓` }]);
          }
        } 
        else {
          // Açık görevi en uygun drone'a ata
          const openMissions = newMissions.filter((m) => m.status === "open");
          if (openMissions.length > 0) {
            const randomMission = openMissions[Math.floor(Math.random() * openMissions.length)];
            
            // Tip uyumlu drone bul
            const candidates = liveDrones.filter(d => 
              d.battery > 20 && 
              ((d.type === "cargo" && randomMission.type === "cargo") ||
               (d.type === "emergency" && randomMission.type === "fire") ||
               (d.type === "agricultural" && randomMission.type === "agricultural") ||
               (d.type === "surveillance" && randomMission.type === "traffic"))
            );
            
            const bestDrone = candidates.length > 0 
              ? candidates[Math.floor(Math.random() * candidates.length)]
              : liveDrones[Math.floor(Math.random() * liveDrones.length)];

            newMissions = newMissions.map(x => x.id === randomMission.id ? { ...x, status: "in-progress", droneId: bestDrone.id } : x);
            setAgentLog(l => [...l.slice(-6), { time: now, msg: `[FleetAgent] "${randomMission.title}" → assigned to ${bestDrone.name} (Type: ${bestDrone.type})` }]);
          }
        }

        // Listeyi çok uzatmamak için eski tamamlananları temizle (Max 15 görev)
        if (newMissions.length > 15) {
           newMissions = newMissions.filter(m => m.status !== "completed").slice(0, 15);
        }

        return newMissions;
      });
    }, 4500); // Her 4.5 saniyede bir aksiyon

    return () => clearInterval(interval);
  }, []);

  const handleCreateMission = (newM: Mission) => {
    setMissions(prev => [newM, ...prev]);
    const now = new Date().toLocaleTimeString("tr-TR");
    setAgentLog(prev => [...prev.slice(-6), {
      time: now,
      msg: `[UserAgent] New mission created: "${newM.title}" — ${newM.payment} SOL`
    }]);

    // Supabase Offline-Safe Logging
    logMissionToSupabase({
      type: newM.type,
      title: newM.title,
      description: newM.description,
      from_lat: newM.fromLat,
      from_lng: newM.fromLng,
      to_lat: newM.toLat,
      to_lng: newM.toLng,
      payment: newM.payment,
      status: "open",
      drone_id: null,
      posted_by: "User",
      solana_tx: null
    }).catch(console.error);
  };

  const handleTakeMission = (id: number) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;

    // Find the best available drone from live fleet
    const best = liveDrones
      .filter(d => d.battery > 25)
      .sort((a, b) => b.battery - a.battery)[0];

    setMissions((prev) =>
      prev.map((m) => m.id === id ? { ...m, status: "in-progress" as const, droneId: best?.id || liveDrones[0].id } : m)
    );

    const now = new Date().toLocaleTimeString("tr-TR");
    setAgentLog(prev => [...prev.slice(-6), {
      time: now,
      msg: `[FleetAgent] Manual assignment: "${mission.title}" → ${best?.name || liveDrones[0].name} (user confirmed) ✓`
    }]);
  };

  const filtered = filter === "all" ? missions : missions.filter((m) => m.type === filter);

  const tabs: { key: MissionType | "all"; label: string; icon: any }[] = [
    { key: "all", label: "All", icon: Filter },
    { key: "cargo", label: "Cargo", icon: Package },
    { key: "agricultural", label: "Agriculture", icon: Tractor },
    { key: "fire", label: "Fire", icon: Flame },
    { key: "traffic", label: "Traffic", icon: Eye },
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
                 <ShoppingCart className="w-4 h-4 text-accent-cyan" /> {"Mission Marketplace"}
              </h1>
            </div>
            <div className="flex items-center gap-6">
                {isConnected && (
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[8px] text-text-muted uppercase font-black tracking-widest opacity-60">SOL Balance</span>
                    <span className="text-sm font-black text-accent-cyan tabular-nums tracking-tighter uppercase">{balance || '0.0000'}</span>
                  </div>
                )}
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-primary !py-2 !px-8 text-xs font-black uppercase tracking-widest rounded transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] shadow-none"
                >
                  {"Create Mission"}
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
            <MissionCard key={m.id} mission={m} onTake={handleTakeMission} liveDrones={liveDrones} />
          ))}
        </div>

        {/* Agent Decision Terminal */}
        {agentLog.length > 0 && (
          <div className="mt-8 glass-card !rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent-cyan" />
                <span className="text-xs font-black uppercase tracking-widest text-[#EDEDED]">{"Agent Decision Log"}</span>
              </div>
              <span className="text-[10px] text-success flex items-center gap-1">
                <span className="status-dot status-active" /> {"LIVE"}
              </span>
            </div>
            <div className="p-4 space-y-2">
              {agentLog.map((entry, i) => (
                <div key={i} className="flex gap-2 text-xs leading-relaxed animate-fade-in-up">
                  <span className="text-text-muted shrink-0">[{entry.time}]</span>
                  <span className="text-text-secondary">{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateMissionModal onCreate={handleCreateMission} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
