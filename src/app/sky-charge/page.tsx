"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { initialPods, ChargingPod } from "@/lib/data";

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
          <h3 className="text-lg font-bold">Pod Kaydedildi!</h3>
          <p className="text-sm text-text-secondary">
            Şarj podunuz blokzincire kaydedildi ve artık drone&apos;lar tarafından kullanılabilir.
          </p>
          <div className="bg-white/5 rounded-lg p-3 text-xs font-mono text-text-muted">
            TX: 0xd4e2...f8a1 | Pod NFT #49
          </div>
          <button onClick={onClose} className="btn-secondary !py-2 text-sm rounded-lg">
            Kapat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card !rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Yeni Pod Kaydet</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Pod Adı</label>
            <input
              type="text"
              placeholder="Örn: Balkon Şarj İstasyonu"
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Enlem (Lat)</label>
              <input
                type="text"
                placeholder="38.4350"
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Boylam (Lng)</label>
              <input
                type="text"
                placeholder="27.1420"
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Şarj Ücreti (MON/kWh)</label>
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
              Pod'u Zincire Kaydet <Zap className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── POD CARD ─── */
function PodCard({ pod }: { pod: ChargingPod }) {
  return (
    <div className="glass-card !rounded-xl overflow-hidden group">
      <div className="h-1 bg-gradient-to-r from-yellow-500 to-amber-500" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-accent-cyan transition-colors">{pod.name}</h3>
              <div className="text-xs text-text-muted font-mono">{pod.owner}</div>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${pod.available ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
            {pod.available ? "Müsait" : "Dolu"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center mt-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Ücret</div>
            <div className="text-sm font-bold text-accent-cyan tabular-nums">{pod.rate} MON</div>
            <div className="text-[10px] text-text-muted">per kWh</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Enerji</div>
            <div className="text-sm font-bold text-success tabular-nums">{pod.totalEnergy}</div>
            <div className="text-[10px] text-text-muted">kWh</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Kazanç</div>
            <div className="text-sm font-bold text-warning tabular-nums">{pod.totalEarned}</div>
            <div className="text-[10px] text-text-muted">MON</div>
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
  const months = ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara", "Oca", "Şub", "Mar"];
  const data = [28.5, 34.2, 31.8, 42.6, 38.9, 52.3, 48.7, 61.4, 55.2, 72.8, 68.5, 84.3];
  const max = Math.max(...data);
  const total = data.reduce((a, b) => a + b, 0);
  const growth = ((data[11] - data[0]) / data[0] * 100).toFixed(0);

  return (
    <div className="glass-card !rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-cyan" />
          Aylık Kazanç Grafiği
        </h3>
        <span className="text-xs text-text-muted">Son 12 ay</span>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-6 mb-5 text-sm">
        <div>
          <span className="text-text-muted text-xs">Toplam: </span>
          <span className="font-bold text-accent-cyan tabular-nums">{total.toFixed(1)} MON</span>
        </div>
        <div>
          <span className="text-text-muted text-xs">Büyüme: </span>
          <span className="font-bold text-success tabular-nums">+{growth}%</span>
        </div>
        <div>
          <span className="text-text-muted text-xs">Ort: </span>
          <span className="font-bold tabular-nums">{(total / 12).toFixed(1)} MON</span>
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
                <Plus className="w-4 h-4" /> Pod Kaydet
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: "Toplam Pod", value: initialPods.length, color: "text-warning" },
            { icon: Battery, label: "Müsait", value: activePods, color: "text-success" },
            { icon: TrendingUp, label: "Toplam Enerji", value: `${totalEnergy.toLocaleString()} kWh`, color: "text-accent-cyan" },
            { icon: DollarSign, label: "Toplam Kazanç", value: `${totalEarned.toFixed(1)} MON`, color: "text-accent-violet" },
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

        {/* Earnings Chart */}
        <div className="mb-8">
          <EarningsChart />
        </div>

        {/* Pods Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Kayıtlı Şarj Podları</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPods.map((p) => (
              <PodCard key={p.id} pod={p} />
            ))}
          </div>
        </div>
      </div>

      {showRegister && <RegisterPodModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
