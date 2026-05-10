"use client";

// ── UserAgent ─────────────────────────────────────────────────
// Zeynep ve Murat adlı iki simüle kullanıcı.
// Her ~40 saniyede bir Supabase'e yeni görev açarlar.
// Bu, Marketplace'teki görev listesini canlı tutar.

import { supabase } from "@/lib/supabase";
import type { AgentLog } from "./AgentEngine";

type EmitFn = (agent: string, level: AgentLog["level"], message: string) => void;

// ── Persona tanımları ──
const PERSONAS = [
  {
    name: "UserAgent_Zeynep",
    emoji: "👩",
    wallet: "ZeynepWallet7xKpAbC1D2E3F4G5H",
    missionTemplates: [
      { type: "cargo" as const,        title: "Kordon → Balçova İlaç / Medicine",       desc: "Acil ilaç teslimatı | Emergency medicine delivery",                     from_lat: 38.4280, from_lng: 27.1350, to_lat: 38.3900, to_lng: 27.0500, payment: 0.038 },
      { type: "agricultural" as const, title: "Çeşme Bağ İlaçlama / Vineyard",          desc: "25 dönüm bağ zararlı ilaçlama | 25 decares vineyard pest spraying",           from_lat: 38.3230, from_lng: 26.3050, to_lat: 38.3280, to_lng: 26.3150, payment: 0.085 },
      { type: "cargo" as const,        title: "Alsancak → Karşıyaka Paket / Package",  desc: "E-ticaret express teslimat | E-commerce express delivery",               from_lat: 38.4350, from_lng: 27.1420, to_lat: 38.4560, to_lng: 27.1100, payment: 0.022 },
      { type: "traffic" as const,      title: "Bayraklı Trafik Analizi / Traffic",     desc: "Sabah yoğunluğu akış izleme | Morning rush flow monitoring",             from_lat: 38.4580, from_lng: 27.1700, to_lat: 38.4600, to_lng: 27.1800, payment: 0.035 },
    ],
  },
  {
    name: "UserAgent_Murat",
    emoji: "👨",
    wallet: "MuratWallet8yLqBcD2E3F4G5H6I",
    missionTemplates: [
      { type: "cargo" as const,        title: "Bornova → Konak Kargo / Cargo",       desc: "Ofis malzemesi teslimatı | Office supplies delivery",                from_lat: 38.4700, from_lng: 27.2200, to_lat: 38.4192, to_lng: 27.1287, payment: 0.020 },
      { type: "fire" as const,         title: "Yamanlar Yangın Gözetleme / Fire",   desc: "Orman yangını erken uyarı devriyesi | Forest fire early warning patrol",     from_lat: 38.5200, from_lng: 27.1000, to_lat: 38.5400, to_lng: 27.0800, payment: 0.120 },
      { type: "agricultural" as const, title: "Menemen Tarla Sulama / Irrigation",        desc: "50 dönüm sulama kontrolü | 50 decares irrigation control",               from_lat: 38.6100, from_lng: 27.0700, to_lat: 38.6150, to_lng: 27.0800, payment: 0.060 },
      { type: "cargo" as const,        title: "Urla → Çeşme Ekspres / Express",        desc: "Taze balık teslimatı - öncelikli | Fresh fish delivery - priority",       from_lat: 38.3220, from_lng: 26.7650, to_lat: 38.3230, to_lng: 26.3050, payment: 0.055 },
    ],
  },
];

// Hangi persona'nın hangi şablonu kullanacağını döngüsel seç
let personaIndex = 0;
const templateCursors: Record<string, number> = {};

export const UserAgent = {
  async tick(emit: EmitFn) {
    try {
      const persona = PERSONAS[personaIndex % PERSONAS.length];
      personaIndex++;

      const cursor = templateCursors[persona.name] ?? 0;
      const template = persona.missionTemplates[cursor % persona.missionTemplates.length];
      templateCursors[persona.name] = cursor + 1;

      // Supabase'e yeni görev yaz
      const { data, error } = await supabase
        .from("missions")
        .insert({
          type: template.type,
          title: template.title,
          description: template.desc,
          from_lat: template.from_lat,
          from_lng: template.from_lng,
          to_lat: template.to_lat,
          to_lng: template.to_lng,
          payment: template.payment,
          status: "open",
          posted_by: persona.name,
        })
        .select()
        .single();

      if (error) {
        emit(persona.name, "error", `❌ Görev açılamadı / Failed to create mission: ${error.message}`);
        return;
      }

      emit(
        persona.name,
        "info",
        `${persona.emoji} Yeni görev açıldı / New mission: "${template.title}" — ${template.payment} SOL`
      );

    } catch (err: unknown) {
      emit("UserAgent_Zeynep", "error", `❌ Dispatcher hatası: ${(err as Error).message}`);
    }
  },
};
