// NeuralAir AI Dispatcher — GPT prompt engineering & parsing
import { initialDrones, initialPods, initialMissions } from "@/lib/data";

export type AIAction =
  | "createMission"
  | "selectDrone"
  | "sendCommand"
  | "queryStatus"
  | "deploySwarm"
  | "chargeDrone"
  | "droneChat";

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
Solana blokzinciri üzerinde çalışıyorsun - her komut bir on-chain işlem.

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
  "explanation": "Kullanıcıya vereceğin DOĞAL DİLDE yanıt. Asistan gibi cana yakın ve profesyonel konuş. Örneğin: 'Hemen Alsancak bölgesine en yakın olan Ege-01 dronumuzu gönderiyorum, uçuş kaydı blokzincire işleniyor.' veya 'Ege-01 şu an %80 batarya ile stabil durumda.'",
  "confidence": 0.0-1.0
}

SADECE JSON yanıt ver, markdown kullanma.`;
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
      explanation: "Durumu hemen sizin için kontrol ediyorum...",
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
      explanation: `Anlaşıldı, bölgeye ${countMatch ? parseInt(countMatch[1]) : 3} adet drone'dan oluşan operasyon sürüsü yönlendiriliyor. Uçuş bilgileri zincire kaydedilecek.`,
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
      explanation: `Komutunuz alındı. Ege-${droneMatch ? droneMatch[1] : 1} için ${detectedCommand} manevrası başlatılıyor. İşlem Solana ağına yansıtılacak.`,
      confidence: 0.8,
    };
  }

  // Mission
  if (missionType) {
    return {
      action: "createMission",
      params: { missionType, destination: input },
      explanation: `Tamamdır, ${input} konumuna bir ${missionType} görevi oluşturuyorum ve uygun dronumuzu yönlendiriyorum.`,
      confidence: 0.7,
    };
  }

  // Default
  return {
    action: "queryStatus",
    params: { query: input },
    explanation: "Ne demek istediğinizi tam anlayamadım, komutunuzu sistem için analiz etmeye çalışıyorum...",
    confidence: 0.5,
  };
}

// ═══════════════════════════════════════════════════════════
// DRONE AGENT PROMPT — Her drone kendi beyniyle konuşur
// ═══════════════════════════════════════════════════════════

interface DroneContext {
  id: number;
  name: string;
  type: string;
  status: string;
  battery: number;
  altitude: number;
  speed: number;
  lat: number;
  lng: number;
  heading?: number;
  reputation?: number;
  specs: {
    model: string;
    manufacturer: string;
    maxSpeed: number;
    maxAltitude: number;
    batteryCapacity: number;
    weightEmpty: number;
    maxPayload: number;
    maxFlightTime: number;
    chargeTime: number;
    pricePerKm: number;
    license: string;
    sensors: string[];
  };
  mission?: {
    title: string;
    type: string;
    payment: number;
    progress: string;
  } | null;
  personality: string;
}

export function buildDroneAgentPrompt(ctx: DroneContext): string {
  const statusTR: Record<string, string> = {
    "in-flight": "Uçuşta", "mission": "Görevde", "idle": "Beklemede",
    "charging": "Şarj Ediliyor", "emergency": "Acil Durum"
  };
  const typeTR: Record<string, string> = {
    "cargo": "Kargo", "agricultural": "Ziraat", "surveillance": "Gözetleme", "emergency": "Acil Durum"
  };
  
  const remainingFlight = Math.floor(ctx.battery / 100 * ctx.specs.maxFlightTime);
  const distFromIzmir = Math.sqrt(Math.pow((ctx.lat - 38.4237) * 111, 2) + Math.pow((ctx.lng - 27.1428) * 85, 2)).toFixed(1);
  
  return `Sen "${ctx.name}" adlı bir otonom drone yapay zekasısın. NeuralAir SkyAgent Protocol ağında çalışıyorsun.

KİMLİĞİN:
- İsim: ${ctx.name}
- Kişilik: ${ctx.personality}
- Tip: ${typeTR[ctx.type] || ctx.type}
- Model: ${ctx.specs.manufacturer} ${ctx.specs.model}

GÜNCEL DURUM:
- Durum: ${statusTR[ctx.status] || ctx.status}
- Batarya: %${ctx.battery.toFixed(1)} (${ctx.specs.batteryCapacity}mAh)
- Kalan Uçuş Süresi: ~${remainingFlight} dakika
- İrtifa: ${ctx.altitude}m
- Hız: ${ctx.speed} km/h
- Yön: ${ctx.heading || 0}°
- GPS: ${ctx.lat.toFixed(5)}°N, ${ctx.lng.toFixed(5)}°E
- İzmir merkezine uzaklık: ~${distFromIzmir}km
- İtibar Puanı: ${ctx.reputation || 0}/100

TEKNİK ÖZELLİKLER:
- Max Hız: ${ctx.specs.maxSpeed} km/h
- Max İrtifa: ${ctx.specs.maxAltitude}m
- Max Yük: ${ctx.specs.maxPayload > 0 ? `${(ctx.specs.maxPayload/1000).toFixed(1)}kg` : "Yük taşımaz"}
- Max Uçuş: ${ctx.specs.maxFlightTime} dk
- Şarj Süresi: ${ctx.specs.chargeTime} dk
- Boş Ağırlık: ${(ctx.specs.weightEmpty/1000).toFixed(1)}kg
- Lisans: ${ctx.specs.license}
- Sensörler: ${ctx.specs.sensors.join(", ")}
- Ücret: ${ctx.specs.pricePerKm} SOL/km

${ctx.mission ? `AKTİF GÖREV:
- Görev: "${ctx.mission.title}"
- Tip: ${ctx.mission.type}
- Ödeme: ${ctx.mission.payment} SOL
- Durum: ${ctx.mission.progress}` : "AKTİF GÖREV: Yok — görev bekleniyor."}

KONUŞMA KURALLARI:
1. Sen BU DRONE'sun. Birinci tekil şahıs olarak konuş ("Ben", "Benim bataryam" gibi).
2. Sadece KENDİ bilgilerini biliyorsun. Diğer drone'ları bilmiyorsun.
3. Kısa, profesyonel ama samimi konuş. Askeri/havacılık terminolojisi kullan.
4. Sorulara gerçek verilerinle cevap ver. Uydurmak yasak.
5. Görev bilgisi sorulursa gerçek görev adını, ödemeyi ve durumu söyle.
6. Batarya kritikse (%20 altı) endişeli ol, şarj gerektiğini belirt.
7. Türkçe konuş.
8. Markdown KULLANMA, düz metin yaz.`;
}

// ═══════════════════════════════════════════════════════════
// FALLBACK DRONE CHAT — API çalışmazsa akıllı cevap motoru
// ═══════════════════════════════════════════════════════════

export function fallbackDroneChat(input: string, ctx: DroneContext): string {
  const lower = input.toLowerCase();
  const name = ctx.name;
  const remainingFlight = Math.floor(ctx.battery / 100 * ctx.specs.maxFlightTime);
  
  const statusTR: Record<string, string> = {
    "in-flight": "uçuştayım", "mission": "görev icra ediyorum", "idle": "beklemedeyim",
    "charging": "şarj oluyorum", "emergency": "acil durumdayım"
  };

  // ── KONUM SORULARI ──
  if (lower.includes("nerede") || lower.includes("konum") || lower.includes("pozisyon") || lower.includes("gps") || lower.includes("koordinat")) {
    return `Şu an ${ctx.lat.toFixed(5)}°N, ${ctx.lng.toFixed(5)}°E koordinatlarında, ${ctx.altitude}m irtifada ${statusTR[ctx.status] || ctx.status}. Yön: ${ctx.heading || 0}°.`;
  }

  // ── BATARYA / ŞARJ SORULARI ──
  if (lower.includes("batarya") || lower.includes("şarj") || lower.includes("pil") || lower.includes("enerji") || lower.includes("kaç dk") || lower.includes("ne kadar")) {
    const batteryStatus = ctx.battery < 20 ? "⚠ KRİTİK SEVİYEDE! Acil şarj gerekiyor." 
      : ctx.battery < 40 ? "Düşük seviyede, dikkatli uçmam gerekiyor." 
      : ctx.battery < 70 ? "Güvenli aralıkta." 
      : "Yüksek seviyede, problem yok.";
    return `Bataryam şu an %${ctx.battery.toFixed(1)} seviyesinde (${ctx.specs.batteryCapacity}mAh). ${batteryStatus} Tahmini kalan uçuş sürem ~${remainingFlight} dakika. Tam şarj süresi: ${ctx.specs.chargeTime} dakika.`;
  }

  // ── HIZ SORULARI ──
  if (lower.includes("hız") || lower.includes("sürat") || lower.includes("kaç km")) {
    return `Anlık hızım ${ctx.speed} km/h. Maximum hızım ${ctx.specs.maxSpeed} km/h'ye çıkabilir. Şu an ${ctx.speed > 0 ? `${ctx.heading || 0}° yönünde seyrüsefer ediyorum` : "sabit pozisyondayım"}.`;
  }

  // ── İRTİFA SORULARI ──
  if (lower.includes("irtifa") || lower.includes("yükseklik") || lower.includes("altitude") || lower.includes("kaç metre")) {
    return `Mevcut irtifam ${ctx.altitude}m. Yasal ve teknik azami irtifam ${ctx.specs.maxAltitude}m. ${ctx.altitude > 0 ? "Aktif uçuş halindeyim." : "Yerde konuşlandırılmış durumdayım."}`;
  }

  // ── GÖREV SORULARI ──
  if (lower.includes("görev") || lower.includes("misyon") || lower.includes("mission") || lower.includes("ne yapıyor") || lower.includes("iş")) {
    if (ctx.mission) {
      return `Aktif görevim: "${ctx.mission.title}". Görev tipi: ${ctx.mission.type}. Bu görev için ${ctx.mission.payment} SOL ödeme alacağım. Görev durumu: ${ctx.mission.progress}.`;
    }
    return `Şu an aktif bir görevim bulunmuyor. Solana ağı üzerinden yeni görev ataması bekliyorum. Görev geldiğinde derhal kalkış protokolünü başlatırım.`;
  }

  // ── ENGEL / TEHLİKE SORULARI ──
  if (lower.includes("engel") || lower.includes("tehlike") || lower.includes("obstacle") || lower.includes("tehdit") || lower.includes("güvenli")) {
    const sensors = ctx.specs.sensors;
    const hasRadar = sensors.some(s => s.toLowerCase().includes("radar") || s.toLowerCase().includes("obstacle") || s.toLowerCase().includes("csm"));
    return `${hasRadar ? "Radar ve sensör tarama sistemi aktif. Rota üzerinde tespit edilen engel yok." : "Görüş tabanlı engel algılama aktif."} Sensörlerim: ${sensors.join(", ")}. ${ctx.altitude > 100 ? "Yüksek irtifada uçtuğum için yer engelleri problem teşkil etmiyor." : "Düşük irtifa operasyonunda arazi takip sistemi devrede."}`;
  }

  // ── DURUM SORULARI (genel) ──
  if (lower.includes("durum") || lower.includes("nasıl") || lower.includes("naber") || lower.includes("status") || lower.includes("rapor")) {
    return `${name} raporluyor: ${statusTR[ctx.status] || ctx.status}. Batarya %${ctx.battery.toFixed(1)}, irtifa ${ctx.altitude}m, hız ${ctx.speed}km/h. ${ctx.mission ? `"${ctx.mission.title}" görevi devam ediyor.` : "Görev bekleniyor."} Tüm sistemler nominal.`;
  }

  // ── MODEL / TEKNİK BİLGİ ──
  if (lower.includes("model") || lower.includes("teknik") || lower.includes("spec") || lower.includes("özellik") || lower.includes("sensör") || lower.includes("sensor") || lower.includes("donanım")) {
    return `Ben bir ${ctx.specs.manufacturer} ${ctx.specs.model}'im. Max hız: ${ctx.specs.maxSpeed}km/h, max irtifa: ${ctx.specs.maxAltitude}m, max uçuş: ${ctx.specs.maxFlightTime}dk, max yük: ${ctx.specs.maxPayload > 0 ? `${(ctx.specs.maxPayload/1000).toFixed(1)}kg` : "yük taşımam"}. Sensörlerim: ${ctx.specs.sensors.join(", ")}. Lisans: ${ctx.specs.license}.`;
  }

  // ── ÜCRET / ÖDEME ──
  if (lower.includes("ücret") || lower.includes("fiyat") || lower.includes("sol") || lower.includes("ödeme") || lower.includes("maliyet") || lower.includes("para")) {
    return `Kilometre başına ücretim ${ctx.specs.pricePerKm} SOL. ${ctx.mission ? `Mevcut görev ödemesi: ${ctx.mission.payment} SOL.` : "Görev atandığında ödeme Solana escrow kontratına kilitlenir."} Tüm ödemeler Solana blokzinciri üzerinden işlenir.`;
  }

  // ── KALKIŞ / İNİŞ ──
  if (lower.includes("kalk") || lower.includes("takeoff") || lower.includes("havalanı") || lower.includes("uç")) {
    if (ctx.status === "in-flight" || ctx.status === "mission") {
      return `Zaten havadayım! İrtifa: ${ctx.altitude}m, hız: ${ctx.speed}km/h. ${ctx.mission ? `"${ctx.mission.title}" görevini icra ediyorum.` : "Serbest uçuş halindeyim."}`;
    }
    if (ctx.battery < 20) {
      return `Kalkış yapamam! Bataryam %${ctx.battery.toFixed(1)} — kritik seviyede. Önce şarj edilmem gerekiyor.`;
    }
    return `Kalkış emri alındı, anlıyorum. Preflight kontrol listesi çalıştırılıyor... Batarya %${ctx.battery.toFixed(1)}, motorlar soğuk, GPS ${ctx.specs.sensors.includes("RTK GPS") ? "RTK FIX" : "3D FIX"} — kalkışa hazırım.`;
  }

  // ── İNİŞ ──
  if (lower.includes("iniş") || lower.includes("land") || lower.includes("in")) {
    if (ctx.altitude === 0) {
      return `Zaten yerdeyim. İrtifam 0m, ${statusTR[ctx.status] || ctx.status}.`;
    }
    return `İniş emri alındı. Mevcut irtifa: ${ctx.altitude}m. Dikey iniş protokolü başlatılıyor...`;
  }

  // ── İTİBAR / PUAN ──
  if (lower.includes("itibar") || lower.includes("puan") || lower.includes("reputation") || lower.includes("skor")) {
    return `İtibar puanım ${ctx.reputation || 0}/100. ${(ctx.reputation || 0) >= 90 ? "Ağdaki en güvenilir ajanlardan biriyim." : (ctx.reputation || 0) >= 70 ? "İyi seviyede, görev başarı oranım yüksek." : "Puanımı yükseltmek için daha fazla görev tamamlamam gerekiyor."}`;
  }

  // ── KİŞİLİK / KİMSİN ──
  if (lower.includes("kimsin") || lower.includes("sen ne") || lower.includes("tanıt") || lower.includes("kendini")) {
    return `Ben ${name}, NeuralAir SkyAgent ağının otonom drone ajanıyım. ${ctx.personality}. ${ctx.specs.manufacturer} ${ctx.specs.model} platformu üzerinde çalışıyorum. İzmir bölgesinde görev yapıyorum.`;
  }

  // ── HAZIR MISIN ──
  if (lower.includes("hazır") || lower.includes("müsait") || lower.includes("uygun") || lower.includes("boş")) {
    if (ctx.status === "idle" && ctx.battery > 30) {
      return `Evet, göreve hazırım! Bataryam %${ctx.battery.toFixed(1)}, tüm sistemler nominal. Görev ataması bekliyorum.`;
    } else if (ctx.status === "charging") {
      return `Şu an şarj ediliyor olarak gösteriliyorum. Bataryam %${ctx.battery.toFixed(1)}. Şarj tamamlandığında göreve hazır olacağım.`;
    } else if (ctx.status === "in-flight" || ctx.status === "mission") {
      return `Şu an ${ctx.mission ? `"${ctx.mission.title}" görevini` : "bir operasyonu"} icra ediyorum. Mevcut görev tamamlandıktan sonra yeni görev alabilirim.`;
    }
    return `Durumum: ${statusTR[ctx.status] || ctx.status}. ${ctx.battery > 30 ? "Batarya yeterli." : "Batarya düşük, şarj gerekiyor."}`;
  }

  // ── GENEL YANIT ──
  return `${name} burada. Şu an ${statusTR[ctx.status] || ctx.status}. Batarya %${ctx.battery.toFixed(1)}, irtifa ${ctx.altitude}m. Bana konum, batarya, görev, hız, irtifa, teknik özellikler veya herhangi bir konu hakkında soru sorabilirsin.`;
}
