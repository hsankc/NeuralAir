// İzmir merkezli mock drone verileri
export type DroneStatus = "idle" | "in-flight" | "charging" | "emergency" | "mission";
export type DroneType = "cargo" | "agricultural" | "surveillance" | "emergency";
export type MissionType = "cargo" | "agricultural" | "fire" | "traffic";

export interface DroneAgent {
  id: number;
  name: string;
  type: DroneType;
  lat: number;
  lng: number;
  altitude: number;
  battery: number;
  speed: number; // km/h
  heading: number; // degrees
  status: DroneStatus;
  reputation: number;
  missionId: number | null;
  personality: string;
  targetLat?: number;
  targetLng?: number;
}

export interface ChargingPod {
  id: number;
  name: string;
  owner: string;
  lat: number;
  lng: number;
  rate: number; // MON per kWh
  available: boolean;
  totalEnergy: number; // kWh supplied
  totalEarned: number; // MON earned
  activeSessions: number;
}

export interface Mission {
  id: number;
  type: MissionType;
  title: string;
  description: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  payment: number; // MON
  status: "open" | "accepted" | "in-progress" | "completed" | "cancelled";
  droneId: number | null;
  createdAt: Date;
  priority: boolean;
}

export interface FlightLog {
  id: number;
  droneId: string;
  droneName: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  duration: number; // minutes
  energyUsed: number; // kWh
  missionType: MissionType;
  txHash: string;
  timestamp: Date;
}

// ── İZMİR MERKEZLİ 15 DRONE ──
export const initialDrones: DroneAgent[] = [
  { id: 1, name: "Ege-01", type: "cargo", lat: 38.4237, lng: 27.1428, altitude: 120, battery: 87, speed: 45, heading: 45, status: "in-flight", reputation: 92, missionId: 1, personality: "Hızlı & verimli" },
  { id: 2, name: "Kordon-02", type: "cargo", lat: 38.4350, lng: 27.1380, altitude: 100, battery: 62, speed: 38, heading: 180, status: "in-flight", reputation: 88, missionId: 2, personality: "Temkinli navigator" },
  { id: 3, name: "Alsancak-03", type: "surveillance", lat: 38.4380, lng: 27.1430, altitude: 200, battery: 75, speed: 30, heading: 270, status: "in-flight", reputation: 95, missionId: null, personality: "Gözlemci" },
  { id: 4, name: "Bornova-04", type: "agricultural", lat: 38.4700, lng: 27.2200, altitude: 50, battery: 34, speed: 0, heading: 0, status: "charging", reputation: 80, missionId: null, personality: "Çiftçi yardımcısı" },
  { id: 5, name: "Karşıyaka-05", type: "cargo", lat: 38.4560, lng: 27.1100, altitude: 150, battery: 91, speed: 50, heading: 90, status: "in-flight", reputation: 96, missionId: 3, personality: "Hız şeytanı" },
  { id: 6, name: "Bayraklı-06", type: "emergency", lat: 38.4600, lng: 27.1650, altitude: 180, battery: 95, speed: 60, heading: 315, status: "in-flight", reputation: 99, missionId: null, personality: "Acil müdahale uzmanı" },
  { id: 7, name: "Konak-07", type: "surveillance", lat: 38.4192, lng: 27.1287, altitude: 250, battery: 55, speed: 25, heading: 135, status: "in-flight", reputation: 85, missionId: null, personality: "Sessiz gözlemci" },
  { id: 8, name: "Balçova-08", type: "cargo", lat: 38.3900, lng: 27.0500, altitude: 100, battery: 18, speed: 20, heading: 60, status: "in-flight", reputation: 78, missionId: null, personality: "Tasarrufçu", targetLat: 38.4100, targetLng: 27.0900 },
  { id: 9, name: "Çeşme-09", type: "agricultural", lat: 38.3230, lng: 26.3050, altitude: 40, battery: 72, speed: 35, heading: 200, status: "mission", reputation: 90, missionId: 5, personality: "Tarla uzmanı" },
  { id: 10, name: "Urla-10", type: "cargo", lat: 38.3220, lng: 26.7650, altitude: 110, battery: 43, speed: 40, heading: 350, status: "in-flight", reputation: 82, missionId: null, personality: "Uzun mesafe kurye" },
  { id: 11, name: "Menemen-11", type: "agricultural", lat: 38.6100, lng: 27.0700, altitude: 30, battery: 88, speed: 28, heading: 110, status: "mission", reputation: 87, missionId: 6, personality: "İlaçlama uzmanı" },
  { id: 12, name: "Torbalı-12", type: "cargo", lat: 38.1500, lng: 27.3600, altitude: 130, battery: 67, speed: 42, heading: 0, status: "in-flight", reputation: 84, missionId: null, personality: "Kurye asistanı" },
  { id: 13, name: "Sentinel-13", type: "emergency", lat: 38.5000, lng: 27.0200, altitude: 300, battery: 98, speed: 70, heading: 225, status: "idle", reputation: 100, missionId: null, personality: "Yangın nöbetçisi" },
  { id: 14, name: "Güzelbahçe-14", type: "surveillance", lat: 38.3700, lng: 26.8900, altitude: 220, battery: 60, speed: 32, heading: 170, status: "in-flight", reputation: 91, missionId: null, personality: "Kıyı gözcüsü" },
  { id: 15, name: "Narlıdere-15", type: "cargo", lat: 38.3950, lng: 27.0100, altitude: 90, battery: 50, speed: 38, heading: 80, status: "idle", reputation: 76, missionId: null, personality: "Yeni pilot" },
];

// ── İZMİR ŞARJ PODLARI ──
export const initialPods: ChargingPod[] = [
  { id: 1, name: "Alsancak Hub", owner: "0x7a3F...b8eD", lat: 38.4350, lng: 27.1420, rate: 0.05, available: true, totalEnergy: 1250, totalEarned: 62.5, activeSessions: 0 },
  { id: 2, name: "Kordon Station", owner: "0x2bC1...4fAa", lat: 38.4280, lng: 27.1350, rate: 0.045, available: true, totalEnergy: 980, totalEarned: 44.1, activeSessions: 1 },
  { id: 3, name: "Bornova Tech", owner: "0x9dE3...c7B2", lat: 38.4650, lng: 27.2100, rate: 0.055, available: true, totalEnergy: 1540, totalEarned: 84.7, activeSessions: 0 },
  { id: 4, name: "Karşıyaka Port", owner: "0x1fA8...eD5c", lat: 38.4550, lng: 27.1050, rate: 0.04, available: true, totalEnergy: 870, totalEarned: 34.8, activeSessions: 0 },
  { id: 5, name: "Bayraklı Tower", owner: "0x5cB2...a3F1", lat: 38.4580, lng: 27.1700, rate: 0.06, available: false, totalEnergy: 2100, totalEarned: 126, activeSessions: 2 },
  { id: 6, name: "Çeşme Coastal", owner: "0x8eD4...b9C3", lat: 38.3200, lng: 26.3100, rate: 0.07, available: true, totalEnergy: 450, totalEarned: 31.5, activeSessions: 0 },
  { id: 7, name: "Urla Garden", owner: "0x3aF7...d2E8", lat: 38.3250, lng: 26.7700, rate: 0.05, available: true, totalEnergy: 620, totalEarned: 31, activeSessions: 0 },
  { id: 8, name: "Menemen Field", owner: "0x6bC9...f1A4", lat: 38.6050, lng: 27.0750, rate: 0.035, available: true, totalEnergy: 1890, totalEarned: 66.15, activeSessions: 0 },
];

// ── GÖREVLER ──
export const initialMissions: Mission[] = [
  { id: 1, type: "cargo", title: "Alsancak → Bornova Paket", description: "3.2kg e-ticaret paketi teslimatı", fromLat: 38.4350, fromLng: 27.1420, toLat: 38.4700, toLng: 27.2200, payment: 2.5, status: "in-progress", droneId: 1, createdAt: new Date(), priority: false },
  { id: 2, type: "cargo", title: "Kordon → Balçova İlaç", description: "Acil ilaç teslimatı - eczane siparişi", fromLat: 38.4280, fromLng: 27.1350, toLat: 38.3900, toLng: 27.0500, payment: 3.8, status: "in-progress", droneId: 2, createdAt: new Date(), priority: true },
  { id: 3, type: "cargo", title: "Karşıyaka → Konak Kargo", description: "Ofis malzemesi teslimatı", fromLat: 38.4560, fromLng: 27.1100, toLat: 38.4192, toLng: 27.1287, payment: 1.8, status: "in-progress", droneId: 5, createdAt: new Date(), priority: false },
  { id: 4, type: "fire", title: "Yamanlar Yangın Müdahalesi", description: "Orman yangını tespiti ve su ikmal koordinasyonu", fromLat: 38.5200, fromLng: 27.1000, toLat: 38.5400, toLng: 27.0800, payment: 15, status: "open", droneId: null, createdAt: new Date(), priority: true },
  { id: 5, type: "agricultural", title: "Çeşme Bağ İlaçlama", description: "25 dönüm üzüm bağı zararlı ilaçlama", fromLat: 38.3230, fromLng: 26.3050, toLat: 38.3280, toLng: 26.3150, payment: 8.5, status: "in-progress", droneId: 9, createdAt: new Date(), priority: false },
  { id: 6, type: "agricultural", title: "Menemen Tarla Sulama", description: "50 dönüm pamuk tarlası kontrollü sulama", fromLat: 38.6100, fromLng: 27.0700, toLat: 38.6150, toLng: 27.0800, payment: 6, status: "in-progress", droneId: 11, createdAt: new Date(), priority: false },
  { id: 7, type: "traffic", title: "Konak Trafik İzleme", description: "Bayram yoğunluğu trafik akış analizi", fromLat: 38.4192, fromLng: 27.1287, toLat: 38.4300, toLng: 27.1500, payment: 4, status: "open", droneId: null, createdAt: new Date(), priority: false },
  { id: 8, type: "cargo", title: "Torbalı → Buca Express", description: "Taze meyve-sebze express teslimat", fromLat: 38.1500, fromLng: 27.3600, toLat: 38.3800, toLng: 27.1800, payment: 5.2, status: "open", droneId: null, createdAt: new Date(), priority: false },
];

// ── UÇUŞ KAYITLARI ──
export const initialFlightLogs: FlightLog[] = [
  { id: 1, droneId: "1", droneName: "Ege-01", startLat: 38.4237, startLng: 27.1428, endLat: 38.4700, endLng: 27.2200, duration: 12, energyUsed: 8.5, missionType: "cargo", txHash: "0xabc1...def1", timestamp: new Date(Date.now() - 3600000) },
  { id: 2, droneId: "5", droneName: "Karşıyaka-05", startLat: 38.4560, startLng: 27.1100, endLat: 38.4192, endLng: 27.1287, duration: 8, energyUsed: 5.2, missionType: "cargo", txHash: "0xabc2...def2", timestamp: new Date(Date.now() - 7200000) },
  { id: 3, droneId: "6", droneName: "Bayraklı-06", startLat: 38.4600, startLng: 27.1650, endLat: 38.5200, endLng: 27.1000, duration: 15, energyUsed: 12.1, missionType: "fire", txHash: "0xabc3...def3", timestamp: new Date(Date.now() - 10800000) },
  { id: 4, droneId: "9", droneName: "Çeşme-09", startLat: 38.3230, startLng: 26.3050, endLat: 38.3280, endLng: 26.3150, duration: 45, energyUsed: 18.7, missionType: "agricultural", txHash: "0xabc4...def4", timestamp: new Date(Date.now() - 14400000) },
  { id: 5, droneId: "3", droneName: "Alsancak-03", startLat: 38.4380, startLng: 27.1430, endLat: 38.4500, endLng: 27.1600, duration: 30, energyUsed: 9.8, missionType: "traffic", txHash: "0xabc5...def5", timestamp: new Date(Date.now() - 18000000) },
  { id: 6, droneId: "11", droneName: "Menemen-11", startLat: 38.6100, startLng: 27.0700, endLat: 38.6150, endLng: 27.0800, duration: 60, energyUsed: 22.3, missionType: "agricultural", txHash: "0xabc6...def6", timestamp: new Date(Date.now() - 21600000) },
  { id: 7, droneId: "2", droneName: "Kordon-02", startLat: 38.4350, startLng: 27.1380, endLat: 38.3900, endLng: 27.0500, duration: 18, energyUsed: 11.4, missionType: "cargo", txHash: "0xabc7...def7", timestamp: new Date(Date.now() - 25200000) },
  { id: 8, droneId: "13", droneName: "Sentinel-13", startLat: 38.5000, startLng: 27.0200, endLat: 38.5300, endLng: 27.0500, duration: 25, energyUsed: 15.6, missionType: "fire", txHash: "0xabc8...def8", timestamp: new Date(Date.now() - 28800000) },
];

// ── AGENT TERMİNAL LOG MESAJLARI ──
export const agentMessages = [
  { droneId: 1, level: "info" as const, msg: "Rota hesaplandı. ETA: 8dk. Enerji yeterli." },
  { droneId: 1, level: "info" as const, msg: "İrtifa: 120m. Rüzgar: 12km/s KB. Rota optimal." },
  { droneId: 8, level: "warning" as const, msg: "⚠ Batarya %18. En yakın pod: Balçova Hub. Yönlendiriliyor..." },
  { droneId: 6, level: "success" as const, msg: "✅ Acil bölge taraması tamamlandı. Tehdit yok." },
  { droneId: 2, level: "info" as const, msg: "Paket teslimat noktasına 2.3km. Alçalma başlatılıyor." },
  { droneId: 5, level: "success" as const, msg: "✅ Kargo teslim edildi. Müşteri onayı bekleniyor..." },
  { droneId: 4, level: "warning" as const, msg: "🔋 Şarj oturumu aktif. Pod: Bornova Tech. %34 → hedef: %95" },
  { droneId: 3, level: "info" as const, msg: "Gözetleme devriyesi. Sektör 7 taranıyor." },
  { droneId: 9, level: "info" as const, msg: "İlaçlama operasyonu: 18/25 dönüm tamamlandı." },
  { droneId: 11, level: "info" as const, msg: "Sulama dağıtımı: Su basıncı optimal. Devam ediyor." },
  { droneId: 13, level: "success" as const, msg: "✅ Yangın nöbeti: Tüm sensörler normal. Sıcaklık: 24°C" },
  { droneId: 7, level: "info" as const, msg: "Konak sahil taraması. Görüntü hash: 0xe3f1...a8b2" },
  { droneId: 10, level: "warning" as const, msg: "⚠ Batarya %43. Urla Garden podu 3.2km uzakta." },
  { droneId: 12, level: "info" as const, msg: "Rota güncellemesi: Torbalı çıkışı, hız: 42km/s" },
  { droneId: 6, level: "error" as const, msg: "🚨 Termal anomali tespit! Koord: 38.52°N, 27.10°E. ATC bildirildi." },
  { droneId: 1, level: "success" as const, msg: "✅ Escrow ödeme serbest bırakıldı. TX: 0x7f2a...c3d1" },
  { droneId: 14, level: "info" as const, msg: "Kıyı güvenlik taraması devam ediyor. Güzelbahçe bölgesi." },
  { droneId: 15, level: "info" as const, msg: "Bekleme modunda. Yeni görev bekleniyor..." },
];

// ── Util: Rastgele TX hash üret ──
export function randomTxHash(): string {
  const chars = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 8; i++) h += chars[Math.floor(Math.random() * 16)];
  h += "...";
  for (let i = 0; i < 4; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

// ── Drone tipi → Türkçe etiket ──
export const droneTypeLabels: Record<DroneType, string> = {
  cargo: "Kargo",
  agricultural: "Ziraat",
  surveillance: "Gözetleme",
  emergency: "Acil Durum",
};

export const missionTypeLabels: Record<MissionType, string> = {
  cargo: "Kargo Teslimatı",
  agricultural: "Ziraat Operasyonu",
  fire: "Yangın Müdahalesi",
  traffic: "Trafik İzleme",
};

export const statusLabels: Record<DroneStatus, string> = {
  idle: "Beklemede",
  "in-flight": "Uçuşta",
  charging: "Şarjda",
  emergency: "Acil Durum",
  mission: "Görevde",
};

export const missionStatusLabels: Record<string, string> = {
  open: "Açık",
  accepted: "Kabul Edildi",
  "in-progress": "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};
