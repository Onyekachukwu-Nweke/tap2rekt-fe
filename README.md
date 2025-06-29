
# 🎯 Tap 2 Rekt - Gorbagana Testnet Battle Arena

[![Tap 2 Rekt](https://img.shields.io/badge/Tap%202%20Rekt-Live-brightgreen)](https://lovable.dev/projects/405a68f8-1239-4702-bc7e-aad0cfac3eb6)
[![Gorbagana](https://img.shields.io/badge/Gorbagana-Testnet-orange)](https://rpc.gorbagana.wtf)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com)

> 🚀 **Fast taps, faster transactions** - The ultimate 1v1 speed battle arena powered by Gorbagana blockchain technology

## 🎮 Game Overview

**Tap 2 Rekt** is a high-energy, real-time tap battle game where players compete in lightning-fast 1v1 matches for GOR tokens. Built on the Gorbagana testnet, it combines the excitement of competitive gaming with blockchain-powered wagering and instant rewards.

### ⚡ Core Gameplay
- **Real-time 1v1 battles**: Face off against opponents in 30-second tap marathons
- **Winner takes all**: Fastest tapper claims both wagers
- **Instant rewards**: Automatic token distribution to winners
- **Practice mode**: Hone your skills before entering wager battles
- **Live leaderboards**: Track your performance and climb the ranks

### 🏆 Key Features
- **WebSocket-powered real-time gameplay** with sub-second latency
- **Secure wagering system** with escrow functionality
- **Comprehensive statistics tracking** (battles fought, victories, best scores)
- **Mobile-responsive design** for gaming on any device
- **Practice mode** for skill development
- **Global leaderboards** with top player rankings

## 🌐 Gorbagana Integration

### 💰 GOR Token Economy
**Tap 2 Rekt** leverages the Gorbagana blockchain for seamless gaming experiences:

- **Native GOR tokens**: All wagers and rewards are in GOR (1 GOR = 1 SOL equivalent)
- **Instant transactions**: Sub-second transaction confirmations
- **Low fees**: Minimal transaction costs for gaming
- **Secure escrow**: Smart contract-based wager management

### 🔐 Wallet Integration
Supports multiple Solana-compatible wallets:
- **Phantom Wallet**
- **Solflare**
- **Backpack**
- **Coin98**
- **And more via Solana Wallet Adapter**

### 🏦 Transaction Flow
1. **Deposit**: Players deposit GOR tokens into secure escrow
2. **Battle**: Real-time tap competition with live score tracking
3. **Settlement**: Automatic winner determination and prize distribution
4. **Claim**: Instant token transfer to winner's wallet

## 🚀 Quick Start

### 🌐 Live Demo
**Play Now**: [Tap 2 Rekt Live](https://lovable.dev/projects/405a68f8-1239-4702-bc7e-aad0cfac3eb6)

### 🎮 How to Play
1. **Connect Wallet**: Use any Solana-compatible wallet
2. **Get Test GOR**: Visit the [Gorbagana Faucet](https://faucet.gorbagana.wtf) for test tokens
3. **Create/Join Battle**: Set your wager and find an opponent
4. **Tap to Win**: Outpace your opponent in 30 seconds
5. **Claim Rewards**: Winners automatically receive both wagers

## 🛠️ Local Development

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for version control
- **Solana wallet** (Phantom recommended)
- **Supabase account** (for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tap2rekt-fe.git
cd tap2rekt-fe

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file with your Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RPC_ENDPOINT=https://rpc.gorbagana.wtf
```

### 🗄️ Database Schema

The application uses Supabase with the following core tables:

- **`matches`**: Battle records with wager amounts and status
- **`tap_results`**: Individual game scores and timestamps  
- **`player_stats`**: Aggregated player performance metrics

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **Tailwind CSS** + **shadcn/ui** for modern styling
- **Solana Wallet Adapter** for blockchain integration
- **Socket.io** for real-time WebSocket connections

### Backend Services
- **Supabase** for database and real-time subscriptions
- **Edge Functions** for secure transaction processing
- **Row Level Security** for data protection
- **WebSocket servers** for battle coordination

### Real-time Features
- **Live tap counting** with optimistic updates
- **Real-time opponent tracking** via WebSocket
- **Instant match updates** through Supabase subscriptions
- **Live leaderboard** with automatic refreshing

## 📁 Project Structure

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

## 🚦 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎮 Community

- **Discord**: [Join our gaming community](https://discord.gg/tap2rekt)
- **Twitter**: [@Tap2Rekt](https://twitter.com/tap2rekt)
- **GitHub**: [Report issues and contribute](https://github.com/your-username/tap2rekt-fe)

## 🏅 Leaderboard Champions

Check out our top players and their incredible achievements in the live application!

---

<div align="center">

**🎯 Ready to prove your tapping supremacy? 🎯**

[**PLAY TAP 2 REKT NOW**](https://lovable.dev/projects/405a68f8-1239-4702-bc7e-aad0cfac3eb6)

*Fast taps, faster transactions - powered by Gorbagana 💎*

</div>
