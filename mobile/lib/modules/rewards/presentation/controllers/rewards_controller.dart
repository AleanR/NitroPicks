// lib/modules/rewards/presentation/controllers/rewards_controller.dart

import 'package:flutter/foundation.dart';
import '../../data/rewards_repository.dart';
import '../../domain/reward.dart';

enum RewardsLoadState { idle, loading, loaded, error }

class RewardsController extends ChangeNotifier {
  final RewardsRepository repository;

  RewardsController({required this.repository});

  RewardsLoadState _state = RewardsLoadState.idle;
  List<Reward> _rewards = [];
  String? _errorMessage;

  RewardsLoadState get state => _state;
  List<Reward> get rewards => _rewards;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == RewardsLoadState.loading;

  Future<void> loadRewards() async {
    _state = RewardsLoadState.loading;
    _errorMessage = null;
    notifyListeners();
    try {
      _rewards = await repository.getRewards();
      _state = RewardsLoadState.loaded;
    } catch (e) {
      _state = RewardsLoadState.error;
      _errorMessage = e.toString();
    }
    notifyListeners();
  }

  Future<Map<String, dynamic>> redeem({
    required String userId,
    required String rewardId,
  }) async {
    return repository.redeemReward(userId: userId, rewardId: rewardId);
  }
}
