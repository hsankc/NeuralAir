<div align="center">
  <img src="file:///C:/Users/hasan/.gemini/antigravity/brain/8b11d484-88c2-43db-8eea-a9aada513e1d/neuralair_hero_banner_1778249890895.png" alt="NeuralAir Hero Banner" width="100%">
  
  <br>
  <h1>🛸 NeuralAir Protokolü</h1>
  <p><strong>Yapay Zeka Destekli, Solana Tabanlı Merkeziyetsiz Otonom Drone Ağı (DePIN)</strong></p>
  
  [![Solana](https://img.shields.io/badge/Blockchain-Solana-14F195?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
  [![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![AI](https://img.shields.io/badge/AI-OpenAI_GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
  [![Hardware](https://img.shields.io/badge/Hardware-Pixhawk_&_Raspberry_Pi-C51A4A?style=for-the-badge&logo=raspberry-pi&logoColor=white)]()
</div>

<br>

NeuralAir, droneları yalnızca uzaktan kumandalı cihazlar olmaktan çıkarıp, kendi kararlarını alabilen, kendi cüzdanlarına sahip olan ve otonom görevler yaparak **Solana (SOL)** kazanabilen **bağımsız ekonomik aktörlere (Agent)** dönüştürür.

---

## 🌟 Neden NeuralAir? (Problem & Çözüm)

Günümüzde drone operasyonları manuel, hantal ve güvene dayalı sistemlerdir. Bir kargo dronu uçtuğunda kargoyu teslim ettiğinden nasıl emin oluruz? Veya bir drone havada şarjı bittiğinde ne yapar?

**NeuralAir'in Çözümü:**
1. **DePIN (Decentralized Physical Infrastructure):** Her drone fiziksel bir ağ düğümüdür (node).
2. **AI Agent Yönetimi:** Filoyu insanlar değil, *FleetAgent* ve *Dispatcher AI* otonom yönetir.
3. **Escrow Akıllı Kontratları:** Kullanıcı parayı peşin kilitler (Escrow). Drone paketi bıraktığında, sensör bunu kriptografik olarak imzalar ve para drone'un cüzdanına yatar.

---

## 🧠 Yapay Zeka Mimarisi (Multi-Agent System)

Sistemimiz basit bir "if-else" mantığıyla değil, OpenAI GPT-4 tabanlı birbirleriyle konuşan uzman yapay zeka ajanları ile çalışır.

<div align="center">
  <img src="file:///C:/Users/hasan/.gemini/antigravity/brain/8b11d484-88c2-43db-8eea-a9aada513e1d/neuralair_ai_agents_1778249903736.png" alt="AI Agents" width="80%">
</div>

| Ajan Adı | Görevi ve Sorumluluğu |
| :--- | :--- |
| 🛡️ **FleetAgent** | Tüm filonun sağlığını izler. Eğer bir kargo dronunun bataryası kritik seviyeye inerse, havadaki görevi iptal edip en yakınındaki şarjlı drone'a görevi **devreder**. |
| 🚨 **EmergencyAgent** | Sadece Matrice 30T gibi termal kameralı droneları yönetir. Canlı olarak Jetson Nano'dan gelen "Hotspot" (Yangın) sinyallerini işler, rotaları değiştirip itfaiyeye haber verir. |
| ⚡ **ChargingAgent** | Şarj istasyonlarını (Pod) yönetir. İstasyonlara yanaşan dronelara ne kadar mikro-SOL karşılığında enerji verileceğini saniye saniye hesaplar. |

---

## 💎 Solana Escrow ve Ekonomi Modeli

<div align="center">
  <img src="file:///C:/Users/hasan/.gemini/antigravity/brain/8b11d484-88c2-43db-8eea-a9aada513e1d/neuralair_solana_escrow_1778249917480.png" alt="Solana Escrow" width="80%">
</div>

NeuralAir, aracıları tamamen ortadan kaldıran bir **P2P (Noktadan Noktaya) Makine Ekonomisi** kurar:

1. **Görev İlanı:** Kullanıcı `Marketplace` üzerinden "İlaçlama Görevi" oluşturur. (Örn: 8.5 SOL)
2. **Kilit (Lock):** Kullanıcının Phantom cüzdanından 8.5 SOL çekilir ve Akıllı Kontrat'ta (Escrow) kilitlenir.
3. **Gerçekleşme:** Drone tarlayı ilaçlar. Raspberry Pi üzerindeki GPIO rölesinden "İlaçlama Bitti" sinyalini alır.
4. **Kriptografik İmza (Proof of Action):** Drone, Raspberry Pi içindeki *kendi Solana Keypair'i* ile bu durumu imzalar ve ağa gönderir. (Spoofing yapılamaz).
5. **Serbest Bırakma (Release):** Kontrat imzayı doğrular, 8.5 SOL drone sahibine aktarılır.

---

## 🛠️ Donanım (Hardware) Entegrasyonu - DePIN

Sistemimiz sadece yazılımdan ibaret değildir. Fiziksel bir drone ağı şu mühendislik altyapısıyla çalışır:

<div align="center">
  <img src="file:///C:/Users/hasan/.gemini/antigravity/brain/8b11d484-88c2-43db-8eea-a9aada513e1d/neuralair_wiring_diagram_1778249705922.png" alt="Hardware Wiring" width="100%">
</div>

### Edge Node (Uç Nokta) Mimarisi
Her fiziksel drone üzerinde bir **Companion Computer** (Raspberry Pi 4 veya Jetson Nano) bulunur. Bu bilgisayar:
- `MAVLink` protokolü ile uçuş kontrolcüsüne (Pixhawk/Cube) bağlanır.
- 4G LTE modem ile gökyüzünden NeuralAir sunucularına canlı WebSocket akışı sağlar.
- Sensör verilerini (Batarya, İrtifa, Lidar, Termal) işler ve Solana imzası basar.

> 📄 **Detaylı Pin-to-Pin Kablolama ve Gerçek Python Kodları:** Lütfen proje ana dizinindeki `HARDWARE.md` dosyasına ve `hardware-nodes/` klasörüne bakınız.

---

## 💻 Web Arayüzü (Dashboard) Özellikleri

Hackathon MVP'sinde çalışır durumda olan özelliklerimiz:

* 📡 **Canlı Radar & SkyMap:** Tüm filonun İzmir haritası üzerinde canlı telemetrisi, parabolik uçuş rotaları ve dinamik "Hava Sahası Engelleri" (Kuş Sürüleri, Askeri Bölgeler) radar modu.
* ✅ **Preflight Checklist:** AI tarafından otomatik yapılan 8 aşamalı uçuş öncesi motor/sensör kontrolü.
* 💬 **AI Drone Chat:** Her drone ile doğrudan sohbet! "Acil iniş yap" veya "Termal kameranı aç" gibi doğal dil komutlarını MAVLink komutuna dönüştüren sistem.
* ⚡ **Sky-Charge Canlı İstasyonlar:** Şarj olan droneların batarya dolum oranını ve saniye saniye harcadıkları mikro-SOL miktarını gösteren panel.

---

## ⚙️ Sistem Mimarisi ve Teknik Şablonlar (Deep Dive)

Jüri ve geliştiriciler için NeuralAir'in arka planında çalışan sistemlerin teknik yapı taşları:

### 1. Solana Escrow Smart Contract (Rust / Anchor Yapısı)
Görev oluşturulduğunda çalışan merkeziyetsiz emanet (escrow) kontratımızın veri yapısı şablonu:

```rust
#[account]
pub struct MissionEscrow {
    pub client_pubkey: Pubkey,      // Parayı ödeyen kullanıcı
    pub drone_pubkey: Pubkey,       // Görevi üstlenen Node (Raspberry Pi)
    pub amount: u64,                // Kilitlenen SOL miktarı (lamports)
    pub status: MissionStatus,      // Locked, InFlight, Completed, Refunded
    pub destination_lat: f64,       // Hedef Enlem
    pub destination_lng: f64,       // Hedef Boylam
    pub hardware_signature: [u8; 64], // Drone'dan gelen Ed25519 teslimat kanıtı
}
```

### 2. Edge Node WebSocket Telemetri Şablonu
Donanım düğümlerinin (`hardware-nodes/`) saniyede 1 kez NeuralAir sunucularına fırlattığı imzalı uçuş verisi (JSON Payload):

```json
{
  "id": "EGE-01-CARGO-NODE",
  "type": "telemetry",
  "data": {
    "lat": 38.42375,
    "lng": 27.14282,
    "altitude": 120.4,
    "speed_kmh": 45.2,
    "battery_pct": 87.5,
    "heading": 210,
    "status": "in-flight"
  },
  "signature": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  "timestamp": 1715178234000
}
```

### 3. Yapay Zeka Dispatcher (Karar Motoru) Mantığı
Next.js backend üzerinde çalışan OpenAI entegrasyonumuz, drone telemetrisini ve hava durumunu saniyede bir analiz eder. Örnek Karar Ağacı:

```typescript
// src/lib/simulation.ts (Basitleştirilmiş)
if (drone.battery < 20 && drone.status === "in-flight") {
    // 1. Acil durum protokolü başlat
    await updateStatus(drone.id, "emergency");
    
    // 2. FleetAgent devreye girer: Görevi başka drone'a devret
    const nearestAvailable = findNearestDrone(drone.lat, drone.lng, "cargo");
    await transferMission(mission.id, drone.id, nearestAvailable.id);
    
    // 3. Orijinal drone'u en yakın şarj istasyonuna zorunlu iniş yaptır
    const nearestPod = findNearestChargingPod(drone.lat, drone.lng);
    await issueMavlinkCommand(drone.id, "GOTO", nearestPod.lat, nearestPod.lng);
}
```

---

## 🚀 Kurulum (Geliştirici)

```bash
# Repoyu klonlayın
git clone https://github.com/hasan/neuroair.git
cd NeuroAir

# Bağımlılıkları yükleyin (Next.js 14, Tailwind 4, Lucide)
npm install

# .env.local dosyanızı ayarlayın
# OPENAI_API_KEY=sk-...
# NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Geliştirme sunucusunu başlatın
npm run dev
```

> **Not:** Drone donanım simülatörü kodun içindedir. Tarayıcınızda `localhost:3000/dashboard` adresine gittiğinizde fizik motoru çalışmaya başlar ve haritada otonom hareketleri görebilirsiniz.

---
<div align="center">
  <i>NeuralAir — Gökyüzünün Merkeziyetsiz Zekası</i><br>
  <b>Monad/Solana Hackathon 2026</b>
</div>
