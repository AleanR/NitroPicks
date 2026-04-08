# NitroPicks Flutter App

UCF Sports Betting App — Flutter implementation from Figma design.

## Project Structure

```
lib/
├── main.dart                  # Entry point
├── theme/
│   └── app_theme.dart         # Colors, text styles, theme config
├── utils/
│   └── app_router.dart        # Named route navigation
├── widgets/
│   ├── nitropicks_logo.dart   # Lightning bolt logo widget
│   └── np_button.dart         # Primary / Secondary / Ghost buttons
└── screens/
    └── landing_screen.dart    # ✅ Landing / splash screen
    # More screens added as PNGs are provided:
    # signin_screen.dart
    # signup_screen.dart
    # home_screen.dart (Events feed)
    # my_bets_screen.dart
    # rewards_screen.dart
    # profile_screen.dart
```

## Getting Started

### Prerequisites
- Flutter SDK ≥ 3.0.0
- Dart SDK ≥ 3.0.0

### Install & Run

```bash
# Install dependencies
flutter pub get

# Run on device/simulator
flutter run

# Build release APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

## Design System

| Token | Value |
|---|---|
| Primary color | `#FFB800` (UCF Gold) |
| Background | `#080A0E` (near-black) |
| Surface | `#1A1A1A` |
| Font | DM Sans (Google Fonts) |
| Mono font | DM Mono (Google Fonts) |

## Screens Progress

- [x] Landing screen
- [ ] Sign In
- [ ] Sign Up
- [ ] Events (home feed)
- [ ] My Bets
- [ ] Rewards
- [ ] Profile

> Send more Figma PNGs to continue building out additional screens.
