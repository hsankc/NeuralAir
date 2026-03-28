// NeuralAir AI Dispatcher — GPT prompt engineering & parsing
import { initialDrones, initialPods, initialMissions } from "@/lib/data";

export type AIAction =
  | "createMission"
  | "selectDrone"
  | "sendCommand"
  | "queryStatus"
  | "deploySwarm"
  | "chargeDrone";

export interface ParsedCommand {
  action: AIAction;
  params: {
    droneId?: number;
    droneName?: string;
    droneCount?: number;
    missionType?: string;
    destination?: string;
    destLat?: number;
    destLng?: number;
    command?: string;
    query?: string;
  };
  explanation: string;
  confidence: number;
}

export function buildSystemPrompt(): string {
  const droneList = initialDrones
    .map(
      (d) =>
        `  - ID:${d.id} "${d.name}" tip:${d.type} durum:${d.status} batarya:%${d.battery.toFixed(0)} konum:(${d.lat.toFixed(3)},${d.lng.toFixed(3)})`
    )
    .join("\n");

  const podList = initialPods
    .map(
      (p) =>
        `  - ID:${p.id} "${p.name}" müsait:${p.available} konum:(${p.lat.toFixed(3)},${p.lng.toFixed(3)})`
    )
    .join("\n");

  return `Sen NeuralAir SkyAgent Protocol AI Dispatcher'ısın. İzmir üzerinde otonom drone ağını yönetiyorsun.
Monad blokzinciri üzerinde çalışıyorsun - her komut bir on-chain işlem.

MEVCUT FİLO:
${droneList}

ŞARJ PODLARI:
${podList}

GÖREV TÜRLERİ: cargo (kargo), agricultural (ziraat), fire (yangın müdahalesi), traffic (trafik izleme)
DRONE KOMUTLARI: TakeOff, Land, North, South, East, West, Up, Down, Hover, RTB (üsse dön)

Kullanıcının doğal dil komutunu analiz et ve aşağıdaki JSON formatında yanıt ver:
{
  "action": "createMission" | "selectDrone" | "sendCommand" | "queryStatus" | "deploySwarm" | "chargeDrone",
  "params": {
    "droneId": number (varsa),
    "droneName": string (varsa),
    "droneCount": number (swarm için),
    "missionType": "cargo"|"agricultural"|"fire"|"traffic" (varsa),
    "destination": string (varsa),
    "destLat": number (varsa),
    "destLng": number (varsa),
    "command": "TakeOff"|"Land"|"North"|"South"|"East"|"West"|"Up"|"Down"|"Hover"|"RTB" (varsa),
    "query": string (sorgulama için)
  },
  "explanation": "Türkçe kısa açıklama",
  "confidence": 0.0-1.0
}

SADECE JSON yanıt ver, başka bir şey yazma.`;
}

export function buildUserMessage(input: string): string {
  return `Kullanıcı komutu: "${input}"`;
}

// Fallback parser for when GPT is unavailable
export function fallbackParse(input: string): ParsedCommand {
  const lower = input.toLowerCase();

  // Drone selection
  const droneMatch = lower.match(/(?:drone|dron)\s*(\d+)/i) ||
    lower.match(/(ege|kordon|alsancak|bornova|karşıyaka|bayraklı|konak|balçova|çeşme|urla|menemen|torbalı|sentinel|güzelbahçe|narlıdere)/i);

  // Mission type
  let missionType: string | undefined;
  if (lower.includes("kargo") || lower.includes("paket") || lower.includes("teslimat")) missionType = "cargo";
  else if (lower.includes("tarla") || lower.includes("ziraat") || lower.includes("ilaçlama") || lower.includes("sulama")) missionType = "agricultural";
  else if (lower.includes("yangın") || lower.includes("acil") || lower.includes("fire")) missionType = "fire";
  else if (lower.includes("trafik") || lower.includes("izleme")) missionType = "traffic";

  // Command detection
  const commands: Record<string, string> = {
    "kalkış": "TakeOff", "kalk": "TakeOff",
    "iniş": "Land", "in": "Land",
    "kuzeye": "North", "kuzey": "North",
    "güneye": "South", "güney": "South",
    "doğuya": "East", "doğu": "East",
    "batıya": "West", "batı": "West",
    "yukarı": "Up", "yüksel": "Up",
    "aşağı": "Down", "alçal": "Down",
    "dur": "Hover", "bekle": "Hover",
    "üsse dön": "RTB", "geri dön": "RTB", "eve dön": "RTB",
  };

  let detectedCommand: string | undefined;
  for (const [key, val] of Object.entries(commands)) {
    if (lower.includes(key)) { detectedCommand = val; break; }
  }

  // Query detection
  if (lower.includes("kaç") || lower.includes("durum") || lower.includes("nerede") || lower.includes("nasıl") || lower.includes("bilgi")) {
    return {
      action: "queryStatus",
      params: { query: input },
      explanation: "Filo durum sorgusu yapılıyor...",
      confidence: 0.7,
    };
  }

  // Swarm detection
  if (lower.includes("sürü") || lower.includes("swarm") || (lower.match(/(\d+)\s*(drone|dron)/i))) {
    const countMatch = lower.match(/(\d+)\s*(drone|dron)/i);
    return {
      action: "deploySwarm",
      params: {
        droneCount: countMatch ? parseInt(countMatch[1]) : 3,
        missionType,
        destination: input,
      },
      explanation: `Sürü operasyonu başlatılıyor...`,
      confidence: 0.6,
    };
  }

  // Command
  if (detectedCommand) {
    return {
      action: "sendCommand",
      params: {
        droneId: droneMatch ? parseInt(droneMatch[1]) || 1 : 1,
        command: detectedCommand,
      },
      explanation: `Komut gönderiliyor: ${detectedCommand}`,
      confidence: 0.8,
    };
  }

  // Mission
  if (missionType) {
    return {
      action: "createMission",
      params: { missionType, destination: input },
      explanation: `${missionType} görevi oluşturuluyor...`,
      confidence: 0.7,
    };
  }

  // Default
  return {
    action: "queryStatus",
    params: { query: input },
    explanation: "Komut analiz ediliyor...",
    confidence: 0.5,
  };
}
