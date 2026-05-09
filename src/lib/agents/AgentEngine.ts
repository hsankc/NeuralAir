"use client";

// ── Agent Engine ──────────────────────────────────────────────
// Tüm AI agent'ları başlatan/durduran merkezi kontrol sistemi.
// Sayfa açıldığında Dashboard'dan çağrılır.

import { UserAgent } from "./UserAgent";
import { FleetAgent } from "./FleetAgent";
import { EmergencyAgent } from "./EmergencyAgent";
import { ChargingAgent } from "./ChargingAgent";
import type { DroneAgent } from "@/lib/data";

export type AgentLog = {
  id: string;
  timestamp: Date;
  agent: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
};

type LogCallback = (log: AgentLog) => void;
type DroneStateCallback = () => DroneAgent[];
type DroneUpdateCallback = (id: number, updates: Partial<DroneAgent>) => void;

class AgentEngineClass {
  private running = false;
  private intervals: ReturnType<typeof setInterval>[] = [];
  private logCallback: LogCallback | null = null;
  private getDrones: DroneStateCallback | null = null;
  private updateDrone: DroneUpdateCallback | null = null;

  /** Dashboard'dan çağrılır: callback'leri ve drone state erişimini bağlar */
  init(
    onLog: LogCallback,
    getDronesState: DroneStateCallback,
    updateDroneState: DroneUpdateCallback
  ) {
    this.logCallback = onLog;
    this.getDrones = getDronesState;
    this.updateDrone = updateDroneState;
  }

  /** Tüm agent'ları başlat */
  start() {
    if (this.running) return;
    this.running = true;

    this.log("AgentEngine", "info", "🚀 NeuralAir Agent Engine başlatılıyor / starting...");
    this.log("AgentEngine", "success", "✅ FleetAgent, EmergencyAgent, UserAgent, ChargingAgent aktif / active");

    // UserAgent: Her 40 saniyede yeni görev açar
    this.intervals.push(
      setInterval(() => UserAgent.tick(this.emit.bind(this)), 40_000)
    );

    // FleetAgent: Her 30 saniyede drone-görev eşleştirmesi yapar
    this.intervals.push(
      setInterval(
        () => FleetAgent.tick(this.emit.bind(this), this.getDrones!, this.updateDrone!),
        30_000
      )
    );

    // EmergencyAgent: Her 5 saniyede kritik batarya kontrolü
    this.intervals.push(
      setInterval(
        () => EmergencyAgent.tick(this.emit.bind(this), this.getDrones!, this.updateDrone!),
        5_000
      )
    );

    // ChargingAgent: Her 3 saniyede şarj oturumlarını işler
    this.intervals.push(
      setInterval(
        () => ChargingAgent.tick(this.emit.bind(this), this.getDrones!),
        3_000
      )
    );

    // İlk tick'leri gecikmeyle tetikle (sayfa yüklenmesi beklenir)
    setTimeout(() => UserAgent.tick(this.emit.bind(this)), 8_000);
    setTimeout(
      () => FleetAgent.tick(this.emit.bind(this), this.getDrones!, this.updateDrone!),
      15_000
    );
  }

  /** Tüm agent'ları durdur */
  stop() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.running = false;
    this.log("AgentEngine", "warning", "⏹ Agent Engine durduruldu / stopped");
  }

  isRunning() {
    return this.running;
  }

  /** Agent log'u yayınla (Dashboard paneline ve Supabase'e) */
  emit(agent: string, level: AgentLog["level"], message: string) {
    const log: AgentLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      agent,
      level,
      message,
    };
    this.logCallback?.(log);
  }

  private log(agent: string, level: AgentLog["level"], message: string) {
    this.emit(agent, level, message);
  }
}

// Singleton instance — uygulama boyunca tek bir engine çalışır
export const AgentEngine = new AgentEngineClass();
