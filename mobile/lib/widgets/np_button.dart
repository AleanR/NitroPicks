import 'package:flutter/material.dart';
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
        bg = const Color(0xFFBDBDBD);
        fg = Colors.white;
        borderColor = const Color(0xFFBDBDBD);
        shadow = null;
      } else {
        bg = AppColors.gold;
        fg = AppColors.textInverse;
        borderColor = AppColors.gold;
        shadow = [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ];
      }
    } else if (isSecondary) {
      bg = Colors.transparent;
      fg = AppColors.textPrimary;
      borderColor = AppColors.textPrimary;
      shadow = null;
    } else {
      bg = Colors.transparent;
      fg = AppColors.gold;
      borderColor = Colors.transparent;
      shadow = null;
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: 56,
      child: GestureDetector(
        onTap: (loading || onPressed == null) ? null : onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: borderColor, width: 1.5),
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
                      Text(label, style: AppTextStyles.button(color: fg)),
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