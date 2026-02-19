<div align="center">

# 🛡️ CloakStamp

### Privacy-First Document Certification & Verification on Aleo

**Certify anything. Reveal nothing.**

[![Aleo](https://img.shields.io/badge/Built%20on-Aleo-7b39fc?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABdSURBVDhPY/wPBAxUBExQmmpg1EaqAUYGBgZGqGgMIKYMAtlIbUcTNDAAOZgBaAMzEGMDQJoZsGmkCBiANDMQ0kgROIDUEXIj2QBJI7qN5AGkYKK6P6kPGBgAAPVbDM0RDiIAAAAASUVORK5CYII=)](https://aleo.org/)
[![Leo](https://img.shields.io/badge/Language-Leo-a78bfa?style=for-the-badge)](https://developer.aleo.org/leo/)
[![Network](https://img.shields.io/badge/Network-Testnet-00d084?style=for-the-badge)](https://explorer.aleo.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Issue, hold, and verify documents on-chain without ever exposing their content.*  
*Zero-knowledge proofs ensure privacy while maintaining verifiability.*

[Live Demo](#) · [Smart Contract](#deployed-contract) · [API Docs](#api-reference) · [Deploy Guide](#deployment)

</div>

---

## 🔐 What is CloakStamp?

CloakStamp is a **zero-knowledge document certification protocol** that enables three roles:

| Role | What They Do |
|------|-------------|
| **🏛️ Issuer** | Certifies documents (universities, governments, companies) |
| **📄 Holder** | Owns certified documents, generates ZK proofs |
| **✅ Verifier** | Validates document authenticity without seeing content |

> **No document content, identity, or payment amount ever appears on the public chain.**  
> Only BHP256 hash commitments (one-way, unlinkable) are stored as boolean flags.

---

## 📋 Deployed Contract

| Field | Value |
|-------|-------|
| **Program ID** | `cloakstamp_private_v2.aleo` |
| **Network** | Aleo Testnet |
| **Deploy TX** | [`at1cj2rq...wsgs`](https://explorer.aleo.org/transaction/at1cj2rqpjza89d4aye66lxtxfr5y3fghk70kcr5dklgdcec67uygpqk6wsgs) |
| **Fee TX** | [`at1lthje...9cyq`](https://explorer.aleo.org/transaction/at1lthje2c9v233ddrqvag97yqt742fc05nw9plvefw57af4nn89cyq7uvxhj) |
| **Dependencies** | `credits.aleo` · `test_usdcx_stablecoin.aleo` |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│               React 18 · Vite 5 · TailwindCSS 3                 │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────────┐ │
│  │   Home &   │  │  Certify   │  │   Prove  │  │   Verify    │ │
│  │  Hero +    │  │  (ALEO /   │  │  (ZK     │  │  (Public    │ │
│  │  Metrics   │  │   USDCx)   │  │  Proofs) │  │  Validation)│ │
│  └────────────┘  └────────────┘  └──────────┘  └─────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Composables: useIdentity · useRecordVault                   ││
│  │  Toolkit: chain · gateway · digest · stablecoin              ││
│  │  State: sessionStore · txTracker (Zustand)                   ││
│  └──────────────────────────────────────────────────────────────┘│
│                Shield Wallet + Leo Wallet Integration             │
└────────────────────────┬─────────────────────────────────────────┘
                         │ JWT Auth + REST API
┌────────────────────────┴─────────────────────────────────────────┐
│                          BACKEND                                  │
│            Express.js · TypeScript · LowDB · Zod                  │
│                                                                   │
│  ┌──────────┐ ┌──────────────┐ ┌────────┐ ┌──────────────────┐  │
│  │ Identity │ │ Authorities  │ │ Proofs │ │   Protocol       │  │
│  │ (JWT)    │ │ (Issuers)    │ │        │ │   Metrics        │  │
│  └──────────┘ └──────────────┘ └────────┘ └──────────────────┘  │
│  ┌─────────────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │  Certifications     │ │   Digest     │ │  Core Services   │  │
│  │  (Stamp/Revoke)     │ │   (BHP256)   │ │  storage ·       │  │
│  │                     │ │              │ │  chainReader ·    │  │
│  └─────────────────────┘ └──────────────┘ │  hashEngine      │  │
│                                           └──────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ Aleo RPC (Provable API)
┌──────────────────────────┴───────────────────────────────────────┐
│                    ALEO BLOCKCHAIN (Testnet)                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  cloakstamp_private_v2.aleo                                  │ │
│  │                                                               │ │
│  │  Records: IssuerLicense · CertifiedDocument · HolderReceipt  │ │
│  │           VerificationReceipt · PaymentReceipt               │ │
│  │                                                               │ │
│  │  Mappings: protocol_admin · registered_issuers               │ │
│  │            document_exists · revoked_documents               │ │
│  │            issuance_fees · verification_fees                  │ │
│  │            registration_fees · total_issuers                  │ │
│  │            total_certifications · total_verifications         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────┐  ┌─────────────────────────────────────┐ │
│  │   credits.aleo    │  │  test_usdcx_stablecoin.aleo         │ │
│  │  (Native ALEO)    │  │  (USDCx Stablecoin Transfers)       │ │
│  └───────────────────┘  └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Features

### Smart Contract
- **7 transitions** — `initialize`, `self_register_issuer`, `register_issuer`, `certify_document`, `certify_document_usdcx`, `prove_document`, `revoke_document`
- **Permissionless registration** — any user can self-register as an issuer by paying a small fee (0.05 ALEO)
- **5 private record types** — all encrypted, UTXO-based, owned by respective parties
- **10 mappings** — absolute minimum public state, keyed by BHP256 commitments
- **Dual payment** — ALEO native token or USDCx stablecoin
- **Cross-program calls** — `credits.aleo` + `test_usdcx_stablecoin.aleo`
- **Auto-initializing constructor** — protocol admin, fees, and counters set at deploy time
- **Immutable deployment** — `@noupgrade` constructor

### Backend
- **JWT wallet authentication** — challenge → sign → verify → token
- **6 API modules** — identity, authorities, certifications, proofs, protocol, digest
- **Zod validation** — all request bodies validated at runtime
- **BHP256 WASM worker** — subprocess-based hash engine with memoization
- **Chain reader** — Provable API proxy for mapping reads and TX confirmation
- **Rate limiting** — 100 req/15min on auth endpoints
- **Privacy-first storage** — all addresses SHA-256 hashed in database

### Frontend
- **5 pages** — Home, Certify, My Documents, Prove, Verify
- **Shield + Leo Wallet** — dual adapter support with auto-connect
- **3-strategy record decryption** — direct → ciphertext → block API fallback
- **Real TX ID resolution** — resolves `shield_*` temp IDs to `at1*` on-chain IDs
- **Client-side BHP256** — WASM first, backend fallback
- **Category-coded document cards** — Academic (violet), Professional (sky), Identity (emerald), Medical (rose), Legal (amber)
- **Framer Motion animations** — staggered reveals, hover effects, page transitions
- **Dark theme** — deep purple glassmorphism design system

---

## 🔒 Privacy Guarantees

| Aspect | Protection |
|--------|-----------|
| **Identity** | Never exposed on-chain. Transitions use `self.signer` privately |
| **Document Content** | Never touches blockchain. Only BHP256 commitments stored |
| **Payment Amounts** | Private records only. Public mappings track booleans only |
| **ALEO Payments** | `transfer_private_to_public` — private record consumed |
| **USDCx Payments** | Fully private `transfer_private` — zero public trace |
| **Registration** | Self-registration reveals nothing about the user — only a commitment hash |
| **Verification** | Zero-knowledge proof. Verifier learns validity, not content |
| **Mappings** | 10 total — one-way commitment keys, boolean/counter values only |
| **Backend Data** | All wallet addresses SHA-256 hashed before storage |

---

## 📂 Project Structure

```
CloakStamp/
├── contracts/
│   └── cloakstamp_private_v2/
│       ├── src/main.leo              # Leo smart contract (7 transitions)
│       ├── program.json              # Program config + dependencies
│       └── build/                    # Compiled .aleo artifacts
│
├── backend/
│   ├── src/
│   │   ├── server.ts                 # Express entry — CORS, JSON, routes
│   │   ├── definitions.ts            # TypeScript interfaces
│   │   ├── core/
│   │   │   ├── storage.ts            # LowDB persistence (SHA-256 hashed addrs)
│   │   │   ├── chainReader.ts        # Provable explorer API client
│   │   │   └── hashEngine.ts         # BHP256 WASM subprocess
│   │   ├── shield/guardian.ts        # JWT auth middleware
│   │   ├── pipelines/schemas.ts      # Zod request validation
│   │   └── handlers/
│   │       ├── identity.ts           # Challenge/confirm wallet auth
│   │       ├── authorities.ts        # Issuer enrollment & status
│   │       ├── certifications.ts     # Stamp, revoke, holder docs, status
│   │       ├── proofs.ts             # Submit, inspect, validate proofs
│   │       ├── protocol.ts           # Metrics, fees, admin, mapping proxy
│   │       └── digest.ts             # BHP256 hash endpoint
│   ├── hash-engine-worker.mjs        # Standalone WASM BHP256 worker
│   ├── data/db.json                  # LowDB JSON database
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── bootstrap.tsx             # React entry — ChainProvider → Shell
│   │   ├── Shell.tsx                 # BrowserRouter + lazy routes
│   │   ├── global.css                # Tailwind + glassmorphism + scrollbar
│   │   ├── fragments/
│   │   │   ├── connectors/ChainProvider.tsx    # Shield + Leo wallet setup
│   │   │   ├── layout/{TopNav,AppShell,SiteFooter}.tsx
│   │   │   ├── landing/HeroSection.tsx         # Video BG hero
│   │   │   ├── dashboard/MetricsPreview.tsx    # Live protocol stats
│   │   │   └── shared/{ActionButton,GlassCard,MetricCard,Spinner}.tsx
│   │   ├── composables/
│   │   │   ├── useIdentity.ts        # Challenge → sign → JWT auth hook
│   │   │   └── useRecordVault.ts     # 3-strategy record decryption
│   │   ├── toolkit/
│   │   │   ├── interfaces.ts         # TypeScript types
│   │   │   ├── chain.ts              # Record parsing, block fetch, mappings
│   │   │   ├── gateway.ts            # Full REST API client
│   │   │   ├── digest.ts             # Client BHP256 (WASM → backend)
│   │   │   └── stablecoin.ts         # USDCx scaling + MerkleProof
│   │   ├── state/
│   │   │   ├── sessionStore.ts       # Auth state (Zustand, persisted)
│   │   │   └── txTracker.ts          # TX queue + polling + ID resolution
│   │   └── views/
│   │       ├── HomeView.tsx           # Landing: hero + metrics
│   │       ├── CertifyView.tsx        # Issuer: register → certify
│   │       ├── MyDocumentsView.tsx     # Holder: category-coded doc cards
│   │       ├── ProveView.tsx          # Holder: generate ZK proof
│   │       └── VerifyView.tsx         # Public: validate proof / doc status
│   ├── public/{logo.svg,aleo.png}
│   ├── vercel.json                   # SPA rewrite rule
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── guide.md                          # 2300+ line Aleo development reference
├── summary.md                        # Project summary & development log
└── README.md                         # You are here
```

---

## ⛓️ Smart Contract Details

### Record Types (All Private & Encrypted)

| Record | Fields | Owner |
|--------|--------|-------|
| `IssuerLicense` | `license_commitment`, `nonce_seed` | Issuer |
| `CertifiedDocument` | `issuer`, `doc_hash`, `category`, `expires_at`, `nonce_seed` | Holder |
| `HolderReceipt` | `doc_hash`, `issuer`, `fee_paid`, `nonce_seed` | Holder |
| `VerificationReceipt` | `doc_commitment`, `holder_commitment`, `verified_at`, `nonce_seed` | Verifier |
| `PaymentReceipt` | `amount`, `purpose_hash`, `nonce_seed` | Payer |

### Transitions

| Transition | Description | Payment | Who Can Call |
|------------|-------------|---------|-------------|
| `initialize` | One-time protocol setup: admin, fees, counters | — | Deployer (auto at deploy) |
| `self_register_issuer` | **Any user** self-registers as issuer by paying a fee | 0.05 ALEO | **Anyone** |
| `register_issuer` | Admin registers an issuer for free (institutional grants) | — | Admin only |
| `certify_document` | Issuer certifies document, holder receives record | 0.1 ALEO | Registered issuer |
| `certify_document_usdcx` | Same certification, paid in USDCx stablecoin | USDCx | Registered issuer |
| `prove_document` | Holder proves ownership, verifier gets receipt | 0.05 ALEO | Document holder |
| `revoke_document` | Issuer revokes a certification | — | Original issuer |

### On-Chain Mappings (10 Total)

| Mapping | Key → Value | Purpose |
|---------|-------------|--------|
| `protocol_admin` | `u8 → address` | Governance admin |
| `registered_issuers` | `field → bool` | `BHP256(issuer)` → registered |
| `document_exists` | `field → bool` | `BHP256(doc+issuer)` → certified |
| `revoked_documents` | `field → bool` | `BHP256(doc+issuer)` → revoked |
| `issuance_fees` | `u8 → u64` | Certification fee config (microcredits) |
| `verification_fees` | `u8 → u64` | Verification fee config (microcredits) |
| `registration_fees` | `u8 → u64` | Self-registration fee config (microcredits) |
| `total_issuers` | `u8 → u64` | Global issuer counter |
| `total_certifications` | `u8 → u64` | Global certification counter |
| `total_verifications` | `u8 → u64` | Global verification counter |

---

## 🔄 End-to-End Workflows

### Certification Flow

```
 User                            Blockchain                        Holder
   │                                 │                                │
   │  1. self_register_issuer(       │                                │
   │     credits, fee)               │                                │
   │────────────────────────────────>│  → IssuerLicense record        │
   │                                 │  → registered_issuers = true   │
   │                                 │  → total_issuers += 1          │
   │                                 │                                │
   │  2. certify_document(holder,    │                                │
   │     doc_hash, category, expiry, │                                │
   │     credits, fee_amount)        │                                │
   │────────────────────────────────>│  → CertifiedDocument → Holder  │
   │                                 │  → HolderReceipt → Holder      │
   │                                 │  → PaymentReceipt → Issuer     │
   │                                 │  → document_exists = true      │
   │                                 │  → total_certifications += 1   │
```

### Verification Flow

```
 Holder                          Blockchain                       Verifier
   │                                 │                                │
   │  1. prove_document(doc,         │                                │
   │     verifier, credits, fee)     │                                │
   │────────────────────────────────>│  → VerificationReceipt → Vfy   │
   │                                 │  → CertifiedDocument refreshed │
   │                                 │  → PaymentReceipt → Holder     │
   │                                 │  → total_verifications += 1    │
```

### Data Flow

```
User File → SHA-256 hex → BigInt → BHP256 commitment (field)
                                          ↓
                     ┌────────────────────┼────────────────────┐
                     ↓                    ↓                    ↓
             On-chain mapping       Private records      Backend DB
             (bool flag only)    (encrypted, UTXO)    (SHA-256 hashed
              via commitment      owned by holder      addresses, UUIDs)
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Purpose |
|-------------|---------|
| [Node.js](https://nodejs.org/) >= 18 | Runtime |
| [Shield Wallet](https://www.shieldwallet.dev/) | Browser extension for Aleo |
| [Leo](https://developer.aleo.org/leo/) | Smart contract development (optional) |

### Installation

```bash
# Clone the repository
git clone https://github.com/Chain-Crafter213/CloakStamp.git
cd CloakStamp

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### Environment Setup

**Backend** — create `backend/.env`:

```env
PORT=3001
JWT_SECRET=your_secure_secret_here
CORS_ORIGIN=http://localhost:5173
ALEO_PROGRAM_ID=cloakstamp_private_v2.aleo
PROVABLE_API_BASE=https://api.explorer.provable.com/v1/testnet
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_ALEO_PROGRAM_ID=cloakstamp_private_v2.aleo
```

### Run Locally

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** → connect Shield Wallet → start certifying!

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/identity/challenge` | — | Request sign-in nonce |
| `POST` | `/identity/confirm` | — | Verify wallet signature → JWT |

### Authorities (Issuers)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/authorities/enroll` | JWT | Register as certification authority |
| `GET` | `/authorities/check/:address` | — | Check if address is registered issuer |
| `GET` | `/authorities/count` | — | Total registered issuers |

### Certifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/certifications/stamp` | JWT | Record a new certification |
| `POST` | `/certifications/revoke` | JWT | Record a revocation |
| `GET` | `/certifications/holder/:address` | JWT | Get holder's documents |
| `GET` | `/certifications/status/:commitment` | — | Check document status |

### Proofs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/proofs/submit` | JWT | Record verification proof |
| `GET` | `/proofs/inspector/:address` | JWT | Get verifier's proofs |
| `GET` | `/proofs/validate/:commitment` | — | Validate proof on-chain |

### Protocol

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/protocol/metrics` | — | On-chain protocol statistics |
| `GET` | `/protocol/fees` | — | Current fee configuration |
| `GET` | `/protocol/admin` | — | Protocol admin address |
| `GET` | `/protocol/mapping/:name/:key` | — | Read any on-chain mapping value |

### Digest (BHP256)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/digest/compute/:fieldValue` | — | Compute BHP256 hash |
| `GET` | `/digest/status` | — | Hash engine readiness |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Smart Contract** | Leo · Aleo Testnet · BHP256 · `credits.aleo` · USDCx stablecoin |
| **Backend** | Express.js 4.18 · TypeScript 5.3 · LowDB 7 · Zod 3.22 · JWT · Provable SDK |
| **Frontend** | React 18 · Vite 5 · TailwindCSS 3.3 · Framer Motion 10 · Zustand 4.4 · React Router 6 |
| **Wallet** | Shield Wallet + Leo Wallet adapters (Provable) |
| **Deployment** | Vercel (frontend) · Render (backend) · Aleo Testnet (contract) |

---

## 🎯 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| BHP256 commitments as mapping keys | Unlinkable — no raw addresses or data on public chain |
| 10 minimal mappings | Absolute minimum public state: commitments + booleans + counters |
| Permissionless self-registration | Any user can become an issuer — no gatekeeping, true dApp |
| Dual payment (ALEO + USDCx) | Native token for simplicity, stablecoin for price stability |
| `@noupgrade` constructor | Immutable protocol — deployed code cannot be modified |
| 3-strategy record decryption | Shield Wallet compatibility: direct → ciphertext → block API |
| `privateFee: false` everywhere | Required for Shield Wallet transaction success |
| `leaf_index: 1u32` for USDCx | `test_usdcx_stablecoin.aleo` MerkleProof requirement |
| LowDB with SHA-256 hashed addrs | Lightweight + privacy-aware; easily swap to PostgreSQL |
| Zustand + sessionStorage | Auth persists across refreshes without localStorage concerns |

---

## 🌐 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to **Vite**
5. Add environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |
| `VITE_ALEO_PROGRAM_ID` | `cloakstamp_private_v2.aleo` |

6. Deploy! The `vercel.json` SPA rewrite is already configured.

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service** → Connect GitHub repo
2. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npx tsc` |
| **Start Command** | `node dist/server.js` |
| **Runtime** | Node |

3. Add environment variables:

| Variable | Value |
|----------|-------|
| `PORT` | `3001` (or Render's default) |
| `JWT_SECRET` | `your_strong_secret_here` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |
| `ALEO_PROGRAM_ID` | `cloakstamp_private_v2.aleo` |
| `PROVABLE_API_BASE` | `https://api.explorer.provable.com/v1/testnet` |

### Contract (Already Deployed)

The smart contract is already live on Aleo Testnet. To deploy a new version:

```bash
cd contracts/cloakstamp_private_v2
# Update program name in program.json (e.g., cloakstamp_private_v2.aleo)
leo deploy --network testnet --broadcast --yes
leo execute initialize --network testnet --broadcast --yes
```

---

## 🔭 Vision & Roadmap

CloakStamp is built to become **the standard privacy layer for document trust on the web**. Every institution, individual, and protocol that needs to prove something without revealing everything is a potential user. Here is where we are going.

---

### 🌍 Mainnet Deployment

The protocol is currently live on **Aleo Testnet** for validation and real-world testing. The next major milestone is a full **Aleo Mainnet deployment** — making certifications permanent, economically meaningful, and production-grade. The contract architecture, fee model, and dual-currency payments are all designed with mainnet economics in mind from day one.

---

### 🛠️ Near-Term Improvements

These are protocol and UX upgrades that directly increase real-world usability:

| # | Improvement | Impact |
|---|-------------|--------|
| 1 | **Verifier Portal** | A dedicated page where any party can paste a `VerificationReceipt` commitment and instantly confirm validity on-chain — the demand side of the ecosystem |
| 2 | **QR Code Sharing** | Holders generate a scannable QR code encoding their proof parameters. A verifier scans → triggers ZK verification → receives receipt. Enables real-world use at job fairs, hospitals, border crossings |
| 3 | **Expiry Dashboard** | The contract already stores `expires_at`. Surface this with countdown timers, expiry warnings, and one-click renewal requests |
| 4 | **Batch Certification** | A single transaction certifies multiple documents. Critical for universities issuing hundreds of diplomas or enterprises onboarding large cohorts |
| 5 | **Fee Withdrawal** | Add a `withdraw_fees` transition so the protocol admin can claim accumulated ALEO and USDCx fees from the program's public balance |
| 6 | **Admin Panel** | A dedicated UI for the protocol admin to manage registered issuers, view global stats, adjust fees, and monitor revocations |

---

### 📈 Mid-Term Growth

Features that grow the ecosystem and make CloakStamp a platform rather than just a tool:

| # | Feature | What It Enables |
|---|---------|----------------|
| 7 | **Issuer Marketplace** | Registered issuers list their services, pricing, and trust scores. Holders browse and request certifications directly in-app — creates a two-sided marketplace |
| 8 | **TypeScript SDK** | A published npm package (`@cloakstamp/sdk`) so any dApp can call `certify`, `prove`, and `verify` programmatically. A DeFi protocol could verify a borrower's income attestation before approving a loan |
| 9 | **Multi-Issuer Co-signing** | Critical documents (notarized contracts, medical records with multiple signatories) require 2+ registered issuers to certify before the document is considered valid on-chain |
| 10 | **On-Chain Renewal** | A `renew_document` transition extends `expires_at` on existing certifications without creating duplicates — required for annual licenses, recurring memberships |
| 11 | **Mobile Wallet Support** | Extend wallet adapter support to mobile-first wallets so holders and issuers can operate entirely from a smartphone |
| 12 | **IPFS Document Anchoring** | Optionally anchor the document's IPFS CID alongside the BHP256 commitment — holders get decentralized storage, issuers get content-addressable proof of what they certified |

---

### 🏗️ Long-Term Protocol Evolution

Architectural changes that make CloakStamp a foundational layer of the privacy web:

| # | Initiative | Description |
|---|-----------|-------------|
| 13 | **Cross-Chain Proof Bridging** | Export Aleo ZK proofs as Groth16 or PLONK artifacts verifiable on Ethereum/Solana. A diploma certified on Aleo becomes verifiable in any EVM smart contract — unlocking the entire Web3 ecosystem as verifiers |
| 14 | **Decentralized Issuer Registry** | Replace admin-gated registration with a staking + reputation model. Issuers stake ALEO tokens to register; slashing occurs for fraudulent certifications. Removes all centralized gatekeeping |
| 15 | **Governance Token** | Introduce a protocol governance token for fee parameter voting, issuer dispute resolution, staking rewards, and treasury management |
| 16 | **ZK Credential Composability** | Allow certified records to be used as inputs to other Aleo programs — e.g., a DeFi protocol reads a CloakStamp `VerificationReceipt` to enforce KYC without ever learning the user's identity |
| 17 | **Institutional API Gateway** | A dedicated enterprise API with SLA guarantees, bulk certification endpoints, webhook callbacks, and compliance reporting — targeting universities, hospitals, HR platforms, and legal firms |

---

### 🎯 Real-World Target Sectors

| Sector | How CloakStamp Helps |
|--------|---------------------|
| **Education** | Universities issue tamper-proof digital diplomas. Employers verify degrees instantly without calling admissions offices |
| **Healthcare** | Patients carry private vaccination records, insurance eligibility proofs, and prescription histories — shareable on demand without exposing full medical history |
| **Finance & DeFi** | Income attestations, credit scores, and KYC status can be proven to lending protocols privately — enabling compliance without surveillance |
| **Legal** | Signed contracts, NDAs, and power-of-attorney documents can be attested on-chain without revealing their contents to anyone except the authorized parties |
| **HR & Recruiting** | Candidates prove employment history, professional licenses, and background checks to employers privately — no central background-check company holding sensitive data |
| **Government & Identity** | Citizenship attestations, age verification, and residency proofs for digital public services — privacy-preserving e-government |

---

### 💡 The Core Thesis

> **Trust should not require exposure.**  
> Every time someone has to share their full document to prove a single fact, privacy fails.  
> CloakStamp makes it possible to prove *exactly what is needed* — and nothing more —  
> anchored to a immutable, decentralized record that no authority can alter or revoke.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with [Leo](https://developer.aleo.org/leo/) on [Aleo](https://aleo.org/)**

*Zero Knowledge. Maximum Trust.*

</div>
