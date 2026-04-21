# NitroPicks 🏈

> A UCF-exclusive sports prediction platform where students compete using virtual points — no real money, real stakes.

**Live:** [nitropicks.xyz](https://nitropicks.xyz)

---

## What is NitroPicks?

NitroPicks lets UCF students place simulated bets on UCF athletic events using virtual betting credits. Winning bets convert credits into **Knight Points (KP)** — redeemable for real campus perks and discounts. The goal: make UCF athletics more engaging through friendly, competitive prediction.

---

## How It Works

### The Economy
Two virtual currencies power the platform:

| Currency | Purpose | How to Earn |
|----------|---------|-------------|
| **Betting Credits** | Place bets — no real value | 1,000 on signup · 800 per UCF ticket scanned |
| **Knight Points (KP)** | Redeem campus rewards | Win bets |

### Betting Flow
1. Browse open UCF sporting events
2. Choose a team and stake (min 10 credits, max 30% of balance)
3. Credits are deducted immediately — bet is **pending**
4. Odds lock at the moment the bet is placed
5. After the game, the admin declares a winner
6. Winners receive `stake × locked odds` in Knight Points · losers forfeit their stake

### Odds Model
Market-driven odds adjust in real time based on bet volume. Both teams start at even odds and shift as more bets come in — the more lopsided the betting, the higher the underdog's payout. A 10% house margin is applied to keep the system stable.

Betting closes **10 minutes before game start**. Cancelled or tied games refund all stakes.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Client | React 19, TypeScript, Tailwind CSS |
| Mobile | Flutter (Dart) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT — cookie (web) · Bearer token (mobile) |
| Email | Resend (domain: nitropicks.xyz) |
| Hosting | DigitalOcean · PM2 · Nginx |

---

## Architecture

Modular monolith — each module owns its own routes, controllers, and models.

```
server/src/modules/
├── users/          # accounts, auth, balances, leaderboard
├── bets/           # place bets, resolve bets, history
├── games/          # CRUD, live/upcoming/finished status
├── rewards/        # reward catalog, voucher redemption
└── services/       # email (Resend)
```

```
client/src/pages/
├── MarketsPage       # browse & bet on games
├── LeaderboardPage   # ranked user standings
├── ProfilePage       # account, bet history, vouchers
└── AdminPage         # manage games, resolve bets
```

```
mobile/lib/modules/
├── auth/     events/     bets/     rewards/     account/
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Flutter SDK
- MongoDB Atlas URI
- Resend API key

### Environment Variables
Create `server/.env`:

```env
MONGO_DB_URL=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_key
EMAIL_FROM=NitroPicks <noreply@nitropicks.xyz>
CLIENT_URL=https://nitropicks.xyz   # omit locally to skip email verification
```

### Install & Run

```bash
# Install dependencies
npm run install:all

# Backend (port 8080)
cd server && npm start

# Web client (port 5173)
cd client && npm run dev

# Mobile
cd mobile && flutter run
```

### Seed the Database

```bash
cd server

# 12 demo games: 3 closing · 3 open · 3 upcoming · 3 finished
node seeds/seedTestGames.js

# Rewards catalog
node seeds/seedRewards.js
```

---

## Deployment

```bash
# On the DigitalOcean droplet
cd ~/NitroPicks && git pull origin main
cd server && npm install && pm2 restart nitropicks
```

---

## Docs

| Document | Description |
|----------|-------------|
| [Entity Relationship Diagram](docs/erd.md) | Data model — users, games, bets, rewards |
| [Mobile UI Design](docs/NitroPicks-mobile-ui.pdf) | Mobile screen designs and layout |
| [Mobile Screens](docs/screens-dart.png) | Flutter screen overview |
| [Mobile Models](docs/models-dart.png) | Flutter data models |
| [Mobile Services](docs/services-dart.png) | Flutter service layer |
| [Mobile Controllers](docs/controllers-dart.png) | Flutter controller layer |

---

## Rules Summary

- UCF email (`@ucf.edu`) required to register
- Minimum bet: **10 credits** · Maximum: **30% of balance**
- Odds lock at bet placement — immune to later market swings
- Betting window closes 10 minutes before game start
- Cancelled / tied games → full refund
- No real money involved at any point
