import '../../../core/storage/secure_storage_service.dart';
import '../domain/user.dart';
import 'auth_api_service.dart';

class AuthRegistrationResult {
  final String email;
  final String message;
  final String? verificationUrl;
  final String? token;

  const AuthRegistrationResult({
    required this.email,
    required this.message,
    this.verificationUrl,
    this.token,
  });
}

class PasswordResetResult {
  final String message;
  final String? resetUrl;

  const PasswordResetResult({
    required this.message,
    this.resetUrl,
  });
}

class AuthRepository {
  AuthRepository({
    required AuthApiService apiService,
    required SecureStorageService storageService,
  })  : _apiService = apiService,
        _storageService = storageService;

  final AuthApiService _apiService;
  final SecureStorageService _storageService;

Future<(User, String?)> signIn({
  required String email,
  required String password,
}) async {
  final response = await _apiService.login(
    email: email,
    password: password,
  );

  final token = response['token']?.toString();

  if (token != null && token.isNotEmpty) {
    await _storageService.write(key: _sessionTokenKey, value: token);
  }

  final userJson = response['user'] is Map<String, dynamic>
      ? response['user'] as Map<String, dynamic>
      : response;

  final user = User.fromJson(userJson);

  return (user, token);
}

  Future<AuthRegistrationResult> register({
    required String firstName,
    required String lastName,
    required String ucfId,
    required String major,
    required String email,
    required String password,
  }) async {
    final username = _deriveUsername(email);
    final response = await _apiService.register(
      firstName: firstName,
      lastName: lastName,
      ucfId: ucfId,
      major: major,
      email: email,
      password: password,
      username: username,
    );

    final token = response['token']?.toString();
    if (token != null && token.isNotEmpty) {
      await _storageService.write(key: _sessionTokenKey, value: token);
    }

    return AuthRegistrationResult(
      email: email,
      message: response['message']?.toString() ?? 'Verification email sent.',
      verificationUrl: response['otpUrl']?.toString(),
      token: token,
    );
  }

  Future<PasswordResetResult> sendPasswordReset({
    required String email,
  }) async {
    final response = await _apiService.forgotPassword(email: email);
    return PasswordResetResult(
      message: response['message']?.toString() ??
          'If an account exists, we sent a code to your email.',
      resetUrl: response['resetURL']?.toString(),
    );
  }

  static String deriveUsername(String email) => _deriveUsername(email);

  static String _deriveUsername(String email) {
    return email.split('@').first.trim();
  }

  static const _sessionTokenKey = 'session_token';
}
