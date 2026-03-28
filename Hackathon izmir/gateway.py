"""
gateway.py — Ajanm: Sky-Sync | True Flight Simulator Bridge
===========================================================
Translates 8-axis (Thrust, Strafe, Yaw, Alt) flight control signals
to Monad Smart Contract transactions.
"""

import os
import time
import random
import hashlib
import logging
from enum import Enum
from datetime import datetime, timezone
from typing import Optional

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

MONAD_RPC_URL       = os.getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz")
CONTRACT_ADDRESS    = os.getenv("CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000")

SIMULATED_FINALITY_MS = 400

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ajanm.gateway")

# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC MODELS (8-AXIS)
# ─────────────────────────────────────────────────────────────────────────────

class Direction(str, Enum):
    THRUST_FORWARD = "THRUST_FORWARD"  # W
    THRUST_REVERSE = "THRUST_REVERSE"  # S
    STRAFE_LEFT    = "STRAFE_LEFT"     # A
    STRAFE_RIGHT   = "STRAFE_RIGHT"    # D
    YAW_LEFT       = "YAW_LEFT"        # Q
    YAW_RIGHT      = "YAW_RIGHT"       # E
    ASCEND         = "ASCEND"          # Space
    DESCEND        = "DESCEND"         # Shift

class MoveRequest(BaseModel):
    drone_id:  int       = Field(default=0)
    direction: Direction 

class MoveResponse(BaseModel):
    success:       bool
    tx_hash:       str
    drone_id:      int
    direction:     str
    latency_ms:    int
    block_number:  int
    timestamp:     str

# ─────────────────────────────────────────────────────────────────────────────
# SIMULATED WEB3 LOGIC
# ─────────────────────────────────────────────────────────────────────────────

def build_and_send_flight_tx(drone_id: int, direction: Direction) -> dict:
    """
    Simulates sending the specific 8-axis flight command to Monad Parallel EVM.
    e.g. Direction.YAW_LEFT -> contract.functions.yawLeft(drone_id)
    """
    logger.info(f"[SIM] Submitting '{direction.value}()' tx for drone #{drone_id} to Monad...")
    time.sleep(SIMULATED_FINALITY_MS / 1000.0)

    seed = f"{drone_id}{direction}{time.time()}"
    sim_hash = "0x" + hashlib.sha256(seed.encode()).hexdigest()
    sim_block = random.randint(1_000_000, 9_999_999)

    return {
        "tx_hash": sim_hash,
        "block_number": sim_block,
        "latency_ms": SIMULATED_FINALITY_MS,
    }

# ─────────────────────────────────────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Ajanm: Sky-Sync 8-Axis Flight Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Ajanm 8-Axis Flight Gateway starting up…")

@app.post("/api/move", response_model=MoveResponse)
async def move_drone(payload: MoveRequest):
    t_start = time.monotonic()
    
    tx_result = build_and_send_flight_tx(payload.drone_id, payload.direction)
    
    total_latency_ms = int((time.monotonic() - t_start) * 1000)
    
    logger.info(
        f"✅ {payload.direction.value} Confirmed | "
        f"TxHash: {tx_result['tx_hash'][:10]}… | Latency: {total_latency_ms}ms"
    )
    
    return MoveResponse(
        success=True,
        tx_hash=tx_result["tx_hash"],
        drone_id=payload.drone_id,
        direction=payload.direction.value,
        latency_ms=total_latency_ms,
        block_number=tx_result["block_number"],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

if __name__ == "__main__":
    uvicorn.run("gateway:app", host="0.0.0.0", port=8000, log_level="warning")
