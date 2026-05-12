"use client";

// ── FleetAgent ────────────────────────────────────────────────
// Runs every 30 seconds.
// Reads open missions from Supabase, picks a suitable drone,
// and assigns the mission. Decision: GPT-4o-mini (or fallback parser).

import { supabase } from "@/lib/supabase";
import type { DroneAgent } from "@/lib/data";
import type { AgentLog } from "./AgentEngine";

type EmitFn = (agent: string, level: AgentLog["level"], message: string) => void;
type GetDronesFn = () => DroneAgent[];
type UpdateDroneFn = (id: number, updates: Partial<DroneAgent>) => void;

// Plain distance (Haversine approximation)
function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Score drone type against mission type
function typeFit(droneType: DroneAgent["type"], missionType: string): number {
  const fits: Record<string, string[]> = {
    fire:         ["emergency", "surveillance"],
    agricultural: ["agricultural"],
    cargo:        ["cargo"],
    traffic:      ["surveillance", "cargo"],
  };
  return fits[missionType]?.includes(droneType) ? 0 : 2; // km penalty
}

// ── Fallback Decision Engine (without GPT) ──
function fallbackDecide(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openMissions: any[],
  availableDrones: DroneAgent[]
): { droneId: number; missionId: number; reason: string } | null {
  if (!openMissions.length || !availableDrones.length) return null;

  // For each mission, find the best drone (score = distance + type mismatch penalty)
  let bestScore = Infinity;
  let bestPair: { droneId: number; missionId: number; reason: string } | null = null;

  for (const mission of openMissions.slice(0, 3)) {
    for (const drone of availableDrones) {
      if (drone.battery < 30) continue; // Skip drones with low battery

      const dist = distance(drone.lat, drone.lng, mission.from_lat, mission.from_lng);
      const penalty = typeFit(drone.type, mission.type);
      const score = dist + penalty;

      if (score < bestScore) {
        bestScore = score;
        bestPair = {
          droneId: drone.id,
          missionId: mission.id,
          reason: `${drone.name} is the closest (${dist.toFixed(1)}km) and a proper type match`,
        };
      }
    }
  }

  return bestPair;
}

// ── GPT Decision Engine (if API key is available) ──
async function gptDecide(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openMissions: any[],
  availableDrones: DroneAgent[]
): Promise<{ droneId: number; missionId: number; reason: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("/api/agent-decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missions: openMissions.slice(0, 3).map((m) => ({
          id: m.id,
          type: m.type,
          title: m.title,
          from: [m.from_lat, m.from_lng],
          payment: m.payment,
        })),
        drones: availableDrones.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          battery: d.battery,
          lat: d.lat,
          lng: d.lng,
        })),
      }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const FleetAgent = {
  async tick(emit: EmitFn, getDrones: GetDronesFn, updateDrone: UpdateDroneFn) {
    emit("FleetAgent", "info", "🔄 Scanning open missions...");

    try {
      // Fetch open missions from Supabase
      const { data: openMissions, error } = await supabase
        .from("missions")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: true })
        .limit(5);

      if (error || !openMissions?.length) {
        emit("FleetAgent", "info", "📭 No open missions to assign right now");
        return;
      }

      // Filter available drones
      const availableDrones = getDrones().filter(
        (d) => (d.status === "idle" || d.status === "in-flight") && d.battery > 30 && !d.missionId
      );

      if (!availableDrones.length) {
        emit("FleetAgent", "warning", "⚠️ No available drones, waiting...");
        return;
      }

      // Make decision: use GPT if available, otherwise fallback
      const decision =
        (await gptDecide(openMissions, availableDrones)) ??
        fallbackDecide(openMissions, availableDrones);

      if (!decision) {
        emit("FleetAgent", "info", "🤔 No suitable match found");
        return;
      }

      const mission = openMissions.find((m) => m.id === decision.missionId);
      const drone = availableDrones.find((d) => d.id === decision.droneId);
      if (!mission || !drone) return;

      // Update mission in Supabase
      await supabase
        .from("missions")
        .update({ status: "accepted", drone_id: drone.id })
        .eq("id", mission.id);

      // Record agent decision
      await supabase.from("agent_decisions").insert({
        agent_name: "FleetAgent",
        decision: `${drone.name} accepted mission "${mission.title}"`,
        reasoning: decision.reason,
        affected: `drone:${drone.id}, mission:${mission.id}`,
      });

      // Update drone state (motion begins on the map)
      updateDrone(drone.id, {
        status: "mission",
        missionId: mission.id,
        targetLat: mission.to_lat,
        targetLng: mission.to_lng,
      });

      emit(
        "FleetAgent",
        "success",
        `✅ ${drone.name} → "${mission.title}" (${mission.payment} SOL) | ${decision.reason}`
      );

      // Show simulated TX hash
      const fakeTx = generateSolanaTxHash();
      emit("FleetAgent", "info", `⛓️ Escrow TX: ${fakeTx}`);

    } catch (err: unknown) {
      emit("FleetAgent", "error", `❌ FleetAgent error: ${(err as Error).message}`);
    }
  },
};

// Simulated Solana-format TX hash (44 Base58 characters)
function generateSolanaTxHash(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
