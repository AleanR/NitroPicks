// lib/utils/app_router.dart
import 'package:flutter/material.dart';
import '../screens/landing_screen.dart';
import '../screens/signup_screen.dart';
import '../screens/welcome_screen.dart';

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
        return _slide(const _PlaceholderScreen(title: 'Sign In'));

      case '/home':
        return _fade(const _PlaceholderScreen(title: 'Events'));

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

/// Temporary placeholder while other screens are being built
class _PlaceholderScreen extends StatelessWidget {
  final String title;
  const _PlaceholderScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080A0E),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(title,
            style: const TextStyle(color: Colors.white, fontSize: 18)),
      ),
      body: Center(
        child: Text(
          '$title screen\n(coming soon)',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.grey, fontSize: 16),
        ),
      ),
    );
  }
}
