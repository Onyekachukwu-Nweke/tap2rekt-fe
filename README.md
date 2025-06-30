# 🎯 Tap2Rekt – Gorbagana Testnet Battle Arena

[![Tap 2 Rekt](https://img.shields.io/badge/Tap2Rekt-Live-brightgreen)](https://lovable.dev/projects/405a68f8-1239-4702-bc7e-aad0cfac3eb6) [![Gorbagana](https://img.shields.io/badge/Gorbagana-Testnet-orange)](https://rpc.gorbagana.wtf) [![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)](https://typescriptlang.org) [![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com)

> 🚀 **Fast taps, faster transactions** — a 1v1 real-time tap battle game powered by the Gorbagana blockchain.

---

## 🎮 Game Overview

**Tap2Rekt** is a real-time multiplayer tap battle game where two players compete in a 30-second speed tap showdown. Powered by the **Gorbagana testnet**, Tap2Rekt integrates token wagering and real-time match outcomes with a clean Web3 experience.

### 🔥 Core Mechanics
- 1v1 tap battles in real-time
- Wager GOR tokens
- Winner takes all
- Live score tracking and leaderboard
- Practice mode available for warmups

---

## 🌐 Gorbagana Integration

## 💰 GOR Token Economy
**Tap 2 Rekt** leverages the Gorbagana blockchain for seamless gaming experiences:

- **Native GOR tokens**: All wagers and rewards are in GOR (1 GOR = 1 SOL equivalent)
- **Instant transactions**: Sub-second transaction confirmations
- **Low fees**: Minimal transaction costs for gaming
- **Secure escrow**: Wager management

### ✅ Wallet Support
> ✅ **Only Backpack wallet is supported** for Gorbagana testnet access.

**Connection Steps:**
1. Install the [Backpack Wallet](https://backpack.app) browser extension.
2. Set your Solana RPC to `https://rpc.gorbagana.wtf`.
3. Use the [Gorbagana faucet](https://faucet.gorbagana.wtf) to get testnet GOR tokens.

### 🏦 Transaction Flow
1. **Deposit**: Players deposit GOR tokens into secure escrow
2. **Battle**: Real-time tap competition with live score tracking
3. **Settlement**: Automatic winner determination and prize distribution
4. **Claim**: Instant token transfer to winner's wallet


---

## 🚀 Live Demo

> 🔗 **Demo URLs:**  <br>
> Game Link: https://tap2rekt.onrender.com <br>
> Game Demo: https://www.loom.com/share/df2755b9a7ec4d4fb5fa14069f4983d5?sid=e6d1c6b0-c138-4ff4-9904-94253dff4b3d <br>

---

## 🛠️ Local Development

### 🧩 Prerequisites
- Node.js 18+
- npm
- Git
- Supabase project (for backend)
- Backpack Wallet installed
- Gorbagana RPC endpoint
- WebSocket server

### ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/Onyekachukwu-Nweke/tap2rekt-fe.git
cd tap2rekt-fe

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🧪 Environment Configuration

Create a `.env` file in the root with the following:

```env
VITE_WS_URL=wss://tap2rekt-wss.onrender.com
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_RPC_ENDPOINT=https://rpc.gorbagana.wtf
VITE_VAULT_PRIVATE_KEY=your_vault_private_key
```

---

## 🧱 Architecture Overview

### Frontend

* **React 18** + **Vite** + **TypeScript**
* **Tailwind CSS** + **shadcn/ui**
* **Solana Wallet Adapter** (Backpack only)
* **Socket.IO** for real-time gameplay

### Backend

* **Supabase** for database and subscriptions
* **Supabase Edge Functions** for secure match logic
* **RLS** for permissioned access

### Real-time Features
- **Live tap counting** with optimistic updates
- **Real-time opponent tracking** via WebSocket
- **Instant match updates** through Supabase subscriptions
- **Live leaderboard** with automatic refreshing

---

## 🧩 Game Flow

1. **Connect your Backpack wallet**
2. **Get GOR tokens** from [faucet](https://faucet.gorbagana.wtf)
3. **Join or create a match**
4. **Tokens are escrowed**
5. **30-second tap battle begins**
6. **Winner is automatically determined**
7. **Winnings are transferred instantly**

---

## 📦 Project Structure

```
src/
├── components/           # React components
│   ├── game/            # Game-specific components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Main app components
├── hooks/               # Custom React hooks
│   ├── useMatches.ts    # Match management
│   ├── useWagerSystem.ts # Wagering logic
│   └── useWebSocket*.ts # Real-time connections
├── pages/               # Route components
├── integrations/        # Supabase integration
└── lib/                 # Utility functions

supabase/
├── functions/           # Edge functions
├── migrations/          # Database migrations
└── config.toml         # Supabase configuration
```

---

## 🎯 Game Mechanics

### Battle Flow
1. **Lobby Phase**: Players create or join matches with specified wagers
2. **Deposit Phase**: Both players confirm their token deposits
3. **Countdown**: 3-second preparation countdown
4. **Battle Phase**: 30-second intense tapping competition
5. **Results**: Automatic winner determination and prize distribution

### Scoring System
- **Raw speed**: Pure taps per second
- **Consistency**: Maintaining steady tap rate
- **Final burst**: Performance in crucial final seconds
- **Network stability**: Compensation for connection issues

## 🛡️ Security Features

- **Escrow contracts**: Secure token holding during matches
- **Anti-cheat measures**: Server-side validation of all game actions
- **Rate limiting**: Protection against spam and abuse
- **Wallet verification**: Cryptographic signature validation
- **RLS policies**: Database-level access control

---

## 🧪 Testing

```bash
# Run local dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```