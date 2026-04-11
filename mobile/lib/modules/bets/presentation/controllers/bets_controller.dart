// lib/modules/bets/presentation/controllers/bets_controller.dart

import 'package:flutter/foundation.dart';
import '../../data/bet_repository.dart';
import '../../domain/bet.dart';

enum BetsLoadState { idle, loading, loaded, error }

class BetsController extends ChangeNotifier {
  final BetRepository _repository;

  BetsController({required BetRepository repository})
      : _repository = repository;

  BetsLoadState _state = BetsLoadState.idle;
  List<Bet> _bets = [];
  String? _errorMessage;

  BetsLoadState get state => _state;
  String? get errorMessage => _errorMessage;

  List<Bet> get activeBets =>
      _bets.where((b) => b.isActive).toList();

  List<Bet> get pastBets =>
      _bets.where((b) => b.isWon || b.isLost || b.status == 'refunded').toList();

  Future<void> loadBets() async {
    _state = BetsLoadState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      _bets = await _repository.getMyBets();
      _state = BetsLoadState.loaded;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _state = BetsLoadState.error;
    }

    notifyListeners();
  }
}
