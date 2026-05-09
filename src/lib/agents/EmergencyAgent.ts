"use client";

// ── EmergencyAgent ────────────────────────────────────────────
// Her 5 saniyede çalışır.
// Bataryası kritik seviyeye (%20 altı) düşen, uçuşta olan
// drone'ları tespit eder ve en yakın Sky-Charge pod'una yönlendirir.
// ElevenLabs (veya browser TTS) ile sesli uyarı verir.

import { supabase } from "@/lib/supabase";
import type { DroneAgent, ChargingPod } from "@/lib/data";
import { initialPods as PODS } from "@/lib/data";
import type { AgentLog } from "./AgentEngine";

type EmitFn = (agent: string, level: AgentLog["level"], message: string) => void;
type GetDronesFn = () => DroneAgent[];
type UpdateDroneFn = (id: number, updates: Partial<DroneAgent>) => void;

// Daha önce uyarıldığı drone'ları tekrar uyarma (spam önleyici)
const alreadyWarned = new Set<number>();

// Haversine mesafe hesabı
function dist(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

// En yakın müsait pod'u bul
function findNearestPod(drone: DroneAgent): ChargingPod | null {
  let nearest: ChargingPod | null = null;
  let minDist = Infinity;

  for (const pod of PODS) {
    if (!pod.available) continue;
    const d = dist(drone.lat, drone.lng, pod.lat, pod.lng);
    if (d < minDist) {
      minDist = d;
      nearest = pod;
    }
  }

  return nearest;
}

// Browser TTS (ElevenLabs yoksa)
function speak(text: string) {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 0.8; // Biraz robotik ses
    window.speechSynthesis.cancel(); // Önceki sesi kes
    window.speechSynthesis.speak(utterance);
  }
}

export const EmergencyAgent = {
  async tick(emit: EmitFn, getDrones: GetDronesFn, updateDrone: UpdateDroneFn) {
    const drones = getDrones();

    // Kritik bataryalı + uçuşta olan drone'ları bul
    const criticalDrones = drones.filter(
      (d) =>
        d.battery < 20 &&
        (d.status === "in-flight" || d.status === "mission") &&
        !alreadyWarned.has(d.id)
    );

    for (const drone of criticalDrones) {
      alreadyWarned.add(drone.id);

      const nearestPod = findNearestPod(drone);
      if (!nearestPod) {
        emit("EmergencyAgent", "error", `🚨 ${drone.name}: Batarya kritik / Battery critical! Müsait pod bulunamadı / No available pod found!`);
        continue;
      }

      // Drone'u pod'a yönlendir
      updateDrone(drone.id, {
        status: "emergency",
        targetLat: nearestPod.lat,
        targetLng: nearestPod.lng,
        missionId: null,
      });

      // Eğer görevi varsa, görevi iptal et / serbest bırak
      if (drone.missionId) {
        await supabase
          .from("missions")
          .update({ status: "open", drone_id: null })
          .eq("id", drone.missionId);
      }

      // Agent kararını kaydet
      await supabase.from("agent_decisions").insert({
        agent_name: "EmergencyAgent",
        decision: `${drone.name} acil iniş / emergency landing → ${nearestPod.name}`,
        reasoning: `Batarya / Battery %${Math.round(drone.battery)} (kritik eşik / critical threshold: %20)`,
        affected: `drone:${drone.id}, pod:${nearestPod.id}`,
      });

      // Sesli uyarı (ElevenLabs veya browser TTS)
      speak(
        `Emergency! ${drone.name} battery critical at ${Math.round(drone.battery)} percent. ` +
          `Redirecting to ${nearestPod.name} charging station.`
      );

      emit(
        "EmergencyAgent",
        "error",
        `🚨 ACİL / EMERGENCY! ${drone.name} batarya / battery %${Math.round(drone.battery)} → ${nearestPod.name}'e yönlendiriliyor / redirecting`
      );
    }

    // Şarj tamamlanan drone'ları tekrar normal moda al
    const recharged = drones.filter(
      (d) => d.status === "charging" && d.battery >= 85 && alreadyWarned.has(d.id)
    );

    for (const drone of recharged) {
      alreadyWarned.delete(drone.id); // Tekrar uyarılabilir olsun
      updateDrone(drone.id, { status: "idle" });
      speak(`${drone.name} charging complete. Ready for next mission.`);
      emit("EmergencyAgent", "success", `🔋 ${drone.name} şarj tamamlandı / charging complete, hazır / ready`);
    }
  },
};
