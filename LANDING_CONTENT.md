# NeuralAir — Landing Page İçerik Dosyası

> Burası **sadece içerik** dosyasıdır. Tasarım/kod ayrı.
> Aşağıdaki her bölümü oku, **TODO** yazan yerleri doldur veya örneği onayla.
> Hazır olunca bu dosyadan birebir landing page üretilecek.

---

## 0) Genel Marka

- **Ürün adı:** NeuralAir
- **Alt başlık (tagline, max 6 kelime):**
  - Öneri A: `Gökyüzünün merkeziyetsiz koordinasyon katmanı.`
  - Öneri B: `Otonom drone ağı. Solana üstünde.`
  - **Seçim / TODO:**
- **Tek cümlelik özet (jüri + yatırımcı için):**
  - Öneri: `Solana üzerinde çalışan; AI dağıtımı, DePIN şarj ve görev pazarını birleştiren otonom havacılık ağı.`
  - **Seçim / TODO:**
- **Birincil CTA (büyük buton):** `Canlı Demoyu Aç` → `/dashboard`
- **İkincil CTA:** `Projeyi İncele` → sayfa içi anchor
- **Ton:** Profesyonel, sade, teknolojik. Emoji yok, abartı yok.

---

## 1) HERO Bölümü

**Amaç:** İlk 3 saniyede “bu ne?” sorusunu cevaplamak.

- **Üst rozet (mini etiket):** `SOLANA DEPIN · DAAN PROTOKOLÜ`
- **Ana başlık (2 satır, büyük):**
  - Satır 1: `Otonom Drone Ağı.`
  - Satır 2 (vurgulu): `Tek Protokolde.`
  - **Alternatif TODO:**
- **Alt açıklama (max 2 cümle):**
  > NeuralAir; AI dağıtımı, DePIN şarj istasyonları ve halka açık görev pazarını
  > Solana üzerinde tek bir koordinasyon katmanında birleştirir.
  - **TODO (değiştirmek istersen):**
- **CTA’lar:** `Canlı Demoyu Aç` · `Projeyi İncele`
- **Mini istatistikler (3 adet, sayı + etiket):**
  - `<400ms` — On-chain telemetri hedefi
  - `Devnet` — Phantom ile bağlan
  - `4 Drone Tipi` — Kargo · Tarım · İtfaiye · Trafik
  - **TODO (değiştir / onayla):**

---

## 2) BAĞLAM — ÇÖZÜM (Neden NeuralAir?)

**Amaç:** Sektördeki dönüşümü ve NeuralAir'in pozisyonunu göstermek.
**Görsel:** İkili karşılaştırma (sol: bugün / sağ: NeuralAir) veya 3 sütunlu pillar grid.

- **Bölüm başlığı:** `Drone ekonomisi merkezsiz bir koordinasyona hazır.`
- **Üst paragraf (1 cümle):**
  > Mevcut filo platformları kapalı API’lar, manuel görev dağıtımı ve
  > tek noktada toplanan ödeme akışlarıyla sınırlı kalıyor.
- **Karşılaştırma (3 satır):**
  | Bugün                              | NeuralAir                                     |
  | ---------------------------------- | --------------------------------------------- |
  | Tek sağlayıcı, kapalı pazar        | Açık görev pazarı, herkes ilan açar          |
  | Merkezi şarj altyapısı (yetersiz)  | Sky-Charge DePIN: dağıtık podlar, pasif gelir |
  | Manuel görev atama, gecikmeli ödeme | AI dispatcher + Solana ile saniye altı kapanış |
- **Kapanış cümlesi:**
  > NeuralAir; **görev → ödeme → uçuş → şarj** döngüsünün tamamını
  > tek protokol altında, **on-chain ve şeffaf** çalıştırır.
- **TODO (onayla / değiştir):**

---

## 3) ÖZELLİKLER (Modüller)

**Amaç:** Ürünün teknik derinliğini göstermek. Her madde tıklanabilir → ilgili sayfaya gider.

> Format: **Etiket · Başlık · Teknik 1 cümle · Route**

1. **`fleet/map`** — **SkyMap**
   `MapLibre GL üzerinde gerçek-zamanlı filo telemetrisi; WebSocket köprüsü, rota interpolasyonu ve görev geometrisi katmanları.` → `/dashboard`
2. **`marketplace`** — **Görev Pazarı**
   `On-chain escrow tabanlı görev ilanları; profil bazlı (kargo / tarım / itfaiye / trafik) filtreleme ve cüzdan-imzalı kabul akışı.` → `/marketplace`
3. **`depin/skycharge`** — **Sky-Charge**
   `Dağıtık şarj istasyonları; pod operatörleri için kWh bazlı $SOL ödeme akışı ve uptime göstergeleri.` → `/sky-charge`
4. **`ai/dispatcher`** — **AI Dispatcher**
   `Doğal dil komutlarını yorumlar; OpenAI API + yerel fallback motorla drone-görev eşleşmesini otonom kurar.` → `/dashboard`
5. **`agent/terminal`** — **Agent Terminal**
   `FleetAgent, ChargingAgent ve EmergencyAgent kararlarını gerçek zamanlı log stream olarak yayınlar.` → `/dashboard`
6. **`control/fpv`** — **Manuel Kontrol**
   `Operatörün uzaktan devralma arayüzü; klavye/joystick + canlı kamera ön izleme (demo).` → `/control`
7. **`logs/flight`** — **Uçuş Günlükleri**
   `Görev sonu telemetri özetleri, ödeme kayıtları ve değişmez denetim izi (audit trail).` → `/flight-logs`

**TODO (onayla / değiştir):**

---

## 4) NASIL ÇALIŞIR (3 Paralel Akış)

**Amaç:** Sistemin **3 ayrı operasyonel akışını** göstermek. Görsel olarak 3 sütun, her sütunda numaralı adımlar.

### Akış A — Görev Yaşam Döngüsü (Ana Akış)
1. **Görev Açılır** — Kullanıcı pazar üzerinden görevi tanımlar (tip, ödeme, hedef koordinatlar).
2. **Cüzdan Bağlanır** — Phantom ile Devnet kimliği iş akışına eklenir, escrow ödeme kilitlenir.
3. **AI Dispatcher Eşleştirir** — FleetAgent batarya, konum ve sensör tipine göre uygun drone’u atar.
4. **Operasyon İzlenir** — Harita, terminal ve uçuş günlükleri aynı zaman çizgisinde akar; görev sonunda ödeme otomatik release.

### Akış B — Sky-Charge DePIN
1. **Pod Kurulur** — Kullanıcı çatısına/balkonuna mini şarj istasyonu kurar ve cüzdanını bağlar.
2. **Drone Yaklaşır** — Düşük batarya algılayan ChargingAgent en yakın uygun pod’a rota çizer.
3. **Şarj Başlar** — Pod oturum açar, gerçek-zamanlı kWh ölçer.
4. **Mikro Ödeme** — Şarj sonunda $SOL pod sahibinin cüzdanına otomatik aktarılır.

### Akış C — Manuel Kontrol & Devralma
1. **Operatör Bağlanır** — Yetkili kullanıcı `/control` üzerinden hedef drone’u seçer.
2. **Otonom Pasifleşir** — FleetAgent ilgili drone için karar verme yetkisini operatöre devreder.
3. **Canlı Telemetri** — FPV kamera + telemetri operatöre düşük gecikmeyle akar.
4. **Devir Geri** — Operasyon biter; drone otomatik uçuşa veya bekleme moduna döner.

**TODO (onayla / değiştir):**

---

## 5) DRONE FİLOSU

**Amaç:** “Gerçek bir ürün” hissi vermek. 7 farklı kategori, kart formatında (3x3 grid veya carousel).

| Kategori        | Önerilen Donanım                  | Öne Çıkan Spec                         | Görev Profili                      |
| --------------- | --------------------------------- | -------------------------------------- | ---------------------------------- |
| Kargo           | DJI FlyCart 30                    | 30 kg yük · 16 km menzil               | Uzun menzil teslimat               |
| Tarım           | DJI Agras T50                     | 50 L tank · RTK GPS · 21 m geniş püskürtme | İlaçlama, gübreleme, tarama        |
| İtfaiye         | DJI Matrice 350 RTK + H30T        | Termal · 55 dk uçuş · 23x optik zoom    | Erken yangın tespiti, koordinasyon |
| Trafik          | Autel EVO Max 4T                  | 160x hibrit zoom · 42 dk uçuş           | Sahil ve karayolu gözetimi         |
| Gözetleme       | Skydio X10                        | AI tabanlı hedef takibi · 5 km menzil  | Olay yeri ve perimeter takibi      |
| Güvenlik        | Parrot ANAFI USA                  | Termal + 32x zoom · NDAA uyumlu         | Tesis ve kritik altyapı güvenliği  |
| Arama-Kurtarma  | DJI Matrice 30T                   | Termal · IP55 · 10 km menzil            | Afet ve SAR operasyonları          |

**Not:** Markalar **referans donanım önerisidir**; NeuralAir donanımdan bağımsız çalışır (MAVLink uyumluluğu yeterli).

**TODO (onayla / değiştir):**

---

## 6) DONANIM ENTEGRASYONU

**Amaç:** "Bu sadece arayüz değil, gerçek donanıma açık" mesajı.
**Görsel:** Sol tarafta donanım stack diyagramı (SVG, drone silüeti üzerinde modüller işaretli), sağ tarafta açıklamalar.

### Donanım Stack (Edge Node)
- **Uçuş Kontrolcüsü:** Pixhawk 4 / CubePilot Cube Orange — MAVLink üzerinden filo komutu
- **Edge AI:** NVIDIA Jetson Orin Nano — engel tespiti, görüntü işleme, sürü kararları
- **Bağlantı:** 4G LTE / 5G + WireGuard tunnel — kesintisiz Solana RPC erişimi
- **Sensör:** RTK GPS (±2 cm) · Termal kamera · ADS-B alıcı
- **Kimlik:** Ed25519 anahtar çifti — drone-imzalı proof-of-flight kayıtları

### Önerilen Diyagram (landing'de SVG olarak çizilecek)
```
        ┌─────────────────────────────┐
        │     NeuralAir Edge Node     │
        ├─────────────────────────────┤
        │  Jetson Orin (AI)           │ ← görüntü işleme
        │  Pixhawk Cube (FC)          │ ← MAVLink uçuş
        │  4G/5G modem                │ ← Solana RPC
        │  Ed25519 keystore           │ ← imzalı telemetri
        └─────────────────────────────┘
                    ↕
           ┌────────────────┐
           │  Solana Devnet │
           └────────────────┘
```

> NeuralAir'in edge node mimarisi, endüstri standardı uçuş donanımıyla
> doğrudan konuşacak şekilde tasarlandı. Saha entegrasyonu detayları için
> [HARDWARE.md](./HARDWARE.md) dökümanı hazır.

**TODO (onayla / değiştir):**

---

## 7) TEKNOLOJİ YIĞINI

**Amaç:** Bir bakışta ciddiyet göstermek. Kategorize edilmiş pill grid.

### Frontend
- **Next.js 16** (App Router, RSC, Turbopack)
- **React 19** · **TypeScript 5**
- **Tailwind CSS 4** · **Lucide Icons**
- **Framer-style native CSS animations**

### Web3 / Blockchain
- **@solana/web3.js** — RPC ve transaction
- **Phantom Wallet** — kullanıcı kimliği
- **Anchor / Rust** — on-chain programlar (yol haritası)
- **Ed25519** — drone imzalı telemetri

### Harita & Geo
- **MapLibre GL JS** — vektör harita motoru
- **Leaflet** (legacy fallback)
- **Turf.js** — geo hesaplamalar (yol haritası)

### Backend & Veri
- **Supabase (PostgreSQL + Realtime)** — offline-safe mod
- **REST + WebSocket** — telemetri akışı
- **Vercel Edge Functions** — düşük gecikmeli API

### AI & Otomasyon
- **OpenAI API (gpt-4o-mini)** — doğal dil dispatcher
- **Yerel fallback motor** — API'siz çalışma
- **FleetAgent / ChargingAgent / EmergencyAgent** — özel ajan mimarisi

### Donanım Köprüsü (Yol Haritası)
- **MAVLink 2** — uçuş kontrolcü protokolü
- **ROS 2 Humble** — robot orkestrasyonu
- **WireGuard** — güvenli edge tunnel

### DevOps
- **GitHub Actions** — CI/CD
- **Vercel** — production deploy
- **ESLint 9 + Prettier** — kod kalitesi

**TODO (onayla / çıkar):**

---

## 8) KAPANIŞ CTA

**Amaç:** Sayfayı net bir aksiyonla bitirmek.

- **Başlık:** `Hazırsan, panele geç.`
- **Alt metin:** `Cüzdanı bağla, görev oluştur, filoyu izle. Tüm modüller canlı.`
- **Buton 1:** `Panele Git` → `/dashboard`
- **Buton 2:** `Pazara Git` → `/marketplace`

---

## 9) FOOTER

- **Sol:** `NeuralAir · 2026`
- **Orta:** Tek cümle disclaimer
  > Solana ekosistemi için otonom havacılık demosu.
  > Üretim kullanımı ayrı güvenlik ve regülasyon süreçleri gerektirir.
- **Sağ:** GitHub → [https://github.com/hsankc/NeuralAir](https://github.com/hsankc/NeuralAir)

---

## ⚙️ Tasarım Yön Notları (Sadece referans)

- **Mod:** Karanlık, derin lacivert/siyah arka plan
- **Aksan:** Solana yeşili (`#14F195`) + minimal mor (`#9945FF`) vurgu
- **Stil:** Modern glassmorphism, ince border, hafif blur
- **Animasyon:** Hero’da sıralı fade-up; scroll snap ile bölümler tam ekran
- **Tipografi:** Büyük başlık (Inter/SF), mono ile sayı vurgusu
- **Yasak:** Emoji, klişe AI çerçeveleri, abartılı neon glow

---

### Doldurma Talimatı

Sadece **TODO** yazan yerleri kendi cümlelerinle güncelle.
Onaylayacaklarına `OK` yaz, değiştireceklerini direkt yaz.
Bittiğinde **“içerik hazır, landing’i kur”** de — bu dosyadan birebir sayfayı üretirim.