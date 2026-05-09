<div align="center">
  <img src="./fotoğraflar/media__1774706137863.png" alt="NeuralAir Cover" width="100%" />
  <br/>
  <h1>🛸 NeuralAir - Gökyüzünün Yeni Protokolü</h1>
  <p><b>Solana üzerinde çalışan Yüksek Performanslı, Merkeziyetsiz ve Otonom Havacılık Ağı (DAAN).</b></p>
  
  <img src="https://img.shields.io/badge/Solana-Powered-14F195?style=for-the-badge&logo=solana&logoColor=black" alt="Solana" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/AI_Dispatcher-Enabled-3B82F6?style=for-the-badge" alt="AI Agent" />
  <img src="https://img.shields.io/badge/DePIN-Infrastructure-10B981?style=for-the-badge" alt="DePIN" />
</div>

<br/>

**NeuralAir**, yapay zeka yönlendirmeli drone filolarini, merkeziyetsiz şarj podlarını (DePIN) ve halka açık bir görev pazarını **saniyenin altındaki on-chain işlemlerle** koordine eden, yepyeni bir Web3 ekosistemidir. Geleneksel blokzincirlerinde rüya bile edilemeyecek düzeydeki gerçek zamanlı fiziksel donanım kontrolünü, Solana'nın (Devnet) hızı sayesinde gerçeğe dönüştürür.

---

## 🌟 Vizyon ve Değer Önerisi

Geleneksel drone lojistiği merkezi sistemlere bağımlı, yavaş ve küresel ölçekte büyümeye kapalıdır. Dahası, donanımları Ethereum (L1) gibi zincirlerden yönetmeye kalktığınızda ağ gecikmesi nedeniyle dronelar hedeflerinden sapabilir. **NeuralAir bu sorunu çözer:**

- 🏗️ **Gerçek Kullanım Senaryoları:** Bireysel veya kurumsal kullanıcılar pazar yerine teslimat veya analiz görevleri yükler (Ziraat, Kargo, İtfaiye, Trafik).
- 🤖 **Otonom AI Ajanları (FleetAgent):** Sistemdeki her drone bir "Agent" olarak hareket eder. Bataryası ve taşıdığı sensör tipine göre en uygun görevi otonom olarak üstlenir ve on-chain akıllı kontratlarla resmiyete döker.
- 🔋 **DePIN ile Pasif Gelir:** İnsanlar balkonlarına veya çatılarına ufak "Sky-Charge Şarj Podları" kurarak ağın menzilini genişletir ve drone iniş-kalkışlarında otomatik **$SOL kazanırlar**.
- ⚡ **Sıfır Gecikme:** Phantom Cüzdan entegrasyonu ve Solana ağı sayesinde, havada uçan binlerce drone'un koordinatları anlık güncellenir, mikro ödemeleri anında aktarılır ve gökyüzünde bir çarpışma önlenir.

---

## 📸 Görsel Tur & Temel Modüller

Protokolümüz, donanımsal verileri kullanıcılara "Deep Blue Glassmorphism" konseptiyle son derece şık, ferah ve profesyonel bir şekilde yansıtır.

<table width="100%">
  <tr>
    <td width="55%">
      <img src="./fotoğraflar/media__1774706105774.png" alt="Gösterge Paneli" width="100%"/>
    </td>
    <td width="45%">
      <b>1. Canlı Hava Sahası ve Kontrol Paneli (SkyMap)</b><br/>
      Gerçek zamanlı interaktif MapLibre/Leaflet haritası kullanılarak inşa edilen bu modül; droneların anlık hız, irtifa, batarya durumu ve hedeflerini görselleştirir. 
    </td>
  </tr>
  <tr>
    <td width="55%">
      <b>2. Sky-Charge DePIN Ağ Altyapısı</b><br/>
      Kesintisiz otonom uçuşların kalbi. Aktif şarj istasyonları, tamamen ağ katılımcıları tarafından sunulur. Bir drone enerjisi azaldığında otonom olarak bu podlardan birine rota çizer ve şarj işlemi başladığı an DePIN sahibine ağ üzerinden $SOL geliri aktarılır.
    </td>
    <td width="45%">
      <img src="./fotoğraflar/media__1774706110633.png" alt="Sky-Charge DePIN" width="100%"/>
    </td>
  </tr>
  <tr>
    <td width="55%">
      <img src="./fotoğraflar/media__1774706119307.png" alt="Görev Pazarı" width="100%"/>
    </td>
    <td width="45%">
      <b>3. Dinamik Görev Pazarı (Marketplace)</b><br/>
      Ekosistemin kârlılık motoru. Kullanıcılar yangın denetimi, tarla ilaçlama veya paket teslimatı gibi işler açar. Sistem her 4 saniyede bir yeni görevleri havuza atar, FleetAgent ise uygun drone'ları otomatik olarak bu görevlere eşleştirir.
    </td>
  </tr>
  <tr>
    <td width="55%">
      <b>4. Terminal & Sistem Olay Günlükleri</b><br/>
      Sürü (Swarm) içindeki tüm aksiyonlar terminal modülü üzerinden canlı ve görsel olarak dinlenebilir. Kritik pil krizleri, rota düzeltmeleri ve görev atamaları eş zamanlı süzülerek arayüze yansır. Veriler Hackathon için <b>Supabase (Offline-Safe Mode)</b> ile loglanmaktadır.
    </td>
    <td width="45%">
      <img src="./fotoğraflar/media__1774706132559.png" alt="Canlı Loglar" width="100%"/>
    </td>
  </tr>
</table>

---

## 🛠️ Teknoloji Yığını (Tech Stack)

- **Frontend Core:** Next.js 14, React, Tailwind CSS (Platform için özel yazılmış estetik karanlık mod tasarımı).
- **Web3 Engine:** `@solana/web3.js` ve Phantom Wallet entegrasyonu.
- **Haritalandırma & Navigasyon:** Leaflet, React-Leaflet ve MapLibre GL.
- **Simülatör & Donanım Arayüzü:** `requestAnimationFrame` tabanlı gerçekçi uçuş simülatörü (Lerp algoritmaları, İrtifa/Hız hesaplamaları).
- **Backend & Database:** Supabase (PostgreSQL) uçuş verilerinin, DePIN gelirlerinin ve görev loglarının tutulması için (Tamamen Offline-Safe olarak kodlanmıştır).

---

## ⚙️ Kurulum & Çalıştırma

### Ön Gereksinimler
- Node.js 18+ sürümü
- Phantom Wallet (Tarayıcı Eklentisi)
- Cüzdanınızın ayarlarından ağı **Devnet** olarak değiştirdiğinizden emin olun.

### Kurulum Adımları

```bash
git clone https://github.com/hsankc/NeuralAir.git
cd NeuralAir
npm install
```

### Çevresel Değişkenler
Proje dizininde bir `.env.local` dosyası oluşturun ve aşağıdaki detayları ekleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_SUPABASE_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

### Projeyi Başlat

```bash
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresine gidin, Phantom cüzdanınızı bağlayın ve **Görev Pazarına** girip filonuzu izleyin!

<br />

<div align="center">
  <h3>🏆 Geleceğin Otonom Ekosistemi</h3>
  <p>NeuralAir, sadece ekrandaki bir simülasyon değil; gerçek donanımlarla, Solana'nın hızıyla ve yapay zekanın aklıyla kurgulanmış <b>"Yaşayan"</b> bir organizmadır.</p>
</div>
