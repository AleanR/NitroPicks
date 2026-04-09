import 'odds.dart';

enum EventStatus { open, soon, closing, closed, won, lost }

class EventModel {
  final String id;
  final TeamOdds home;
  final TeamOdds away;
  final EventStatus status;
  final String league;
  final String? gameTime;
  final Duration? closingIn;
  final String? svgAsset;

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
