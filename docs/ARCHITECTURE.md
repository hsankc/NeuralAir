# System Architecture

NeuralAir bridges physical drone hardware with decentralized software on Solana. The architecture is organized into **five distinct layers**, each with clear responsibilities.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER CLIENT                       │
│  Next.js 16 (App Router) · React 19 · TypeScript 5     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Dashboard │ │  Market  │ │Sky-Charge│ │  Control  │  │
│  │  SkyMap   │ │  Escrow  │ │  DePIN   │ │  FPV/3D   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       │            │            │              │        │
│  ┌────┴────────────┴────────────┴──────────────┴─────┐  │
│  │          DroneFleetContext (Global State)          │  │
│  │   useSimulation · AgentEngine · WalletContext      │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
   ┌────────────┐  ┌──────────────┐  ┌──────────┐
   │ Solana RPC │  │  OpenAI API  │  │ Supabase │
   │  (Devnet)  │  │ (gpt-4o-mini)│  │ (Logging)│
   │  Phantom   │  │ + Fallback   │  │ Optional │
   └────────────┘  └──────────────┘  └──────────┘
```

---

## 1. Frontend & Presentation Layer

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Server-side rendering, routing, API routes |
| **React 19** | Component architecture with concurrent features |
| **TypeScript 5** | Type safety across the entire codebase |
| **Tailwind CSS 4** | Utility-first styling with custom design tokens |
| **MapLibre GL JS** | Vector map engine for live fleet tracking |
| **Leaflet** | Alternative map renderer with SkyMap layers |

---

## 2. State Management Layer

- **DroneFleetContext** — Global React context providing live drone data to all pages
- **useSimulation** hook — Client-side physics simulation (requestAnimationFrame-based)
- **AgentEngine** — Orchestrates Fleet, Charging, and Emergency agent decision loops

All pages (Dashboard, Marketplace, Sky-Charge, Flight Logs) consume the same shared context for consistent fleet state.

---

## 3. AI Dispatch Layer

| Component | Role |
|---|---|
| **AI Dispatcher** (`/api/ai-dispatch`) | Parses natural-language commands into structured mission intents |
| **OpenAI gpt-4o-mini** | Primary LLM for command interpretation |
| **Local Fallback Engine** | Rule-based parser when API key is unavailable |
| **FleetAgent** | Matches missions to drones based on battery, location, and sensor capability |
| **ChargingAgent** | Routes low-battery drones to nearest available Sky-Charge pod |
| **EmergencyAgent** | Handles critical events (low battery, weather, airspace conflicts) |

---

## 4. Blockchain Layer (Solana)

| Component | Role |
|---|---|
| **@solana/web3.js** | RPC communication and transaction construction |
| **Phantom Wallet** | User authentication and transaction signing |
| **Mission Escrow** | SOL locked on mission creation; released on proof-of-completion |
| **Ed25519 Signatures** | Drone-signed telemetry for proof-of-flight attestation |
| **Network** | Solana Devnet (configurable to Mainnet-beta) |

---

## 5. Hardware Edge Layer

Each drone in the fleet is designed for a **dual-compute architecture**:

```
┌─────────────────────────────┐
│     NeuralAir Edge Node     │
├─────────────────────────────┤
│  Jetson Orin Nano  (AI)     │ ← Computer vision, obstacle detection
│  Pixhawk Cube      (FC)    │ ← MAVLink flight control
│  4G/5G Modem                │ ← Solana RPC backhaul via WireGuard
│  Ed25519 Keystore           │ ← Signed telemetry attestation
│  RTK GPS · Thermal · ADS-B │ ← ±2cm positioning, airspace awareness
└─────────────────────────────┘
              ↕
     ┌────────────────┐
     │  Solana Devnet  │
     └────────────────┘
```

> See [`HARDWARE.md`](../HARDWARE.md) and [`hardware-nodes/`](../hardware-nodes/) for implementation details and Python bridge scripts.

---

## Directory Structure

```
src/
├── app/                    # Next.js routes
│   ├── page.tsx            # Landing page
│   ├── dashboard/          # Operations command center
│   ├── marketplace/        # Mission marketplace with escrow
│   ├── sky-charge/         # DePIN charging economics
│   ├── control/            # FPV manual control surface
│   ├── flight-logs/        # Audit trail & export
│   └── api/                # API routes (AI dispatch, agent decisions)
├── components/
│   ├── SkyMap.tsx           # Leaflet-based fleet map
│   ├── AIChat.tsx           # AI dispatcher interface
│   ├── WalletConnect.tsx    # Phantom wallet integration
│   └── dashboard/          # 10 modular dashboard components
├── lib/
│   ├── agents/             # Fleet, Charging, Emergency, User agents
│   ├── ai/                 # Dispatcher prompt & parsing
│   ├── hooks/              # useSimulation hook
│   ├── web3/               # Solana config, IDL, wallet context
│   ├── DroneFleetContext.tsx # Global fleet state provider
│   └── data.ts             # Fleet definitions & coordinates
hardware-nodes/
├── core/                   # Solana signer (Python)
├── jetson-thermal/         # Fire detection (Python)
├── pixhawk-mavlink/        # MAVLink bridge (Python)
└── raspberry-agras/        # Agricultural pump relay (Python)
```
