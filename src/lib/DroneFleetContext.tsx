"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { DroneAgent, Mission } from "./data";
import { useDroneSimulator, useTerminalLogs } from "./hooks/useSimulation";

export interface TerminalLog {
  time: string;
  msg: string;
  type: string;
}

interface FleetContextType {
  drones: DroneAgent[];
  liveMissions: Mission[];
  logs: { time: string; drone: string; level: string; msg: string }[];
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function DroneFleetProvider({ children }: { children: ReactNode }) {
  const { drones, liveMissions } = useDroneSimulator();
  const logs = useTerminalLogs(drones);

  return (
    <FleetContext.Provider value={{ drones, liveMissions, logs }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useDroneFleet() {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error("useDroneFleet must be used within a DroneFleetProvider");
  }
  return context;
}
