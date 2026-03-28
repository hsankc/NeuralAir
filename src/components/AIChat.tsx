"use client";

import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Send,
  Mic,
  Loader2,
  Zap,
  Crosshair,
  Package,
  Radio,
  X,
  ChevronUp,
} from "lucide-react";
import type { ParsedCommand } from "@/lib/ai/dispatcher";
import { randomTxHash } from "@/lib/data";

interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  parsed?: ParsedCommand;
  txHash?: string;
  timestamp: Date;
}

const exampleCommands = [
  "En yakın dronu Alsancak'a gönder",
  "Kaç drone şarjda?",
  "Yangın bölgesine 2 drone yolla",
  "Ege-01'i kalkışa geçir",
  "Filo batarya durumunu göster",
];

function actionIcon(action: string) {
  switch (action) {
    case "createMission": return Package;
    case "sendCommand": return Crosshair;
    case "deploySwarm": return Radio;
    default: return Brain;
  }
}

function actionLabel(action: string) {
  switch (action) {
    case "createMission": return "Görev Oluştur";
    case "selectDrone": return "Drone Seç";
    case "sendCommand": return "Komut Gönder";
    case "queryStatus": return "Durum Sorgula";
    case "deploySwarm": return "Sürü Operasyonu";
    case "chargeDrone": return "Şarj Et";
    default: return action;
  }
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "NeuralAir AI Dispatcher aktif. Doğal dil ile drone filoyu yönetin. Örnek: \"Alsancak'taki yangın için en yakın dronu gönder\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const data = await res.json();

      if (data.success && data.parsed) {
        // Dispatch event for other components to react (like useDroneSimulator)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ai-command", { detail: data.parsed })
          );
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.parsed.explanation || "Komut işlendi.",
          parsed: data.parsed,
          txHash: randomTxHash(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "system",
            content: data.error || "Komut anlaşılamadı. Lütfen tekrar deneyin.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: "Bağlantı hatası. API çevrimdışı olabilir.",
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-drone-blip"
      >
        <Brain className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] flex flex-col glass-card !rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up"
      style={{ height: 520 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">AI Dispatcher</div>
            <div className="text-xs text-success flex items-center gap-1">
              <span className="status-dot status-active" /> Aktif — GPT-4o
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-text-muted hover:text-text-primary p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-accent-cyan/15 text-text-primary border border-accent-cyan/30"
                  : msg.role === "ai"
                  ? "bg-white/5 border border-border"
                  : "bg-accent-violet/10 border border-accent-violet/20 text-text-secondary"
              }`}
            >
              <div>{msg.content}</div>

              {msg.parsed && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = actionIcon(msg.parsed.action);
                      return <Icon className="w-3.5 h-3.5 text-accent-cyan" />;
                    })()}
                    <span className="text-xs font-medium text-accent-cyan">
                      {actionLabel(msg.parsed.action)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success">
                      %{Math.round((msg.parsed.confidence || 0.8) * 100)}
                    </span>
                  </div>
                  {msg.parsed.params && Object.keys(msg.parsed.params).length > 0 && (
                    <div className="text-[11px] font-mono text-text-muted bg-black/20 rounded p-2">
                      {JSON.stringify(msg.parsed.params, null, 1)}
                    </div>
                  )}
                </div>
              )}

              {msg.txHash && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-success font-mono">
                  <Zap className="w-3 h-3" />
                  TX: {msg.txHash}
                </div>
              )}

              <div className="text-[10px] text-text-muted mt-1.5">
                {msg.timestamp.toLocaleTimeString("tr-TR")}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-accent-cyan text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI analiz ediyor...
          </div>
        )}
      </div>

      {/* Example chips */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {exampleCommands.slice(0, 3).map((cmd) => (
            <button
              key={cmd}
              onClick={() => { setInput(cmd); }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-border text-text-secondary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Drone komutunu yazın..."
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
              disabled={loading}
            />
            <Mic className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
