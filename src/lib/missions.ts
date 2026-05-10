/**
 * NeuralAir — Görev Havuzu (Mission Pool)
 * 
 * 50+ görev, 4 kategoriye ayrılmış.
 * Sistem açılınca 5 tanesi aktif, geri kalanı havuzda bekler.
 * Bir görev tamamlandığında havuzdan uygun tipte yeni görev çekilir.
 */

import { Mission, MissionType } from "./data";

// İzmir bölgesi koordinatları (gerçek lokasyonlar)
const locations: Record<string, [number, number]> = {
  alsancak: [38.4350, 27.1420],
  bornova: [38.4700, 27.2200],
  karsiyaka: [38.4560, 27.1100],
  konak: [38.4185, 27.1290],
  buca: [38.3800, 27.1800],
  bayrakli: [38.4600, 27.1650],
  cigli: [38.5100, 27.0600],
  narlidere: [38.3910, 27.0580],
  balcova: [38.3880, 27.0410],
  gaziemir: [38.3180, 27.1350],
  torbali: [38.1560, 27.3580],
  urla: [38.3220, 27.7650],
  cesme: [38.3230, 26.3050],
  menemen: [38.6100, 27.0690],
  guzelbahce: [38.3730, 26.8780],
  foca: [38.6690, 26.7530],
  seferihisar: [38.1980, 26.8400],
  kemalpasa: [38.4290, 27.4200],
  odemis: [38.2290, 27.9700],
  bergama: [39.1200, 27.1800],
  // Kampüs & özel noktalar
  egeUni: [38.4590, 27.2270],
  dokuzEylul: [38.3650, 27.2100],
  havaalani: [38.2920, 27.1560],
  liman: [38.4400, 27.1450],
  otogar: [38.4130, 27.1580],
};

// ═══ KARGO GÖREVLERİ (15+) ═══
const cargoMissions: Omit<Mission, "id" | "createdAt" | "status" | "droneId">[] = [
  {
    type: "cargo", title: "Alsancak → Bornova Express",
    description: "2.1kg e-commerce package — standard delivery",
    fromLat: locations.alsancak[0], fromLng: locations.alsancak[1],
    toLat: locations.bornova[0], toLng: locations.bornova[1],
    payment: 2.5, priority: false,
  },
  {
    type: "cargo", title: "Konak → Karşıyaka Medicine",
    description: "Emergency medicine delivery — pharmacy order, fragile",
    fromLat: locations.konak[0], fromLng: locations.konak[1],
    toLat: locations.karsiyaka[0], toLng: locations.karsiyaka[1],
    payment: 4.2, priority: true,
  },
  {
    type: "cargo", title: "Bornova → Buca Food",
    description: "Hot food delivery — 3.5kg, handle with care",
    fromLat: locations.bornova[0], fromLng: locations.bornova[1],
    toLat: locations.buca[0], toLng: locations.buca[1],
    payment: 1.8, priority: false,
  },
  {
    type: "cargo", title: "Havalimanı → Alsancak Document",
    description: "Official document delivery — signature required",
    fromLat: locations.havaalani[0], fromLng: locations.havaalani[1],
    toLat: locations.alsancak[0], toLng: locations.alsancak[1],
    payment: 3.5, priority: true,
  },
  {
    type: "cargo", title: "Ege Üni → Bayraklı Lab",
    description: "Lab samples — sensitive material, 0.8kg",
    fromLat: locations.egeUni[0], fromLng: locations.egeUni[1],
    toLat: locations.bayrakli[0], toLng: locations.bayrakli[1],
    payment: 5.0, priority: true,
  },
  {
    type: "cargo", title: "Liman → Gaziemir Warehouse",
    description: "Customs doc and sample transport — 1.2kg",
    fromLat: locations.liman[0], fromLng: locations.liman[1],
    toLat: locations.gaziemir[0], toLng: locations.gaziemir[1],
    payment: 2.8, priority: false,
  },
  {
    type: "cargo", title: "Narlıdere → Balçova Pharmacy",
    description: "Prescription delivery — cold chain, urgent",
    fromLat: locations.narlidere[0], fromLng: locations.narlidere[1],
    toLat: locations.balcova[0], toLng: locations.balcova[1],
    payment: 3.0, priority: true,
  },
  {
    type: "cargo", title: "Torbalı → Kemalpaşa Yedek Spare Parts",
    description: "Industrial spare parts — 4.5kg, non-fragile",
    fromLat: locations.torbali[0], fromLng: locations.torbali[1],
    toLat: locations.kemalpasa[0], toLng: locations.kemalpasa[1],
    payment: 3.2, priority: false,
  },
  {
    type: "cargo", title: "Çiğli → Menemen Post",
    description: "Postal delivery — standard package, 1.5kg",
    fromLat: locations.cigli[0], fromLng: locations.cigli[1],
    toLat: locations.menemen[0], toLng: locations.menemen[1],
    payment: 1.5, priority: false,
  },
  {
    type: "cargo", title: "Konak → Otogar Luggage",
    description: "Passenger luggage delivery — 5kg, large package",
    fromLat: locations.konak[0], fromLng: locations.konak[1],
    toLat: locations.otogar[0], toLng: locations.otogar[1],
    payment: 2.0, priority: false,
  },
  {
    type: "cargo", title: "Buca → Gaziemir Electronics",
    description: "Electronics delivery — fragile, insured",
    fromLat: locations.buca[0], fromLng: locations.buca[1],
    toLat: locations.gaziemir[0], toLng: locations.gaziemir[1],
    payment: 4.5, priority: false,
  },
  {
    type: "cargo", title: "Karşıyaka → Bayraklı Groceries",
    description: "Online grocery order — 3kg, cold chain",
    fromLat: locations.karsiyaka[0], fromLng: locations.karsiyaka[1],
    toLat: locations.bayrakli[0], toLng: locations.bayrakli[1],
    payment: 2.2, priority: false,
  },
  {
    type: "cargo", title: "Urla → Seferihisar Organic",
    description: "Organic farm products — 2.8kg, fresh delivery",
    fromLat: locations.urla[0], fromLng: locations.urla[1],
    toLat: locations.seferihisar[0], toLng: locations.seferihisar[1],
    payment: 3.8, priority: false,
  },
  {
    type: "cargo", title: "Alsancak → Konak Clothing",
    description: "Online clothing order — light package, 0.5kg",
    fromLat: locations.alsancak[0], fromLng: locations.alsancak[1],
    toLat: locations.konak[0], toLng: locations.konak[1],
    payment: 1.2, priority: false,
  },
  {
    type: "cargo", title: "Dokuz Eylül → Buca Books",
    description: "University books — 3.2kg, standard delivery",
    fromLat: locations.dokuzEylul[0], fromLng: locations.dokuzEylul[1],
    toLat: locations.buca[0], toLng: locations.buca[1],
    payment: 1.6, priority: false,
  },
];

// ═══ ZİRAAT GÖREVLERİ (12+) ═══
const agriculturalMissions: Omit<Mission, "id" | "createdAt" | "status" | "droneId">[] = [
  {
    type: "agricultural", title: "Çeşme Bağ Vineyard Spraying",
    description: "25 decares vineyard pest spraying — sulfur based",
    fromLat: 38.3230, fromLng: 26.3050,
    toLat: 38.3280, toLng: 26.3150,
    payment: 8.5, priority: false,
  },
  {
    type: "agricultural", title: "Menemen Ova Field Irrigation",
    description: "40 decares cotton field — drip irrigation control",
    fromLat: 38.6050, fromLng: 27.0600,
    toLat: 38.6150, toLng: 27.0800,
    payment: 6.0, priority: false,
  },
  {
    type: "agricultural", title: "Güzelbahçe Zeytin Olive Fertilizing",
    description: "15 decares olive grove — organic fertilizer distribution",
    fromLat: 38.3700, fromLng: 26.8700,
    toLat: 38.3760, toLng: 26.8850,
    payment: 7.5, priority: false,
  },
  {
    type: "agricultural", title: "Torbalı Sera Greenhouse Scan",
    description: "Greenhouse multispectral mapping — disease detection",
    fromLat: 38.1500, fromLng: 27.3500,
    toLat: 38.1580, toLng: 27.3650,
    payment: 10.0, priority: false,
  },
  {
    type: "agricultural", title: "Urla Narenciye Citrus Spraying",
    description: "30 decares citrus orchard — medfly spraying",
    fromLat: 38.3180, fromLng: 26.7600,
    toLat: 38.3250, toLng: 26.7720,
    payment: 9.0, priority: true,
  },
  {
    type: "agricultural", title: "Kemalpaşa Kiraz Cherry Orchard",
    description: "20 decares cherry orchard — early warning sensor scan",
    fromLat: 38.4250, fromLng: 27.4150,
    toLat: 38.4320, toLng: 27.4280,
    payment: 7.0, priority: false,
  },
  {
    type: "agricultural", title: "Ödemiş Tütün Tobacco Field",
    description: "50 decares tobacco field — leaf quality drone scan",
    fromLat: 38.2250, fromLng: 27.9650,
    toLat: 38.2350, toLng: 27.9800,
    payment: 12.0, priority: false,
  },
  {
    type: "agricultural", title: "Bergama Pamuk Cotton Field",
    description: "35 decares cotton field — pre-harvest NDVI scan",
    fromLat: 39.1150, fromLng: 27.1750,
    toLat: 39.1280, toLng: 27.1900,
    payment: 11.0, priority: false,
  },
  {
    type: "agricultural", title: "Seferihisar Tangerine",
    description: "18 decares tangerine orchard — irrigation optimization",
    fromLat: 38.1930, fromLng: 26.8350,
    toLat: 38.2010, toLng: 26.8450,
    payment: 6.5, priority: false,
  },
  {
    type: "agricultural", title: "Menemen Buğday Wheat Seeding",
    description: "60 decares wheat field — seed distribution operation",
    fromLat: 38.6000, fromLng: 27.0550,
    toLat: 38.6200, toLng: 27.0850,
    payment: 15.0, priority: false,
  },
  {
    type: "agricultural", title: "Çeşme Lavanta Lavender Field",
    description: "10 decares lavender — harvest time analysis and photography",
    fromLat: 38.3150, fromLng: 26.2900,
    toLat: 38.3200, toLng: 26.2980,
    payment: 5.0, priority: false,
  },
  {
    type: "agricultural", title: "Foça Enginar Artichoke Field",
    description: "22 decares artichoke — leaf disease detection",
    fromLat: 38.6650, fromLng: 26.7480,
    toLat: 38.6720, toLng: 26.7580,
    payment: 7.8, priority: false,
  },
];

// ═══ YANGIN / ACİL DURUM GÖREVLERİ (12+) ═══
const fireMissions: Omit<Mission, "id" | "createdAt" | "status" | "droneId">[] = [
  {
    type: "fire", title: "Yamanlar Yangın Fire Detection",
    description: "Forest fire early warning — thermal scan",
    fromLat: 38.5200, fromLng: 27.1000,
    toLat: 38.5400, toLng: 27.0800,
    payment: 15.0, priority: true,
  },
  {
    type: "fire", title: "Bornova Orman Forest Patrol",
    description: "Routine thermal patrol — high fire risk zone",
    fromLat: 38.4800, fromLng: 27.2300,
    toLat: 38.4950, toLng: 27.2100,
    payment: 8.0, priority: false,
  },
  {
    type: "fire", title: "Nif Dağı Nif Mountain Monitoring",
    description: "Nif Mountain — summer fire watch",
    fromLat: 38.4400, fromLng: 27.3800,
    toLat: 38.4550, toLng: 27.4000,
    payment: 10.0, priority: false,
  },
  {
    type: "fire", title: "Çeşme Makilik Shrubland Scan",
    description: "Coastal shrubland — high wind risk",
    fromLat: 38.3100, fromLng: 26.2800,
    toLat: 38.3250, toLng: 26.3100,
    payment: 12.0, priority: true,
  },
  {
    type: "fire", title: "Bayraklı Sanayi Industry Check",
    description: "Industrial zone fire risk scan — chemical plant",
    fromLat: 38.4650, fromLng: 27.1700,
    toLat: 38.4700, toLng: 27.1800,
    payment: 9.0, priority: false,
  },
  {
    type: "fire", title: "Foça Orman Forest Protection",
    description: "Foça natural protected area — illegal fire detection",
    fromLat: 38.6600, fromLng: 26.7400,
    toLat: 38.6750, toLng: 26.7600,
    payment: 11.0, priority: false,
  },
  {
    type: "fire", title: "Gaziemir Havalimanı Airport Perimeter",
    description: "Smoke/fire early warning near airport",
    fromLat: 38.2900, fromLng: 27.1400,
    toLat: 38.3050, toLng: 27.1600,
    payment: 14.0, priority: true,
  },
  {
    type: "fire", title: "Menemen Ova Anız Stubble Fire",
    description: "Post-harvest stubble burning detection — environmental violation",
    fromLat: 38.5900, fromLng: 27.0500,
    toLat: 38.6100, toLng: 27.0750,
    payment: 7.0, priority: false,
  },
  {
    type: "fire", title: "Balçova Termal Thermal Anomaly",
    description: "Geothermal zone thermal scan — temperature map",
    fromLat: 38.3850, fromLng: 27.0350,
    toLat: 38.3920, toLng: 27.0450,
    payment: 8.5, priority: false,
  },
  {
    type: "fire", title: "Bergama Antik Alan Ancient Site Protection",
    description: "Fire monitoring around UNESCO heritage site",
    fromLat: 39.1150, fromLng: 27.1700,
    toLat: 39.1250, toLng: 27.1850,
    payment: 13.0, priority: true,
  },
  {
    type: "fire", title: "Urla Sahil Coast Rescue",
    description: "Coast search and rescue coordination",
    fromLat: 38.3150, fromLng: 26.7500,
    toLat: 38.3250, toLng: 26.7650,
    payment: 16.0, priority: true,
  },
  {
    type: "fire", title: "Çiğli Askeri Bölge Military Zone Perimeter",
    description: "Security scan around NATO base",
    fromLat: 38.5000, fromLng: 27.0100,
    toLat: 38.5150, toLng: 27.0300,
    payment: 10.0, priority: false,
  },
];

// ═══ TRAFİK / GÖZETLEME GÖREVLERİ (11+) ═══
const trafficMissions: Omit<Mission, "id" | "createdAt" | "status" | "droneId">[] = [
  {
    type: "traffic", title: "Konak Otoyol Highway Monitoring",
    description: "Izmir-Aydin highway entrance — traffic density analysis",
    fromLat: 38.4100, fromLng: 27.1200,
    toLat: 38.3900, toLng: 27.1400,
    payment: 5.0, priority: false,
  },
  {
    type: "traffic", title: "Bayraklı Kavşak Intersection Analysis",
    description: "Bayrakli bridge intersection — accident risk analysis",
    fromLat: 38.4580, fromLng: 27.1650,
    toLat: 38.4620, toLng: 27.1750,
    payment: 4.5, priority: false,
  },
  {
    type: "traffic", title: "Karşıyaka Sahil Coast Guard",
    description: "Kordon line — illegal fishing and maritime security",
    fromLat: 38.4520, fromLng: 27.1000,
    toLat: 38.4600, toLng: 27.1200,
    payment: 6.0, priority: false,
  },
  {
    type: "traffic", title: "Buca Stadyum Stadium Security",
    description: "Match day stadium perimeter crowd monitoring",
    fromLat: 38.3780, fromLng: 27.1750,
    toLat: 38.3830, toLng: 27.1850,
    payment: 8.0, priority: true,
  },
  {
    type: "traffic", title: "Çeşme Marina Marina Surveillance",
    description: "Marina and port zone — boat traffic monitoring",
    fromLat: 38.3200, fromLng: 26.3000,
    toLat: 38.3250, toLng: 26.3100,
    payment: 5.5, priority: false,
  },
  {
    type: "traffic", title: "Alsancak Liman Port Security",
    description: "Izmir Port perimeter — customs and security scan",
    fromLat: 38.4380, fromLng: 27.1400,
    toLat: 38.4420, toLng: 27.1500,
    payment: 7.0, priority: false,
  },
  {
    type: "traffic", title: "Gaziemir AVM Mall Inspection",
    description: "Mall parking and perimeter security scan",
    fromLat: 38.3150, fromLng: 27.1300,
    toLat: 38.3200, toLng: 27.1400,
    payment: 4.0, priority: false,
  },
  {
    type: "traffic", title: "Foça Sahil Kaçak Illegal Structure",
    description: "Natural protected area — illegal construction detection",
    fromLat: 38.6650, fromLng: 26.7450,
    toLat: 38.6750, toLng: 26.7600,
    payment: 9.0, priority: true,
  },
  {
    type: "traffic", title: "Menemen OSB Industrial Zone",
    description: "Organized industrial zone — environmental pollution detection",
    fromLat: 38.6050, fromLng: 27.0650,
    toLat: 38.6130, toLng: 27.0780,
    payment: 6.5, priority: false,
  },
  {
    type: "traffic", title: "Bornova Üniversite University Campus",
    description: "Ege University campus security patrol",
    fromLat: 38.4550, fromLng: 27.2200,
    toLat: 38.4650, toLng: 27.2300,
    payment: 3.5, priority: false,
  },
  {
    type: "traffic", title: "Çiğli Havalimanı Airport Perimeter",
    description: "Old airport zone — unauthorized drone detection",
    fromLat: 38.5050, fromLng: 27.0150,
    toLat: 38.5150, toLng: 27.0350,
    payment: 7.5, priority: true,
  },
];

// ═══ TÜM GÖREVLERİ BİRLEŞTİR ═══
const allMissionTemplates = [
  ...cargoMissions,
  ...agriculturalMissions,
  ...fireMissions,
  ...trafficMissions,
];

// Görev tipi → uygun drone tipi eşleşmesi
export const missionToDroneType: Record<MissionType, string[]> = {
  cargo: ["cargo"],
  agricultural: ["agricultural"],
  fire: ["emergency"],
  traffic: ["surveillance"],
};

// Havuzdan rastgele görev çek (belirli bir tip veya herhangi)
let missionIdCounter = 100;

export function pickRandomMission(preferType?: MissionType): Mission {
  const pool = preferType
    ? allMissionTemplates.filter(m => m.type === preferType)
    : allMissionTemplates;

  const template = pool[Math.floor(Math.random() * pool.length)];
  missionIdCounter++;

  return {
    ...template,
    id: missionIdCounter,
    status: "open",
    droneId: null,
    createdAt: new Date(),
  };
}

// Başlangıçta açık olacak görevler (havuzdan 8 tane çek)
export function generateInitialOpenMissions(): Mission[] {
  const missions: Mission[] = [];
  const types: MissionType[] = ["cargo", "cargo", "agricultural", "fire", "traffic", "cargo", "agricultural", "fire"];

  types.forEach(type => {
    missions.push(pickRandomMission(type));
  });

  return missions;
}
