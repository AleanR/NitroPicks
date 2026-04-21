# NitroPicks — Web Client

React + TypeScript SPA for the NitroPicks platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| Build | Vite |
| Charts | Recharts |

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with stats and recent winners |
| Markets | `/markets` | Browse and bet on UCF games |
| Leaderboard | `/leaderboard` | Ranked user standings |
| Profile | `/profile` | Account, bet history, vouchers, settings |
| User Profile | `/users/:id` | Public profile view |
| Bet History | `/bet-history` | Full betting history |
| Earn Points | `/earn-points` | Redeem ticket code for KP |
| Redeem Points | `/redeem-points` | Browse and redeem rewards |
| Admin | `/admin` | Game management (admin only) |
| Login | `/login` | Sign in |
| Register | `/register` | Sign up |
| Forgot Password | `/forgot-password` | Request password reset |
| Reset Password | `/reset-password` | Confirm password reset |
| Verify Email | `/verify-email` | Email verification |

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── api/                  # API service functions
├── components/           # Shared UI components
│   ├── Navbar.tsx
│   ├── BetSlip.tsx
│   └── ...
├── context/              # Auth context, user state
├── pages/
│   ├── HomePage.tsx
│   ├── MarketsPage.tsx
│   ├── LeaderboardPage.tsx
│   ├── AdminPage.tsx
│   ├── BetHistoryPage.tsx
│   ├── EarnPointsPage.tsx
│   ├── RedeemPointsPage.tsx
│   └── profile/
│       ├── ProfilePage.tsx
│       └── components/
│           ├── BalancePanel.tsx
│           ├── StatsPanel.tsx
│           ├── RecentBetsPanel.tsx
│           ├── VoucherHistoryPanel.tsx
│           ├── WeeklyProgressChart.tsx
│           ├── EditProfileModal.tsx
│           ├── ContactSupportModal.tsx
│           ├── SecurityPanel.tsx
│           └── UCFInfoPanel.tsx
└── types/                # Shared TypeScript types
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend running on port `8080` (see `/server` README)

### Install & Run

```bash
npm install
npm run dev     # starts on http://localhost:5173
npm run build   # production build
```

---

## Key Features

- **Markets** — filter games by sport and status (live/upcoming/finished), search by team, sticky bet slip
- **Betting** — real-time odds that update as bets come in, min 10 credits · max 30% of balance
- **Profile** — bet history, Knight Points balance, voucher redemption and history, weekly progress chart
- **Leaderboard** — sortable columns (rank, name, points, win rate, total bets)
- **Admin** — create/edit/cancel games, resolve bets by declaring a winner
- **Auth** — UCF email required, email verification via Resend, password reset flow

---

## Design

| Token | Value |
|-------|-------|
| Gold (primary) | `#FBBF24` |
| Background | `#080A0E` |
| Surface | `#111318` |
| Live (green) | `#22C55E` |
| Closing (amber) | `#F59E0B` |
| Upcoming (blue) | `#3B82F6` |
