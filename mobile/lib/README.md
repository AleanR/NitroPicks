# NitroPicks — Events Tab

## New File Structure

```
lib/
├── data/
│   └── events_data.dart          ← Mock data (8 events, all statuses)
│
├── models/
│   └── event_model.dart          ← EventModel, TeamOdds, EventStatus enum
│
├── screens/
│   └── events_screen.dart        ← Full Events tab screen
│
└── widgets/
    └── events/
        ├── events_widgets.dart   ← Barrel export (import one file)
        ├── event_card.dart       ← Main card widget (EventCard)
        ├── filter_tab_bar.dart   ← FilterTabBar + _FilterChip
        ├── events_search_bar.dart← EventsSearchBar
        ├── odds_button.dart      ← OddsButton (tap to select)
        ├── status_chip.dart      ← StatusChip (Open/Soon/Closing/etc.)
        └── betting_slip.dart     ← BettingSlipSheet (modal)
```

## Integration Steps

### 1. Add to app_router.dart
See `ROUTER_PATCH.dart` — add the `/home` and `/event-detail` cases.

### 2. Import EventsScreen
```dart
import '../screens/events_screen.dart';
```

### 3. Ensure pubspec.yaml has assets declared
```yaml
flutter:
  assets:
    - assets/svg/
```

## Card Status Colors (from AppTheme)

| Status  | Color          | Use case                  |
|---------|---------------|---------------------------|
| Open    | green #22C55E | Game accepting bets       |
| Soon    | orange #F97316| Game starting < 30 min    |
| Closing | red #EF4444   | Last chance, shows timer  |
| Closed  | gray #6B7280  | Game locked               |
| Won     | green #22C55E | Bet won (completed)       |
| Lost    | red #EF4444   | Bet lost (completed)      |

## Swapping SVG Assets
Each `EventModel` has an optional `svgAsset` field:
```dart
EventModel(
  svgAsset: 'assets/svg/card_1.svg', // swap path when new assets arrive
  ...
)
```
Wire it into `EventCard` by adding a `flutter_svg` `SvgPicture.asset(event.svgAsset)` 
as a card background inside the `ClipRRect` when you're ready.

## Adding Real Data
Replace `mockEvents` in `lib/data/events_data.dart` with your API call.
Return `List<EventModel>` — the screen re-renders automatically.
