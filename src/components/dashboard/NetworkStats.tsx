"use client";

import { Plane, Zap, Battery, TrendingUp } from "lucide-react";
import { DroneAgent, initialMissions } from "@/lib/data";

export function NetworkStats({ drones }: { drones: DroneAgent[] }) {
  const active = drones.filter((d) => d.status === "in-flight" || d.status === "mission").length;
  const charging = drones.filter((d) => d.status === "charging").length;
  const avgBattery = Math.round(drones.reduce((a, d) => a + d.battery, 0) / drones.length);

  const stats = [
    { icon: Plane, label: "Active Flights", value: active, color: "text-accent-cyan" },
    { icon: Zap, label: "Charging", value: charging, color: "text-warning" },
    { icon: Battery, label: "Avg Battery", value: `%${avgBattery}`, color: "text-success" },
    { icon: TrendingUp, label: "Completed Missions", value: initialMissions.filter((m) => m.status === "in-progress").length, color: "text-accent-violet" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="stat-card flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center ${s.color}`}>
            <s.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className="text-[11px] text-text-muted mt-1 uppercase tracking-wider font-medium">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
