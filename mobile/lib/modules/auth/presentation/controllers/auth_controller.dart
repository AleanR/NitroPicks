import 'package:flutter/foundation.dart';

import '../../domain/auth_state.dart';
import '../../domain/user.dart';

class AuthController extends ChangeNotifier {
  AuthState _state = const AuthState(status: AuthStatus.unauthenticated);

  AuthState get state => _state;

  void setLoading() {
    _emit(_state.copyWith(
      status: AuthStatus.loading,
      message: null,
    ));
  }

  // ← token parameter added so the router can read it from state
  void setAuthenticated(User user, {String? token}) {
    _emit(AuthState(
      status: AuthStatus.authenticated,
      user: user,
      email: user.email,
      token: token,
    ));
  }

  void setVerificationPending({
    required String email,
    required String message,
  }) {
    _emit(AuthState(
      status: AuthStatus.verificationPending,
      email: email,
      message: message,
      user: _state.user,
    ));
  }

  void setPasswordResetSent({
    required String email,
    required String message,
  }) {
    _emit(AuthState(
      status: AuthStatus.passwordResetSent,
      email: email,
      message: message,
      user: _state.user,
    ));
  }

  void setFailure(String message) {
    _emit(_state.copyWith(
      status: AuthStatus.failure,
      message: message,
    ));
  }

  void clearMessage() {
    _emit(_state.copyWith(message: null));
  }

  void markUnauthenticated() {
    _emit(const AuthState(status: AuthStatus.unauthenticated));
  }

  void _emit(AuthState state) {
    _state = state;
    notifyListeners();
  }
}
