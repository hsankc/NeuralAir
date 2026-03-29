"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Crosshair, Cpu, MapPin, Navigation, TrendingUp } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function ControlPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [txCount, setTxCount] = useState(0);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: string }[]>([]);
  const [altitude, setAltitude] = useState(250);
  const [bearing, setBearing] = useState(0);
  const [coords, setCoords] = useState("38.4237, 27.1428");
  const [isStarted, setIsStarted] = useState(false);

  // Target & Current state refs (for physics/lerp)
  const targetCam = useRef({ lng: 27.1428, lat: 38.4237, alt: 250, bearing: 0 });
  const currentCam = useRef({ lng: 27.1428, lat: 38.4237, alt: 250, bearing: 0 });
  const keys = useRef<Record<string, boolean>>({});

  const appendLog = (msg: string, type: string = "info") => {
    const time = new Date().toLocaleTimeString("tr-TR", { hour12: false });
    setLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 30));
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // ── MAPLIBRE GL JS INIT (OpenFreeMap: 3D bina desteği olan açık kaynaklı stil) ──
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: [27.1428, 38.4237], 
      zoom: 17.5,
      pitch: 85,
      bearing: 0,
      interactive: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      appendLog("Sky-Sync Protokolü Başlatıldı", "success");
      appendLog("Monad Paralel EVM Güvenli Bağlantı", "success");
      
      // Cyberpunk 3D Bina Extrusion (Bina yüksekliklerini kullanarak gerçek 3D görünümü)
      map.addLayer({
        id: "cyberpunk-3d-buildings",
        source: "openmaptiles",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          // Binaları neon mor ve yeşil arası renklerde yüksekliklerine göre boyuyoruz
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "render_height"],
            0, "#836ef1",    // Kısa binalar neon mor
            20, "#000000",   // Duvarlar siyah
            300, "#39ff65",  // Gökdelenler neon yeşil
          ],
          "fill-extrusion-height": ["get", "render_height"],
          "fill-extrusion-base": ["get", "render_min_height"],
          "fill-extrusion-opacity": 0.8,
        },
      });

      // Yol ağını neon yap (Grid efekti)
      const layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((l) => {
          if (l.type === "line" && l.id.toLowerCase().includes("road")) {
            map.setPaintProperty(l.id, "line-color", "rgba(57, 255, 101, 0.4)");
          }
        });
      }

      startEngine();
    });

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
    const lerpAngle = (start: number, end: number, factor: number) => {
      let diff = end - start;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      return start + diff * factor;
    };

    const startEngine = () => {
      let lastTxTimes: Record<string, number> = {};
      const TX_DEBOUNCE_MS = 500;

      const flightLoop = () => {
        if (!mapRef.current) return;
        
        let moving = false;
        let activeMoves: string[] = [];

        const moveThrust = 0.00015;
        const rotateThrust = 2.5;
        const altThrust = 4.0;
        const rad = targetCam.current.bearing * (Math.PI / 180);

        if (keys.current["KeyW"] || keys.current["ArrowUp"]) {
          targetCam.current.lat += Math.cos(rad) * moveThrust;
          targetCam.current.lng += Math.sin(rad) * moveThrust;
          activeMoves.push("THRUST_FORWARD");
          moving = true;
        }
        if (keys.current["KeyS"] || keys.current["ArrowDown"]) {
          targetCam.current.lat -= Math.cos(rad) * moveThrust;
          targetCam.current.lng -= Math.sin(rad) * moveThrust;
          activeMoves.push("THRUST_REVERSE");
          moving = true;
        }
        if (keys.current["KeyA"] || keys.current["ArrowLeft"]) {
          targetCam.current.lat += Math.cos(rad - Math.PI / 2) * moveThrust;
          targetCam.current.lng += Math.sin(rad - Math.PI / 2) * moveThrust;
          activeMoves.push("STRAFE_LEFT");
          moving = true;
        }
        if (keys.current["KeyD"] || keys.current["ArrowRight"]) {
          targetCam.current.lat += Math.cos(rad + Math.PI / 2) * moveThrust;
          targetCam.current.lng += Math.sin(rad + Math.PI / 2) * moveThrust;
          activeMoves.push("STRAFE_RIGHT");
          moving = true;
        }

        if (keys.current["KeyQ"]) {
          targetCam.current.bearing -= rotateThrust;
          activeMoves.push("YAW_LEFT");
          moving = true;
        }
        if (keys.current["KeyE"]) {
          targetCam.current.bearing += rotateThrust;
          activeMoves.push("YAW_RIGHT");
          moving = true;
        }

        if (keys.current["Space"]) {
          targetCam.current.alt += altThrust;
          activeMoves.push("ASCEND");
          moving = true;
        }
        if (keys.current["ShiftLeft"] || keys.current["ShiftRight"]) {
          targetCam.current.alt = Math.max(5, targetCam.current.alt - altThrust);
          activeMoves.push("DESCEND");
          moving = true;
        }

        // Lerp physics
        const f = 0.12;
        currentCam.current.lat = lerp(currentCam.current.lat, targetCam.current.lat, f);
        currentCam.current.lng = lerp(currentCam.current.lng, targetCam.current.lng, f);
        currentCam.current.alt = lerp(currentCam.current.alt, targetCam.current.alt, f);
        currentCam.current.bearing = lerpAngle(currentCam.current.bearing, targetCam.current.bearing, f);

        // UI Updates
        setAltitude(Math.round(currentCam.current.alt));
        setBearing(Math.round(currentCam.current.bearing));
        setCoords(`${currentCam.current.lat.toFixed(5)}N, ${currentCam.current.lng.toFixed(5)}E`);

        // Apply to Map (Safely check if style is ready)
        if (mapRef.current.style && mapRef.current.style._loaded) {
          mapRef.current.setCenter([currentCam.current.lng, currentCam.current.lat]);
          mapRef.current.setBearing(currentCam.current.bearing);
          mapRef.current.setZoom(Math.max(1, 22 - Math.log2(currentCam.current.alt)));
        }

        // TX Streaming
        if (moving) {
          const now = performance.now();
          activeMoves.forEach((move) => {
            if (now - (lastTxTimes[move] || 0) > TX_DEBOUNCE_MS) {
              lastTxTimes[move] = now;
              setTxCount((c) => c + 1);
              appendLog(`[KUYRUKTA] Mission::${move}()`, "warning");
              setTimeout(() => {
                appendLog(`[ONAYLANDI] ${move}() kaydedildi. Tx: 0x${Math.random().toString(16).slice(2, 10)}...`, "success");
              }, 400);
            }
          });
        }

        requestAnimationFrame(flightLoop);
      };

      requestAnimationFrame(flightLoop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  return (
    <div className="relative h-screen bg-black overflow-hidden font-mono text-accent-cyan select-none">
      {/* HARİTA KONTEYNERI */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 z-0 bg-neutral-900" 
        style={{ width: '100vw', height: '100vh' }} 
      />
      
      {/* HUD OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-accent-violet/15 via-transparent to-accent-cyan/15" />

      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              NEURALAIR <span className="text-accent-violet">:: SKY-SYNC</span>
            </h1>
            <p className="text-[10px] tracking-[4px] text-accent-violet font-bold uppercase">True FPV Simulator</p>
          </div>
        </div>
        <div className="text-right pointer-events-auto bg-black/80 border border-success/40 px-4 py-2 rounded-sm pr-10">
            <div className="text-[10px] text-success/70 font-bold mb-1 uppercase tracking-widest">Bağlı Ajan</div>
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-bold text-white uppercase">Ege-01</span>
            </div>
        </div>
      </div>

      {/* TERMINAL */}
      <div className="absolute top-28 right-6 w-80 h-[450px] bg-black/85 border border-accent-violet/30 rounded-sm z-50 pointer-events-auto flex flex-col shadow-[0_0_30px_rgba(131,110,241,0.2)]">
        <div className="p-3 bg-accent-violet/20 border-b border-accent-violet/30 flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-widest flex items-center gap-2">
            <Radio className="w-3 h-3 text-white animate-pulse" /> MONAD TX STREAM
          </span>
          <span className="text-[8px] px-1.5 py-0.5 border border-accent-violet/50 rounded-sm">400ms FINALITY</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="text-[11px] leading-tight animate-fade-in">
              <span className="text-accent-violet mr-1.5">[{log.time}]</span>
              <span className={log.type === "success" ? "text-success" : log.type === "warning" ? "text-warning" : "text-white opacity-80"}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* START MODAL */}
      {!isStarted && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto">
          <button 
            onClick={() => {
              setIsStarted(true);
              appendLog("3D Cyberpunk Motoru Aktifleştirildi", "success");
            }}
            className="group relative px-10 py-6 border border-accent-cyan/40 hover:border-accent-cyan transition-all"
          >
            <div className="absolute -inset-0.5 bg-accent-cyan/20 blur opacity-0 group-hover:opacity-100 transition-all" />
            <div className="relative flex flex-col items-center gap-4">
              <Crosshair className="w-16 h-16 text-accent-cyan mb-2" />
              <div className="text-center">
                <div className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">3D UÇUŞU BAŞLATMAK İÇİN TIKLAYIN</div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-[10px] font-bold text-accent-cyan/80">
                  <div className="flex items-center gap-2 uppercase tracking-widest"><span className="px-1.5 py-0.5 bg-accent-cyan text-black">W/S</span> İleri / Geri</div>
                  <div className="flex items-center gap-2 uppercase tracking-widest"><span className="px-1.5 py-0.5 bg-accent-cyan text-black">A/D</span> Sola / Sağa</div>
                  <div className="flex items-center gap-2 uppercase tracking-widest"><span className="px-1.5 py-0.5 bg-accent-cyan text-black">Q/E</span> Dönüş</div>
                  <div className="flex items-center gap-2 uppercase tracking-widest"><span className="px-1.5 py-0.5 bg-accent-cyan text-black">ESC</span> Fareyi Bırak</div>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* CROSSHAIR */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none opacity-40">
        <div className="w-20 h-20 rounded-full border border-dashed border-accent-violet animate-spin-slow flex items-center justify-center">
          <div className="w-10 h-[1px] bg-success" />
          <div className="h-10 w-[1px] bg-success absolute" />
        </div>
      </div>

      {/* TELEMETRY FOOTER */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-50 pointer-events-none flex-wrap gap-4">
        <div className="flex gap-4 pointer-events-auto">
          <div className="bg-black/85 border-l-4 border-success p-4 min-w-[150px]">
            <div className="text-[10px] text-accent-violet font-bold mb-1 uppercase tracking-widest">Koordinatlar</div>
            <div className="text-xl font-black text-white">{coords}</div>
          </div>
          <div className="bg-black/85 border-l-4 border-accent-cyan p-4 min-w-[120px]">
             <div className="text-[10px] text-accent-violet font-bold mb-1 uppercase tracking-widest">İrtifa</div>
             <div className="text-xl font-black text-white">{altitude}m</div>
          </div>
          <div className="bg-black/85 border-l-4 border-accent-cyan p-4 min-w-[120px]">
             <div className="text-[10px] text-accent-violet font-bold mb-1 uppercase tracking-widest">Açı (Yaw)</div>
             <div className="text-xl font-black text-white">{bearing}°</div>
          </div>
          <div className="bg-black/85 border-l-4 border-accent-violet p-4 min-w-[120px]">
             <div className="text-[10px] text-accent-violet font-bold mb-1 uppercase tracking-widest">TX Streamed</div>
             <div className="text-xl font-black text-white">{txCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
