// lib/modules/rewards/data/rewards_repository.dart

import '../domain/redemption.dart';
import '../domain/reward.dart';
import 'rewards_api_service.dart';

class RewardsRepository {
  final RewardsApiService service;
  const RewardsRepository({required this.service});

  Future<List<Reward>> getRewards() => service.getRewards();

  Future<Map<String, dynamic>> redeemReward({
    required String userId,
    required String rewardId,
  }) => service.redeemReward(userId: userId, rewardId: rewardId);

  Future<List<Redemption>> getRedemptions({required String userId}) =>
      service.getRedemptions(userId: userId);
}
