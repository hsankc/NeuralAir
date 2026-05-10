"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { DroneAgent, Mission, initialDrones } from "./data";
import { generateInitialOpenMissions } from "./missions";

export interface TerminalLog {
  time: string;
  msg: string;
  type: string;
}

interface FleetState {
  drones: DroneAgent[];
  missions: Mission[];
  logs: TerminalLog[];
}

type FleetAction =
  | { type: "UPDATE_DRONE"; id: number; updates: Partial<DroneAgent> }
  | { type: "ADD_MISSION"; mission: Mission }
  | { type: "COMPLETE_MISSION"; missionId: number }
  | { type: "ADD_LOG"; log: TerminalLog }
  | { type: "SET_DRONES"; drones: DroneAgent[] };

const initialState: FleetState = {
  drones: initialDrones,
  missions: [], // Initialized in provider
  logs: [],
};

function fleetReducer(state: FleetState, action: FleetAction): FleetState {
  switch (action.type) {
    case "UPDATE_DRONE":
      return {
        ...state,
        drones: state.drones.map((d) =>
          d.id === action.id ? { ...d, ...action.updates } : d
        ),
      };
    case "SET_DRONES":
      return { ...state, drones: action.drones };
    case "ADD_MISSION":
      return { ...state, missions: [action.mission, ...state.missions] };
    case "COMPLETE_MISSION":
      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === action.missionId ? { ...m, status: "completed" as const } : m
        ),
      };
    case "ADD_LOG":
      return { ...state, logs: [action.log, ...state.logs].slice(0, 100) };
    default:
      return state;
  }
}

interface FleetContextType extends FleetState {
  dispatch: React.Dispatch<FleetAction>;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function DroneFleetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(fleetReducer, initialState);

  // Initialize missions on client side only
  useEffect(() => {
    const initialMissions = generateInitialOpenMissions();
    initialMissions.forEach((m) => dispatch({ type: "ADD_MISSION", mission: m }));
  }, []);

  // Listen to mission complete events to update global state
  useEffect(() => {
    const handleMissionComplete = (e: CustomEvent) => {
      const { droneName, missionTitle } = e.detail;
      // Add log
      const time = new Date().toLocaleTimeString("tr-TR", { hour12: false });
      dispatch({
        type: "ADD_LOG",
        log: { time, msg: `[FLEET] ${droneName} → "${missionTitle}" COMPLETED`, type: "success" },
      });
    };
    
    window.addEventListener("mission-complete", handleMissionComplete as EventListener);
    return () => window.removeEventListener("mission-complete", handleMissionComplete as EventListener);
  }, []);

  return (
    <FleetContext.Provider value={{ ...state, dispatch }}>
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
