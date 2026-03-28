<p align="center">
  <img src="https://img.shields.io/badge/MONAD-Parallel%20EVM-836ef1?style=for-the-badge&logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Finality-400ms-39ff65?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Solidity-^0.8.20-363636?style=for-the-badge&logo=solidity" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

<h1 align="center">⬡ Ajanm: Sky-Sync</h1>

<p align="center">
  <b>Decentralized Mission Control for Autonomous Drone Swarms</b><br/>
  <i>Powered by Monad's Parallel EVM — 400ms Finality — Zero Contention</i>
</p>

<p align="center">
  <code>"We didn't just teach drones to fly — we taught them to think with a decentralized mind."</code>
</p>

---

## 🎯 What is Ajanm: Sky-Sync?

**Ajanm: Sky-Sync** is a real-time, first-person drone flight simulator where every movement is recorded as a blockchain transaction on **Monad's Parallel EVM**. It demonstrates that swarm-scale mission control can achieve **O(1) latency** on Monad, compared to **O(n) latency** on sequential EVMs like Ethereum.

The player uses **8-axis keyboard controls** (Thrust, Strafe, Yaw, Altitude) to pilot a drone through a cyberpunk 3D cityscape. Each control input generates an on-chain transaction that finalizes in **~400ms** — fast enough for real-time flight simulation.

> **TL;DR:** A playable proof that Monad's parallelism makes blockchain-native real-time applications possible.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎮 **True FPV Simulator** | 8-axis flight control with lerped camera movement through 3D extruded buildings |
| ⛓️ **On-Chain Everything** | Every thrust, strafe, yaw, and altitude change is a Monad transaction |
| ⚡ **400ms Finality** | Real-time feedback loop — input → tx → confirmation → visual update |
| 🏙️ **Cyberpunk Dashboard** | Neon-glow HUD with live telemetry, crosshair, and real-time TX terminal |
| 🗺️ **3D Map Visualization** | MapLibre GL JS with extruded buildings, dark theme, and neon road grid |
| 🤖 **Parallel-Safe Contract** | `mapping(uint256 => DroneState)` — each drone's state is isolated, enabling true parallelism |
| 🔄 **Graceful Fallback** | Frontend works offline with local simulation if the gateway is unavailable |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AJANM: SKY-SYNC                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐    HTTP/JSON     ┌──────────────┐    Web3.py    │
│   │              │ ───────────────► │              │ ────────────► │
│   │   Frontend   │   POST /move     │   Gateway    │   submitTx   │
│   │  (index.html)│ ◄─────────────── │ (gateway.py) │ ◄──────────  │
│   │              │   tx_hash +      │              │   receipt     │
│   │  MapLibre GL │   latency_ms     │   FastAPI    │               │
│   │  8-Axis HUD  │                  │   CORS       │               │
│   └──────────────┘                  └──────────────┘               │
│         ▲                                  │                        │
│         │ Keyboard                         ▼                        │
│     W A S D Q E                 ┌──────────────────┐               │
│     Space  Shift                │  Monad Parallel   │               │
│                                 │       EVM         │               │
│                                 │                    │               │
│                                 │ MissionController  │               │
│                                 │     .sol           │               │
│                                 │                    │               │
│                                 │ 400ms Finality     │               │
│                                 │ Chain ID: 41454    │               │
│                                 └──────────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow — The 5-Step Cycle

```
  ┌─────────┐     ┌─────────┐     ┌─────────────┐     ┌──────────┐     ┌───────────┐
  │ KEYBOARD │────►│ GATEWAY │────►│ MONAD       │────►│ CONFIRM  │────►│ IMMUTABLE │
  │  INPUT   │     │  (API)  │     │ PARALLEL TX │     │ RESPONSE │     │  AUDIT    │
  └─────────┘     └─────────┘     └─────────────┘     └──────────┘     └───────────┘
   Player          FastAPI          ~400ms              tx_hash +        On-chain
   presses W       POST /move      finality            latency_ms       forever
```

1. **🎮 Input Capture** — Player presses a flight key → frontend debounces at 500ms intervals
2. **📡 Gateway Relay** — FastAPI receives the 8-axis command, builds a Monad transaction
3. **⚡ Parallel Execution** — Monad resolves the drone's isolated state in ~400ms (no queue!)
4. **✅ Confirmation** — Gateway returns `tx_hash` + `latency_ms` → terminal displays result
5. **📜 Immutable Record** — Every decision, GPS coordinate, and latency is written on-chain permanently

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **pip** (Python package manager)
- A modern web browser (Chrome, Firefox, Edge)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ajanm-sky-sync.git
cd ajanm-sky-sync
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Start the Gateway

```bash
python gateway.py
```

> Gateway starts on **http://localhost:8000**  
> Interactive API docs at **http://localhost:8000/docs**

### 4️⃣ Open the Dashboard

Open `index.html` in your browser — or serve it locally:

```bash
python -m http.server 3000
```

Then navigate to **http://localhost:3000**

### 5️⃣ Fly!

Use the controls below to pilot the drone through the cyberpunk cityscape:

| Key | Action |
|-----|--------|
| `W` | Thrust Forward |
| `S` | Thrust Reverse |
| `A` | Strafe Left |
| `D` | Strafe Right |
| `Q` | Yaw Left |
| `E` | Yaw Right |
| `Space` | Ascend |
| `Shift` | Descend |

> **💡 Tip:** If the gateway isn't running, the frontend automatically falls back to local simulation mode.

---

## 📁 Project Structure

```
ajanm-sky-sync/
│
├── index.html              # 🎮 Cyberpunk FPV dashboard
│                           #    MapLibre GL + 3D buildings + HUD + TX terminal
│
├── gateway.py              # 🌉 FastAPI bridge between frontend & Monad
│                           #    8-axis command → Web3 transaction
│
├── MissionController.sol   # ⛓️ Solidity smart contract
│                           #    Parallel-safe drone state management
│
├── requirements.txt        # 📦 Python dependencies
│
└── README.md               # 📖 You are here
```

---

## 🧠 Smart Contract Deep Dive

### `MissionController.sol`

The contract stores each drone's state in an **isolated mapping**, which is the key to unlocking Monad's parallel execution:

```solidity
mapping(uint256 => DroneState) public drones;
```

Each `DroneState` tracks:
- **Position** (`x`, `y`, `z`) — 3D coordinates
- **Heading** — Yaw angle (0°-359°)
- **Mission Count** — Total transactions executed
- **Audit Trail** — Last update block, timestamp, and operator

#### 8 Flight Functions

| Function | Key | State Change |
|----------|-----|-------------|
| `thrustForward()` | W | `z -= MOVE_STEP` |
| `thrustReverse()` | S | `z += MOVE_STEP` |
| `strafeLeft()` | A | `x -= MOVE_STEP` |
| `strafeRight()` | D | `x += MOVE_STEP` |
| `yawLeft()` | Q | `heading -= TURN_STEP` |
| `yawRight()` | E | `heading += TURN_STEP` |
| `ascend()` | Space | `y += MOVE_STEP` |
| `descend()` | Shift | `y -= MOVE_STEP` |

Every function emits a `FlightAction` event for complete on-chain audit logging.

---

## ⚡ Why Monad?

This project is specifically designed to showcase Monad's **Parallel EVM** advantages:

| | Sequential EVM (Ethereum) | Monad Parallel EVM |
|---|---|---|
| **State Model** | Global — all drones share state | Isolated — `mapping(uint256 => DroneState)` |
| **1 Drone** | ✅ Works fine | ✅ Works fine |
| **100 Drones** | ⚠️ Queuing begins | ✅ All parallel |
| **1000 Drones** | 🔴 O(n) latency cascade | ✅ O(1) — still ~400ms |
| **Finality** | ~12s (Ethereum) | **~400ms** |
| **Contention** | Inevitable at scale | **Architecturally impossible** |
| **Real-time apps** | Not viable | **Natively supported** |

### The Core Insight

Because each drone's state is stored in its own mapping slot (`drones[droneId]`), Monad's **Optimistic Concurrency Control** can execute transactions for different drones **in parallel** without any coordination overhead. This means:

> **Adding more drones doesn't increase latency.** The system scales horizontally at the EVM level.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5 + Vanilla JS | Zero-dependency cyberpunk dashboard |
| **3D Engine** | MapLibre GL JS | 3D extruded buildings + dark map tiles |
| **Fonts** | Orbitron + Share Tech Mono | Cyberpunk HUD typography |
| **Backend** | Python FastAPI | Async HTTP gateway with CORS |
| **Blockchain** | Web3.py | Monad RPC client |
| **Smart Contract** | Solidity ^0.8.20 | Parallel-safe drone state |
| **Network** | Monad AntiGravity Testnet | Chain ID: 41454 |

---

## 🔧 Configuration

Set environment variables for live blockchain mode:

```bash
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz
export CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Default values (simulation mode) are used if these are not set.

---

## 🚢 Deploying the Smart Contract

Deploy `MissionController.sol` to Monad using Hardhat or Foundry:

```bash
# Using Foundry
forge create --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  src/MissionController.sol:MissionController

# Using Hardhat
npx hardhat deploy --network monad
```

> **Network Details:**
> - RPC: `https://testnet-rpc.monad.xyz`
> - Chain ID: `41454`

---

## 📸 Screenshots

> *Launch the dashboard and fly through Manhattan's cyberpunk skyline. Every movement is a Monad transaction.*

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/swarm-mode`)
3. Commit your changes (`git commit -m 'Add swarm coordination mode'`)
4. Push to the branch (`git push origin feature/swarm-mode`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Built with ⬡ for the Monad Hackathon by the Ajanm Team</b><br/>
  <i>İzmir, 2026</i>
</p>
