import { useState, useEffect, useCallback, useRef } from "react";
import { initialDrones, initialMissions, initialObstacles, DroneAgent, Mission } from "@/lib/data";
import { pickRandomMission, generateInitialOpenMissions, missionToDroneType } from "@/lib/missions";
import { FlightSimulator } from "@/lib/simulation";
import { buildFieldSweepPath } from "@/lib/agriculturalSweep";

export function useDroneSimulator() {
  const [drones, setDrones] = useState(initialDrones);
  const [liveMissions, setLiveMissions] = useState<Mission[]>(() => [
    ...initialMissions,
    ...generateInitialOpenMissions(),
  ]);

  // ═══ REF: Simülasyon closure'ına güncel mission verisini ver ═══
  const missionsRef = useRef<Mission[]>(liveMissions);
  useEffect(() => { missionsRef.current = liveMissions; }, [liveMissions]);

  /** Ziraat lawnmower waypoint index — droneId + missionId */
  const agSweepRef = useRef<Map<string, { index: number; path: [number, number][] }>>(new Map());

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
        const validAgSweepKeys = new Set(
          prevDrones
            .filter((x) => x.type === "agricultural" && x.status === "mission" && x.missionId != null)
            .map((x) => `${x.id}-${x.missionId}`),
        );
        for (const k of [...agSweepRef.current.keys()]) {
          if (!validAgSweepKeys.has(k)) agSweepRef.current.delete(k);
        }

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

          // 1. Ziraat — görev dikdörtgeninde lawnmower waypoint takibi
          if (d.type === "agricultural" && d.status === "mission") {
            if (mission?.type === "agricultural") {
              const sweepKey = `${d.id}-${mission.id}`;
              let sweep = agSweepRef.current.get(sweepKey);
              if (!sweep) {
                sweep = { index: 0, path: buildFieldSweepPath(mission) };
                agSweepRef.current.set(sweepKey, sweep);
              }

              let idx = sweep.index;
              while (idx < sweep.path.length) {
                const [wLat, wLng] = sweep.path[idx];
                const wx = wLat - d.lat;
                const wy = wLng - d.lng;
                if (Math.hypot(wx, wy) < 0.0002) idx += 1;
                else break;
              }
              sweep.index = idx;
              agSweepRef.current.set(sweepKey, sweep);

              if (idx >= sweep.path.length) {
                emitMissionComplete(d.id, mission.id, d.name, mission.title);
                setLiveMissions((prev) =>
                  prev.map((m) => (m.id === mission.id ? { ...m, status: "completed" as const } : m)),
                );
                agSweepRef.current.delete(sweepKey);
                return {
                  ...d,
                  status: "idle" as const,
                  missionId: null,
                  targetLat: undefined,
                  targetLng: undefined,
                  altitude: 35,
                  speed: 0,
                };
              }

              const [tLat, tLng] = sweep.path[idx];
              const dx = tLat - d.lat;
              const dy = tLng - d.lng;
              const dist = Math.hypot(dx, dy) || 1e-9;
              moveSpeed = 0.00034;
              newLat = d.lat + (dx / dist) * moveSpeed;
              newLng = d.lng + (dy / dist) * moveSpeed;
              newHeading = (Math.atan2(dy, dx) * 180) / Math.PI;
            } else if (mission) {
              const dx = mission.toLat - d.lat;
              const dy = mission.toLng - d.lng;
              const dist = Math.hypot(dx, dy) || 1e-9;
              moveSpeed = 0.0004;
              newLat += (dx / dist) * moveSpeed;
              newLng += (dy / dist) * moveSpeed;
              newHeading = (Math.atan2(dy, dx) * 180) / Math.PI;
            } else {
              const rad = (d.heading * Math.PI) / 180;
              moveSpeed = 0.00025;
              newLat = d.lat + Math.cos(rad) * moveSpeed;
              newLng = d.lng + Math.sin(rad) * moveSpeed;
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
export function useTerminalLogs(drones: DroneAgent[]) {
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
