# NitroPicks — Mobile

A UCF-focused sports prediction app built with Flutter. Students place simulated bets on UCF athletic events using virtual betting credits. Winning bets earn Knight Points (KP) redeemable for real campus perks.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter 3+ / Dart 3+ |
| UI | Material 3 · DM Sans (Google Fonts) |
| HTTP | `package:http` |
| Backend | Shared Node.js/Express + MongoDB Atlas API |
| Auth | JWT via `Authorization: Bearer <token>` |
| Target | Web (Edge/Chrome) · Android · iOS |

---

## Features

### Events
- Browse all UCF sporting events with live parimutuel odds
- Tab filters: **All · Open · Closing · Upcoming · Closed**
- Odds update in real time as bets are placed
- Betting window closes 10 minutes before game start
- One bet per event enforced — placed chips lock with a "Your bet" indicator
- Pull-to-refresh and search

### Bets
- Place single bets with a custom stake (min 10 credits, max 30% of balance)
- Odds locked at time of placement
- **Active** tab: pending results with stake, locked odds, potential payout
- **Past** tab: resolved bets showing win/loss and payout received
- Auto-refreshes when a bet is placed or an admin resolves a game

### Rewards
- Browse 30+ UCF rewards across 6 categories: Food · Merch · Campus · Athletics · Digital · Experience
- Knight Points balance shown live at the top
- Redeem flow: confirm cost → voucher code generated → email sent to UCF address
- **My Vouchers** tab: full redemption history with copyable codes, sorted newest-first
- Vouchers persist to the database — accessible across sessions

### Account
- Knight Points balance with load-credits flow (16-digit ticket confirmation → +1000 KP)
- Bet stats: Total · Won · Lost
- **Leaderboard** — top 10 students by KP with gold/silver/bronze podium for top 3
- Student info (major, UCF ID)
- Sign out

### Admin (admin accounts only)
- 5th tab visible only when `role === 'admin'`
- Lists all games past their betting close time with no winner set
- Pick winner (Home / Away / Tie) to resolve — all pending bets settled instantly
- Resolving a game triggers auto-refresh on the Bets screen for all users

---

## Project Structure

```
lib/
├── main.dart
├── core/
│   ├── constants/
│   │   ├── api_constants.dart        # Base URL
│   │   └── app_constants.dart
│   ├── errors/
│   │   ├── app_exception.dart
│   │   └── failure.dart
│   ├── routing/
│   │   └── app_router.dart
│   └── services/
│       └── api_service.dart
├── shared/
│   ├── theme/
│   │   ├── app_theme.dart            # AppColors, typography
│   │   ├── app_colors.dart
│   │   └── app_text_styles.dart
│   └── widgets/
│       ├── main_shell.dart           # Bottom nav shell, ValueNotifier state
│       ├── auth_shell.dart
│       ├── nitropicks_logo.dart
│       ├── np_button.dart
│       ├── np_text_field.dart
│       └── step_indicator.dart
└── modules/
    ├── auth/
    │   ├── domain/        user.dart · auth_state.dart · ucf_majors.dart
    │   ├── data/          auth_api_service.dart · auth_repository.dart
    │   └── presentation/  signin · signup · welcome · landing · forgot_password
    ├── events/
    │   ├── domain/        event.dart · odds.dart
    │   ├── data/          event_api_service.dart · event_repository.dart
    │   └── presentation/  events_screen · event_detail · bet_slip_panel
    │                      event_card · filter_tab_bar · events_search_bar
    ├── bets/
    │   ├── domain/        bet.dart · placed_bet.dart
    │   ├── data/          bet_api_service.dart · bet_repository.dart
    │   └── presentation/  bets_screen · bets_controller · bet_card
    ├── rewards/
    │   ├── domain/        reward.dart · redemption.dart
    │   ├── data/          rewards_api_service.dart · rewards_repository.dart
    │   └── presentation/  rewards_screen · rewards_controller
    ├── account/
    │   ├── domain/        account.dart
    │   ├── data/          account_api_service.dart
    │   └── presentation/  account_screen · account_controller · leaderboard_screen
    └── admin/
        └── presentation/  admin_screen
```

---

## Getting Started

### Prerequisites

- Flutter SDK `>=3.0.0 <4.0.0`
- Dart SDK `>=3.0.0`
- Server running locally on port `8080` (see `/server` README)

### Install & Run

```bash
# From the mobile/ directory

# Install dependencies
flutter pub get

# Run on Edge (primary dev target)
flutter run -d edge

# Run on Android emulator
flutter run -d android

# Run on iOS simulator
flutter run -d ios
```

### Base URL

Set in [`lib/core/constants/api_constants.dart`](lib/core/constants/api_constants.dart):

```dart
static const String baseUrl = 'http://localhost:8080/api';
```

Change this to your deployed server URL for production builds.

---

## API Routes Used

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/register` | Sign up |
| `POST` | `/users/forgot-password` | Password reset request |
| `PATCH` | `/users/reset-password/:token` | Password reset confirm |
| `GET` | `/users/me` | Current user profile |
| `POST` | `/users/earn-points` | Load betting credits via ticket code |
| `GET` | `/users/leaderboard` | Top 10 users by KP |
| `GET` | `/users/:id/redemptions` | Redemption history |
| `GET` | `/games` | All games |
| `PUT` | `/games/:id/end` | Admin: resolve a game |
| `POST` | `/bets` | Place a bet |
| `GET` | `/bets/my/list` | User's bets |
| `GET` | `/rewards` | Rewards catalog |
| `POST` | `/users/:id/redeem` | Redeem a reward |

---

## Design System

| Token | Value |
|---|---|
| Gold (primary) | `#FBBF24` |
| Background | `#080A0E` |
| Surface | `#111318` |
| Surface elevated | `#1C1F26` |
| Border | `#2A2D35` |
| Open (green) | `#22C55E` |
| Closing (amber) | `#F59E0B` |
| Font | DM Sans — Google Fonts |

---

## State Management

No external state management library. Uses:

- `ChangeNotifier` controllers per screen
- `ValueNotifier<int>` for cross-widget knight points sync (bet placement → header badge → rewards balance)
- `ValueNotifier<int>` increment pattern for triggering cross-screen refreshes (bet placed / game resolved → My Bets reload)
