// lib/modules/bets/domain/bet.dart

class BetLeg {
  final String gameId;
  final String team; // "home" or "away"
  final double odds;
  final String result; // "pending", "win", "lose", "cancelled"

  const BetLeg({
    required this.gameId,
    required this.team,
    required this.odds,
    this.result = 'pending',
  });

  Map<String, dynamic> toJson() => {
        'gameId': gameId,
        'team': team,
        'odds': odds,
      };

  factory BetLeg.fromJson(Map<String, dynamic> json) {
    return BetLeg(
      gameId: json['gameId'] as String,
      team: json['team'] as String,
      odds: (json['odds'] as num).toDouble(),
      result: json['result'] as String? ?? 'pending',
    );
  }
}

class Bet {
  final String id;
  final String userId;
  final double stake;
  final String betType; // "single" or "parlay"
  final String status; // "active", "win", "lose", "refunded"
  final List<BetLeg> legs;
  final double totalOdds;
  final double expectedPayout;

  const Bet({
    required this.id,
    required this.userId,
    required this.stake,
    required this.betType,
    required this.status,
    required this.legs,
    required this.totalOdds,
    required this.expectedPayout,
  });

  factory Bet.fromJson(Map<String, dynamic> json) {
    return Bet(
      id: json['_id'] as String,
      userId: json['userId'] as String,
      stake: (json['stake'] as num).toDouble(),
      betType: json['betType'] as String,
      status: json['status'] as String,
      legs: (json['legs'] as List<dynamic>)
          .map((l) => BetLeg.fromJson(l as Map<String, dynamic>))
          .toList(),
      totalOdds: (json['totalOdds'] as num).toDouble(),
      expectedPayout: (json['expectedPayout'] as num).toDouble(),
    );
  }
}
