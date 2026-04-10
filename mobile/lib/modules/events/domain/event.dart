// lib/modules/events/domain/event.dart

import 'odds.dart';

enum EventStatus { upcoming, live, finished, cancelled }

class EventModel {
  final String id;
  final String homeTeam;
  final String awayTeam;
  final int numBettorsHome;
  final int numBettorsAway;
  final double totalBetAmountHome;
  final double totalBetAmountAway;
  final double betPool;
  final TeamOdds homeWin;
  final TeamOdds awayWin;
  final int scoreHome;
  final int scoreAway;
  final DateTime bettingOpensAt;
  final DateTime bettingClosesAt;
  final String winner;
  final EventStatus status;

  const EventModel({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    required this.numBettorsHome,
    required this.numBettorsAway,
    required this.totalBetAmountHome,
    required this.totalBetAmountAway,
    required this.betPool,
    required this.homeWin,
    required this.awayWin,
    required this.scoreHome,
    required this.scoreAway,
    required this.bettingOpensAt,
    required this.bettingClosesAt,
    required this.winner,
    required this.status,
  });

  /// Mirrors the backend's computedStatus virtual
  EventStatus get computedStatus {
    final now = DateTime.now();
    if (status == EventStatus.cancelled) return EventStatus.cancelled;
    if (now.isBefore(bettingOpensAt)) return EventStatus.upcoming;
    if (now.isAfter(bettingOpensAt) && now.isBefore(bettingClosesAt)) {
      return EventStatus.live;
    }
    return EventStatus.finished;
  }

  /// Time remaining in the betting window (null if not live)
  Duration? get timeUntilClose {
    final now = DateTime.now();
    if (now.isBefore(bettingClosesAt)) {
      return bettingClosesAt.difference(now);
    }
    return null;
  }

  int get totalBettors => numBettorsHome + numBettorsAway;

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['_id'] as String,
      homeTeam: json['homeTeam'] as String,
      awayTeam: json['awayTeam'] as String,
      numBettorsHome: (json['numBettorsHome'] as num?)?.toInt() ?? 0,
      numBettorsAway: (json['numBettorsAway'] as num?)?.toInt() ?? 0,
      totalBetAmountHome: (json['totalBetAmountHome'] as num?)?.toDouble() ?? 100,
      totalBetAmountAway: (json['totalBetAmountAway'] as num?)?.toDouble() ?? 100,
      betPool: (json['betPool'] as num?)?.toDouble() ?? 200,
      homeWin: TeamOdds.fromJson((json['homeWin'] as Map<String, dynamic>?) ?? {'label': '', 'odds': 1.8}),
      awayWin: TeamOdds.fromJson((json['awayWin'] as Map<String, dynamic>?) ?? {'label': '', 'odds': 1.8}), 
      scoreHome: (json['scoreHome'] as num?)?.toInt() ?? 0,
      scoreAway: (json['scoreAway'] as num?)?.toInt() ?? 0,
      bettingOpensAt: DateTime.parse(json['bettingOpensAt'] as String),
      bettingClosesAt: DateTime.parse(json['bettingClosesAt'] as String),
      winner: json['winner'] as String? ?? '',
      status: _parseStatus(json['status'] as String?),
    );
  }

  static EventStatus _parseStatus(String? s) {
    switch (s) {
      case 'live':
        return EventStatus.live;
      case 'finished':
        return EventStatus.finished;
      case 'cancelled':
        return EventStatus.cancelled;
      default:
        return EventStatus.upcoming;
    }
  }
}
