# Project Overview

## What is NeuralAir?

NeuralAir is a **Decentralized Autonomous Aviation Network (DAAN)** built on **Solana**. It coordinates, manages, and executes physical drone operations across a smart city using a combination of **Artificial Intelligence**, **Edge Hardware**, and **Blockchain-based settlement**.

> **Live Demo:** [neuralair.vercel.app](https://neuralair.vercel.app)
> **Source:** [github.com/hsankc/NeuralAir](https://github.com/hsankc/NeuralAir)

---

## The Problem

Today's drone networks are **closed, centralized systems**. A single company must:

- Buy and maintain the drones
- Build the charging infrastructure
- Manage dispatch software and scheduling
- Handle payments and compliance

This creates an enormous barrier to scale and centralizes control of the airspace into a few corporate hands.

---

## The Solution

NeuralAir creates an **open, permissionless protocol** where:

1. **Drones** are autonomous agents with their own **Ed25519 cryptographic identities** on Solana.
2. **Charging Pods** are community-owned (**DePIN**) and automatically earn $SOL revenue when they provide energy to the network.
3. **Missions** are securely matched and paid for using Solana **smart contract escrow** to eliminate trust barriers.
4. **AI Dispatchers** parse natural-language commands and assign the optimal drone based on battery, location, and sensor capabilities.

---

## Core Value Proposition

| Stakeholder | Value |
|---|---|
| **Drone Operators** | Decentralized matching allows anyone to put their drone to work on the network without building a centralized service company. |
| **Infrastructure Owners** | Turn a rooftop into a revenue-generating asset via Sky-Charge DePIN nodes that earn per-kWh micropayments. |
| **Clients** | Trustless execution — you only pay when cryptographic proof of the mission's completion is verified on-chain. |

---

## Product Modules

| Module | Route | Description |
|---|---|---|
| **SkyMap** | `/dashboard` | Real-time fleet telemetry on MapLibre GL with route layers and mission geometry |
| **Mission Market** | `/marketplace` | On-chain escrow listings with wallet-signed acceptance flow |
| **Sky-Charge** | `/sky-charge` | Distributed charging stations with kWh-based $SOL settlement |
| **AI Dispatcher** | `/dashboard` (overlay) | Natural-language fleet commands via OpenAI with local fallback |
| **Agent Terminal** | `/dashboard` (bottom) | Live streaming of Fleet, Charging, and Emergency agent decisions |
| **Manual Control** | `/control` | FPV-style operator takeover with keyboard flight and Solana TX stream |
| **Flight Logs** | `/flight-logs` | Immutable audit trail with search, filters, and CSV export |

---

## Fleet Categories

NeuralAir supports **7 drone categories** with reference hardware:

| Category | Reference Hardware | Key Spec |
|---|---|---|
| Cargo | DJI FlyCart 30 | 30 kg payload · 16 km range |
| Agriculture | DJI Agras T50 | 50 L tank · RTK GPS |
| Firefighting | DJI Matrice 350 RTK + H30T | Thermal · 55 min flight |
| Traffic | Autel EVO Max 4T | 160x zoom · 42 min flight |
| Surveillance | Skydio X10 | AI target tracking · 5 km |
| Security | Parrot ANAFI USA | Thermal + 32x · NDAA compliant |
| Search & Rescue | DJI Matrice 30T | Thermal · IP55 · 10 km range |

> **Note:** Brands are reference suggestions. NeuralAir works with any **MAVLink-compatible** airframe.
