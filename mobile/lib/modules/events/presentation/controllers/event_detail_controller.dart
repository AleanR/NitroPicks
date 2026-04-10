// lib/modules/events/presentation/controllers/event_detail_controller.dart

import 'package:flutter/foundation.dart';
import '../../../bets/data/bet_repository.dart';
import '../../../bets/domain/bet.dart';
import '../../domain/event.dart';

enum BetState { idle, loading, success, error }

class EventDetailController extends ChangeNotifier {
  final BetRepository _betRepository;

  EventDetailController({required BetRepository betRepository})
      : _betRepository = betRepository;

  BetState _betState = BetState.idle;
  String? _errorMessage;
  Bet? _lastBet;

  BetState get betState => _betState;
  String? get errorMessage => _errorMessage;
  Bet? get lastBet => _lastBet;

  /// Places a single-leg bet on [event] for [team] ("home" or "away")
  /// with the given [stake] in KP (points).
  Future<bool> placeBet({
    required EventModel event,
    required String team, // "home" or "away"
    required double stake,
    required double odds,
  }) async {
    _betState = BetState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final leg = BetLeg(
        gameId: event.id,
        team: team,
        odds: odds,
      );

      _lastBet = await _betRepository.placeBet(stake: stake, legs: [leg]);
      _betState = BetState.success;
      notifyListeners();
      return true;
    } catch (e) {
      _betState = BetState.error;
      // Strip "Exception: " prefix for cleaner display
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  void reset() {
    _betState = BetState.idle;
    _errorMessage = null;
    notifyListeners();
  }
}
