// lib/modules/rewards/presentation/controllers/rewards_controller.dart

import 'package:flutter/foundation.dart';
import '../../data/rewards_repository.dart';
import '../../domain/redemption.dart';
import '../../domain/reward.dart';

enum RewardsLoadState { idle, loading, loaded, error }

class RewardsController extends ChangeNotifier {
  final RewardsRepository repository;

  RewardsController({required this.repository});

  RewardsLoadState _state = RewardsLoadState.idle;
  List<Reward> _rewards = [];
  String? _errorMessage;

  RewardsLoadState _redemptionsState = RewardsLoadState.idle;
  List<Redemption> _redemptions = [];
  String? _redemptionsError;

  RewardsLoadState get state => _state;
  List<Reward> get rewards => _rewards;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == RewardsLoadState.loading;

  RewardsLoadState get redemptionsState => _redemptionsState;
  List<Redemption> get redemptions => _redemptions;
  String? get redemptionsError => _redemptionsError;
  bool get isLoadingRedemptions => _redemptionsState == RewardsLoadState.loading;

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

  Future<void> loadRedemptions({required String userId}) async {
    _redemptionsState = RewardsLoadState.loading;
    _redemptionsError = null;
    notifyListeners();
    try {
      _redemptions = await repository.getRedemptions(userId: userId);
      _redemptionsState = RewardsLoadState.loaded;
    } catch (e) {
      _redemptionsState = RewardsLoadState.error;
      _redemptionsError = e.toString();
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
