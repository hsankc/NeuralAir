"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DroneAgent, ChargingPod } from "@/lib/data";

interface SkyMapProps {
  drones: DroneAgent[];
  pods: ChargingPod[];
  onDroneClick?: (drone: DroneAgent) => void;
}

// Custom drone icon SVG
function droneIconSvg(color: string, heading: number) {
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(${heading}deg)">
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

export default function SkyMap({ drones, pods, onDroneClick }: SkyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const droneMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const podMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [38.42, 27.14], // İzmir center
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Attribution
    L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update pod markers (static)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    pods.forEach((pod) => {
      if (!podMarkersRef.current.has(pod.id)) {
        const icon = L.divIcon({
          html: podIconSvg(pod.available),
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([pod.lat, pod.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;color:#E2E8F0;background:#141B2D;padding:12px;border-radius:8px;min-width:180px;border:1px solid #1E3A5F">
            <div style="font-weight:700;margin-bottom:6px;color:#FFD600">⚡ ${pod.name}</div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:4px">Sahip: ${pod.owner}</div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:4px">Ücret: ${pod.rate} MON/kWh</div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:4px">Toplam Enerji: ${pod.totalEnergy} kWh</div>
            <div style="font-size:12px;color:${pod.available ? "#00E676" : "#FF1744"}">${pod.available ? "✓ Müsait" : "✗ Dolu"}</div>
          </div>`,
          { className: "dark-popup" }
        );

        podMarkersRef.current.set(pod.id, marker);
      }
    });
  }, [pods]);

  // Update drone markers (dynamic)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    drones.forEach((drone) => {
      const color = getDroneColor(drone.type, drone.status);
      const icon = L.divIcon({
        html: droneIconSvg(color, drone.heading),
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (droneMarkersRef.current.has(drone.id)) {
        const marker = droneMarkersRef.current.get(drone.id)!;
        marker.setLatLng([drone.lat, drone.lng]);
        marker.setIcon(icon);
      } else {
        const marker = L.marker([drone.lat, drone.lng], { icon }).addTo(map);
        marker.on("click", () => {
          onDroneClick?.(drone);
        });
        droneMarkersRef.current.set(drone.id, marker);
      }

      // Update popup content
      const marker = droneMarkersRef.current.get(drone.id)!;
      marker.unbindPopup();
      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;color:#E2E8F0;background:#141B2D;padding:12px;border-radius:8px;min-width:200px;border:1px solid #1E3A5F">
          <div style="font-weight:700;margin-bottom:6px;color:${color}">🛸 ${drone.name}</div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:3px">Batarya: <span style="color:${drone.battery < 20 ? "#FF1744" : "#00E676"};font-weight:600">%${drone.battery.toFixed(1)}</span></div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:3px">İrtifa: ${drone.altitude}m | Hız: ${drone.speed}km/s</div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:3px">İtibar: ${drone.reputation}/100</div>
          <div style="font-size:11px;color:#64748B;margin-top:4px">${drone.personality}</div>
        </div>`,
        { className: "dark-popup" }
      );

      // Re-bind click handler to get updated drone reference
      marker.off("click");
      marker.on("click", () => {
        onDroneClick?.(drone);
      });
    });
  }, [drones, onDroneClick]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: 400 }} />
  );
}
