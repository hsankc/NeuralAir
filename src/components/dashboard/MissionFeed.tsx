"use client";

import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { initialMissions, missionTypeLabels, missionStatusLabels } from "@/lib/data";
import { locale, typeColor } from "./utils";

export function MissionFeed() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Active Missions</h3>
        <Link href="/marketplace" className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
          All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {initialMissions.filter((m) => m.status !== "completed" && m.status !== "cancelled").slice(0, 5).map((m) => (
          <div key={m.id} className="bg-bg-tertiary/60 rounded-xl p-4 hover:bg-bg-tertiary transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${typeColor(m.type)}`}>
                  {missionTypeLabels(locale)[m.type]}
                </span>
                {m.priority && (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-[#521313] bg-[#2E0A0A] text-[#F87171] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Priority
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-accent-cyan tabular-nums ml-2 whitespace-nowrap">{m.payment} SOL</span>
            </div>
            <div className="text-sm font-semibold mb-2">{m.title}</div>
            <div className="text-xs text-text-muted mb-3 leading-relaxed">{m.description.slice(0, 50)}...</div>
            <div className="flex items-center justify-end">
              <span className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full border ${
                m.status === "in-progress" ? "bg-[#062E1C] border-[#0A472A] text-[#34D399]" : "bg-[#2E1A05] border-[#4D2D0B] text-[#FBBF24]"
              }`}>
                {missionStatusLabels(locale)[m.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
