// lib/modules/rewards/domain/reward.dart

class Reward {
  final String id;
  final String name;
  final String category;
  final String description;
  final int pointsCost;
  final int quantityAvailable;
  final int quantityRedeemed;
  final bool isActive;
  final String eligibility;
  final String redemptionInstructions;

  const Reward({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.pointsCost,
    required this.quantityAvailable,
    required this.quantityRedeemed,
    required this.isActive,
    required this.eligibility,
    required this.redemptionInstructions,
  });

  int get remaining => quantityAvailable - quantityRedeemed;
  bool get inStock => remaining > 0;

  factory Reward.fromJson(Map<String, dynamic> json) {
    return Reward(
      id: (json['_id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      pointsCost: (json['pointsCost'] as num?)?.toInt() ?? 0,
      quantityAvailable: (json['quantityAvailable'] as num?)?.toInt() ?? 0,
      quantityRedeemed: (json['quantityRedeemed'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] == true,
      eligibility: (json['eligibility'] ?? '').toString(),
      redemptionInstructions: (json['redemptionInstructions'] ?? '').toString(),
    );
  }
}
