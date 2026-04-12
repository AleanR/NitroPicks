// lib/modules/rewards/domain/redemption.dart

class Redemption {
  final String id;
  final String rewardId;
  final String rewardName;
  final String voucherCode;
  final int pointsCost;
  final DateTime redeemedAt;

  const Redemption({
    required this.id,
    required this.rewardId,
    required this.rewardName,
    required this.voucherCode,
    required this.pointsCost,
    required this.redeemedAt,
  });

  factory Redemption.fromJson(Map<String, dynamic> json) {
    return Redemption(
      id: (json['_id'] ?? '').toString(),
      rewardId: (json['rewardId'] ?? '').toString(),
      rewardName: (json['rewardName'] ?? '').toString(),
      voucherCode: (json['voucherCode'] ?? '').toString(),
      pointsCost: (json['pointsCost'] as num?)?.toInt() ?? 0,
      redeemedAt: json['redeemedAt'] != null
          ? DateTime.parse(json['redeemedAt'].toString()).toLocal()
          : DateTime.now(),
    );
  }
}
