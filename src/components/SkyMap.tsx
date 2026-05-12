"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DroneAgent, ChargingPod, Mission, AirspaceObstacle, DroneType } from "@/lib/data";
import { buildFieldSweepPath } from "@/lib/agriculturalSweep";

interface SkyMapProps {
  drones: DroneAgent[];
  pods: ChargingPod[];
  missions?: Mission[];
  obstacles?: AirspaceObstacle[];
  onDroneClick?: (drone: DroneAgent) => void;
  selectedDroneId?: number;
  filterType?: DroneType | "all"; // Map filters
  showRadar?: boolean;
}

// ═══ ICONS ═══
function droneIconSvg(color: string, heading: number, isSelected: boolean) {
  const glow = isSelected ? `<circle cx="16" cy="16" r="15" fill="none" stroke="${color}" stroke-width="2" opacity="0.6"><animate attributeName="r" values="14;18;14" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/></circle>` : '';
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(${heading}deg)">
    ${glow}
    <circle cx="16" cy="16" r="14" fill="${color}22" stroke="${color}" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="4" fill="${color}"/>
    <path d="M16 4 L18 12 L16 10 L14 12 Z" fill="${color}" opacity="0.9"/>
    <circle cx="16" cy="16" r="8" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.4"/>
  </svg>`;
}

function podIconSvg(available: boolean) {
  const color = available ? "#FFD600" : "#FF1744";
  return `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="${color}22" stroke="${color}" stroke-width="1.5"/>
    <path d="M12 6 L12 12 M9 9 L15 9 M12 12 L12 18" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function getDroneColor(type: string, status: string): string {
  if (status === "emergency") return "#FF1744";
  if (status === "charging") return "#FFD600";
  switch (type) {
    case "cargo": return "#00E5FF";
    case "agricultural": return "#00E676";
    case "surveillance": return "#7C4DFF";
    case "emergency": return "#FF1744";
    default: return "#00E5FF";
  }
}

function getObstacleColor(severity: string) {
  switch (severity) {
    case "high": return "#FF1744"; // Red
    case "medium": return "#F59E0B"; // Orange
    case "low": return "#00E5FF"; // Cyan
    default: return "#94A3B8";
  }
}

// ═══ UTILS ═══
function calcRouteProgress(drone: DroneAgent, mission: Mission): number {
  const totalDist = Math.sqrt(
    Math.pow((mission.toLat - mission.fromLat) * 111, 2) +
    Math.pow((mission.toLng - mission.fromLng) * 85, 2)
  );
  const remaining = Math.sqrt(
    Math.pow((mission.toLat - drone.lat) * 111, 2) +
    Math.pow((mission.toLng - drone.lng) * 85, 2)
  );
  return Math.max(0, Math.min(100, Math.floor((1 - remaining / Math.max(totalDist, 0.1)) * 100)));
}

// Calculate an arc (curve) between two points
function calculateArc(start: [number, number], end: [number, number], arcHeight: number = 0.02, steps: number = 20): [number, number][] {
  const points: [number, number][] = [];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  
  // Calculate normal vector
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Linear interpolation
    const lx = start[0] + dx * t;
    const ly = start[1] + dy * t;
    
    // Parabolic arc offset
    const offset = arcHeight * Math.sin(t * Math.PI);
    
    points.push([lx + nx * offset, ly + ny * offset]);
  }
  
  return points;
}

// ═════════ SKY MAP COMPONENT ═════════
export default function SkyMap({ 
  drones, pods, missions = [], obstacles = [], 
  onDroneClick, selectedDroneId, filterType = "all", showRadar = false 
}: SkyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  const droneMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const podMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const routeLayersRef = useRef<Map<number, L.LayerGroup>>(new Map());
  const obstacleLayersRef = useRef<Map<number, L.LayerGroup>>(new Map());
  const agriculturalScanRef = useRef<Map<number, L.LayerGroup>>(new Map());
  const agScanMissionIdRef = useRef<Map<number, number>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [38.42, 27.14], // İzmir center
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark/Neon tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      droneMarkersRef.current.clear();
      podMarkersRef.current.clear();
      routeLayersRef.current.clear();
      obstacleLayersRef.current.clear();
      agriculturalScanRef.current.clear();
      agScanMissionIdRef.current.clear();
    };
  }, []);

  // Update pods
  useEffect(() => {
    if (!mapRef.current) return;
    pods.forEach((pod) => {
      if (!podMarkersRef.current.has(pod.id)) {
        const icon = L.divIcon({ html: podIconSvg(pod.available), className: "", iconSize: [24, 24], iconAnchor: [12, 12] });
        const marker = L.marker([pod.lat, pod.lng], { icon }).addTo(mapRef.current!);
        marker.bindPopup(`<b>${pod.name}</b><br/>Enerji: ${pod.totalEnergy} kWh`);
        podMarkersRef.current.set(pod.id, marker);
      }
    });
  }, [pods]);

  // Update obstacles (Radar Mode)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!showRadar) {
      obstacleLayersRef.current.forEach(layer => layer.remove());
      obstacleLayersRef.current.clear();
      return;
    }

    obstacles.forEach(obs => {
      if (!obstacleLayersRef.current.has(obs.id)) {
        const layerGroup = L.layerGroup().addTo(map);
        const color = getObstacleColor(obs.severity);
        
        // Danger zone circle
        L.circle([obs.lat, obs.lng], {
          radius: obs.radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.1,
          weight: 1,
          dashArray: "4, 4"
        }).addTo(layerGroup);

        // Radar pulse animation
        const icon = L.divIcon({
          html: `<svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="2" opacity="0.8">
              <animate attributeName="r" values="0;20" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="20" cy="20" r="4" fill="${color}"/>
          </svg>`,
          className: "", iconSize: [40, 40], iconAnchor: [20, 20]
        });

        const marker = L.marker([obs.lat, obs.lng], { icon }).addTo(layerGroup);
        marker.bindPopup(`
          <div style="font-family:Inter;background:#1a1d24;padding:10px;border-radius:8px;color:white;border:1px solid ${color}55">
            <strong style="color:${color}">${obs.name}</strong><br/>
            <span style="font-size:11px;color:#9ca3af">${obs.description}</span><br/>
            <span style="font-size:10px;color:#6b7280">İrtifa: ${obs.altitude}-${obs.altitudeMax}m | Yarıçap: ${obs.radius}m</span>
          </div>
        `);

        obstacleLayersRef.current.set(obs.id, layerGroup);
      }
    });

    // Cleanup removed obstacles
    obstacleLayersRef.current.forEach((layer, id) => {
      if (!obstacles.find(o => o.id === id)) {
        layer.remove();
        obstacleLayersRef.current.delete(id);
      }
    });
  }, [obstacles, showRadar]);

  // Update missions (Arcs & Agricultural Scan) & Drone Routes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const activeDrones = drones.filter(d => d.status === "in-flight" || d.status === "mission");

    routeLayersRef.current.forEach((layerGroup, droneId) => {
      if (!activeDrones.find((d) => d.id === droneId)) {
        layerGroup.remove();
        routeLayersRef.current.delete(droneId);
      }
    });

    agriculturalScanRef.current.forEach((layerGroup, droneId) => {
      const drone = drones.find((d) => d.id === droneId);
      if (!drone || drone.type !== "agricultural" || drone.status !== "mission") {
        layerGroup.remove();
        agriculturalScanRef.current.delete(droneId);
        agScanMissionIdRef.current.delete(droneId);
      }
    });

    activeDrones.forEach((drone) => {
      if (filterType !== "all" && drone.type !== filterType) {
        if (routeLayersRef.current.has(drone.id)) {
          routeLayersRef.current.get(drone.id)!.remove();
          routeLayersRef.current.delete(drone.id);
        }
        return;
      }

      // Find REAL mission — both by missionId and by droneId
      const mission = drone.missionId
        ? missions.find(m => m.id === drone.missionId)
        : missions.find(m => m.droneId === drone.id && (m.status === "in-progress" || m.status === "accepted"));

      // ═══ GÖREV YOKSA PROJECTED PATH ÇİZ ═══
      if (!mission) {
        // Eğer drone havadaysa devriye/serbest gezinme rotası (projected path) çiz
        if (drone.status === "in-flight" || drone.status === "mission") {
          if (routeLayersRef.current.has(drone.id)) routeLayersRef.current.get(drone.id)!.remove();
          const layerGroup = L.layerGroup().addTo(map);
          const color = getDroneColor(drone.type, drone.status);
          
          const rad = drone.heading * (Math.PI / 180);
          const toLat = drone.lat + Math.cos(rad) * 0.015; // İleriye doğru 1.5km
          const toLng = drone.lng + Math.sin(rad) * 0.015;

          // Sadece projeksiyon çizgisi çiz, sahte hedef dairesi ÇİZME!
          L.polyline([[drone.lat, drone.lng], [toLat, toLng]], { 
            color: color, 
            weight: 2, 
            opacity: 0.3, 
            dashArray: "5, 10" 
          }).addTo(layerGroup);
          
          routeLayersRef.current.set(drone.id, layerGroup);
        } else {
          if (routeLayersRef.current.has(drone.id)) {
            routeLayersRef.current.get(drone.id)!.remove();
            routeLayersRef.current.delete(drone.id);
          }
        }
        
        // Ziraat tarama alanını da temizle
        if (agriculturalScanRef.current.has(drone.id)) {
          agriculturalScanRef.current.get(drone.id)!.remove();
          agriculturalScanRef.current.delete(drone.id);
          agScanMissionIdRef.current.delete(drone.id);
        }
        return;
      }

      const toLat = mission.toLat;
      const toLng = mission.toLng;
      const fromLat = mission.fromLat;
      const fromLng = mission.fromLng;
      const color = getDroneColor(drone.type, drone.status);
      const progress = calcRouteProgress(drone, mission);

      // --- AGRICULTURAL SCAN PATTERN (mission field bounds = sim path) ---
      if (drone.type === "agricultural" && mission.type === "agricultural") {
        const lastMid = agScanMissionIdRef.current.get(drone.id);
        const mustRebuild = !agriculturalScanRef.current.has(drone.id) || lastMid !== mission.id;
        if (mustRebuild) {
          if (agriculturalScanRef.current.has(drone.id)) {
            agriculturalScanRef.current.get(drone.id)!.remove();
            agriculturalScanRef.current.delete(drone.id);
          }
          agScanMissionIdRef.current.set(drone.id, mission.id);
          const scanLayer = L.layerGroup().addTo(map);
          const minLat = Math.min(mission.fromLat, mission.toLat);
          const maxLat = Math.max(mission.fromLat, mission.toLat);
          const minLng = Math.min(mission.fromLng, mission.toLng);
          const maxLng = Math.max(mission.fromLng, mission.toLng);
          const bounds: L.LatLngBoundsLiteral = [
            [minLat, minLng],
            [maxLat, maxLng],
          ];
          L.rectangle(bounds, { color, weight: 1, fillOpacity: 0.1, dashArray: "4 4" }).addTo(scanLayer);
          const scanPoints = buildFieldSweepPath(mission);
          L.polyline(scanPoints, { color, weight: 2, opacity: 0.45 }).addTo(scanLayer);
          scanLayer.bindTooltip("Field scan / spray pattern", { direction: "top", className: "route-tooltip" });
          agriculturalScanRef.current.set(drone.id, scanLayer);
        }
      } else if (agriculturalScanRef.current.has(drone.id)) {
        agriculturalScanRef.current.get(drone.id)!.remove();
        agriculturalScanRef.current.delete(drone.id);
        agScanMissionIdRef.current.delete(drone.id);
      }

      // --- STANDARD ROUTE ARCS ---
      if (routeLayersRef.current.has(drone.id)) routeLayersRef.current.get(drone.id)!.remove();
      const layerGroup = L.layerGroup().addTo(map);

      // Full route curve
      const fullArc = calculateArc([fromLat, fromLng], [toLat, toLng]);
      L.polyline(fullArc, { color: color, weight: 2, opacity: 0.2, dashArray: "8, 8" }).addTo(layerGroup);

      // Completed part
      L.polyline([[fromLat, fromLng], [drone.lat, drone.lng]], { color: color, weight: 3, opacity: 0.8 }).addTo(layerGroup);
      
      // Remaining part
      L.polyline([[drone.lat, drone.lng], [toLat, toLng]], { color: color, weight: 2, opacity: 0.4, dashArray: "6, 6" }).addTo(layerGroup);

      // Target marker (SABİT — mission koordinatlarından, drone'dan değil!)
      L.circleMarker([toLat, toLng], { radius: 6, color, fillColor: color, fillOpacity: 0.8, weight: 2 }).addTo(layerGroup);

      if (progress > 5 && progress < 95) {
        const midLat = (drone.lat + toLat) / 2;
        const midLng = (drone.lng + toLng) / 2;
        const progressIcon = L.divIcon({
          html: `<div style="background:rgba(15,18,28,0.85);border:1px solid ${color}44;border-radius:8px;padding:2px 8px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:${color};backdrop-filter:blur(8px);">%${progress} ✈</div>`,
          className: "", iconSize: [60, 20], iconAnchor: [30, 10],
        });
        L.marker([midLat, midLng], { icon: progressIcon, interactive: false }).addTo(layerGroup);
      }

      routeLayersRef.current.set(drone.id, layerGroup);
    });
  }, [drones, missions, filterType]);

  // Update drone markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    drones.forEach((drone) => {
      // Filter logic
      if (filterType !== "all" && drone.type !== filterType) {
        if (droneMarkersRef.current.has(drone.id)) {
          droneMarkersRef.current.get(drone.id)!.remove();
          droneMarkersRef.current.delete(drone.id);
        }
        return;
      }

      const color = getDroneColor(drone.type, drone.status);
      const isSelected = drone.id === selectedDroneId;
      const icon = L.divIcon({
        html: droneIconSvg(color, drone.heading, isSelected),
        className: "", iconSize: [32, 32], iconAnchor: [16, 16],
      });

      if (droneMarkersRef.current.has(drone.id)) {
        const marker = droneMarkersRef.current.get(drone.id)!;
        marker.setLatLng([drone.lat, drone.lng]);
        marker.setIcon(icon);
      } else {
        const marker = L.marker([drone.lat, drone.lng], { icon }).addTo(map);
        marker.on("click", () => onDroneClick?.(drone));
        droneMarkersRef.current.set(drone.id, marker);
      }

      // Evade/Obstacle Warning System integration for Popup
      const marker = droneMarkersRef.current.get(drone.id)!;
      marker.unbindPopup();
      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;color:#F8FAFC;background:rgba(18,23,34,0.9);padding:14px;border-radius:12px;min-width:200px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 8px 32px rgba(0,0,0,0.5);backdrop-filter:blur(16px)">
          <div style="font-weight:700;margin-bottom:8px;color:${color};font-size:14px;letter-spacing:0.5px;display:flex;align-items:center;gap:6px">🛸 ${drone.name}</div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:4px">Tür: <span style="color:#F8FAFC;text-transform:capitalize">${drone.type}</span></div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:4px">Batarya: <span style="color:${drone.battery < 20 ? "#EF4444" : drone.battery < 50 ? "#F59E0B" : "#10B981"};font-weight:700">%${drone.battery.toFixed(0)}</span></div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:4px">İrtifa: <span style="color:#F8FAFC">${drone.altitude}m</span> <span style="opacity:0.5">|</span> Hız: <span style="color:#F8FAFC">${drone.speed}km/s</span></div>
        </div>`
      );
    });

    // Remove drones not matching filter
    droneMarkersRef.current.forEach((marker, id) => {
      if (!drones.find(d => d.id === id) || (filterType !== "all" && drones.find(d => d.id === id)?.type !== filterType)) {
        marker.remove();
        droneMarkersRef.current.delete(id);
      }
    });
  }, [drones, onDroneClick, selectedDroneId, filterType]);

  // Handle selected drone flyTo
  useEffect(() => {
    if (!mapRef.current || !selectedDroneId) return;
    const drone = drones.find((d) => d.id === selectedDroneId);
    if (drone) {
      mapRef.current.flyTo([drone.lat, drone.lng], 14, { animate: true, duration: 1.5 });
    }
  }, [selectedDroneId, drones]);

  return <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: 400 }} />;
}
