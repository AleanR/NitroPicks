// lib/modules/bets/domain/bet.dart

/// Slim game info embedded in a populated bet leg.
class BetLegGame {
  final String id;
  final String sport;
  final String homeTeam;
  final String awayTeam;
  final DateTime bettingClosesAt;

  const BetLegGame({
    required this.id,
    required this.sport,
    required this.homeTeam,
    required this.awayTeam,
    required this.bettingClosesAt,
  });

  factory BetLegGame.fromJson(Map<String, dynamic> json) {
    return BetLegGame(
      id: json['_id'] as String,
      sport: json['sport'] as String? ?? '',
      homeTeam: json['homeTeam'] as String,
      awayTeam: json['awayTeam'] as String,
      bettingClosesAt: DateTime.parse(json['bettingClosesAt'] as String),
    );
  }
}

class BetLeg {
  final String gameId;
  final String team; // "home" or "away"
  final double odds;
  final String result; // "pending", "win", "lose", "cancelled"

  /// Populated from the server when fetching user bets.
  final BetLegGame? game;

  const BetLeg({
    required this.gameId,
    required this.team,
    required this.odds,
    this.result = 'pending',
    this.game,
  });

  /// The display name of the team the user picked.
  String? get pickedTeamName {
    if (game == null) return null;
    return team == 'home' ? game!.homeTeam : game!.awayTeam;
  }

  /// The display name of the opposing team.
  String? get opposingTeamName {
    if (game == null) return null;
    return team == 'home' ? game!.awayTeam : game!.homeTeam;
  }

  Map<String, dynamic> toJson() => {
        'gameId': gameId,
        'team': team,
        'odds': odds,
      };

  factory BetLeg.fromJson(Map<String, dynamic> json) {
    final gameIdRaw = json['gameId'];
    BetLegGame? game;
    String gameId = '';

    if (gameIdRaw is Map<String, dynamic>) {
      // Populated — game document is embedded
      gameId = gameIdRaw['_id'] as String? ?? '';
      try {
        game = BetLegGame.fromJson(gameIdRaw);
      } catch (_) {
        // Partial/malformed game doc — leave game null
      }
    } else if (gameIdRaw is String) {
      gameId = gameIdRaw;
    }
    // else: null (game deleted after reseeding) — gameId stays ''

    return BetLeg(
      gameId: gameId,
      team: json['team'] as String? ?? '',
      odds: (json['odds'] as num?)?.toDouble() ?? 0,
      result: json['result'] as String? ?? 'pending',
      game: game,
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
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Bet({
    required this.id,
    required this.userId,
    required this.stake,
    required this.betType,
    required this.status,
    required this.legs,
    required this.totalOdds,
    required this.expectedPayout,
    this.createdAt,
    this.updatedAt,
  });

  bool get isActive => status == 'active';
  bool get isWon => status == 'win';
  bool get isLost => status == 'lose';

  /// Profit if won (payout − stake), displayed as +N.
  double get profit => expectedPayout - stake;

  /// The primary leg (for singles; parlays show aggregate info).
  BetLeg? get primaryLeg => legs.isNotEmpty ? legs.first : null;

  factory Bet.fromJson(Map<String, dynamic> json) {
    // userId may be an ObjectId object or a plain string
    final userIdRaw = json['userId'];
    final userId = userIdRaw is Map
        ? (userIdRaw['\$oid'] ?? userIdRaw['_id'] ?? '').toString()
        : userIdRaw?.toString() ?? '';

    return Bet(
      id: json['_id']?.toString() ?? '',
      userId: userId,
      stake: (json['stake'] as num?)?.toDouble() ?? 0,
      betType: json['betType'] as String? ?? 'single',
      status: json['status'] as String? ?? 'active',
      legs: (json['legs'] as List<dynamic>? ?? [])
          .map((l) => BetLeg.fromJson(l as Map<String, dynamic>))
          .toList(),
      totalOdds: (json['totalOdds'] as num?)?.toDouble() ?? 0,
      expectedPayout: (json['expectedPayout'] as num?)?.toDouble() ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }
}
