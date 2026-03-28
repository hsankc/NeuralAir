"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Crosshair,
  ArrowLeft,
  ChevronRight,
  Cpu,
  Navigation,
  Battery,
  Zap,
  MousePointer2,
} from "lucide-react";
import { initialDrones, droneTypeLabels } from "@/lib/data";

interface HudData {
  lat: number;
  lng: number;
  alt: number;
  speed: number;
}

export default function ControlPage() {
  const [selectedDroneId, setSelectedDroneId] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState<HudData>({ lat: 38.4237, lng: 27.1428, alt: 200, speed: 0 });
  const [pointerLocked, setPointerLocked] = useState(false);

  const drone = initialDrones.find((d) => d.id === selectedDroneId)!;

  // Simulator Engine Ref
  const keys = useRef({ w: false, a: false, s: false, d: false, q: false, e: false, shift: false });
  const mouseRot = useRef({ heading: 0, pitch: -0.2 });

  useEffect(() => {
    const Cesium = (window as any).Cesium;
    if (!Cesium || !containerRef.current) return;

    // Set Base URL so Cesium knows where to find its WebWorkers and Assets
    (window as any).CESIUM_BASE_URL = "https://cdnjs.cloudflare.com/ajax/libs/cesium/1.114.0/";

    // Set Ion Token for Google Photorealistic 3D Tiles
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";

    // Initialize Viewer
    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
    });

    // Disable Cesium's default mouse controls to prevent internal errors on click
    viewer.scene.screenSpaceCameraController.enableInputs = false;

    // Optimize rendering
    const creditContainer = viewer.bottomContainer;
    if (creditContainer) creditContainer.style.display = "none";

    // Load Environment (Terrain + Buildings)
    const loadEnvironment = async () => {
      try {
        viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync({
          requestWaterMask: true,
        });
        const osmBuildings = await Cesium.createOsmBuildingsAsync();
        viewer.scene.primitives.add(osmBuildings);
      } catch (err) {
        console.warn("OSM Binaları yüklenemedi", err);
      }
    };
    loadEnvironment();

    const camera = viewer.camera;

    // Set initial position specifically to Izmir
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(27.1428, 38.4237, 250),
      orientation: {
        heading: mouseRot.current.heading,
        pitch: mouseRot.current.pitch,
        roll: 0.0,
      },
    });

    // ── INPUT HANDLING ──
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "shift") keys.current.shift = true;
      if (keys.current.hasOwnProperty(key)) keys.current[key as keyof typeof keys.current] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "shift") keys.current.shift = false;
      if (keys.current.hasOwnProperty(key)) keys.current[key as keyof typeof keys.current] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Mouse Gimbal Look
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== containerRef.current) return;
      const sensitivity = 0.002;
      mouseRot.current.heading += e.movementX * sensitivity;
      mouseRot.current.pitch -= e.movementY * sensitivity;
      // Limit pitch to prevent flipping upside down
      mouseRot.current.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseRot.current.pitch));
    };
    
    window.addEventListener("mousemove", onMouseMove);

    const checkPointerLock = () => {
      setPointerLocked(document.pointerLockElement === containerRef.current);
    };
    document.addEventListener("pointerlockchange", checkPointerLock);

    // Enable pointer lock on click
    const handleSimClick = () => {
      try {
        const promise = containerRef.current?.requestPointerLock();
        if (promise !== undefined && (promise as any).catch) {
          (promise as any).catch(() => {});
        }
      } catch (err) {}
    };
    containerRef.current.addEventListener("click", handleSimClick);

    // ── RENDER LOOP ──
    const preRenderListener = () => {
      const isLocked = document.pointerLockElement === containerRef.current;
      if (!isLocked) return;

      const baseSpeed = keys.current.shift ? 4.0 : 0.8; // Boost with shift
      const altSpeed = 0.5;

      let moved = false;
      if (keys.current.w) { camera.moveForward(baseSpeed); moved = true; }
      if (keys.current.s) { camera.moveBackward(baseSpeed); moved = true; }
      if (keys.current.a) { camera.moveLeft(baseSpeed); moved = true; }
      if (keys.current.d) { camera.moveRight(baseSpeed); moved = true; }
      if (keys.current.q) { camera.moveDown(altSpeed); moved = true; }
      if (keys.current.e) { camera.moveUp(altSpeed); moved = true; }

      // Force view orientation updates
      camera.setView({
        orientation: {
          heading: mouseRot.current.heading,
          pitch: mouseRot.current.pitch,
          roll: 0,
        },
      });
    };
    viewer.scene.preUpdate.addEventListener(preRenderListener);

    // ── HUD UPDATER ──
    const hudInterval = setInterval(() => {
      const cartographic = Cesium.Cartographic.fromCartesian(camera.position);
      setHud({
        lat: Cesium.Math.toDegrees(cartographic.latitude),
        lng: Cesium.Math.toDegrees(cartographic.longitude),
        alt: Math.round(cartographic.height),
        speed: (keys.current.w || keys.current.s) ? (keys.current.shift ? 65 : 24) : 0,
      });
    }, 200);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", checkPointerLock);
      clearInterval(hudInterval);
      if (containerRef.current) containerRef.current.removeEventListener("click", handleSimClick);
      viewer.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      {/* HUD Header overlaying the 3D canvas */}
      <header className="absolute top-0 inset-x-0 z-10 glass-strong border-b border-border shadow-md">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-text-muted hover:text-accent-cyan">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded gradient-bg flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold gradient-text hidden sm:block">NeuralAir</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-danger animate-pulse" />
                  FPV Simülatör Modu
                </span>
              </div>
            </div>

            {/* Drone Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-bold">{drone.name}</span>
                <span className="text-xs px-2 py-0.5 rounded border bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30">
                  {droneTypeLabels[drone.type]}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-text-muted">
                <Zap className="w-3.5 h-3.5 text-warning" />
                Kira Ücreti: 2 MON / Saat
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Viewport container */}
      <div className="flex-1 relative cursor-crosshair group">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Click to start overlay */}
        {!pointerLocked && (
          <div className="absolute inset-0 z-20 bg-bg-primary/60 backdrop-blur-sm flex items-center justify-center">
            <div className="glass-card p-8 flex flex-col items-center gap-4 transform transition-transform hover:scale-105">
              <MousePointer2 className="w-12 h-12 text-accent-cyan mb-2" />
              <h2 className="text-xl font-bold">Uçuşu Başlatmak İçin Tıklayın</h2>
              <div className="text-sm text-text-secondary text-center space-y-2 mt-4">
                <p><b>W / A / S / D</b>: Yön Kontrolleri</p>
                <p><b>Q / E</b>: İrtifa (Alçal/Yüksel)</p>
                <p><b>Shift</b>: Hızlı Uçuş</p>
                <p><b>Mouse</b>: Gimbal (Kamera Açısı)</p>
                <p><b>ESC</b>: Serbest Fare Modu</p>
              </div>
            </div>
          </div>
        )}

        {/* Tactical HUD Overlay (Visible only when flying) */}
        {pointerLocked && (
          <div className="absolute inset-x-0 bottom-8 z-10 pointer-events-none flex justify-center">
            <div className="glass-card shadow-lg p-3 rounded-lg flex items-center gap-8 mx-auto pointer-events-auto border-accent-cyan/20">
              <div className="text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">ALT (m)</div>
                <div className="text-xl font-mono font-bold text-accent-cyan tabular-nums">{hud.alt}</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">SPD (km/s)</div>
                <div className="text-xl font-mono font-bold text-success tabular-nums">{hud.speed}</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">LAT (N)</div>
                <div className="text-sm font-mono font-semibold text-text-primary tabular-nums">{hud.lat.toFixed(5)}</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">LNG (E)</div>
                <div className="text-sm font-mono font-semibold text-text-primary tabular-nums">{hud.lng.toFixed(5)}</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center flex flex-col items-center">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">BAT</div>
                <div className="flex items-center gap-1 text-warning">
                  <Battery className="w-4 h-4" />
                  <span className="text-sm font-bold font-mono">%{drone.battery.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reticle */}
        {pointerLocked && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-difference z-10 text-white/50">
            <Crosshair className="w-8 h-8 opacity-50" />
            <div className="absolute rounded-full w-24 h-24 border border-white/20 border-dashed animate-[spin_10s_linear_infinite]" />
          </div>
        )}
      </div>
    </div>
  );
}
