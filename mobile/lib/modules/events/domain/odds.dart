// lib/modules/events/domain/odds.dart

class TeamOdds {
  final String label;
  final double odds;

  const TeamOdds({
    required this.label,
    required this.odds,
  });

  /// Formats the raw decimal odds (e.g. 1.8) as a display string (e.g. "1.80x")
  String get displayOdds => '${odds.toStringAsFixed(2)}x';

  factory TeamOdds.fromJson(Map<String, dynamic> json) {
    return TeamOdds(
      label: json['label'] as String? ?? '',
      odds: (json['odds'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
