"use client";

// ── AgentPanel ────────────────────────────────────────────────
// Live agent activity feed shown on the right side of the dashboard.
// Displays agents' decisions, logs and status.

import { useEffect, useRef } from "react";
import { Bot, Zap, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import type { AgentLog } from "@/lib/agents/AgentEngine";

interface AgentPanelProps {
  logs: AgentLog[];
  isRunning: boolean;
  onToggle: () => void;
}

const AGENT_COLORS: Record<string, string> = {
  FleetAgent:     "text-blue-400",
  EmergencyAgent: "text-red-400",
  UserAgent_Zeynep: "text-purple-400",
  UserAgent_Murat:  "text-pink-400",
  ChargingAgent:  "text-yellow-400",
  AgentEngine:    "text-green-400",
  PricingAgent:   "text-orange-400",
};

const LEVEL_ICONS: Record<AgentLog["level"], React.ReactNode> = {
  info:    <Info className="w-3 h-3 text-blue-400 flex-shrink-0" />,
  success: <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />,
  warning: <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />,
  error:   <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />,
};

const LEVEL_BG: Record<AgentLog["level"], string> = {
  info:    "",
  success: "bg-green-500/5",
  warning: "bg-yellow-500/5",
  error:   "bg-red-500/10",
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AgentPanel({ logs, isRunning, onToggle }: AgentPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new log arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent-cyan" />
          <span className="text-sm font-semibold text-white">Agent Activity</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? "bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse"
                : "bg-zinc-500"
            }`}
          />
        </div>
        <button
          onClick={onToggle}
          className={`text-xs px-3 py-1 rounded-full border transition-all ${
            isRunning
              ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
              : "border-green-500/50 text-green-400 hover:bg-green-500/10"
          }`}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
      </div>

      {/* Agent status summary */}
      <div className="flex gap-2 px-4 py-2 border-b border-white/5 flex-wrap">
        {[
          { name: "Fleet", color: "blue" },
          { name: "Emergency", color: "red" },
          { name: "User", color: "purple" },
          { name: "Charge", color: "yellow" },
        ].map((a) => (
          <span
            key={a.name}
            className={`text-xs px-2 py-0.5 rounded-full bg-${a.color}-500/10 text-${a.color}-400 border border-${a.color}-500/20`}
          >
            {a.name}
          </span>
        ))}
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 font-mono text-xs">
        {logs.length === 0 && (
          <div className="text-center text-zinc-500 mt-8">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Waiting for agents...</p>
            <p className="text-xs mt-1 opacity-60">Press Start</p>
          </div>
        )}

        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex gap-2 items-start rounded p-1.5 ${LEVEL_BG[log.level]}`}
          >
            {LEVEL_ICONS[log.level]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`font-semibold ${AGENT_COLORS[log.agent] ?? "text-zinc-400"}`}>
                  {log.agent}
                </span>
                <span className="text-zinc-600 text-[10px]">{formatTime(log.timestamp)}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed break-all">{log.message}</p>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-white/5">
        <p className="text-xs text-zinc-500 text-center">
          {logs.length} logs • {isRunning ? "Live" : "Stopped"}
        </p>
      </div>
    </div>
  );
}
