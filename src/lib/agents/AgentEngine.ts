"use client";

// ── Agent Engine ──────────────────────────────────────────────
// Central control system that starts/stops all AI agents.
// Called from the Dashboard when the page loads.

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

  /** Called from the Dashboard: binds callbacks and drone state access */
  init(
    onLog: LogCallback,
    getDronesState: DroneStateCallback,
    updateDroneState: DroneUpdateCallback
  ) {
    this.logCallback = onLog;
    this.getDrones = getDronesState;
    this.updateDrone = updateDroneState;
  }

  /** Start all agents */
  start() {
    if (this.running) return;
    this.running = true;

    this.log("AgentEngine", "info", "🚀 NeuralAir Agent Engine starting...");
    this.log("AgentEngine", "success", "✅ FleetAgent, EmergencyAgent, UserAgent, ChargingAgent active");

    // UserAgent: opens a new mission every 40 seconds
    this.intervals.push(
      setInterval(() => UserAgent.tick(this.emit.bind(this)), 40_000)
    );

    // FleetAgent: matches drones to missions every 30 seconds
    this.intervals.push(
      setInterval(
        () => FleetAgent.tick(this.emit.bind(this), this.getDrones!, this.updateDrone!),
        30_000
      )
    );

    // EmergencyAgent: critical battery check every 5 seconds
    this.intervals.push(
      setInterval(
        () => EmergencyAgent.tick(this.emit.bind(this), this.getDrones!, this.updateDrone!),
        5_000
      )
    );

    // ChargingAgent: processes charging sessions every 3 seconds
    this.intervals.push(
      setInterval(
        () => ChargingAgent.tick(this.emit.bind(this), this.getDrones!),
        3_000
      )
    );

    // Trigger first ticks after a delay (wait for the page to load)
    setTimeout(() => UserAgent.tick(this.emit.bind(this)), 8_000);
    setTimeout(
      () => FleetAgent.tick(this.emit.bind(this), this.getDrones!, this.updateDrone!),
      15_000
    );
  }

  /** Stop all agents */
  stop() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.running = false;
    this.log("AgentEngine", "warning", "⏹ Agent Engine stopped");
  }

  isRunning() {
    return this.running;
  }

  /** Emit an agent log (to the Dashboard panel and Supabase) */
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

// Singleton instance — only one engine runs for the entire app
export const AgentEngine = new AgentEngineClass();
