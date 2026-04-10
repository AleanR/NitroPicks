import 'package:flutter/foundation.dart';

import '../../data/auth_repository.dart';
import '../../domain/auth_state.dart';
import 'auth_controller.dart';

class SignInController extends ChangeNotifier {
  SignInController({
    required AuthRepository authRepository,
    required AuthController authController,
  })  : _authRepository = authRepository,
        _authController = authController;

  final AuthRepository _authRepository;
  final AuthController _authController;

  AuthState _state = const AuthState(status: AuthStatus.unauthenticated);

  AuthState get state => _state;
  bool get isLoading => _state.isLoading;
  String? get errorMessage => _state.isFailure ? _state.message : null;
  String? get resetMessage =>
      _state.status == AuthStatus.passwordResetSent ? _state.message : null;
  bool get resetSent => _state.status == AuthStatus.passwordResetSent;

  bool canSubmit({
    required String email,
    required String password,
  }) {
    return email.trim().isNotEmpty && password.isNotEmpty;
  }

  bool canSendReset(String email) => email.trim().isNotEmpty;

  Future<bool> signIn({
    required String email,
    required String password,
  }) async {
    final validationMessage = _validateSignIn(email: email, password: password);
    if (validationMessage != null) {
      _setFailure(validationMessage);
      return false;
    }

    _setLoading();
    _authController.setLoading();

    try {
      final (user, token) = await _authRepository.signIn(
        email: email.trim(),
        password: password,
      );

      _state = AuthState(
        status: AuthStatus.authenticated,
        user: user,
        email: user.email,
        token: token,
      );

_authController.setAuthenticated(
  user,
  token: token,
);
      notifyListeners();
      return true;
    } catch (error) {
      final message = error.toString().replaceFirst('Exception: ', '');
      _setFailure(message);
      _authController.setFailure(message);
      return false;
    }
  }

  Future<bool> sendPasswordReset({required String email}) async {
    final trimmedEmail = email.trim();
    if (!_isValidEmail(trimmedEmail)) {
      _setFailure('Please enter a valid email address.');
      return false;
    }

    _setLoading();

    try {
      final result = await _authRepository.sendPasswordReset(email: trimmedEmail);
      _state = AuthState(
        status: AuthStatus.passwordResetSent,
        email: trimmedEmail,
        message: result.message,
      );
      _authController.setPasswordResetSent(
        email: trimmedEmail,
        message: result.message,
      );
      notifyListeners();
      return true;
    } catch (error) {
      final message = error.toString().replaceFirst('Exception: ', '');
      _setFailure(message);
      return false;
    }
  }

  void clearFeedback() {
    _state = const AuthState(status: AuthStatus.unauthenticated);
    notifyListeners();
  }

  String? _validateSignIn({
    required String email,
    required String password,
  }) {
    if (!_isValidEmail(email.trim()) || password.isEmpty) {
      return 'Invalid email address or password. Please try again.';
    }
    return null;
  }

  bool _isValidEmail(String email) => email.contains('@');

  void _setLoading() {
    _state = _state.copyWith(
      status: AuthStatus.loading,
      message: null,
      email: null,
    );
    notifyListeners();
  }

  void _setFailure(String message) {
    _state = _state.copyWith(
      status: AuthStatus.failure,
      message: message,
    );
    notifyListeners();
  }
}
