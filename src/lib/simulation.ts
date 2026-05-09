/**
 * NeuralAir — Canlı Agent Simülasyon Motoru v4
 * 
 * Her drone GERÇEK ZAMANLI verisini raporlar.
 * Mesajlar cache'lenmez — her çağrıda drone'un GÜNCEL durumuna göre üretilir.
 * Round-robin: 1→2→3→4→5→1→2→... Her drone sırayla konuşur.
 */

import { DroneAgent, initialMissions, Mission } from "./data";

export type LogLevel = "info" | "success" | "warning" | "error" | "system";

export interface SimLogEntry {
  droneId: number;
  droneName: string;
  level: LogLevel;
  msg: string;
  timestamp: Date;
}

// Her drone için mesaj şablonu tipi
type MsgTemplate = (drone: DroneAgent, mission: Mission | undefined) => string;

// ═══ MESAJ HAVUZU — Her drone tipi için farklı mesaj şablonları ═══
// Bu fonksiyonlar her çağrıda drone'un GÜNCEL değerlerini kullanır

const cargoTemplates: MsgTemplate[] = [
  (d, m) => `İrtifa / Altitude: ${d.altitude}m | Hız / Speed: ${d.speed}km/h | Yön / Heading: ${d.heading}° — cruise stabil / stable`,
  (d, m) => `Batarya / Battery: %${d.battery.toFixed(1)} (${d.specs.batteryCapacity}mAh) | Kalan uçuş / Remaining: ~${Math.floor(d.battery / 100 * d.specs.maxFlightTime)}dk`,
  (d, m) => `GPS: ${d.lat.toFixed(5)}°N, ${d.lng.toFixed(5)}°E | ${d.specs.sensors.includes("RTK GPS") ? "RTK FIX ±2cm" : "3D FIX"} ✓`,
  (d, m) => `${d.specs.model} motor sıcaklıkları / motor temps: ${Math.floor(Math.random() * 8 + 42)}°C — nominal`,
  (d, m) => `ADS-B transponder aktif / active. Çevre hava trafiği / Air traffic: temiz / clear ✓`,
  (d, m) => `Collision Sensing tarama / scan: engel yok / no obstacle. Rota temiz / Route clear.`,
  (d, m) => m ? `Görev / Mission: "${m.title}" | Ödeme / Pay: ${m.payment} SOL | ${m.priority ? "ÖNCELİKLİ / PRIORITY 🔴" : "Normal"}` : `Görev bekleniyor / Waiting. Escrow kontrat dinleniyor / Listening escrow...`,
  (d, m) => m ? `Hedefe kalan / Dist to target: ~${calcRemaining(d, m).toFixed(1)}km | ETA: ${Math.max(1, Math.ceil(calcRemaining(d, m) / Math.max(d.speed, 1) * 60))}dk` : `Rota atanmadı / No route. Bekleme pozisyonunda / Standby.`,
  (d, m) => m ? `Görev ilerleme / Mission progress: %${calcProgress(d, m)} tamamlandı / complete` : `Sistem idle / System idle. Tüm sensörler standby / Sensors standby.`,
  (d, m) => m ? `Payload durumu / Payload status: güvenli / secure | Titreşim / Vibe: normal | Sıcaklık / Temp: ${Math.floor(Math.random() * 5 + 20)}°C` : `Payload yok / No payload.`,
  (d, m) => `Rüzgar kompansasyonu / Wind comp: +${(Math.random() * 3).toFixed(1)}° yaw düzeltmesi uygulandı / applied`,
  (d, m) => `Telemetri paketi Solana'ya gönderildi / Telemetry sent. TX: 0x${Math.random().toString(16).slice(2, 10)}`,
];

const emergencyTemplates: MsgTemplate[] = [
  (d, m) => `İrtifa / Altitude: ${d.altitude}m | Hız / Speed: ${d.speed}km/h | ${d.specs.model} operasyonel / operational`,
  (d, m) => `Batarya / Battery: %${d.battery.toFixed(1)} (${d.specs.batteryCapacity}mAh) | Kalan / Rem: ~${Math.floor(d.battery / 100 * d.specs.maxFlightTime)}dk`,
  (d, m) => m?.type === "fire" ? `🚨 YANGIN MÜDAHALESİ / FIRE RESP: "${m.title}" | ${m.payment} SOL` : `Devriye aktif / Patrol active. Tehdit yok / Clear.`,
  (d, m) => `Termal kamera / Thermal cam (${d.specs.sensors[0]}): tarama aktif / scanning | Bölge sıcaklığı / Zone temp: ${Math.floor(Math.random() * 8 + 24)}°C`,
  (d, m) => m?.type === "fire" ? `Hotspot tespit / detected: ${m.toLat.toFixed(4)}°N | Max: ${Math.floor(Math.random() * 150 + 280)}°C` : `Termal anomali / Thermal anomaly: yok / none ✓`,
  (d, m) => m?.type === "fire" ? `Yangın alanı / Fire area: ~${(Math.random() * 3 + 1.5).toFixed(1)} hektar / ha | Yayılma / Spread: ${["KB", "KD", "GB", "GD"][Math.floor(Math.random() * 4)]}` : `Sektör taraması / Sector scan: temiz / clear.`,
  (d, m) => m?.type === "fire" ? `İtfaiye birimine güncel koordinat gönderildi / Coords sent to fire dept ✓` : `ATC frekansı dinleniyor / Listening ATC. Acil çağrı yok / No distress call.`,
  (d, m) => `${d.specs.sensors[1]} zoom kamera: ${d.specs.sensors.includes("Zoom 48MP") ? "48MP optik, 200× hybrid" : "aktif / active"}`,
  (d, m) => m?.type === "fire" ? `Rüzgar / Wind: ${Math.floor(Math.random() * 12 + 8)}km/s — yayılma riski / spread risk ${Math.random() > 0.4 ? "YÜKSEK / HIGH" : "ORTA / MEDIUM"}` : `Hava durumu / Weather: uçuşa uygun / clear for flight`,
  (d, m) => `Lazer mesafe / Laser dist: hedef / target ${(Math.random() * 400 + 200).toFixed(0)}m | Hoparlör / Speaker: standby`,
  (d, m) => `GPS: ${d.lat.toFixed(5)}°N, ${d.lng.toFixed(5)}°E | Spotlight: ${Math.random() > 0.5 ? "standby" : "aktif / active"}`,
  (d, m) => m ? `Görev ilerleme / Mission prog: %${calcProgress(d, m)} | Koordinasyon devam ediyor / Coordinating` : `Nöbet pozisyonunda / Guard pos. Tüm sensörler aktif / All sensors active.`,
];

const agriculturalTemplates: MsgTemplate[] = [
  (d, m) => `İrtifa / Altitude: ${d.altitude}m | Terrain Follow: AKTİF / ACTIVE | Hız / Speed: ${d.speed}km/h`,
  (d, m) => `Batarya / Battery: %${d.battery.toFixed(1)} (${d.specs.batteryCapacity}mAh) | Kalan / Rem: ~${Math.floor(d.battery / 100 * d.specs.maxFlightTime)}dk`,
  (d, m) => m ? `Operasyon / Op: "${m.title}" | ${m.payment} SOL` : `Tarla taraması bekleniyor / Waiting field scan.`,
  (d, m) => `Çift atomizer / Dual atomizer aktif / active | Akış / Flow: ${(Math.random() * 2 + 3).toFixed(1)} L/dk | Basınç / Pressure: ${Math.floor(Math.random() * 5 + 45)}PSI`,
  (d, m) => `Tank seviyesi / Tank level: %${Math.floor(Math.random() * 25 + 55)} | Kalan / Rem: ~${Math.floor(Math.random() * 8 + 5)}L`,
  (d, m) => {
    const done = Math.floor(Math.random() * 10 + 12);
    return `Şerit / Strip: ${done}/25 tamamlandı (%${Math.floor(done/25*100)}) | Dağılım / Spread: homojen / uniform ✓`;
  },
  (d, m) => `Phased Array Radar: arazi profili / terrain profile OK | Eğim / Slope: ${(Math.random() * 6 + 2).toFixed(1)}°`,
  (d, m) => `RTK pozisyon / position: ±2cm | Şerit örtüşme / Strip overlap: %${Math.floor(Math.random() * 3 + 8)} — optimal`,
  (d, m) => `Rüzgar / Wind: ${Math.floor(Math.random() * 6 + 3)}km/s — ilaçlama için / for spray: ${Math.random() > 0.2 ? "uygun / ok ✓" : "⚠ sınırda / borderline"}`,
  (d, m) => m ? `Görev ilerleme / Mission prog: %${calcProgress(d, m)} tamamlandı / complete` : `Operasyon bekliyor / Op pending.`,
  (d, m) => `GPS: ${d.lat.toFixed(5)}°N, ${d.lng.toFixed(5)}°E | ${d.specs.model} nominal`,
  (d, m) => `Telemetri / Telemetry: sıcaklık / temp=${Math.floor(Math.random() * 5 + 28)}°C | nem / humidity=%${Math.floor(Math.random() * 20 + 50)}`,
];

const idleTemplates: MsgTemplate[] = [
  (d) => `${d.specs.manufacturer} ${d.specs.model} hazır bekliyor / ready. Batarya / Battery: %${d.battery.toFixed(0)}`,
  (d) => `Solana escrow dinleniyor / listening. Yeni görev bekleniyor / Waiting new mission...`,
  (d) => `Sensörler standby / Sensors standby: ${d.specs.sensors.slice(0, 2).join(", ")} | Kalibrasyon / Calibration: OK ✓`,
  (d) => `Son sistem kontrolü / System check: tüm motorlar soğuk / all motors cool. Sıcaklık / Temp: ${Math.floor(Math.random() * 5 + 22)}°C`,
  (d) => `GPS: ${d.lat.toFixed(5)}°N, ${d.lng.toFixed(5)}°E | Lisans / License: ${d.specs.license} geçerli / valid ✓`,
  (d) => `Pozisyon / Pos: pad üzerinde / on pad. Şarj bağlantısı / Charge link: ${d.battery > 90 ? "tamamlandı / done ✓" : "aktif / active"}`,
];

const chargingTemplates: MsgTemplate[] = [
  (d) => `Pod bağlantısı aktif / Pod link active. ${d.specs.batteryCapacity}mAh → %${d.battery.toFixed(0)} şarj ediliyor / charging...`,
  (d) => `Akım / Current: ${(d.specs.batteryCapacity / 1000 * 0.8).toFixed(1)}A | Voltaj / Voltage: nominal`,
  (d) => `Hücre sıcaklığı / Cell temp: ${Math.floor(Math.random() * 8 + 30)}°C — güvenli aralıkta / safe range`,
  (d) => `Şarj / Charge ETA: ~${Math.max(1, Math.floor((95 - d.battery) / 100 * d.specs.chargeTime))}dk → %95 hedef / target`,
  (d) => `Hücre dengesi kontrol ediliyor / Balancing cells... ${d.specs.batteryCapacity}mAh pil sağlığı / battery health: %98`,
];

// ═══ YARDIMCI HESAPLAMALAR ═══

function calcRemaining(drone: DroneAgent, mission: Mission): number {
  const dx = mission.toLat - drone.lat;
  const dy = mission.toLng - drone.lng;
  return Math.sqrt(dx * dx * 111 * 111 + dy * dy * 85 * 85);
}

function calcProgress(drone: DroneAgent, mission: Mission): number {
  const totalDist = Math.sqrt(
    Math.pow((mission.toLat - mission.fromLat) * 111, 2) +
    Math.pow((mission.toLng - mission.fromLng) * 85, 2)
  );
  const remaining = calcRemaining(drone, mission);
  const progress = Math.max(0, Math.min(99, Math.floor((1 - remaining / Math.max(totalDist, 0.1)) * 100)));
  return progress;
}

const surveillanceTemplates: MsgTemplate[] = [
  (d, m) => `İrtifa / Altitude: ${d.altitude}m | Hız / Speed: ${d.speed}km/h | Gözetleme rotası aktif / Surveillance route active`,
  (d, m) => `Batarya / Battery: %${d.battery.toFixed(1)} (${d.specs.batteryCapacity}mAh) | Kalan / Rem: ~${Math.floor(d.battery / 100 * d.specs.maxFlightTime)}dk`,
  (d, m) => m ? `Gözetleme / Monitor: "${m.title}" | ${m.payment} SOL` : `Devriye beklemede / Patrol standby. Sensörler hazır / Sensors ready.`,
  (d, m) => `HD kamera / cam: aktif / active | Stabilizasyon / Stab: 3-eksen gimbal ✓ | Kayıt / Rec: devam ediyor / in progress`,
  (d, m) => `Plaka okuma sistemi / ALPR: ${Math.random() > 0.5 ? "aktif / active — son tespit / last det: 34ABC" + Math.floor(Math.random() * 100) : "standby"}`,
  (d, m) => m ? `İzleme alanı / Monitor area: ${m.fromLat.toFixed(4)}°N → ${m.toLat.toFixed(4)}°N | Kapsam / Coverage: optimal` : `Alan taraması bekleniyor / Waiting area scan.`,
  (d, m) => `GPS: ${d.lat.toFixed(5)}°N, ${d.lng.toFixed(5)}°E | ${d.specs.model} nominal`,
  (d, m) => `Gece görüşü / Night vision: ${Math.random() > 0.5 ? "aktif / active (IR mod)" : "standby"} | Zoom: ${Math.floor(Math.random() * 20 + 10)}×`,
  (d, m) => `Trafik yoğunluğu / Traffic dens: ${["düşük / low", "orta / medium", "yüksek / high"][Math.floor(Math.random() * 3)]} | Araç sayısı / Vehicles: ${Math.floor(Math.random() * 80 + 20)}`,
  (d, m) => m ? `Görev ilerleme / Mission prog: %${calcProgress(d, m)} tamamlandı / complete` : `Operasyon bekliyor / Op pending.`,
  (d, m) => `Telemetri akışı / Telemetry stream: ${Math.floor(Math.random() * 30 + 10)} fps | Gecikme / Latency: ${Math.floor(Math.random() * 50 + 80)}ms`,
];

function getTemplatesForDrone(drone: DroneAgent): MsgTemplate[] {
  if (drone.status === "charging") return chargingTemplates;
  if (drone.status === "idle") return idleTemplates;

  switch (drone.type) {
    case "cargo": return cargoTemplates;
    case "emergency": return emergencyTemplates;
    case "agricultural": return agriculturalTemplates;
    case "surveillance": return surveillanceTemplates;
    default: return cargoTemplates;
  }
}

function detectLevel(msg: string): LogLevel {
  if (msg.includes("🚨") || msg.includes("KRİTİK") || msg.includes("YÜKSEK")) return "error";
  if (msg.includes("⚠") || msg.includes("DÜŞÜK") || msg.includes("sınırda")) return "warning";
  if (msg.includes("✅") || msg.includes("tamamlandı") || msg.includes("✓")) return "success";
  if (msg.includes("standby") || msg.includes("bekleniyor") || msg.includes("BEKLEME")) return "system";
  return "info";
}

// ═══ ANA SİMÜLASYON SINIFI ═══
export class FlightSimulator {
  private droneOrder: number[];
  private currentIndex = 0;
  private templateIndex: Map<number, number> = new Map(); // Her drone için şablon indexi

  constructor(drones: DroneAgent[]) {
    this.droneOrder = drones.map(d => d.id);
    // Her drone farklı bir şablondan başlasın
    drones.forEach((d, i) => this.templateIndex.set(d.id, i % 3));
  }

  /**
   * Her çağrıda sıradaki drone'dan CANLI mesaj üret.
   * Mesaj drone'un GÜNCEL verilerine göre oluşturulur (cache yok).
   */
  getNextMessage(drones: DroneAgent[]): SimLogEntry {
    // Round-robin: sıradaki drone
    const droneId = this.droneOrder[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.droneOrder.length;

    const drone = drones.find(d => d.id === droneId) || drones[0];
    const mission = initialMissions.find(m => m.id === drone.missionId);
    const templates = getTemplatesForDrone(drone);

    // Bu drone'un sıradaki şablonunu al
    let idx = this.templateIndex.get(drone.id) || 0;
    const template = templates[idx % templates.length];
    this.templateIndex.set(drone.id, idx + 1);

    // CANLI mesaj üret (güncel drone verileriyle)
    const msg = template(drone, mission);

    return {
      droneId: drone.id,
      droneName: drone.name,
      level: detectLevel(msg),
      msg,
      timestamp: new Date(),
    };
  }
}
