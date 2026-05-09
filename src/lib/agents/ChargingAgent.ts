"use client";

// ── ChargingAgent ─────────────────────────────────────────────
// Her 3 saniyede çalışır.
// Şarj olmakta olan drone'lar için mikro SOL kazanç sayacını
// günceller ve Sky-Charge sayfasındaki pod gelirini artırır.

import { supabase } from "@/lib/supabase";
import type { DroneAgent } from "@/lib/data";
import type { AgentLog } from "./AgentEngine";

type EmitFn = (agent: string, level: AgentLog["level"], message: string) => void;
type GetDronesFn = () => DroneAgent[];

// Her şarj oturumunda kazanılan SOL miktarı (3 saniyede bir)
const SOL_PER_TICK = 0.000012;

// Şarj olan pod'ların toplam kazancını takip et
const podEarnings: Record<number, number> = {};

// Sürpriz TX hash üretici (Solana format)
function fakeSolanaTx(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Throttle: Her 15 saniyede bir Supabase'e yazılsın (çok fazla write olmasın)
let lastDbWrite = 0;

export const ChargingAgent = {
  async tick(emit: EmitFn, getDrones: GetDronesFn) {
    const drones = getDrones();
    const chargingDrones = drones.filter((d) => d.status === "charging" || d.status === "emergency");

    if (!chargingDrones.length) return;

    // Her şarjda olan drone için pod kazancı hesapla
    for (const drone of chargingDrones) {
      // En yakın pod'u simüle olarak bul (id modulo 8)
      const podId = (drone.id % 8) + 1;
      podEarnings[podId] = (podEarnings[podId] ?? 0) + SOL_PER_TICK;

      // Her 5 tickte bir (15sn) terminal'e log bas
      if (Math.random() < 0.2) {
        const tx = fakeSolanaTx();
        emit(
          "ChargingAgent",
          "info",
          `💰 +${SOL_PER_TICK} SOL → Pod-${podId} | Drone: ${drone.name} | TX: ${tx.slice(0, 8)}...`
        );
      }
    }

    // Her 15 saniyede bir Supabase'deki pod kazancını güncelle
    const now = Date.now();
    if (now - lastDbWrite > 15_000) {
      lastDbWrite = now;

      for (const [podId, earned] of Object.entries(podEarnings)) {
        if (earned <= 0) continue;

        try {
          // Direkt update ile pod kazancını artır
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
          // Supabase yazma hatası — sessizce geç
        }

        podEarnings[parseInt(podId)] = 0; // Sıfırla, tekrar birikmesi için
      }
    }
  },
};
