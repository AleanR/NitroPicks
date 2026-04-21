# NitroPicks — Server

Express + TypeScript REST API for the NitroPicks platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (cookie + Bearer token) |
| Email | Resend |
| Process Manager | PM2 |

---

## Architecture

Modular monolith — each module owns its routes, controllers, and model.

```
src/
├── index.ts               # Entry point
├── middlewares.ts          # isAuthenticated, isAdmin
├── helpers/
│   ├── auth.ts            # AuthenticatedRequest type
│   ├── index.ts           # hashPassword, comparePassword
│   └── jwt.ts             # createToken, verifyToken
└── modules/
    ├── authentication/    # register, login, logout, verify email
    ├── users/             # profile, leaderboard, points, password reset
    ├── games/             # CRUD, status computation, game resolution
    ├── bets/              # place bets, resolve, history
    ├── rewards/           # reward catalog, voucher redemption
    └── services/          # email, bet resolution, cancellation
```

---

## Environment Variables

Create a `.env` file in `server/`:

```env
MONGO_DB_URL=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_key
EMAIL_FROM=NitroPicks <noreply@nitropicks.xyz>
CLIENT_URL=https://nitropicks.xyz   # omit locally to skip email verification
PORT=8080
```

---

## Running Locally

```bash
npm install
npm run dev     # ts-node with nodemon
npm start       # compiled JS
```

---

## API Reference

### Authentication
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | — | Sign in |
| `POST` | `/api/auth/register` | — | Sign up (UCF email required) |
| `POST` | `/api/auth/logout` | — | Clear session cookie |
| `GET` | `/api/auth/verify-email` | — | Verify email via token |
| `POST` | `/api/auth/resend-verification` | User | Resend verification email |

### Users
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/users/me` | User | Current user profile |
| `GET` | `/api/users/leaderboard` | — | Top users by Knight Points |
| `GET` | `/api/users/count` | — | Total registered users |
| `GET` | `/api/users/points/total` | — | Total KP in circulation |
| `GET` | `/api/users/redemptions/total` | — | Total rewards redeemed |
| `POST` | `/api/users/earn-points` | User | Redeem ticket code for +1000 KP |
| `GET` | `/api/users/:id` | — | Public user profile |
| `PATCH` | `/api/users/:id` | User | Update profile |
| `DELETE` | `/api/users/:id` | User | Delete account |
| `GET` | `/api/users/:id/redemptions` | User | Voucher redemption history |
| `GET` | `/api/users/:id/ticket-redemptions` | User | Ticket redemption history |
| `GET` | `/api/users/search` | User | Search users |
| `POST` | `/api/users/support/contact` | User | Send support email |
| `POST` | `/api/users/forgot-password` | — | Request password reset |
| `PATCH` | `/api/users/reset-password/:token` | — | Confirm password reset |

### Games
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/games` | — | All public games with computed status |
| `GET` | `/api/games/search` | User | Search games |
| `GET` | `/api/games/all` | Admin | All games including cancelled |
| `POST` | `/api/games` | Admin | Create game |
| `PATCH` | `/api/games/:id` | Admin | Update game |
| `PATCH` | `/api/games/:id/score` | Admin | Update score |
| `PUT` | `/api/games/:id/end` | Admin | Resolve game + settle bets |
| `DELETE` | `/api/games/:id/cancel` | Admin | Cancel + refund all bets |
| `DELETE` | `/api/games/:id` | Admin | Hard delete |

### Bets
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/bets` | User | Place a bet |
| `GET` | `/api/bets/my` | User | Bet stats (win/loss/refund counts) |
| `GET` | `/api/bets/my/list` | User | Full bet history |
| `GET` | `/api/bets/user/:id/list` | User | Another user's bet history |
| `GET` | `/api/bets/recent-winners` | — | Recent winning bets |
| `GET` | `/api/bets` | Admin | All bets |

### Rewards
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/rewards` | User | Active rewards catalog |
| `POST` | `/api/users/:id/redeem` | User | Redeem reward for voucher code |

---

## Seeding

```bash
# 12 demo games: 3 closing · 3 open · 3 upcoming · 3 finished
node seeds/seedTestGames.js

# Rewards catalog (30 rewards)
node seeds/seedRewards.js

# Mobile-specific seed (same 12-game structure)
node seeds/seedGames_mobile.js
```

---

## Deployment

```bash
# On the DigitalOcean droplet
cd ~/NitroPicks && git pull origin main
cd server && npm install && pm2 restart nitropicks
```
