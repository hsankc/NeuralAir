"use client";

// Mock contract hooks — simulates on-chain interactions
// In production, these would use ethers.js with actual contract ABIs

import { useState, useCallback } from "react";
import { randomTxHash } from "@/lib/data";
import { MONAD_TESTNET } from "@/lib/web3/config";

interface TxResult {
  success: boolean;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  latency: number;
}

function simulateTx(): Promise<TxResult> {
  const latency = 200 + Math.floor(Math.random() * 400);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        txHash: randomTxHash(),
        blockNumber: 4500000 + Math.floor(Math.random() * 100000),
        gasUsed: (50000 + Math.floor(Math.random() * 100000)).toString(),
        latency,
      });
    }, latency);
  });
}

export function useRegistry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerDrone = useCallback(async (name: string, droneType: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulateTx();
      setLoading(false);
      return result;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  const registerPod = useCallback(async (name: string, lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulateTx();
      setLoading(false);
      return result;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  return { registerDrone, registerPod, loading, error };
}

export function useMissionEscrow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMission = useCallback(async (droneId: number, mType: number, destLat: number, destLng: number, paymentMon: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulateTx();
      setLoading(false);
      return result;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  const completeMission = useCallback(async (missionId: number) => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  return { createMission, completeMission, loading, error };
}

export function useSkyCharge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCharging = useCallback(async (droneId: number, podId: number) => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  const endCharging = useCallback(async (sessionId: number) => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  const withdrawEarnings = useCallback(async () => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  return { startCharging, endCharging, withdrawEarnings, loading, error };
}

export function useDroneControl() {
  const [loading, setLoading] = useState(false);

  const sendCommand = useCallback(async (droneId: number, command: string) => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  return { sendCommand, loading };
}

export function useFlightLogger() {
  const [loading, setLoading] = useState(false);

  const logFlight = useCallback(async (droneId: number, data: any) => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  return { logFlight, loading };
}

export function useGovernance() {
  const [loading, setLoading] = useState(false);

  const addNoFlyZone = useCallback(async (lat: number, lng: number, radius: number) => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  const declareEmergency = useCallback(async (eType: number, lat: number, lng: number) => {
    setLoading(true);
    const result = await simulateTx();
    setLoading(false);
    return result;
  }, []);

  return { addNoFlyZone, declareEmergency, loading };
}
