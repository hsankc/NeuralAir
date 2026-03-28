# 🏆 NeuralAir: Hackathon Birinciliği İçin Sunum & Mimari Rehberi

Kanka, bu doküman tamamen jüriyi etkilemek, projenin sadece bir "arayüz" olmadığını, arkasında **gerçek bir fiziksel altyapı (DePIN), Yapay Zeka ve Blockchain (Monad)** entegrasyonu olduğunu kanıtlamak için hazırlandı. Sunumda ve projeyi anlatırken aşağıdaki kurguyu kullanmalısın.

---

## 🚀 1. Problemin Tanımı ve Çözüm (Neden Buradayız?)
**Problem:** Dünyada kargo ve gözetim dronları şu an **merkezi** şirketlerin (Amazon vb.) tekelinde. Eğer sivil bir drone filon varsa, bunları tek bir ağda birleştirip görev alamazsın. Ayrıca, drone'ların şarj istasyonları (pod'lar) kurmak trilyon dolarlık devasa bir altyapı maliyeti gerektirir.
**Çözüm:** **NeuralAir (Decentralized Autonomous Aviation Network)**.
NeuralAir, drone sahiplerini, şarj istasyonu (pod) sahiplerini ve teslimat/hizmet isteyen müşterileri **Monad Blockchain** üzerinde buluşturan "DePIN" (Decentralized Physical Infrastructure) tabanlı bir Uber/Otonom ağdır.

---

## 🧠 2. Sistem Mimarisi: Web Sitesi Drone'u Nasıl Yönetiyor?

Jürinin en çok soracağı soru: *"Bu sitedeki tuşa basınca fiziksel drone nasıl uçacak?"* 
Cevabını şu şekilde vermelisin:

**Web3 ve Drone Yazılımı (Varlıkların Dijital İkizi - Digital Twin)**
Uygulamamızdaki her bir drone, Monad ağında bir **Smart Contract (Akıllı Sözleşme)** olarak temsil edilir. 
1. **Frontend (Dashboard):** Müşteri Görev Pazarı'ndan "Alsancak'tan Bornova'ya İlaç Götür" görevini akıllı sözleşmeye yazar (Ödül: 5 MON).
2. **AI Dispatcher (Aracı Yapay Zeka):** Sistemdeki uygun şarjlı, en yakın ve göreve en yetkin (Kargo tipi) drone'u tespit eder. 
3. **Hardware Gateway (Ros2 / MAVLink):** Web sitesindeki "Görevi Ata" butonu, Monad ağındaki `assignMission` fonksiyonunu tetikler. Fiziksel drone'un üstündeki Raspberry Pi / Companion Computer (Yardımcı Bilgisayar), sürekli olarak Monad Testnet'ini veya bizim node'umuzu dinler. Kendi ID'sine atanmış görevi gördüğünde, blockchain'den koordinatları (Lat: 38.45, Lng: 27.21) çeker.
4. **Otonom Uçuş (Firmware):** Drone uçuş kontrolcüsüne (Pixhawk vb.) MAVLink protokolü üzerinden koordinatlar iletilir. Drone uçuşa geçer.

Biz şu an frontend'de **gerçek MAVLink telemetri akışını (GPS, batarya, hız)** saniyede bir güncellenen algoritmalarla simüle ediyoruz. Fiziksel bir drone bağlandığında, *simülatörden gelen veri yerine websocket üzerinden gerçek IoT cihazından* veri akacaktır.

---

## ⚡ 3. DePIN ve Şarj Mantığı (Sky-Charge)

Projenin en can alıcı noktası burası. Drone havadayken bataryası bitiyor (şu anki kodda %20'ye ayarlı).
* **Klasik Sistem:** Drone olduğu yere iner ya da çıkış noktasına dönmeye çalışıp yolda düşer.
* **NeuralAir (DePIN):** Sistem bataryanın %20'nin altına indiğini tespit eder etmez **Acil İniş Protokolünü (Emergency Landing)** başlatır. Drone, blockchain üzerinde kayıtlı en yakın **Community Sky-Charge Pod**'unu (kullanıcıların evlerine/iş yerlerine kurduğu şarj istasyonları) bulur ve oraya iner. 
* Şarj boyunca, drone'un cüzdanından (hesabından) şarj istasyonu sahibinin cüzdanına saniye başı/kWh başı **MON token** akar. İşte DePIN vizyonu budur!

---

## ⛓️ 4. Neden Monad Kullanıyoruz? (Hileli Soru)

Jüri soracak: *"Neden Ethereum ya da Solana değil de Monad?"*
**Cevap (Ezberle):** 
"NeuralAir gibi canlı bir havacılık ağında saniyelik gecikmeler (latency) drone'ların çarpışmasına veya koordinat kaybına yol açar. Biz bir filonun canlı telemetrisini, mikro ödemelerini (şarj olurken akan para) ve anlık AI Dispatcher görev atamalarını on-chain (zincir üstünde) yapmak istiyoruz. Ethereum (15 TPS) bu trafiği kaldıramaz ve işlem ücretleri uçuş maliyetini aşar. **Monad'ın paralel EVM yapısı ve saniyede 10,000 işlem (TPS) kapasitesi, dronelarımızın %100 on-chain, merkeziyetsiz bir şekilde anlık haberleşmesini mümkün kılan TEK çözümdür.**"

---

## 🎯 5. Birincilik İçin Sunum Taktikleri (The WOW Factor)

1. **Simülasyonu Canlı Göster:** Dashboard'u aç, bir drone'un (örneğin Ege-01) bataryasını izle. Bataryanın 20'nin altına inmesini bekle. Terminalde anında *🚨 BATARYA KRİTİK!* uyarısının çıkmasını "İşte tam bu saniyede akıllı sözleşme müdahale edip en yakın pod'a rotayı çiziyor" diye anlat.
2. **Karanlık Temanın Gücünü Kullan:** "Tasarım neden bu kadar karanlık?" diye sorarlarsa, *"Bu sıradan bir web sitesi değil, 7/24 operasyon yapan operatörler için tasarlanmış gerçek bir Görev Kontrol Merkezi (Command Center). Profesyonel askeri ve sivil havacılık panelleri göz yormaması için dark mode (Midnight Monad) olarak tasarlanır,"* de.
3. **Makro Ekonomi Vurgusu:** Sky-Charge bölümündeki kazanç grafiğini gösterip, "Sistemin büyümesi bizim dron almamıza bağlı değil. İnsanlar çatılarına şarj podu alarak pasif gelir (MON) elde ediyor, ağ kendi kendini DEPIN modeliyle büyütüyor" vurgusunu mutlaka yap.

Bugün itibariyle hem UI (Milyon Dolarlık Startup) hem de arkaplan fiziği (batarya, otonom döngü, harita) tam uyum içinde çalışıyor. Sahne senin komutanım! 🏆
