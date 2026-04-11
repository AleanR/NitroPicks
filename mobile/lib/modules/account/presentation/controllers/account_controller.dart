import 'package:flutter/foundation.dart';

import '../../data/account_api_service.dart';
import '../../domain/account.dart';

class AccountController extends ChangeNotifier {
  AccountController({
    required AccountApiService apiService,
    Account? initialAccount,
  })  : _apiService = apiService,
        _account = initialAccount;

  final AccountApiService _apiService;

  Account? _account;
  bool _isLoading = false;
  bool _isSubmitting = false;
  bool _disposed = false;
  String? _errorMessage;

  int totalBets = 0;
  int betsWon   = 0;
  int betsLost  = 0;

  Account? get account => _account;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  Future<Account?> loadAccount() async {
    _isLoading = true;
    _errorMessage = null;
    _notify();

    try {
      final results = await Future.wait([
        _apiService.getCurrentAccount(),
        _apiService.getBetStats(),
      ]);
      _account = results[0] as Account;
      final stats = results[1] as Map<String, int>;
      totalBets = stats['total'] ?? 0;
      betsWon   = stats['won']   ?? 0;
      betsLost  = stats['lost']  ?? 0;
      return _account;
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '');
      return _account;
    } finally {
      _isLoading = false;
      _notify();
    }
  }

  Future<int?> loadBettingCredits(String code) async {
    _isSubmitting = true;
    _errorMessage = null;
    _notify();

    try {
      final result = await _apiService.earnPoints(code: code);
      final account = _account;
      if (account != null) {
        _account = account.copyWith(knightPoints: result.knightPoints);
      }
      return result.knightPoints;
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '');
      return null;
    } finally {
      _isSubmitting = false;
      _notify();
    }
  }

  void setKnightPoints(int knightPoints) {
    final account = _account;
    if (account == null || account.knightPoints == knightPoints) return;
    _account = account.copyWith(knightPoints: knightPoints);
    _notify();
  }

  void clearError() {
    if (_errorMessage == null) return;
    _errorMessage = null;
    _notify();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }

  void _notify() {
    if (!_disposed) notifyListeners();
  }
}
