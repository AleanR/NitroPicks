// lib/shared/widgets/nitropicks_logo.dart
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class NitroPicksLogo extends StatelessWidget {
  final double size;

  const NitroPicksLogo({super.key, this.size = 120});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            AppColors.accentBlue.withValues(alpha: 0.18),
            Colors.transparent,
          ],
          stops: const [0.0, 1.0],
          radius: 0.72,
        ),
      ),
      child: Center(
        child: Container(
          width: size * 0.82,
          height: size * 0.82,
          decoration: BoxDecoration(
            color: AppColors.gold,
            shape: BoxShape.circle,
            //border: Border.all(color: AppColors.accentBlue, width: 3.5),
            boxShadow: [
              BoxShadow(
                color: AppColors.gold.withValues(alpha: 0.32),
                blurRadius: 28,
                spreadRadius: 4,
              ),
            ],
          ),
          child: Center(
            child: CustomPaint(
              size: Size(size * 0.34, size * 0.34 * 82 / 70),
              painter: _BoltPainter(),
            ),
          ),
        ),
      ),
    );
  }
}

class _BoltPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF101114)
      ..style = PaintingStyle.fill;

    // Exact bolt from Figma SVG: M171 260.5 L212 212 V245 H241 L200 294 V260.5 H171 Z
    // Original bounds: x=171..241, y=212..294  →  w=70, h=82
    // Scale to fill our canvas size
    final sw = size.width / 70.0;
    final sh = size.height / 82.0;

    // Translate so origin (171,212) maps to (0,0)
    final path = Path()
      ..moveTo((171 - 171) * sw, (260.5 - 212) * sh) // 0, 48.5
      ..lineTo((212 - 171) * sw, (212 - 212) * sh)   // 41, 0
      ..lineTo((212 - 171) * sw, (245 - 212) * sh)   // 41, 33
      ..lineTo((241 - 171) * sw, (245 - 212) * sh)   // 70, 33
      ..lineTo((200 - 171) * sw, (294 - 212) * sh)   // 29, 82
      ..lineTo((200 - 171) * sw, (260.5 - 212) * sh) // 29, 48.5
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_BoltPainter old) => false;
}
