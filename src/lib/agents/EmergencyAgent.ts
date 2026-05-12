"use client";

// ── EmergencyAgent ────────────────────────────────────────────
// Runs every 5 seconds.
// Detects in-flight drones whose battery dropped to a critical level (<20%)
// and reroutes them to the nearest Sky-Charge pod.
// Plays a voice alert via ElevenLabs (or browser TTS).

import { supabase } from "@/lib/supabase";
import type { DroneAgent, ChargingPod } from "@/lib/data";
import { initialPods as PODS } from "@/lib/data";
import type { AgentLog } from "./AgentEngine";

type EmitFn = (agent: string, level: AgentLog["level"], message: string) => void;
type GetDronesFn = () => DroneAgent[];
type UpdateDroneFn = (id: number, updates: Partial<DroneAgent>) => void;

// Avoid warning the same drone twice (anti-spam)
const alreadyWarned = new Set<number>();

// Haversine distance
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

// Find the nearest available pod
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

// Browser TTS (when ElevenLabs is unavailable)
function speak(text: string) {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 0.8; // Slightly robotic voice
    window.speechSynthesis.cancel(); // Cancel any prior speech
    window.speechSynthesis.speak(utterance);
  }
}

export const EmergencyAgent = {
  async tick(emit: EmitFn, getDrones: GetDronesFn, updateDrone: UpdateDroneFn) {
    const drones = getDrones();

    // Find in-flight drones with critical battery
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
        emit("EmergencyAgent", "error", `🚨 ${drone.name}: Battery critical! No available pod found!`);
        continue;
      }

      // Redirect drone to the pod
      updateDrone(drone.id, {
        status: "emergency",
        targetLat: nearestPod.lat,
        targetLng: nearestPod.lng,
        missionId: null,
      });

      // If the drone has a mission, cancel/release it
      if (drone.missionId) {
        await supabase
          .from("missions")
          .update({ status: "open", drone_id: null })
          .eq("id", drone.missionId);
      }

      // Record agent decision
      await supabase.from("agent_decisions").insert({
        agent_name: "EmergencyAgent",
        decision: `${drone.name} emergency landing → ${nearestPod.name}`,
        reasoning: `Battery ${Math.round(drone.battery)}% (critical threshold: 20%)`,
        affected: `drone:${drone.id}, pod:${nearestPod.id}`,
      });

      // Voice alert (ElevenLabs or browser TTS)
      speak(
        `Emergency! ${drone.name} battery critical at ${Math.round(drone.battery)} percent. ` +
          `Redirecting to ${nearestPod.name} charging station.`
      );

      emit(
        "EmergencyAgent",
        "error",
        `🚨 EMERGENCY! ${drone.name} battery ${Math.round(drone.battery)}% → redirecting to ${nearestPod.name}`
      );
    }

    // Return fully-charged drones to normal mode
    const recharged = drones.filter(
      (d) => d.status === "charging" && d.battery >= 85 && alreadyWarned.has(d.id)
    );

    for (const drone of recharged) {
      alreadyWarned.delete(drone.id); // Allow future warnings again
      updateDrone(drone.id, { status: "idle" });
      speak(`${drone.name} charging complete. Ready for next mission.`);
      emit("EmergencyAgent", "success", `🔋 ${drone.name} charging complete, ready`);
    }
  },
};
