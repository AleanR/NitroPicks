enum AuthStatus { unknown, authenticated, unauthenticated, loading }

class AuthState {
  final AuthStatus status;

  const AuthState({this.status = AuthStatus.unknown});
}
