"use client";

// ── FleetAgent ────────────────────────────────────────────────
// Her 30 saniyede çalışır.
// Supabase'deki açık görevleri alır, uygun drone'u belirler
// ve görevi ona atar. Karar: GPT-4o-mini (veya fallback parser).

import { supabase } from "@/lib/supabase";
import type { DroneAgent } from "@/lib/data";
import type { AgentLog } from "./AgentEngine";

type EmitFn = (agent: string, level: AgentLog["level"], message: string) => void;
type GetDronesFn = () => DroneAgent[];
type UpdateDroneFn = (id: number, updates: Partial<DroneAgent>) => void;

// Düz mesafe hesabı (Haversine yaklaşımı)
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

// Drone tipini göreve göre puanla
function typeFit(droneType: DroneAgent["type"], missionType: string): number {
  const fits: Record<string, string[]> = {
    fire:         ["emergency", "surveillance"],
    agricultural: ["agricultural"],
    cargo:        ["cargo"],
    traffic:      ["surveillance", "cargo"],
  };
  return fits[missionType]?.includes(droneType) ? 0 : 2; // km ceza
}

// ── Fallback Karar Motoru (GPT olmadan) ──
function fallbackDecide(
  openMissions: any[],
  availableDrones: DroneAgent[]
): { droneId: number; missionId: number; reason: string } | null {
  if (!openMissions.length || !availableDrones.length) return null;

  // Her görev için en uygun dronu bul (puan = mesafe + tip uyumsuzluk cezası)
  let bestScore = Infinity;
  let bestPair: { droneId: number; missionId: number; reason: string } | null = null;

  for (const mission of openMissions.slice(0, 3)) {
    for (const drone of availableDrones) {
      if (drone.battery < 30) continue; // Düşük bataryalı drone almaz

      const dist = distance(drone.lat, drone.lng, mission.from_lat, mission.from_lng);
      const penalty = typeFit(drone.type, mission.type);
      const score = dist + penalty;

      if (score < bestScore) {
        bestScore = score;
        bestPair = {
          droneId: drone.id,
          missionId: mission.id,
          reason: `${drone.name} en yakın / closest (${dist.toFixed(1)}km) ve uygun tip / proper type`,
        };
      }
    }
  }

  return bestPair;
}

// ── GPT Karar Motoru (API key varsa) ──
async function gptDecide(
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
    emit("FleetAgent", "info", "🔄 Açık görevler taranıyor / Scanning open missions...");

    try {
      // Supabase'den açık görevleri al
      const { data: openMissions, error } = await supabase
        .from("missions")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: true })
        .limit(5);

      if (error || !openMissions?.length) {
        emit("FleetAgent", "info", "📭 Şu an atanacak açık görev yok / No open missions to assign");
        return;
      }

      // Müsait drone'ları filtrele
      const availableDrones = getDrones().filter(
        (d) => (d.status === "idle" || d.status === "in-flight") && d.battery > 30 && !d.missionId
      );

      if (!availableDrones.length) {
        emit("FleetAgent", "warning", "⚠️ Müsait drone bulunamadı, bekleniyor / No available drones, waiting...");
        return;
      }

      // Karar al: GPT varsa GPT, yoksa fallback
      const decision =
        (await gptDecide(openMissions, availableDrones)) ??
        fallbackDecide(openMissions, availableDrones);

      if (!decision) {
        emit("FleetAgent", "info", "🤔 Uygun eşleşme bulunamadı / No suitable match found");
        return;
      }

      const mission = openMissions.find((m) => m.id === decision.missionId);
      const drone = availableDrones.find((d) => d.id === decision.droneId);
      if (!mission || !drone) return;

      // Supabase'de görevi güncelle
      await supabase
        .from("missions")
        .update({ status: "accepted", drone_id: drone.id })
        .eq("id", mission.id);

      // Agent kararını kaydet
      await supabase.from("agent_decisions").insert({
        agent_name: "FleetAgent",
        decision: `${drone.name} → "${mission.title}" görevi kabul etti / mission accepted`,
        reasoning: decision.reason,
        affected: `drone:${drone.id}, mission:${mission.id}`,
      });

      // Drone state'ini güncelle (haritada hareket başlar)
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

      // Simüle TX hash göster
      const fakeTx = generateSolanaTxHash();
      emit("FleetAgent", "info", `⛓️ Escrow TX: ${fakeTx}`);

    } catch (err: any) {
      emit("FleetAgent", "error", `❌ FleetAgent hatası / error: ${err.message}`);
    }
  },
};

// Solana formatında simüle TX hash (44 karakter Base58)
function generateSolanaTxHash(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
