/**
 * NeuralAir — Internationalization (i18n) Dictionary
 * TR (Türkçe) / EN (English)
 */

export type Locale = "tr" | "en";

export const t = {
  // ═══ HEADER & NAVIGATION ═══
  nav: {
    architecture: { tr: "Sistem Mimarisi", en: "Architecture" },
    hardware: { tr: "Donanım", en: "Hardware" },
    fleet: { tr: "Filo", en: "Fleet" },
    modules: { tr: "Modüller", en: "Modules" },
    launchPanel: { tr: "Paneli Başlat", en: "Launch Panel" },
    droneFleet: { tr: "Drone Filosu", en: "Drone Fleet" },
    appModules: { tr: "Uygulama Modülleri", en: "App Modules" },
  },

  // ═══ HERO ═══
  hero: {
    badge: { tr: "15 Drone Aktif • Solana Devnet", en: "15 Drones Active • Solana Devnet" },
    titleLine1: { tr: "Otonom Havacılığın", en: "The Decentralized" },
    titleLine2: { tr: "Merkeziyetsiz Geleceği", en: "Future of Aviation" },
    subtitle: {
      tr: "Yapay zeka ile yönetilen drone filoları, Solana üzerinde çalışan akıllı sözleşmeler ve merkeziyetsiz Sky-Charge donanım ağıyla, gökyüzündeki operasyonları otonom, güvenli ve şeffaf hale getiriyoruz.",
      en: "AI-managed drone fleets, smart contracts on Solana, and a decentralized Sky-Charge hardware network — making aerial operations autonomous, secure, and transparent."
    },
    cta: { tr: "Sistemi Başlat", en: "Launch System" },
    howItWorks: { tr: "Nasıl Çalışır?", en: "How It Works?" },
  },

  // ═══ ARCHITECTURE ═══
  arch: {
    title: { tr: "Sistem Mimarisi ve İşleyiş", en: "System Architecture & Workflow" },
    subtitle: {
      tr: "Donanımdan blokzincirine kadar tam entegre, insan müdahalesiz bir otonom operasyon döngüsü.",
      en: "A fully integrated, human-free autonomous operation loop — from hardware to blockchain."
    },
    steps: [
      {
        title: { tr: "1. Görev Talebi", en: "1. Mission Request" },
        desc: {
          tr: "Kullanıcılar kargo, ziraat veya acil durum görevlerini sisteme girer. Ödeme Solana Escrow'una kilitlenir.",
          en: "Users submit cargo, agriculture, or emergency missions. Payment is locked in a Solana Escrow."
        }
      },
      {
        title: { tr: "2. AI Dispatcher", en: "2. AI Dispatcher" },
        desc: {
          tr: "Yapay zeka, görevin konumu, hava durumu ve drone şarj durumlarına bakarak filodaki en uygun drone'u seçer.",
          en: "AI selects the best drone based on mission location, weather, and battery status."
        }
      },
      {
        title: { tr: "3. Otonom Uçuş", en: "3. Autonomous Flight" },
        desc: {
          tr: "Jetson Nano ve Pixhawk donanımı, çarpışma önleyici sensörlerle otonom olarak uçuşu gerçekleştirir.",
          en: "Jetson Nano and Pixhawk hardware execute the flight autonomously with collision-avoidance sensors."
        }
      },
      {
        title: { tr: "4. On-Chain Onay", en: "4. On-Chain Verification" },
        desc: {
          tr: "Görev tamamlandığında başarı logu zincire yazılır ve kilitli bakiye serbest bırakılarak ödeme tamamlanır.",
          en: "Upon completion, the success log is written on-chain and the escrowed funds are released."
        }
      },
    ]
  },

  // ═══ HARDWARE ═══
  hw: {
    badge: { tr: "Uç Donanım & Sensörler", en: "Edge Hardware & Sensors" },
    titleLine1: { tr: "Sadece Yazılım Değil,", en: "Not Just Software," },
    titleLine2: { tr: "Tam Donanım Entegrasyonu", en: "Full Hardware Integration" },
    subtitle: {
      tr: "NeuralAir ekosistemi, uçtan uca özel donanımlarla desteklenir. Gerçek dünya fiziksel operasyonları milisaniyelik tepki süreleriyle yönetilir.",
      en: "The NeuralAir ecosystem is backed by end-to-end custom hardware. Real-world physical operations are managed with millisecond response times."
    },
    pixhawk: {
      desc: {
        tr: "Uçuş kontrolcüsü. Gyro, ivmeölçer ve GPS verilerini saniyede yüzlerce kez işleyerek stabiliteyi sağlar.",
        en: "Flight controller. Processes gyro, accelerometer, and GPS data hundreds of times per second for stability."
      }
    },
    jetson: {
      desc: {
        tr: "Gemi üstü yapay zeka bilgisayarı. Lidar verilerini, kamera görüntülerini işler ve otonom kararlar verir.",
        en: "On-board AI computer. Processes lidar, camera feeds, and makes autonomous decisions."
      }
    },
    lte: {
      desc: {
        tr: "Kesintisiz telemetri bağlantısı. Cihazlar MAVLink üzerinden haberleşir ve durumlarını blokzincirine raporlar.",
        en: "Uninterrupted telemetry link. Devices communicate via MAVLink and report status to the blockchain."
      }
    },
    active: { tr: "Aktif", en: "Active" },
  },

  // ═══ FLEET ═══
  fleet: {
    title: { tr: "Göreve Özel Drone Filosu", en: "Mission-Specific Drone Fleet" },
    subtitle: {
      tr: "Sistemde tek tip değil, yapacağı işin fiziksel gereksinimlerine göre tasarlanmış özel donanımlar bulunur.",
      en: "Not one-size-fits-all. Each drone is custom-built for the physical requirements of its mission."
    },
    cargo: {
      name: { tr: "Kargo Serisi (Ege)", en: "Cargo Series (Ege)" },
      desc: {
        tr: "Şehir içi hızlı teslimat, medikal kargo ve hafif eşya taşımacılığı için optimize edilmiş ağır sınıf dronlar.",
        en: "Heavy-class drones optimized for urban delivery, medical cargo, and lightweight goods transportation."
      }
    },
    agri: {
      name: { tr: "Ziraat Serisi (Tarım)", en: "Agriculture Series" },
      desc: {
        tr: "Geniş tarlaların otonom ilaçlanması, sulanması ve multispektral kameralarla rekolte analizi yapan dronlar.",
        en: "Autonomous crop spraying, irrigation, and multispectral harvest analysis drones."
      }
    },
    fire: {
      name: { tr: "Acil Durum (Alev)", en: "Emergency (Fire)" },
      desc: {
        tr: "Orman yangınlarında erken tespit, termal ısı haritası çıkarma ve ilk yardım kiti ulaştırma dronları.",
        en: "Early wildfire detection, thermal heat mapping, and first-aid kit delivery drones."
      }
    },
    traffic: {
      name: { tr: "Trafik & Güvenlik", en: "Traffic & Security" },
      desc: {
        tr: "Plaka tanıma, kaza tespiti ve otoyol izleme görevlerinde kullanılan yüksek irtifa gözlem cihazları.",
        en: "High-altitude surveillance devices for license plate recognition, accident detection, and highway monitoring."
      }
    }
  },

  // ═══ MODULES ═══
  modules: {
    title: { tr: "Uygulama Modülleri", en: "Application Modules" },
    subtitle: {
      tr: "Tek bir Next.js mimarisi altında toplanmış 5 güçlü modül ile ekosistemin her yönüne tam kontrol.",
      en: "5 powerful modules under a single Next.js architecture — full control over every aspect of the ecosystem."
    },
    explore: { tr: "Hemen İncele", en: "Explore Now" },
    goTo: { tr: "Modüle Git", en: "Go to Module" },
    dashboard: {
      title: { tr: "Gösterge Paneli", en: "Dashboard" },
      desc: {
        tr: "Tüm filonun, şarj podlarının ve aktif görevlerin 3D harita üzerinde canlı izlendiği merkezi komuta ekranı.",
        en: "Central command screen for live monitoring of the fleet, charging pods, and active missions on a 3D map."
      }
    },
    marketplace: {
      title: { tr: "Görev Pazarı", en: "Mission Marketplace" },
      desc: {
        tr: "Kullanıcıların harita üzerinden görev talep ettiği formlar. Solana akıllı sözleşmeleriyle güvenli ödeme.",
        en: "Users request missions via map-based forms. Secure payments through Solana smart contracts."
      }
    },
    skycharge: {
      title: { tr: "Sky-Charge DePIN", en: "Sky-Charge DePIN" },
      desc: {
        tr: "Kişilerin kurduğu şarj istasyonları ağı. Drone şarj oldukça pod sahibi cüzdanına mikro-SOL kazanır.",
        en: "A community-owned charging station network. Pod owners earn micro-SOL as drones charge."
      }
    },
    fpv: {
      title: { tr: "FPV Kontrol", en: "FPV Control" },
      desc: {
        tr: "Otonom uçuşlarda beklenmedik bir durum olduğunda operatörün anında klavye ile komutayı devraldığı panel.",
        en: "Operators take manual keyboard control in unexpected situations during autonomous flights."
      }
    },
    logs: {
      title: { tr: "Uçuş Kayıtları", en: "Flight Logs" },
      desc: {
        tr: "Tamamlanan tüm görevlerin ve uçuş sürelerinin Solana blokzincirinde saklandığı şeffaf defter.",
        en: "Transparent ledger of all completed missions and flight durations stored on the Solana blockchain."
      }
    }
  },

  // ═══ FOOTER ═══
  footer: {
    openSource: { tr: "Açık Kaynak", en: "Open Source" },
  },

  // ═══ DASHBOARD ═══
  dash: {
    title: { tr: "Gösterge Paneli", en: "Dashboard" },
    activeFlight: { tr: "Aktif Uçuş", en: "Active Flights" },
    charging: { tr: "Şarjda", en: "Charging" },
    avgBattery: { tr: "Ort. Batarya", en: "Avg. Battery" },
    missionLabel: { tr: "Görev", en: "Missions" },
    liveMap: { tr: "Canlı Gökyüzü Haritası — İzmir", en: "Live Skymap — İzmir" },
    allFleet: { tr: "Tüm Filo", en: "All Fleet" },
    radarMode: { tr: "Radar Modu", en: "Radar Mode" },
    droneActive: { tr: "drone aktif", en: "drones active" },
    fleet: { tr: "FİLO", en: "FLEET" },
    weather: { tr: "İzmir Hava Durumu", en: "İzmir Weather" },
    clear: { tr: "Açık", en: "Clear" },
    activeMissions: { tr: "Aktif Görevler", en: "Active Missions" },
    all: { tr: "Tümü", en: "All" },
    selectDronePrompt: { tr: "Bir drone seçerek detayları görüntüleyin", en: "Select a drone to view details" },
    connectWallet: { tr: "Cüzdan Bağla", en: "Connect Wallet" },
    status: {
      idle: { tr: "Boşta", en: "Idle" },
      "in-flight": { tr: "Uçuşta", en: "In Flight" },
      mission: { tr: "Görevde", en: "On Mission" },
      charging: { tr: "Şarjda", en: "Charging" },
      emergency: { tr: "Acil", en: "Emergency" },
    },
    // Sidebar nav
    navDashboard: { tr: "Gösterge Paneli", en: "Dashboard" },
    navMarketplace: { tr: "Görev Pazarı", en: "Mission Marketplace" },
    navSkyCharge: { tr: "Sky-Charge", en: "Sky-Charge" },
    navControl: { tr: "Kontrol", en: "Control" },
    navFlightLogs: { tr: "Uçuş Kayıtları", en: "Flight Logs" },
  },

  // ═══ MARKETPLACE ═══
  market: {
    title: { tr: "Görev Pazarı", en: "Mission Marketplace" },
    createMission: { tr: "Görev Aç", en: "Create Mission" },
    takeMission: { tr: "Görevi Al", en: "Take Mission" },
    all: { tr: "Tümü", en: "All" },
    cargo: { tr: "Kargo", en: "Cargo" },
    agriculture: { tr: "Ziraat", en: "Agriculture" },
    fire: { tr: "Yangın", en: "Fire" },
    traffic: { tr: "Trafik", en: "Traffic" },
    agentLog: { tr: "Agent Karar Logu", en: "Agent Decision Log" },
    live: { tr: "Canlı", en: "Live" },
    inProgress: { tr: "Devam Ediyor", en: "In Progress" },
    completed: { tr: "Tamamlandı", en: "Completed" },
    open: { tr: "Açık", en: "Open" },
  },

  // ═══ CONTROL / FPV ═══
  control: {
    title: { tr: "FPV Kontrol", en: "FPV Control" },
    sport: { tr: "Sport Mod", en: "Sport Mode" },
    cinematic: { tr: "Sinematik Mod", en: "Cinematic Mode" },
    selectDrone: { tr: "Drone Seç", en: "Select Drone" },
    connectedAgent: { tr: "Bağlı Ajan", en: "Connected Agent" },
    startFlight: { tr: "3D UÇUŞU BAŞLATMAK İÇİN TIKLAYIN", en: "CLICK TO START 3D FLIGHT" },
    forwardBack: { tr: "İleri / Geri", en: "Forward / Back" },
    leftRight: { tr: "Sola / Sağa", en: "Left / Right" },
    turn: { tr: "Dönüş", en: "Turn" },
    releaseMouse: { tr: "Fareyi Bırak", en: "Release Mouse" },
    coords: { tr: "Koordinatlar", en: "Coordinates" },
    altitude: { tr: "İrtifa", en: "Altitude" },
    yaw: { tr: "Açı (Yaw)", en: "Yaw" },
    flightMode: { tr: "Uçuş Modu", en: "Flight Mode" },
    streamed: { tr: "TX Streamed", en: "TX Streamed" },
    trueFpv: { tr: "Gerçek FPV Simülatör", en: "True FPV Simulator" },
  },

  // ═══ AICHAT ═══
  aiChat: {
    welcome: { tr: "NeuralAir AI Dispatcher aktif. Doğal dil ile drone filoyu yönetin. Örnek: \"Alsancak'taki yangın için en yakın dronu gönder\"", en: "NeuralAir AI Dispatcher active. Manage the drone fleet with natural language. Example: \"Send the nearest drone for the fire in Alsancak\"" },
    processed: { tr: "Komut işlendi.", en: "Command processed." },
    error: { tr: "Komut anlaşılamadı. Lütfen tekrar deneyin.", en: "Command not understood. Please try again." },
    offline: { tr: "Bağlantı hatası. API çevrimdışı olabilir.", en: "Connection error. API might be offline." },
    scanning: { tr: "AI ağı tarıyor...", en: "Scanning AI network..." },
    placeholder: { tr: "Drone komutunu yazın...", en: "Type drone command..." },
    dispatcher: { tr: "AI Dispatcher", en: "AI Dispatcher" },
    active: { tr: "Aktif — GPT-4o", en: "Active — GPT-4o" },
    actions: {
      createMission: { tr: "Görev Oluştur", en: "Create Mission" },
      selectDrone: { tr: "Drone Seç", en: "Select Drone" },
      sendCommand: { tr: "Komut Gönder", en: "Send Command" },
      queryStatus: { tr: "Durum Sorgula", en: "Query Status" },
      deploySwarm: { tr: "Sürü Operasyonu", en: "Deploy Swarm" },
      chargeDrone: { tr: "Şarj Et", en: "Charge Drone" },
    }
  },

  // ═══ MODAL ═══
  modal: {
    createNew: { tr: "Yeni Görev Oluştur", en: "Create New Mission" },
    whatType: { tr: "Hangi operasyon tipini başlatmak istiyorsunuz?", en: "Which operation type do you want to start?" },
    goBack: { tr: "Geri Dön", en: "Go Back" },
    escrow: { tr: "Solana Escrow (Hazine)", en: "Solana Escrow (Treasury)" },
    missionTitle: { tr: "Görev Başlığı", en: "Mission Title" },
    
    cargoDetails: { tr: "Kargo Detayları", en: "Cargo Details" },
    pickupCoord: { tr: "Alış Koordinatı", en: "Pickup Coordinate" },
    deliveryCoord: { tr: "Teslimat Koordinatı", en: "Delivery Coordinate" },
    weight: { tr: "Ağırlık (gram)", en: "Weight (grams)" },
    fragile: { tr: "Kırılabilir", en: "Fragile" },
    deliverySpeed: { tr: "Teslimat Hızı", en: "Delivery Speed" },
    no: { tr: "Hayır", en: "No" },
    yes: { tr: "Evet", en: "Yes" },
    normal: { tr: "Normal", en: "Normal" },
    express: { tr: "Ekspres", en: "Express" },
    economy: { tr: "Ekonomik", en: "Economy" },
    
    agriDetails: { tr: "Ziraat Operasyonu Detayları", en: "Agriculture Op Details" },
    opType: { tr: "İşlem Tipi", en: "Operation Type" },
    spraying: { tr: "İlaçlama", en: "Spraying" },
    irrigation: { tr: "Sulama", en: "Irrigation" },
    fertilizing: { tr: "Gübreleme", en: "Fertilizing" },
    mapping: { tr: "Harita Çıkarma", en: "Mapping" },
    seeding: { tr: "Tohum Dağıtımı", en: "Seeding" },
    liquidType: { tr: "İlaç / Gübre Tipi", en: "Chemical / Fertilizer Type" },
    flightAlt: { tr: "Uçuş İrtifası (m)", en: "Flight Altitude (m)" },
    maxSpeed: { tr: "Max Hız (km/h)", en: "Max Speed (km/h)" },
    windTolerance: { tr: "Rüzgar Toleransı", en: "Wind Tolerance" },
    low: { tr: "Düşük", en: "Low" },
    medium: { tr: "Orta", en: "Medium" },
    high: { tr: "Yüksek", en: "High" },
    
    fireDetails: { tr: "Acil Durum Operasyonu", en: "Emergency Operation" },
    zoneCoord: { tr: "Bölge Koordinatı", en: "Zone Coordinate" },
    scanRadius: { tr: "Tarama Yarıçapı (m)", en: "Scan Radius (m)" },
    sensorType: { tr: "Sensör Tipi", en: "Sensor Type" },
    thermal: { tr: "Termal Kamera", en: "Thermal Camera" },
    zoom: { tr: "Zoom Kamera", en: "Zoom Camera" },
    multispectral: { tr: "Multispektral", en: "Multispectral" },
    normalCam: { tr: "Normal Kamera", en: "Normal Camera" },
    coordUnit: { tr: "Koordinasyon Birimi", en: "Coordination Unit" },
    fireDept: { tr: "İtfaiye", en: "Fire Dept" },
    forestDept: { tr: "Orman İdaresi", en: "Forest Dept" },
    civilDef: { tr: "Sivil Savunma", en: "Civil Defense" },
    coastGuard: { tr: "Sahil Güvenlik", en: "Coast Guard" },
    priorityLevel: { tr: "Öncelik Seviyesi", en: "Priority Level" },
    critical: { tr: "🔴 Kritik", en: "🔴 Critical" },
    highPri: { tr: "🟠 Yüksek", en: "🟠 High" },
    normalPri: { tr: "🟢 Normal", en: "🟢 Normal" },
    
    trafficDetails: { tr: "Gözetleme Parametreleri", en: "Surveillance Params" },
    monitorZone: { tr: "İzleme Bölgesi", en: "Monitor Zone" },
    monitorDuration: { tr: "İzleme Süresi (saat)", en: "Monitor Duration (hrs)" },
    plateReading: { tr: "Plaka Okuma", en: "Plate Reading" },
    liveStream: { tr: "Canlı Yayın", en: "Live Stream" },
    reportFreq: { tr: "Raporlama Sıklığı", en: "Reporting Frequency" },
    
    payment: { tr: "Ödeme (SOL)", en: "Payment (SOL)" },
    priorityAction: { tr: "Acil İşlem", en: "Priority Action" },
    sendStart: { tr: "Gönder & Görevi Başlat", en: "Send & Start Mission" },
    waitingWallet: { tr: "Cüzdan Onayı Bekleniyor...", en: "Waiting Wallet Approval..." },
    
    agentTookMission: { tr: "Ajan Görevi Devraldı", en: "Agent Took Mission" },
    txSent: { tr: "İşlem Gönderildi", en: "Transaction Sent" },
    agentDesc: { tr: "Bir otonom drone görevi onayladı. Telemetri verisi Sky-Sync kanalına aktarılıyor.", en: "An autonomous drone approved the mission. Telemetry data is streamed to Sky-Sync." },
    txDesc: { tr: "Transfer Phantom üzerinden doğrulandı. Ağ onayı bekleniyor...", en: "Transfer verified via Phantom. Waiting for network confirmation..." },
    hash: { tr: "Hash:", en: "Hash:" },
    confirm: { tr: "Onay:", en: "Confirm:" },
    close: { tr: "Kapat", en: "Close" },
  }
};
