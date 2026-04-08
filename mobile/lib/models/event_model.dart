// lib/models/event_model.dart

enum EventStatus { open, soon, closing, closed, won, lost }

class TeamOdds {
  final String name;
  final String shortName;
  final String odds; // e.g. "+120", "-150"

  const TeamOdds({
    required this.name,
    required this.shortName,
    required this.odds,
  });
}

class EventModel {
  final String id;
  final TeamOdds home;
  final TeamOdds away;
  final EventStatus status;
  final String league;
  final String? gameTime; // e.g. "Today · 7:30 PM"
  final Duration? closingIn; // countdown for closing status
  final String? svgAsset; // e.g. "assets/svg/card_1.svg"

  const EventModel({
    required this.id,
    required this.home,
    required this.away,
    required this.status,
    required this.league,
    this.gameTime,
    this.closingIn,
    this.svgAsset,
  });
}
