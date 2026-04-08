// lib/screens/landing_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/nitropicks_logo.dart';
import '../widgets/np_button.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _logoFade;
  late Animation<Offset> _logoSlide;
  late Animation<double> _textFade;
  late Animation<Offset> _textSlide;
  late Animation<double> _btnFade;
  late Animation<Offset> _btnSlide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _logoFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );
    _logoSlide = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );

    _textFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.3, 0.7, curve: Curves.easeOut),
      ),
    );
    _textSlide = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.3, 0.7, curve: Curves.easeOut),
      ),
    );

    _btnFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.6, 1.0, curve: Curves.easeOut),
      ),
    );
    _btnSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.6, 1.0, curve: Curves.easeOut),
      ),
    );

    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        body: Stack(
          children: [
            // Static background — never rebuilds
            const _LandingBackground(),
            // Animated content in a RepaintBoundary so only this layer repaints
            RepaintBoundary(
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Spacer(flex: 2),
                      // Logo
                      Center(
                        child: FadeTransition(
                          opacity: _logoFade,
                          child: SlideTransition(
                            position: _logoSlide,
                            child: const NitroPicksLogo(size: 130),
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),
                      // Wordmark + tagline
                      FadeTransition(
                        opacity: _textFade,
                        child: SlideTransition(
                          position: _textSlide,
                          child: const _LandingWordmark(),
                        ),
                      ),
                      const Spacer(flex: 3),
                      // Buttons
                      FadeTransition(
                        opacity: _btnFade,
                        child: SlideTransition(
                          position: _btnSlide,
                          child: _buildButtons(context),
                        ),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildButtons(BuildContext context) {
    return Column(
      children: [
        NpButton(
          label: 'Sign Up',
          variant: NpButtonVariant.primary,
          onPressed: () => Navigator.pushNamed(context, '/signup'),
        ),
        const SizedBox(height: 12),
        NpButton(
          label: 'Sign In',
          variant: NpButtonVariant.secondary,
          onPressed: () => Navigator.pushNamed(context, '/signin'),
        ),
      ],
    );
  }
}

// ── Static widgets below — extracted so Flutter never rebuilds them ──────────

class _LandingBackground extends StatelessWidget {
  const _LandingBackground();

  @override
  Widget build(BuildContext context) {
    // From Figma SVG: base is #12100A with blurred ellipses:
    // - top-left: #003087 (UCF blue) at cx=23, cy=21
    // - top-right: #BA9B37 (gold) at cx=382, cy=-66
    // - left-center: #BA9B37 at cx=-46, cy=488
    // - bottom-right: #003087 at cx=498, cy=724
    return const SizedBox.expand(
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0D1520), // top-left: dark navy (blue ellipse)
              Color(0xFF12100A), // center: exact Figma base color
              Color(0xFF1A1200), // bottom: dark gold tint
            ],
            stops: [0.0, 0.45, 1.0],
          ),
        ),
      ),
    );
  }
}

class _LandingWordmark extends StatelessWidget {
  const _LandingWordmark();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'NitroPicks',
          style: GoogleFonts.dmSans(
            fontSize: 48,
            fontWeight: FontWeight.w900,
            fontStyle: FontStyle.italic,
            color: AppColors.textPrimary,
            letterSpacing: -2,
            height: 1.0,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Charge on.',
          style: GoogleFonts.dmSans(
            fontSize: 28,
            fontWeight: FontWeight.w400,
            color: AppColors.textSecondary,
            height: 1.3,
          ),
        ),
        Text(
          'Cash in.',
          style: GoogleFonts.dmSans(
            fontSize: 28,
            fontWeight: FontWeight.w400,
            color: Color(0xFF888888),
            height: 1.3,
          ),
        ),
      ],
    );
  }
}
