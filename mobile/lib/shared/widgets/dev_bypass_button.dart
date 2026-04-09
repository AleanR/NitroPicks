// lib/shared/widgets/dev_bypass_button.dart
//
// DEV ONLY — delete before release.
// Drop this widget anywhere to jump straight to /home.
//
// Usage:
//   const DevBypassButton()
//
// Or inline on any screen:
//   DevBypassButton(label: 'Skip to Events')

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class DevBypassButton extends StatelessWidget {
  final String label;

  const DevBypassButton({
    super.key,
    this.label = '⚡ Dev: Skip to Events',
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () =>
          Navigator.pushNamedAndRemoveUntil(context, '/home', (_) => false),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: AppColors.gold.withValues(alpha: 0.4),
            width: 1,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: GoogleFonts.dmMono(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.gold.withValues(alpha: 0.7),
            letterSpacing: 0.3,
          ),
        ),
      ),
    );
  }
}
