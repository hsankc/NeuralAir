"use client";

// ── ChargingAgent ─────────────────────────────────────────────
// Runs every 3 seconds.
// For each charging drone, increments the micro SOL earnings counter
// and grows the pod revenue shown on the Sky-Charge page.

import { supabase } from "@/lib/supabase";
import type { DroneAgent } from "@/lib/data";
import type { AgentLog } from "./AgentEngine";

type EmitFn = (agent: string, level: AgentLog["level"], message: string) => void;
type GetDronesFn = () => DroneAgent[];

// SOL earned per charging session tick (every 3 seconds)
const SOL_PER_TICK = 0.000012;

// Track total earnings per charging pod
const podEarnings: Record<number, number> = {};

// Surprise TX hash generator (Solana format)
function fakeSolanaTx(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Throttle: write to Supabase at most every 15 seconds (avoid excessive writes)
let lastDbWrite = 0;

export const ChargingAgent = {
  async tick(emit: EmitFn, getDrones: GetDronesFn) {
    const drones = getDrones();
    const chargingDrones = drones.filter((d) => d.status === "charging" || d.status === "emergency");

    if (!chargingDrones.length) return;

    // Compute pod earnings for every charging drone
    for (const drone of chargingDrones) {
      // Find nearest pod by simulation (id modulo 8)
      const podId = (drone.id % 8) + 1;
      podEarnings[podId] = (podEarnings[podId] ?? 0) + SOL_PER_TICK;

      // Roughly every 5th tick (15s) print a terminal log
      if (Math.random() < 0.2) {
        const tx = fakeSolanaTx();
        emit(
          "ChargingAgent",
          "info",
          `💰 +${SOL_PER_TICK} SOL → Pod-${podId} | Drone: ${drone.name} | TX: ${tx.slice(0, 8)}...`
        );
      }
    }

    // Update pod earnings in Supabase every 15 seconds
    const now = Date.now();
    if (now - lastDbWrite > 15_000) {
      lastDbWrite = now;

      for (const [podId, earned] of Object.entries(podEarnings)) {
        if (earned <= 0) continue;

        try {
          // Directly increment pod earnings via update
          const { data: pod } = await supabase
            .from("charging_pods")
            .select("total_earned")
            .eq("id", parseInt(podId))
            .single();

          if (pod) {
            await supabase
              .from("charging_pods")
              .update({ total_earned: (pod.total_earned ?? 0) + earned })
              .eq("id", parseInt(podId));
          }
        } catch {
          // Supabase write error — silently ignore
        }

        podEarnings[parseInt(podId)] = 0; // Reset so it can accumulate again
      }
    }
  },
};
