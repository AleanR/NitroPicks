import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

enum NpButtonVariant { primary, secondary, ghost }

class NpButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final NpButtonVariant variant;
  final double? width;
  final IconData? icon;
  final bool loading;

  const NpButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = NpButtonVariant.primary,
    this.width,
    this.icon,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isPrimary = variant == NpButtonVariant.primary;
    final isSecondary = variant == NpButtonVariant.secondary;
    final isDisabled = onPressed == null && !loading;

    Color bg;
    Color fg;
    Color borderColor;
    List<BoxShadow>? shadow;

    if (isPrimary) {
      if (isDisabled) {
        bg = Colors.white.withValues(alpha: 0.12);
        fg = Colors.white.withValues(alpha: 0.45);
        borderColor = Colors.white.withValues(alpha: 0.06);
        shadow = null;
      } else {
        bg = AppColors.gold;
        fg = AppColors.textInverse;
        borderColor = AppColors.gold;
        shadow = [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.28),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ];
      }
    } else if (isSecondary) {
      bg = Colors.white.withValues(alpha: 0.04);
      fg = AppColors.textPrimary;
      borderColor = Colors.white.withValues(alpha: 0.12);
      shadow = null;
    } else {
      bg = Colors.transparent;
      fg = AppColors.goldLight;
      borderColor = Colors.transparent;
      shadow = null;
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: 58,
      child: GestureDetector(
        onTap: (loading || onPressed == null) ? null : onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: borderColor, width: 1.2),
            boxShadow: shadow,
          ),
          child: Center(
            child: loading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: fg,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (icon != null) ...[
                        Icon(icon, size: 18, color: fg),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        label,
                        style: GoogleFonts.dmSans(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: fg,
                          letterSpacing: -0.2,
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

class NpTextButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final Color? color;

  const NpTextButton({
    super.key,
    required this.label,
    this.onPressed,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Text(
        label,
        style: AppTextStyles.body(
          color: color ?? AppColors.gold,
          size: 14,
        ).copyWith(
          decoration: TextDecoration.underline,
          decorationColor: color ?? AppColors.gold,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
