"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Map as MapIcon,
  Radio,
  Activity,
  Battery,
  Cpu,
  Zap,
  ArrowLeft,
  Navigation,
  Crosshair,
  ChevronDown,
  Wind,
  Thermometer,
  Eye,
  ChevronRight,
  Plane,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Menu,
  X,
  Send,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  initialDrones,
  initialPods,
  initialMissions,
  initialObstacles,
  DroneAgent,
  DroneType,
  droneTypeLabels,
  statusLabels,
  missionTypeLabels,
  missionStatusLabels,
  randomTxHash,
  Mission,
} from "@/lib/data";
import { FlightSimulator } from "@/lib/simulation";
import { pickRandomMission, generateInitialOpenMissions, missionToDroneType } from "@/lib/missions";
import { useLanguage, tx } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

const SkyMap = dynamic(() => import("@/components/SkyMap"), { ssr: false });
const WalletConnect = dynamic(() => import("@/components/WalletConnect"), { ssr: false });

/* ─── Drone Simulator Hook ─── */
function useDroneSimulator() {
  const [drones, setDrones] = useState(initialDrones);
  const [liveMissions, setLiveMissions] = useState<Mission[]>(() => [
    ...initialMissions,
    ...generateInitialOpenMissions(),
  ]);

  // ═══ REF: Simülasyon closure'ına güncel mission verisini ver ═══
  const missionsRef = useRef<Mission[]>(liveMissions);
  useEffect(() => { missionsRef.current = liveMissions; }, [liveMissions]);

  // Görev tamamlama event'i — diğer bileşenler dinleyebilir
  const emitMissionComplete = useCallback((droneId: number, missionId: number, droneName: string, missionTitle: string) => {
    window.dispatchEvent(new CustomEvent("mission-complete", {
      detail: { droneId, missionId, droneName, missionTitle, timestamp: new Date() },
    }));
  }, []);

  // AI komutlarını dinle
  useEffect(() => {
    const handleAiCommand = ((e: CustomEvent) => {
      const cmd = e.detail;
      if (!cmd) return;

      setDrones((prev) => {
        let updated = [...prev];

        // 1. Send Command (Yönlendirme vb.)
        if (cmd.action === "sendCommand" && cmd.params?.droneId) {
          updated = updated.map((d) => {
            if (d.id === cmd.params.droneId) {
              const command = cmd.params.command;
              let newStatus = d.status;
              let newHeading = d.heading;
              let newAlt = d.altitude;

              if (command === "TakeOff") { newStatus = "in-flight"; newAlt = 150; }
              else if (command === "Land") {
                if (cmd.params.destLat && cmd.params.destLng) {
                  // Hedefe uçup inmesi için yönlendir
                  return {
                    ...d,
                    status: "mission",
                    targetLat: cmd.params.destLat,
                    targetLng: cmd.params.destLng
                  };
                } else {
                  // Olduğu yere acil iniş
                  return { ...d, status: "idle", altitude: 0, speed: 0 };
                }
              }
              else if (command === "Hover") { newStatus = "in-flight"; }
              else if (command === "North") newHeading = 270;
              else if (command === "South") newHeading = 90;
              else if (command === "East") newHeading = 0;
              else if (command === "West") newHeading = 180;
              else if (command === "Up") newAlt = Math.min(350, newAlt + 50);
              else if (command === "Down") newAlt = Math.max(20, newAlt - 50);
              else if (command === "RTB") {
                return {
                  ...d,
                  status: "mission",
                  targetLat: 38.4350, // Örn: Alsancak Hub
                  targetLng: 27.1420
                };
              }

              return { ...d, status: newStatus, heading: newHeading, altitude: newAlt };
            }
            return d;
          });
        }

        // 2. Create Mission (Görev Atama)
        if (cmd.action === "createMission") {
          let assigned = false;
          updated = updated.map((d) => {
            if (!assigned && (d.status === "idle" || d.status === "charging")) {
              assigned = true;
              return { ...d, status: "mission" as const };
            }
            return d;
          });
        }

        // 3. Deploy Swarm (Sürü Gönderimi)
        if (cmd.action === "deploySwarm") {
          const count = cmd.params?.droneCount || 3;
          let assigned = 0;
          updated = updated.map((d) => {
            if (assigned < count && (d.status === "idle" || d.status === "charging" || d.type === "emergency")) {
              assigned++;
              return { ...d, status: "emergency" as const, heading: 225 };
            }
            return d;
          });
        }

        return updated;
      });
    }) as EventListener;

    window.addEventListener("ai-command", handleAiCommand);
    return () => window.removeEventListener("ai-command", handleAiCommand);
  }, []);

  // ═══ ANA SİMÜLASYON DÖNGÜSÜ ═══
  useEffect(() => {
    const iv = setInterval(() => {
      setDrones((prevDrones) => {
        return prevDrones.map((d) => {
          // ── ŞARJ ──
          if (d.status === "charging") {
            const newBat = Math.min(100, d.battery + 0.7 + Math.random() * 0.3);
            if (newBat >= 98) {
              return { ...d, battery: 100, status: "idle" as const, altitude: 0, speed: 0 };
            }
            return { ...d, battery: newBat };
          }

          // ── BEKLEMEDE — görev atanmadıkça yerde kalır ──
          if (d.status === "idle") {
            return d; // Hiçbir şey yapma, batarya düşmez, kalkış olmaz
          }

          // === AKTİF UÇUŞ FİZİĞİ ===
          let moveSpeed = 0.0006 + Math.random() * 0.0006;
          let newLat = d.lat;
          let newLng = d.lng;
          let newHeading = d.heading;

          // ═══ GÖREV HEDEFİ BUL — missionsRef ile güncel veri ═══
          const allMissions = missionsRef.current;
          const mission = d.missionId
            ? allMissions.find(m => m.id === d.missionId)
            : allMissions.find(m => m.droneId === d.id && (m.status === "in-progress" || m.status === "accepted"));

          // 1. Ziraat Tarama Mantığı — mission varsa hedefe git, yoksa tarama yap
          if (d.type === "agricultural" && d.status === "mission") {
            if (mission) {
              // Hedef alanına git
              const dx = mission.toLat - d.lat;
              const dy = mission.toLng - d.lng;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 0.003) {
                // Tarla alanında — zig-zag tarama yap
                moveSpeed = 0.0002;
                newHeading = d.heading + (Math.random() > 0.3 ? 90 : -90);
                newLat = d.lat + Math.cos(newHeading * Math.PI / 180) * moveSpeed;
                newLng = d.lng + Math.sin(newHeading * Math.PI / 180) * moveSpeed;
              } else {
                // Hedefe doğru uç
                moveSpeed = 0.0004;
                newLat += (dx / dist) * moveSpeed;
                newLng += (dy / dist) * moveSpeed;
                newHeading = Math.atan2(dy, dx) * 180 / Math.PI;
              }
            } else {
              moveSpeed = 0.0002;
              newHeading = d.heading + (Math.random() > 0.3 ? 90 : -90);
              newLat = d.lat + Math.cos(newHeading * Math.PI / 180) * moveSpeed;
              newLng = d.lng + Math.sin(newHeading * Math.PI / 180) * moveSpeed;
            }
          }
          // 2. Görev Hedefine Uçuş
          else if (d.status === "mission" || d.status === "in-flight") {
            const targetLat = mission ? mission.toLat : d.targetLat;
            const targetLng = mission ? mission.toLng : d.targetLng;

            if (targetLat && targetLng) {
              const dx = targetLat - d.lat;
              const dy = targetLng - d.lng;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // ═══ GÖREV TAMAMLAMA / İNİŞ ═══
              if (dist < 0.002) {
                if (mission) {
                  // Hedefe ulaştı! Görev tamamlandı.
                  emitMissionComplete(d.id, mission.id, d.name, mission.title);

                  // liveMissions'da görevi tamamla
                  setLiveMissions(prev => prev.map(m =>
                    m.id === mission.id ? { ...m, status: "completed" as const } : m
                  ));
                }

                // İniş yap - drone yere iniyor
                return {
                  ...d,
                  status: "idle" as const,
                  missionId: null,
                  targetLat: undefined,
                  targetLng: undefined,
                  altitude: 0,
                  speed: 0,
                  lat: targetLat,
                  lng: targetLng,
                };
              }

              // Hedefe doğru uç
              if (dist > 0.001) {
                newLat += (dx / dist) * moveSpeed;
                newLng += (dy / dist) * moveSpeed;
                newHeading = Math.atan2(dy, dx) * 180 / Math.PI;
              }
            } else {
              // Görev yoksa rastgele gezin
              newLat += Math.cos(d.heading * Math.PI / 180) * moveSpeed;
              newLng += Math.sin(d.heading * Math.PI / 180) * moveSpeed;
              newHeading += (Math.random() - 0.5) * 12;
            }
          }

          // 3. Engelden Kaçınma (Obstacle Avoidance)
          initialObstacles.forEach(obs => {
            const dx = obs.lat - newLat;
            const dy = obs.lng - newLng;
            const distInMeters = Math.sqrt(dx * dx + dy * dy) * 111000;
            if (distInMeters < obs.radius + 150 && Math.abs(d.altitude - obs.altitude) < Math.max(obs.altitudeMax, 100)) {
              newLat -= (dx / Math.max(distInMeters, 1)) * moveSpeed * 3;
              newLng -= (dy / Math.max(distInMeters, 1)) * moveSpeed * 3;
              newHeading += 45;
            }
          });

          // Batarya: ~0.17% per 2s tick (sadece uçarken)
          let newBattery = Math.max(0, d.battery - 0.14 - Math.random() * 0.06);
          let newStatus: DroneAgent["status"] = d.status;
          let newSpeed = d.speed + Math.round((Math.random() - 0.5) * 4);
          let newAlt = d.altitude + (Math.random() - 0.5) * 8;

          // Hız sınırları
          newSpeed = Math.max(15, Math.min(70, newSpeed));

          // %20 altına düşünce → otomatik iniş
          if (newBattery < 20 && d.battery >= 20) {
            newStatus = "emergency";
          } else if (newBattery < 20) {
            newSpeed = Math.max(0, d.speed - 5);
            newAlt = Math.max(0, d.altitude - 12);
            if (newAlt <= 3) {
              newStatus = "charging";
              newSpeed = 0;
              newAlt = 0;
            } else {
              newStatus = "emergency";
            }
          }

          if (newHeading < 0) newHeading += 360;
          if (newHeading > 360) newHeading -= 360;
          newAlt = Math.max(0, Math.min(350, newAlt));

          // İzmir sınırları
          newLat = Math.max(38.1, Math.min(38.7, newLat));
          newLng = Math.max(26.2, Math.min(27.5, newLng));

          return {
            ...d,
            lat: newLat,
            lng: newLng,
            battery: newBattery,
            heading: newHeading,
            altitude: Math.round(newAlt),
            speed: Math.round(newSpeed),
            status: newStatus as DroneAgent["status"],
          };
        });
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [emitMissionComplete]);

  // ═══ DRONE REF — görev atama closure'ından güncel drone verisine erişim ═══
  const dronesRef = useRef<DroneAgent[]>(drones);
  useEffect(() => { dronesRef.current = drones; }, [drones]);

  // ═══ AKILLI GÖREV ATAMA — 10sn'de bir açık görev varsa uygun drona ata ═══
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveMissions((prevMissions) => {
        const openMissions = prevMissions.filter(m => m.status === "open");
        if (openMissions.length === 0) {
          // Havuzdan yeni görev çek
          const newMission = pickRandomMission();
          return [...prevMissions, newMission];
        }

        // İlk açık görevi al
        const mission = openMissions[0];
        const compatibleTypes = missionToDroneType[mission.type] || [];

        // Uygun drone bul — REF'ten güncel veri oku
        const currentDrones = dronesRef.current;
        const candidate = currentDrones.find(d =>
          d.status === "idle" &&
          d.battery > 40 &&
          !d.missionId &&
          compatibleTypes.includes(d.type)
        );

        if (!candidate) return prevMissions; // Uygun drone yok, bekle

        // Drone'u kalkışa geçir
        setDrones(prevDrones =>
          prevDrones.map(d => {
            if (d.id === candidate.id) {
              return {
                ...d,
                status: "mission" as const,
                altitude: 100 + Math.round(Math.random() * 80),
                speed: 30 + Math.round(Math.random() * 20),
                heading: Math.round(Math.random() * 360),
                missionId: mission.id,
              };
            }
            return d;
          })
        );

        // Görevi güncelle — drone atandı
        return prevMissions.map(m =>
          m.id === mission.id
            ? { ...m, status: "in-progress" as const, droneId: candidate.id }
            : m
        );
      });
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  return { drones, liveMissions };
}

/* ─── Terminal Log Hook (Simülasyon Motoru) ─── */
function useTerminalLogs(drones: DroneAgent[]) {
  const [logs, setLogs] = useState<
    { time: string; drone: string; level: string; msg: string }[]
  >([]);
  const simRef = useRef<FlightSimulator | null>(null);
  // Önceki durumları takip et — tekrar mesaj önlemek için
  const prevStateRef = useRef<Map<number, { battery: number; status: string; altitude: number }>>(new Map());
  const firedEventsRef = useRef<Set<string>>(new Set());

  // Simülatörü başlat
  useEffect(() => {
    simRef.current = new FlightSimulator(initialDrones);
    // İlk durumları kaydet
    initialDrones.forEach(d => {
      prevStateRef.current.set(d.id, { battery: d.battery, status: d.status, altitude: d.altitude });
    });
  }, []);

  // Drone durum DEĞİŞİKLİKLERİNİ izle — sadece geçiş anında BİR KERE log
  useEffect(() => {
    const now = new Date().toLocaleTimeString("tr-TR");
    const newLogs: { time: string; drone: string; level: string; msg: string }[] = [];

    drones.forEach((d) => {
      const prev = prevStateRef.current.get(d.id);
      if (!prev) {
        prevStateRef.current.set(d.id, { battery: d.battery, status: d.status, altitude: d.altitude });
        return;
      }

      const eventKey = `${d.id}-${d.status}-${Math.floor(d.battery / 5)}`; // 5% bantlarında deduplicate

      // Batarya %20'nin altına İLK KEZ düştü
      if (prev.battery >= 20 && d.battery < 20 && !firedEventsRef.current.has(`${d.id}-bat-critical`)) {
        firedEventsRef.current.add(`${d.id}-bat-critical`);
        newLogs.push({
          time: now, drone: d.name, level: "error",
          msg: `🚨 BATARYA KRİTİK! %${d.battery.toFixed(1)} — ${d.specs.model} acil iniş protokolü başlatıldı!`,
        });
      }

      // Status DEĞİŞTİ: emergency'e geçti (acil iniş başladı)
      if (prev.status !== "emergency" && d.status === "emergency") {
        newLogs.push({
          time: now, drone: d.name, level: "warning",
          msg: `⚠ ${d.specs.model} acil iniş başlatıldı. İrtifa: ${d.altitude}m → 0m`,
        });
      }

      // Status DEĞİŞTİ: charging'e geçti (iniş tamamlandı)
      if (prev.status !== "charging" && d.status === "charging") {
        firedEventsRef.current.delete(`${d.id}-bat-critical`); // sonraki uçuş için sıfırla
        newLogs.push({
          time: now, drone: d.name, level: "success",
          msg: `✅ İniş tamamlandı. ${d.specs.model} şarj poduna bağlandı.`,
        });

        // ═══ DRONE KOORDİNASYONU: Görevi başka drone'a devret ═══
        const mission = initialMissions.find(m => m.droneId === d.id && (m.status === "in-progress" || m.status === "accepted"));
        if (mission) {
          // En uygun boşta drone'u bul (yüksek batarya + uygun tip)
          const candidate = drones
            .filter(other => other.id !== d.id && other.battery > 40 && (other.status === "idle" || other.status === "in-flight"))
            .sort((a, b) => b.battery - a.battery)[0];

          if (candidate) {
            newLogs.push({
              time: now, drone: "FleetAgent", level: "system",
              msg: `🔄 KOORDİNASYON: "${mission.title}" görevi ${d.name}'dan ${candidate.name}'a devredildi (Batarya: %${candidate.battery.toFixed(0)})`,
            });
          } else {
            newLogs.push({
              time: now, drone: "FleetAgent", level: "warning",
              msg: `⚠ "${mission.title}" görevi askıda — uygun drone bulunamadı. Şarj tamamlanınca yeniden atanacak.`,
            });
          }
        }
      }

      // Status DEĞİŞTİ: charging → idle (şarj tamamlandı)
      if (prev.status === "charging" && d.status === "idle") {
        newLogs.push({
          time: now, drone: d.name, level: "success",
          msg: `🔋 Şarj tamamlandı! ${d.specs.batteryCapacity}mAh → %100. Görev bekleniyor.`,
        });
      }

      // Status DEĞİŞTİ: idle → in-flight (kalkış yaptı)
      if (prev.status === "idle" && d.status === "in-flight") {
        newLogs.push({
          time: now, drone: d.name, level: "info",
          msg: `[KALKIŞ] ${d.specs.manufacturer} ${d.specs.model} havalandı. Hedef irtifa: ${d.altitude}m`,
        });
      }

      // Durumu güncelle
      prevStateRef.current.set(d.id, { battery: d.battery, status: d.status, altitude: d.altitude });
    });

    if (newLogs.length > 0) {
      setLogs((prev) => [...prev.slice(-40), ...newLogs]);
    }
  }, [drones]);

  // Simülasyon motorundan CANLI mesajlar — her 1.5s'de sıradaki drone konuşur
  useEffect(() => {
    const iv = setInterval(() => {
      if (!simRef.current) return;
      const entry = simRef.current.getNextMessage(drones);
      const newLog = {
        time: entry.timestamp.toLocaleTimeString("tr-TR"),
        drone: entry.droneName,
        level: entry.level,
        msg: entry.msg,
      };
      setLogs((prev) => [...prev.slice(-60), newLog]);
    }, 1500);

    return () => clearInterval(iv);
  }, [drones]);

  // Görev tamamlama eventini dinle
  useEffect(() => {
    const handler = ((e: CustomEvent) => {
      const { droneName, missionTitle } = e.detail;
      const now = new Date().toLocaleTimeString("tr-TR");
      setLogs((prev) => [...prev.slice(-60), {
        time: now, drone: droneName, level: "success",
        msg: `🎯 GÖREV TAMAMLANDI! "${missionTitle}" başarıyla teslim edildi. ${droneName} iniş yaptı.`,
      }]);
    }) as EventListener;
    window.addEventListener("mission-complete", handler);
    return () => window.removeEventListener("mission-complete", handler);
  }, []);

  return logs;
}

/* ─── Status Color ─── */
function statusColor(s: string) {
  switch (s) {
    case "in-flight": return "text-accent-cyan";
    case "mission": return "text-accent-violet";
    case "charging": return "text-warning";
    case "emergency": return "text-danger";
    default: return "text-text-muted";
  }
}

function statusDotClass(s: string) {
  switch (s) {
    case "in-flight": return "status-active";
    case "mission": return "status-active";
    case "charging": return "status-charging";
    case "emergency": return "status-emergency";
    default: return "status-idle";
  }
}

function typeColor(t: string) {
  switch (t) {
    case "cargo": return "bg-[#18181B] text-[#60A5FA] border-[#27272A]";
    case "agricultural": return "bg-[#18181B] text-[#34D399] border-[#27272A]";
    case "surveillance": return "bg-[#18181B] text-[#A78BFA] border-[#27272A]";
    case "emergency": return "bg-[#18181B] text-[#F87171] border-[#27272A]";
    case "fire": return "bg-[#18181B] text-[#F87171] border-[#27272A]";
    case "traffic": return "bg-[#18181B] text-[#FBBF24] border-[#27272A]";
    default: return "bg-[#18181B] text-[#A1A1AA] border-[#27272A]";
  }
}

function logLevelColor(l: string) {
  switch (l) {
    case "success": return "text-[#34D399]";
    case "warning": return "text-[#FBBF24]";
    case "error": return "text-[#F87171]";
    default: return "text-[#A1A1AA]";
  }
}

/* ─── NETWORK STATS ─── */
function NetworkStats({ drones }: { drones: DroneAgent[] }) {
  const { locale } = useLanguage();
  const active = drones.filter((d) => d.status === "in-flight" || d.status === "mission").length;
  const charging = drones.filter((d) => d.status === "charging").length;
  const avgBattery = Math.round(drones.reduce((a, d) => a + d.battery, 0) / drones.length);

  const stats = [
    { icon: Plane, label: tx(t.dash.activeFlight, locale), value: active, color: "text-accent-cyan" },
    { icon: Zap, label: tx(t.dash.charging, locale), value: charging, color: "text-warning" },
    { icon: Battery, label: tx(t.dash.avgBattery, locale), value: `%${avgBattery}`, color: "text-success" },
    { icon: TrendingUp, label: tx(t.dash.missionLabel, locale), value: initialMissions.filter((m) => m.status === "in-progress").length, color: "text-accent-violet" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="stat-card flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center ${s.color}`}>
            <s.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className="text-[11px] text-text-muted mt-1 uppercase tracking-wider font-medium">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SIDEBAR NAV ─── */
function DashboardNav() {
  const { locale } = useLanguage();
  const links = [
    { href: "/dashboard", label: tx(t.dash.navDashboard, locale), icon: Activity, active: true },
    { href: "/marketplace", label: tx(t.dash.navMarketplace, locale), icon: MapIcon },
    { href: "/sky-charge", label: tx(t.dash.navSkyCharge, locale), icon: Zap },
    { href: "/control", label: tx(t.dash.navControl, locale), icon: Crosshair },
    { href: "/flight-logs", label: tx(t.dash.navFlightLogs, locale), icon: Clock },
  ];

  return (
    <nav className="space-y-1.5">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            l.active
              ? "bg-accent-cyan/10 text-accent-cyan shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <l.icon className="w-4.5 h-4.5" />
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

/* ─── PREFLIGHT CHECKLIST ─── */
function PreflightChecklist({ drone }: { drone: DroneAgent }) {
  const checks = useMemo(() => [
    { id: "battery", label: "Batarya Kontrolü", detail: `%${drone.battery.toFixed(0)} — ${drone.battery > 25 ? "Yeterli" : "Yetersiz!"}`, autoPass: drone.battery > 25 },
    { id: "gps", label: "GPS Sinyali", detail: drone.specs.sensors.includes("RTK GPS") ? "RTK FIX ±2cm" : "3D FIX", autoPass: true },
    { id: "motors", label: "Motor Testi", detail: `${drone.specs.model} — 4/4 motor nominal`, autoPass: true },
    { id: "sensors", label: "Sensör Kalibrasyonu", detail: drone.specs.sensors.slice(0, 2).join(", "), autoPass: true },
    { id: "airspace", label: "Hava Sahası İzni", detail: `${drone.specs.license} — SHGM onaylı`, autoPass: true },
    { id: "weather", label: "Hava Durumu", detail: "Rüzgar < 30km/s — Uygun", autoPass: true },
    { id: "payload", label: "Yük Kontrolü", detail: drone.specs.maxPayload > 0 ? `Max ${(drone.specs.maxPayload/1000).toFixed(1)}kg — OK` : "Yük yok", autoPass: true },
    { id: "comms", label: "İletişim Linki", detail: "Solana RPC + Telemetri bağlantısı", autoPass: true },
  ], [drone]);

  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Auto-pass ilk render'da
  useEffect(() => {
    const timer = setTimeout(() => {
      const autoPassed = new Set<string>();
      checks.forEach((c, i) => {
        if (c.autoPass) {
          setTimeout(() => {
            setChecked(prev => new Set([...prev, c.id]));
          }, i * 300);
        }
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [drone.id]);

  const allPassed = checked.size === checks.length;
  const passedCount = checked.size;

  return (
    <div className="bg-bg-tertiary/60 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-text-muted text-xs flex items-center gap-1.5 font-medium uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" /> Uçuş Öncesi Kontrol
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          allPassed ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
        }`}>
          {passedCount}/{checks.length}
        </span>
      </div>

      <div className="space-y-1">
        {checks.map((c) => {
          const passed = checked.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => setChecked(prev => {
                const next = new Set(prev);
                if (next.has(c.id)) next.delete(c.id);
                else next.add(c.id);
                return next;
              })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-300 ${
                passed
                  ? "bg-success/[0.06] border border-success/20"
                  : "bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1]"
              }`}
            >
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all duration-300 ${
                passed
                  ? "bg-success border-success text-white"
                  : c.autoPass
                    ? "border-text-muted/40"
                    : "border-warning/60"
              }`}>
                {passed && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${passed ? "text-success" : "text-text-primary"}`}>
                  {c.label}
                </div>
                <div className="text-[10px] text-text-muted truncate">{c.detail}</div>
              </div>
            </button>
          );
        })}
      </div>

      {allPassed && (
        <div className="flex items-center gap-2 pt-1 text-success text-xs font-semibold animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4" />
          Tüm kontroller geçti — Uçuşa Hazır ✈
        </div>
      )}
    </div>
  );
}

/* ─── DRONE CHAT (Bireysel AI Sohbet) ─── */
function DroneChat({ drone }: { drone: DroneAgent }) {
  const [messages, setMessages] = useState<{ role: "user" | "drone"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Drone değişince sohbeti sıfırla
  useEffect(() => {
    setMessages([{
      role: "drone",
      text: `Merhaba, ben ${drone.name}. ${drone.personality}. Bana soru sorabilir veya komut verebilirsiniz.`
    }]);
  }, [drone.id]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const mission = initialMissions.find(m => m.id === drone.missionId);
      const res = await fetch("/api/ai-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          droneContext: {
            id: drone.id,
            name: drone.name,
            type: drone.type,
            status: drone.status,
            battery: drone.battery,
            altitude: drone.altitude,
            speed: drone.speed,
            lat: drone.lat,
            lng: drone.lng,
            heading: drone.heading,
            reputation: drone.reputation,
            specs: drone.specs,
            mission: mission ? { title: mission.title, type: mission.type, payment: mission.payment, progress: "aktif" } : null,
            personality: drone.personality,
          },
        }),
      });
      const data = await res.json();
      const response = data.parsed?.explanation || data.error || "Komutu işledim.";

      // Dispatch event for drone control (only if it's an actionable command, not just chat)
      if (data.success && data.parsed && data.parsed.action !== "droneChat") {
        const parsed = { ...data.parsed, params: { ...data.parsed.params, droneId: drone.id } };
        window.dispatchEvent(new CustomEvent("ai-command", { detail: parsed }));
      }

      setMessages(prev => [...prev, { role: "drone", text: response }]);
    } catch {
      setMessages(prev => [...prev, { role: "drone", text: `Bağlantı sorunu yaşıyorum. Komut kuyruğa alındı, tekrar dene.` }]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-bg-tertiary/60 rounded-xl overflow-hidden flex flex-col" style={{ height: 220 }}>
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2 shrink-0">
        <Radio className="w-3.5 h-3.5 text-accent-cyan" />
        <span className="text-xs font-semibold text-accent-cyan">{drone.name}</span>
        <span className="text-[10px] text-text-muted">ile Sohbet</span>
        <span className="ml-auto text-[10px] text-success flex items-center gap-1">
          <span className="status-dot status-active" /> bağlı
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
              m.role === "user"
                ? "bg-accent-cyan/10 text-text-primary border border-accent-cyan/20"
                : "bg-white/[0.04] border border-white/[0.06] text-text-secondary"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-[11px] text-accent-cyan flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> {drone.name} düşünüyor...
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-white/[0.06] shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`${drone.name}'a sor...`}
            className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[11px] focus:outline-none focus:border-accent-cyan/50"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-7 h-7 rounded-lg bg-accent-cyan/15 flex items-center justify-center disabled:opacity-30 hover:bg-accent-cyan/25 transition-colors"
          >
            <Send className="w-3 h-3 text-accent-cyan" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DRONE PANEL ─── */
function DronePanel({ drone, onClose }: { drone: DroneAgent; onClose: () => void }) {
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"info" | "checklist" | "chat">("info");

  return (
    <div className="glass-card p-6 space-y-4 animate-slide-in-right overflow-y-auto max-h-[calc(100vh-240px)] no-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl">{drone.name}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className={`status-dot ${statusDotClass(drone.status)}`} />
        <span className={`text-sm font-semibold ${statusColor(drone.status)}`}>
          {statusLabels(locale)[drone.status]}
        </span>
        <span className={`text-xs ml-2 px-2.5 py-0.5 rounded-full border ${typeColor(drone.type)}`}>
          {droneTypeLabels(locale)[drone.type]}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-bg-tertiary/40 rounded-xl p-1">
        {([
          { key: "info", label: "Bilgi", icon: Eye },
          { key: "checklist", label: "Kontrol", icon: CheckCircle2 },
          { key: "chat", label: "Sohbet", icon: Radio },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-accent-cyan/15 text-accent-cyan shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-white/[0.04]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-bg-tertiary/60 rounded-xl p-4">
              <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                <Battery className="w-3.5 h-3.5" /> Batarya
              </div>
              <div className={`text-xl font-bold tabular-nums ${drone.battery < 20 ? "text-danger" : drone.battery < 50 ? "text-warning" : "text-success"}`}>
                %{drone.battery.toFixed(1)}
              </div>
            </div>
            <div className="bg-bg-tertiary/60 rounded-xl p-4">
              <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5" /> Hız
              </div>
              <div className="text-xl font-bold tabular-nums">{drone.speed} km/s</div>
            </div>
            <div className="bg-bg-tertiary/60 rounded-xl p-4">
              <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" /> İrtifa
              </div>
              <div className="text-xl font-bold tabular-nums">{drone.altitude}m</div>
            </div>
            <div className="bg-bg-tertiary/60 rounded-xl p-4">
              <div className="text-text-muted text-xs mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" /> İtibar
              </div>
              <div className="text-xl font-bold tabular-nums text-accent-cyan">{drone.reputation}</div>
            </div>
          </div>

          <div className="bg-bg-tertiary/60 rounded-xl p-4 flex justify-between items-center">
            <div className="text-text-muted text-xs flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <MapIcon className="w-3.5 h-3.5" /> Koordinatlar
            </div>
            <div className="font-mono font-bold tracking-wide text-sm text-text-primary">
              {drone.lat.toFixed(5)}°N, {drone.lng.toFixed(5)}°E
            </div>
          </div>

          <div className="bg-bg-tertiary/60 rounded-xl p-4">
            <div className="text-text-muted text-xs mb-2 flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> AI Kişilik
            </div>
            <div className="text-sm font-medium leading-relaxed">{drone.personality}</div>
          </div>

          {/* Specs */}
          <div className="bg-bg-tertiary/60 rounded-xl p-4 space-y-3">
            <div className="text-text-muted text-xs flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> Teknik Özellikler
            </div>
            <div className="text-sm font-bold text-accent-cyan">{drone.specs.manufacturer} {drone.specs.model}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between"><span className="text-text-muted">Max Hız</span><span className="font-semibold tabular-nums">{drone.specs.maxSpeed} km/h</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Max İrtifa</span><span className="font-semibold tabular-nums">{drone.specs.maxAltitude}m</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Uçuş Süresi</span><span className="font-semibold tabular-nums">{drone.specs.maxFlightTime} dk</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Şarj Süresi</span><span className="font-semibold tabular-nums">{drone.specs.chargeTime} dk</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Max Yük</span><span className="font-semibold tabular-nums">{drone.specs.maxPayload > 0 ? `${(drone.specs.maxPayload/1000).toFixed(1)} kg` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Ücret/km</span><span className="font-semibold tabular-nums text-accent-cyan">{drone.specs.pricePerKm} SOL</span></div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-bold">{drone.specs.license}</span>
              <span className="text-[10px] text-text-muted">{drone.specs.sensors.slice(0, 3).join(' • ')}</span>
            </div>
          </div>
        </>
      )}

      {activeTab === "checklist" && <PreflightChecklist drone={drone} />}

      {activeTab === "chat" && <DroneChat drone={drone} />}

      <div className="flex gap-3 pt-2">
        <Link
          href="/control"
          className="flex-1 btn-primary !py-2.5 text-center text-sm rounded-xl font-semibold shadow-md inline-flex justify-center items-center gap-2"
        >
          <Crosshair className="w-4 h-4" />
          <span>Kontrol Et</span>
        </Link>
        <Link href="/marketplace" className="flex-1 btn-secondary !py-2.5 text-sm rounded-xl font-semibold flex items-center justify-center">
          Görev Ata
        </Link>
      </div>
    </div>
  );
}

/* ─── AGENT TERMINAL ─── */
function AgentTerminal({
  logs,
}: {
  logs: { time: string; drone: string; level: string; msg: string }[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal h-full flex flex-col">
      <div className="terminal-header">
        <div className="terminal-dot bg-danger" />
        <div className="terminal-dot bg-warning" />
        <div className="terminal-dot bg-success" />
        <span className="text-xs text-text-muted ml-2">agent_terminal.log</span>
        <span className="ml-auto text-xs text-success animate-glow-pulse flex items-center gap-1">
          <Radio className="w-3 h-3" /> CANLI
        </span>
      </div>
      <div ref={scrollRef} className="terminal-body flex-1 overflow-y-auto no-scrollbar relative min-h-0">
        <div className="terminal-scanline" />
        <div className="space-y-1.5">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="text-text-muted shrink-0">[{log.time}]</span>
              <span className="text-accent-cyan shrink-0">{log.drone}</span>
              <span className="text-text-muted">→</span>
              <span className={logLevelColor(log.level)}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MISSION FEED ─── */
function MissionFeed() {
  const { locale } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{tx(t.dash.activeMissions, locale)}</h3>
        <Link href="/marketplace" className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
          Tümü <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {initialMissions.filter((m) => m.status !== "completed" && m.status !== "cancelled").slice(0, 5).map((m) => (
          <div key={m.id} className="bg-bg-tertiary/60 rounded-xl p-4 hover:bg-bg-tertiary transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${typeColor(m.type)}`}>
                  {missionTypeLabels(locale)[m.type]}
                </span>
                {m.priority && (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-[#521313] bg-[#2E0A0A] text-[#F87171] flex items-center gap-1 mt-1.5 sm:mt-0">
                    <AlertTriangle className="w-3 h-3" /> Öncelikli
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-accent-cyan tabular-nums ml-2 whitespace-nowrap">{m.payment} SOL</span>
            </div>
            <div className="text-sm font-semibold mb-2">{m.title}</div>
            <div className="text-xs text-text-muted mb-3 leading-relaxed">{m.description.slice(0, 50)}...</div>
            <div className="flex items-center justify-end">
              <span className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full border ${
                m.status === "in-progress" ? "bg-[#062E1C] border-[#0A472A] text-[#34D399]" : "bg-[#2E1A05] border-[#4D2D0B] text-[#FBBF24]"
              }`}>
                {missionStatusLabels(locale)[m.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FLEET LIST (Accordion) ─── */
function FleetList({
  drones,
  selectedDroneId,
  onSelect,
}: {
  drones: DroneAgent[];
  selectedDroneId: number | null;
  onSelect: (drone: DroneAgent) => void;
}) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-1 py-3 mb-2 text-lg font-bold text-[#EDEDED] uppercase tracking-wide hover:text-white transition-colors"
      >
        <span>{tx(t.dash.fleet, locale)} ({drones.length})</span>
        <ChevronDown className={`w-5 h-5 text-[#A1A1AA] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 pt-1 overflow-y-auto max-h-[500px] no-scrollbar">
          {drones.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelect(d)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                selectedDroneId === d.id
                  ? "bg-accent-cyan/10 text-accent-cyan shadow-sm"
                  : "hover:bg-white/5"
              }`}
            >
              <span className={`status-dot shrink-0 ${statusDotClass(d.status)}`} />
              <span className="flex-1 truncate font-medium">{d.name}</span>
              {/* Mini battery bar */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      d.battery < 20 ? "bg-danger" : d.battery < 50 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${d.battery}%` }}
                  />
                </div>
                <span className={`text-[11px] tabular-nums w-7 text-right ${
                  d.battery < 20 ? "text-danger font-bold" : "text-text-muted"
                }`}>
                  {d.battery.toFixed(0)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── WEATHER WIDGET ─── */
function WeatherWidget() {
  const { locale } = useLanguage();
  const conditions = locale === "en"
    ? ["Clear", "Partly Cloudy", "Windy", "Light Rain"]
    : ["Açık", "Parçalı Bulutlu", "Rüzgarlı", "Hafif Yağmur"];
  const [weather, setWeather] = useState({ temp: 24, wind: 12, condition: conditions[0] });

  useEffect(() => {
    const iv = setInterval(() => {
      setWeather({
        temp: 20 + Math.round(Math.random() * 10),
        wind: 5 + Math.round(Math.random() * 20),
        condition: conditions[Math.floor(Math.random() * 4)],
      });
    }, 30000);
    return () => clearInterval(iv);
  }, [locale]);

  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Wind className="w-5 h-5 text-accent-cyan" />
        <div>
          <div className="text-sm font-medium">{weather.condition}</div>
          <div className="text-xs text-text-muted">{tx(t.dash.weather, locale)}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3.5 h-3.5 text-warning" />
          <span className="tabular-nums">{weather.temp}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="tabular-nums">{weather.wind} km/s</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN DASHBOARD PAGE ═══════════════════ */
export default function DashboardPage() {
  const { drones, liveMissions } = useDroneSimulator();
  const logs = useTerminalLogs(drones);
  const { locale, toggle } = useLanguage();
  const [selectedDroneId, setSelectedDroneId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<DroneType | "all">("all");
  const [showRadar, setShowRadar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Loading splash — 1.5 saniye
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Canlı drone verisi — her tick'te güncellenir
  const selectedDrone = selectedDroneId
    ? drones.find((d) => d.id === selectedDroneId) ?? null
    : null;

  const handleDroneSelect = useCallback((drone: DroneAgent) => {
    setSelectedDroneId(drone.id);
  }, []);

  // AI Dispatcher'dan drone seçim event'ini dinle
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.droneId) {
        setSelectedDroneId(detail.droneId);
      }
    };
    window.addEventListener("select-drone", handler);
    return () => window.removeEventListener("select-drone", handler);
  }, []);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#14F195] to-[#9945FF] flex items-center justify-center animate-pulse">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -inset-4 border border-[#14F195]/20 rounded-3xl animate-spin" style={{animationDuration: '3s'}} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-[#EDEDED]">NeuralAir SkyAgent</h2>
          <div className="flex items-center gap-2 text-sm text-[#71717A]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
            {locale === "en" ? "Synchronizing fleet..." : "Filo senkronize ediliyor..."}
          </div>
        </div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#14F195] to-[#9945FF] rounded-full animate-loading-bar" style={{animation: 'loading-bar 1.5s ease-in-out'}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* ── Left Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-bg-secondary/80 backdrop-blur-xl border-r border-white/[0.06] p-5 flex flex-col gap-6 transform transition-transform lg:translate-x-0 overflow-y-auto no-scrollbar ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-sm">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">NeuralAir</span>
          </Link>
          <button className="lg:hidden text-text-muted" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <DashboardNav />

        <WeatherWidget />

        {/* Drone fleet — accordion */}
        <FleetList
          drones={drones}
          selectedDroneId={selectedDroneId}
          onSelect={handleDroneSelect}
        />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 border-b border-white/[0.06] bg-bg-secondary/40 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-text-muted" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-cyan" />
              {tx(t.dash.title, locale)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs font-bold tracking-wider hover:bg-white/[0.1] transition-all">
              <span className={locale === "tr" ? "text-[#14F195]" : "text-[#A1A1AA]"}>TR</span>
              <span className="text-[#52525B]">|</span>
              <span className={locale === "en" ? "text-[#14F195]" : "text-[#A1A1AA]"}>EN</span>
            </button>
            <WalletConnect />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <NetworkStats drones={drones} />

          <div className="grid lg:grid-cols-3 gap-6" style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* Map - Takes 2 cols */}
            <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col" style={{ minHeight: 500 }}>
              <div className="p-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-accent-cyan" />
                  {tx(t.dash.liveMap, locale)}
                </h3>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-text-secondary focus:outline-none focus:border-accent-cyan cursor-pointer"
                  >
                    <option value="all">{tx(t.dash.allFleet, locale)}</option>
                    <option value="cargo">Kargo Dronları</option>
                    <option value="emergency">Acil Durum</option>
                    <option value="agricultural">Ziraat</option>
                  </select>
                  
                  <button 
                    onClick={() => setShowRadar(!showRadar)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${showRadar ? "bg-accent-violet/20 text-accent-violet border border-accent-violet/30" : "bg-black/50 text-text-muted border border-white/10"}`}
                  >
                    <Radio className={`w-3 h-3 ${showRadar ? "animate-pulse" : ""}`} /> 
                    {tx(t.dash.radarMode, locale)}
                  </button>

                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-text-muted">{drones.length} {tx(t.dash.droneActive, locale)}</span>
                    <span className="status-dot status-active" />
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <SkyMap
                  drones={drones}
                  pods={initialPods}
                  missions={liveMissions}
                  obstacles={initialObstacles}
                  onDroneClick={handleDroneSelect}
                  selectedDroneId={selectedDroneId ?? undefined}
                  filterType={filterType}
                  showRadar={showRadar}
                />
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-5 flex flex-col">
              {selectedDrone ? (
                <DronePanel drone={selectedDrone} onClose={() => setSelectedDroneId(null)} />
              ) : (
                <div className="glass-card p-5 text-center text-text-muted text-sm flex-1 flex flex-col items-center justify-center">
                  <Crosshair className="w-8 h-8 mx-auto mb-3 text-text-muted opacity-30" />
                  Bir drone seçerek detayları görüntüleyin
                </div>
              )}

              <MissionFeed />
            </div>
          </div>

          {/* Agent Terminal - Full width */}
          <div className="mt-4" style={{ height: 280 }}>
            <AgentTerminal logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
