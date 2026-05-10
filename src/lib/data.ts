// İzmir merkezli gerçek drone verileri — NeuralAir SkyAgent Protocol
export type DroneStatus = "idle" | "in-flight" | "charging" | "emergency" | "mission";
export type DroneType = "cargo" | "agricultural" | "surveillance" | "emergency";
export type MissionType = "cargo" | "agricultural" | "fire" | "traffic";

export interface DroneSpecs {
  model: string;           // Gerçek üretici model adı
  manufacturer: string;    // Üretici firma
  maxSpeed: number;        // km/h — üretici datası
  maxAltitude: number;     // metre — yasal/teknik max
  batteryCapacity: number; // mAh
  weightEmpty: number;     // gram — boş ağırlık (MTOW değil)
  maxPayload: number;      // gram — taşıyabileceği max yük
  maxFlightTime: number;   // dakika — yüksüz ideal uçuş
  chargeTime: number;      // dakika — 0→100% şarj
  pricePerKm: number;      // SOL — km başına görev ücreti
  license: string;         // SHGM uçuş izin kategorisi
  sensors: string[];       // Sensör donanımı
}

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
  specs: DroneSpecs;
  targetLat?: number;
  targetLng?: number;
}

export interface ChargingPod {
  id: number;
  name: string;
  owner: string;
  lat: number;
  lng: number;
  rate: number; // SOL per kWh
  available: boolean;
  totalEnergy: number; // kWh supplied
  totalEarned: number; // SOL earned
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
  payment: number; // SOL
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

// ═══════════════════════════════════════════════════════════
// 15 GERÇEK AGENT DRONE — Her biri bağımsız otonom ajan
// ═══════════════════════════════════════════════════════════
export const initialDrones: DroneAgent[] = [
  // ── AKTİF UÇUŞTA (5 drone) ──
  {
    id: 1, name: "Ege-01", type: "cargo",
    lat: 38.4237, lng: 27.1428, altitude: 20, battery: 87, speed: 45, heading: 45,
    status: "in-flight", reputation: 92, missionId: 1,
    personality: "Fast & reliable cargo delivery — Izmir urban express",
    specs: {
      model: "Matrice 350 RTK", manufacturer: "DJI",
      maxSpeed: 82, maxAltitude: 7000, batteryCapacity: 5880,
      weightEmpty: 6470, maxPayload: 2700, maxFlightTime: 55, chargeTime: 52,
      pricePerKm: 0.12, license: "SHT-IHA2",
      sensors: ["RTK GPS", "FPV Camera", "CSM Radar", "ADS-B"],
    },
  },
  {
    id: 2, name: "Bayrakli-02", type: "emergency",
    lat: 38.4600, lng: 27.1650, altitude: 180, battery: 95, speed: 60, heading: 315,
    status: "in-flight", reputation: 99, missionId: 4,
    personality: "Emergency response — fire detection and SAR specialist",
    specs: {
      model: "Matrice 30T", manufacturer: "DJI",
      maxSpeed: 82, maxAltitude: 7000, batteryCapacity: 3850,
      weightEmpty: 3770, maxPayload: 230, maxFlightTime: 41, chargeTime: 35,
      pricePerKm: 0.15, license: "SHT-IHA2",
      sensors: ["Thermal 640×512", "Zoom 48MP", "Laser Range", "Speaker", "Spotlight"],
    },
  },
  {
    id: 3, name: "Cesme-03", type: "agricultural",
    lat: 38.3230, lng: 26.3050, altitude: 40, battery: 72, speed: 35, heading: 200,
    status: "mission", reputation: 90, missionId: 5,
    personality: "Vineyard & orchard specialist — precision spraying and irrigation",
    specs: {
      model: "Agras T40", manufacturer: "DJI",
      maxSpeed: 54, maxAltitude: 3000, batteryCapacity: 30000,
      weightEmpty: 28500, maxPayload: 50000, maxFlightTime: 21, chargeTime: 12,
      pricePerKm: 0.25, license: "SHT-IHA2",
      sensors: ["Phased Array Radar", "Dual Atomizer", "Terrain Follow", "RTK"],
    },
  },
  {
    id: 4, name: "Urla-04", type: "cargo",
    lat: 38.3220, lng: 26.7650, altitude: 110, battery: 43, speed: 40, heading: 350,
    status: "in-flight", reputation: 82, missionId: 2,
    personality: "Long-range VTOL courier — rural delivery specialist",
    specs: {
      model: "Dragonfish Standard", manufacturer: "Autel Robotics",
      maxSpeed: 108, maxAltitude: 5000, batteryCapacity: 9800,
      weightEmpty: 7500, maxPayload: 1000, maxFlightTime: 158, chargeTime: 70,
      pricePerKm: 0.10, license: "SHT-IHA2",
      sensors: ["50MP Wide", "Zoom 640", "Thermal", "VTOL Hybrid", "ADS-B"],
    },
  },
  {
    id: 5, name: "Sentinel-05", type: "emergency",
    lat: 38.5000, lng: 27.0200, altitude: 300, battery: 98, speed: 0, heading: 225,
    status: "in-flight", reputation: 100, missionId: null,
    personality: "24/7 fire watch — thermal monitoring and early warning",
    specs: {
      model: "Matrice 350 RTK", manufacturer: "DJI",
      maxSpeed: 82, maxAltitude: 7000, batteryCapacity: 5880,
      weightEmpty: 6470, maxPayload: 2700, maxFlightTime: 55, chargeTime: 52,
      pricePerKm: 0.15, license: "SHT-IHA2",
      sensors: ["Zenmuse H20N", "Night Vision", "Thermal 640", "Laser 1200m", "Speaker"],
    },
  },

  // ── IDLE / STANDBY ──
  {
    id: 6, name: "Konak-06", type: "cargo",
    lat: 38.4185, lng: 27.1290, altitude: 80, battery: 76, speed: 35, heading: 45,
    status: "in-flight", reputation: 88, missionId: 6,
    personality: "Compact urban courier — narrow street and balcony delivery expert",
    specs: {
      model: "Mini 4 Pro", manufacturer: "DJI",
      maxSpeed: 57, maxAltitude: 4000, batteryCapacity: 3850,
      weightEmpty: 249, maxPayload: 500, maxFlightTime: 45, chargeTime: 56,
      pricePerKm: 0.08, license: "SHT-IHA0",
      sensors: ["APAS 5.0", "4K Camera", "GPS L1+L5", "Downward Vision"],
    },
  },
  {
    id: 7, name: "Bornova-07", type: "cargo",
    lat: 38.4690, lng: 27.2150, altitude: 45, battery: 65, speed: 25, heading: 120,
    status: "mission", reputation: 85, missionId: 7,
    personality: "University campus delivery drone — Ege University area",
    specs: {
      model: "Air 3", manufacturer: "DJI",
      maxSpeed: 75, maxAltitude: 6000, batteryCapacity: 4241,
      weightEmpty: 720, maxPayload: 800, maxFlightTime: 46, chargeTime: 60,
      pricePerKm: 0.09, license: "SHT-IHA0",
      sensors: ["Dual Camera", "APAS 5.0", "ADS-B", "RTK GPS"],
    },
  },
  {
    id: 8, name: "Karsiyaka-08", type: "surveillance",
    lat: 38.4560, lng: 27.1100, altitude: 110, battery: 82, speed: 60, heading: 270,
    status: "in-flight", reputation: 95, missionId: null,
    personality: "Coast guard surveillance — Karsiyaka coast line monitoring",
    specs: {
      model: "Mavic 3 Enterprise", manufacturer: "DJI",
      maxSpeed: 75, maxAltitude: 6000, batteryCapacity: 5000,
      weightEmpty: 920, maxPayload: 0, maxFlightTime: 45, chargeTime: 60,
      pricePerKm: 0.11, license: "SHT-IHA1",
      sensors: ["56× Zoom", "Thermal 640×512", "RTK", "Speaker", "Spotlight"],
    },
  },

  // ── CHARGING ──
  {
    id: 9, name: "Narlidere-09", type: "cargo",
    lat: 38.3910, lng: 27.0580, altitude: 0, battery: 35, speed: 0, heading: 0,
    status: "charging", reputation: 78, missionId: null,
    personality: "Heavy lifter — industrial materials and construction delivery",
    specs: {
      model: "FlyCart 30", manufacturer: "DJI",
      maxSpeed: 67, maxAltitude: 6000, batteryCapacity: 17668,
      weightEmpty: 42000, maxPayload: 30000, maxFlightTime: 18, chargeTime: 25,
      pricePerKm: 0.35, license: "SHT-IHA2",
      sensors: ["RTK GPS", "Obstacle Sensing 360°", "ADS-B", "Parachute"],
    },
  },
  {
    id: 10, name: "Gaziemir-10", type: "emergency",
    lat: 38.3180, lng: 27.1350, altitude: 0, battery: 22, speed: 0, heading: 0,
    status: "charging", reputation: 91, missionId: null,
    personality: "Airport perimeter emergency response — accident detection",
    specs: {
      model: "EVO II Dual 640T V3", manufacturer: "Autel Robotics",
      maxSpeed: 72, maxAltitude: 7000, batteryCapacity: 7100,
      weightEmpty: 1350, maxPayload: 0, maxFlightTime: 42, chargeTime: 55,
      pricePerKm: 0.14, license: "SHT-IHA1",
      sensors: ["Thermal 640×512", "8K Camera", "PDAF", "Obstacle Avoidance 360°"],
    },
  },
  {
    id: 11, name: "Menemen-11", type: "agricultural",
    lat: 38.6100, lng: 27.0690, altitude: 0, battery: 55, speed: 0, heading: 0,
    status: "charging", reputation: 86, missionId: null,
    personality: "Plain agriculture expert — large scale spraying & seeding",
    specs: {
      model: "Agras T25", manufacturer: "DJI",
      maxSpeed: 46, maxAltitude: 3000, batteryCapacity: 24000,
      weightEmpty: 21500, maxPayload: 25000, maxFlightTime: 17, chargeTime: 10,
      pricePerKm: 0.22, license: "SHT-IHA2",
      sensors: ["Phased Array Radar", "Centrifugal Atomizer", "Terrain Follow", "RTK"],
    },
  },

  // ── IDLE / MISC ──
  {
    id: 12, name: "Balcova-12", type: "surveillance",
    lat: 38.3880, lng: 27.0410, altitude: 90, battery: 88, speed: 40, heading: 135,
    status: "in-flight", reputation: 93, missionId: 8,
    personality: "Traffic monitoring — highway intersection analysis, plate detection",
    specs: {
      model: "Matrice 30", manufacturer: "DJI",
      maxSpeed: 82, maxAltitude: 7000, batteryCapacity: 3850,
      weightEmpty: 3770, maxPayload: 230, maxFlightTime: 41, chargeTime: 35,
      pricePerKm: 0.13, license: "SHT-IHA2",
      sensors: ["Zoom 48MP", "FPV Camera", "Laser Range 1200m", "ADS-B"],
    },
  },
  {
    id: 13, name: "Guzelbahce-13", type: "agricultural",
    lat: 38.3730, lng: 26.8780, altitude: 0, battery: 98, speed: 0, heading: 0,
    status: "idle", reputation: 87, missionId: null,
    personality: "Olive grove & citrus expert — precision fertilization and mapping",
    specs: {
      model: "Agras T40", manufacturer: "DJI",
      maxSpeed: 54, maxAltitude: 3000, batteryCapacity: 30000,
      weightEmpty: 28500, maxPayload: 50000, maxFlightTime: 21, chargeTime: 12,
      pricePerKm: 0.25, license: "SHT-IHA2",
      sensors: ["Phased Array Radar", "Dual Atomizer", "Terrain Follow", "RTK", "Multispectral"],
    },
  },
  {
    id: 14, name: "Foca-14", type: "surveillance",
    lat: 38.6690, lng: 26.7530, altitude: 0, battery: 92, speed: 0, heading: 0,
    status: "idle", reputation: 96, missionId: null,
    personality: "Coastal surveillance — illegal structure and fishery inspection",
    specs: {
      model: "Mavic 3T", manufacturer: "DJI",
      maxSpeed: 75, maxAltitude: 6000, batteryCapacity: 5000,
      weightEmpty: 920, maxPayload: 0, maxFlightTime: 45, chargeTime: 60,
      pricePerKm: 0.12, license: "SHT-IHA1",
      sensors: ["48MP Wide", "Thermal 640×512", "56× Zoom", "RTK", "ADS-B"],
    },
  },
  {
    id: 15, name: "Torbali-15", type: "cargo",
    lat: 38.1560, lng: 27.3580, altitude: 0, battery: 88, speed: 0, heading: 0,
    status: "idle", reputation: 80, missionId: null,
    personality: "Rural logistics — farm-to-market organic goods transport",
    specs: {
      model: "Dragonfish Standard", manufacturer: "Autel Robotics",
      maxSpeed: 108, maxAltitude: 5000, batteryCapacity: 9800,
      weightEmpty: 7500, maxPayload: 1000, maxFlightTime: 158, chargeTime: 70,
      pricePerKm: 0.10, license: "SHT-IHA2",
      sensors: ["50MP Wide", "Zoom 640", "Thermal", "VTOL Hybrid", "ADS-B"],
    },
  },
];

// ── ŞARJ PODLARI ──
export const initialPods: ChargingPod[] = [
  { id: 1, name: "Alsancak Hub", owner: "0x7a3F...b8eD", lat: 38.4350, lng: 27.1420, rate: 0.05, available: true, totalEnergy: 1250, totalEarned: 62.5, activeSessions: 0 },
  { id: 2, name: "Bornova Tech", owner: "0x9dE3...c7B2", lat: 38.4650, lng: 27.2100, rate: 0.055, available: true, totalEnergy: 1540, totalEarned: 84.7, activeSessions: 0 },
  { id: 3, name: "Bayraklı Tower", owner: "0x5cB2...a3F1", lat: 38.4580, lng: 27.1700, rate: 0.06, available: true, totalEnergy: 2100, totalEarned: 126, activeSessions: 0 },
  { id: 4, name: "Çeşme Coastal", owner: "0x8eD4...b9C3", lat: 38.3200, lng: 26.3100, rate: 0.07, available: true, totalEnergy: 450, totalEarned: 31.5, activeSessions: 0 },
  { id: 5, name: "Urla Garden", owner: "0x3aF7...d2E8", lat: 38.3250, lng: 26.7700, rate: 0.05, available: true, totalEnergy: 620, totalEarned: 31, activeSessions: 0 },
];

// ── GÖREVLER ──
export const initialMissions: Mission[] = [
  { id: 1, type: "cargo", title: "Alsancak → Bornova Package", description: "3.2kg e-commerce delivery", fromLat: 38.4350, fromLng: 27.1420, toLat: 38.4700, toLng: 27.2200, payment: 2.5, status: "in-progress", droneId: 1, createdAt: new Date(), priority: false },
  { id: 2, type: "cargo", title: "Urla → Karsiyaka Meds", description: "Emergency medical delivery — pharmacy order", fromLat: 38.3220, fromLng: 26.7650, toLat: 38.4560, toLng: 27.1100, payment: 5.8, status: "in-progress", droneId: 4, createdAt: new Date(), priority: true },
  { id: 3, type: "cargo", title: "Torbali → Buca Express", description: "Fresh produce express delivery", fromLat: 38.1500, fromLng: 27.3600, toLat: 38.3800, toLng: 27.1800, payment: 5.2, status: "open", droneId: null, createdAt: new Date(), priority: false },
  { id: 4, type: "fire", title: "Yamanlar Fire Response", description: "Forest fire detection and water supply coordination", fromLat: 38.5200, fromLng: 27.1000, toLat: 38.5400, toLng: 27.0800, payment: 15, status: "in-progress", droneId: 2, createdAt: new Date(), priority: true },
  { id: 5, type: "agricultural", title: "Cesme Vineyard Spraying", description: "Pest control spraying for 25 acre vineyard", fromLat: 38.3230, fromLng: 26.3050, toLat: 38.3280, toLng: 26.3150, payment: 8.5, status: "in-progress", droneId: 3, createdAt: new Date(), priority: false },
];

// ── UÇUŞ KAYITLARI ──
export const initialFlightLogs: FlightLog[] = [
  { id: 1, droneId: "1", droneName: "Ege-01", startLat: 38.4237, startLng: 27.1428, endLat: 38.4700, endLng: 27.2200, duration: 12, energyUsed: 8.5, missionType: "cargo", txHash: "0xabc1...def1", timestamp: new Date(Date.now() - 3600000) },
  { id: 2, droneId: "2", droneName: "Bayraklı-02", startLat: 38.4600, startLng: 27.1650, endLat: 38.5200, endLng: 27.1000, duration: 15, energyUsed: 12.1, missionType: "fire", txHash: "0xabc2...def2", timestamp: new Date(Date.now() - 7200000) },
  { id: 3, droneId: "3", droneName: "Çeşme-03", startLat: 38.3230, startLng: 26.3050, endLat: 38.3280, endLng: 26.3150, duration: 45, energyUsed: 18.7, missionType: "agricultural", txHash: "0xabc3...def3", timestamp: new Date(Date.now() - 10800000) },
  { id: 4, droneId: "4", droneName: "Urla-04", startLat: 38.3220, startLng: 26.7650, endLat: 38.4560, endLng: 27.1100, duration: 38, energyUsed: 22.3, missionType: "cargo", txHash: "0xabc4...def4", timestamp: new Date(Date.now() - 14400000) },
  { id: 5, droneId: "5", droneName: "Sentinel-05", startLat: 38.5000, startLng: 27.0200, endLat: 38.5300, endLng: 27.0500, duration: 25, energyUsed: 15.6, missionType: "fire", txHash: "0xabc5...def5", timestamp: new Date(Date.now() - 18000000) },
];

// ── agentMessages — eski, artık simulation.ts motoru kullanılıyor ──
export const agentMessages: { droneId: number; level: "info" | "success" | "warning" | "error"; msg: string }[] = [];

// ── Util: Rastgele TX hash üret ──
export function randomTxHash(): string {
  const chars = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 8; i++) h += chars[Math.floor(Math.random() * 16)];
  h += "...";
  for (let i = 0; i < 4; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

export const droneTypeLabels = (locale: string = "en"): Record<DroneType, string> => ({
  cargo: "Cargo",
  agricultural: "Agriculture",
  surveillance: "Surveillance",
  emergency: "Emergency",
});

export const missionTypeLabels = (locale: string = "en"): Record<MissionType, string> => ({
  cargo: "Cargo Delivery",
  agricultural: "Agriculture Op",
  fire: "Fire Response",
  traffic: "Traffic Monitor",
});

export const statusLabels = (locale: string = "en"): Record<DroneStatus, string> => ({
  idle: "Standby",
  "in-flight": "In Flight",
  charging: "Charging",
  emergency: "Emergency",
  mission: "On Mission",
});

export const missionStatusLabels = (locale: string = "en"): Record<string, string> => ({
  open: "Open",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
});

// ═══ HAVA SAHASI ENGELLERİ ═══
export type ObstacleType = "bird_flock" | "balloon" | "drone_traffic" | "no_fly_zone" | "weather" | "paraglider";

export interface AirspaceObstacle {
  id: number;
  type: ObstacleType;
  name: string;
  lat: number;
  lng: number;
  radius: number;      // metre — etki yarıçapı
  altitude: number;    // metre
  altitudeMax: number;  // metre — max yükseklik
  severity: "low" | "medium" | "high";
  moving: boolean;     // hareket ediyor mu
  speedKmh: number;    // hareket hızı
  heading: number;     // hareket yönü
  description: string;
  detectedBy?: number; // hangi drone tespit etti (id)
}

export const obstacleTypeLabels: Record<ObstacleType, string> = {
  bird_flock: "Bird Flock",
  balloon: "Hot Air Balloon",
  drone_traffic: "Drone Traffic",
  no_fly_zone: "No Fly Zone",
  weather: "Severe Weather",
  paraglider: "Paraglider",
};

export const obstacleIcons: Record<ObstacleType, string> = {
  bird_flock: "🐦",
  balloon: "🎈",
  drone_traffic: "🛸",
  no_fly_zone: "🚫",
  weather: "⛈️",
  paraglider: "🪂",
};

export const initialObstacles: AirspaceObstacle[] = [
  {
    id: 101, type: "bird_flock", name: "Flamingo Flock",
    lat: 38.4450, lng: 27.1300, radius: 300, altitude: 80, altitudeMax: 200,
    severity: "medium", moving: true, speedKmh: 25, heading: 180,
    description: "~200 flamingos migrating south. Over Izmir Bay.",
  },
  {
    id: 102, type: "balloon", name: "Advertising Balloon",
    lat: 38.4200, lng: 27.1500, radius: 50, altitude: 150, altitudeMax: 200,
    severity: "low", moving: false, speedKmh: 0, heading: 0,
    description: "Tethered balloon over Konak square. Fixed position.",
  },
  {
    id: 103, type: "drone_traffic", name: "Unknown Drone",
    lat: 38.4530, lng: 27.1800, radius: 100, altitude: 120, altitudeMax: 150,
    severity: "medium", moving: true, speedKmh: 40, heading: 90,
    description: "Unregistered drone detected — no IFF response. Bornova area.",
  },
  {
    id: 104, type: "no_fly_zone", name: "Military Zone",
    lat: 38.4700, lng: 27.0100, radius: 800, altitude: 0, altitudeMax: 5000,
    severity: "high", moving: false, speedKmh: 0, heading: 0,
    description: "NATO Izmir HQ — permanent no fly zone.",
  },
  {
    id: 105, type: "weather", name: "High Winds",
    lat: 38.3900, lng: 27.0800, radius: 500, altitude: 0, altitudeMax: 300,
    severity: "medium", moving: true, speedKmh: 15, heading: 270,
    description: "Strong westerly winds > 45km/h. Dangerous for light drones.",
  },
  {
    id: 106, type: "paraglider", name: "Paraglider",
    lat: 38.3500, lng: 26.4000, radius: 200, altitude: 200, altitudeMax: 600,
    severity: "low", moving: true, speedKmh: 30, heading: 150,
    description: "Paraglider activity detected off Cesme coast.",
  },
  {
    id: 107, type: "bird_flock", name: "Seagull Colony",
    lat: 38.4100, lng: 27.1350, radius: 200, altitude: 30, altitudeMax: 100,
    severity: "low", moving: true, speedKmh: 15, heading: 45,
    description: "Dense seagull population around Alsancak port.",
  },
];
