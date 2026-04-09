import 'package:flutter/material.dart';
import '../../modules/auth/presentation/screens/landing_screen.dart';
import '../../modules/auth/presentation/screens/signin_screen.dart';
import '../../modules/auth/presentation/screens/signup_screen.dart';
import '../../modules/auth/presentation/screens/welcome_screen.dart';
import '../../modules/events/domain/event.dart';
import '../../modules/events/presentation/screens/event_detail_screen.dart';
import '../../modules/events/presentation/screens/events_screen.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return _fade(const LandingScreen());

      case '/signup':
        return _slide(const SignUpScreen());

      case '/welcome':
        final username = settings.arguments as String? ?? 'Knight';
        return _fade(WelcomeScreen(username: username));

      case '/signin':
        return _slide(const SignInScreen());

      case '/home':
        return _fade(const EventsScreen());

      case '/event-detail':
        final event = settings.arguments as EventModel?;
        return _slide(EventDetailScreen(event: event));

      case '/verify-email-pending':
        final email = settings.arguments as String? ?? '';
        return _fade(VerifyEmailPendingScreen(email: email));

      case '/email-verified':
        return _fade(const EmailVerifiedScreen());

      default:
        return _fade(const LandingScreen());
    }
  }

  static PageRoute _fade(Widget page) => PageRouteBuilder(
        pageBuilder: (_, __, ___) => page,
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 300),
      );

  static PageRoute _slide(Widget page) => PageRouteBuilder(
        pageBuilder: (_, __, ___) => page,
        transitionsBuilder: (_, anim, __, child) => SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 1),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
          child: child,
        ),
        transitionDuration: const Duration(milliseconds: 350),
      );
}

class VerifyEmailPendingScreen extends StatelessWidget {
  final String email;
  const VerifyEmailPendingScreen({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080A0E),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.mark_email_unread_rounded,
                    color: Color(0xFFD4A017), size: 72),
                const SizedBox(height: 24),
                const Text(
                  'Check Your Email',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'We sent a verification link to\n$email\n\nTap the link in that email to activate your account.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF9CA3AF),
                    fontSize: 15,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF9CA3AF),
                      side: const BorderSide(color: Color(0xFF374151)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => Navigator.pushNamedAndRemoveUntil(
                        context, '/signin', (r) => false),
                    child: const Text('Back to Sign In',
                        style: TextStyle(fontSize: 15)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class EmailVerifiedScreen extends StatelessWidget {
  const EmailVerifiedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080A0E),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.verified_rounded,
                    color: Color(0xFF22C55E), size: 72),
                const SizedBox(height: 24),
                const Text(
                  'Email Verified!',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Your UCF email has been confirmed.\nYou\'re ready to roll.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color(0xFF9CA3AF),
                    fontSize: 15,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFD4A017),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => Navigator.pushNamedAndRemoveUntil(
                        context, '/signin', (r) => false),
                    child: const Text('Sign In',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
