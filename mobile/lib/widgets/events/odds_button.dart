// lib/widgets/events/odds_button.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';

class OddsButton extends StatefulWidget {
  final String teamName;
  final String odds;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isDisabled;

  const OddsButton({
    super.key,
    required this.teamName,
    required this.odds,
    required this.onTap,
    this.isSelected = false,
    this.isDisabled = false,
  });

  @override
  State<OddsButton> createState() => _OddsButtonState();
}

class _OddsButtonState extends State<OddsButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 90),
      lowerBound: 0.0,
      upperBound: 1.0,
    );
    _scale = Tween<double>(begin: 1.0, end: 0.94).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool selected = widget.isSelected;
    final bool disabled = widget.isDisabled;

    return GestureDetector(
      onTapDown: disabled ? null : (_) => _ctrl.forward(),
      onTapUp: disabled ? null : (_) => _ctrl.reverse(),
      onTapCancel: disabled ? null : () => _ctrl.reverse(),
      onTap: disabled ? null : widget.onTap,
      child: ScaleTransition(
        scale: _scale,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.gold.withValues(alpha: 0.12)
                : AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: selected
                  ? AppColors.gold
                  : AppColors.border,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.teamName,
                style: GoogleFonts.dmSans(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: disabled
                      ? AppColors.textMuted
                      : AppColors.textSecondary,
                  letterSpacing: 0.2,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 3),
              Text(
                disabled ? '—' : widget.odds,
                style: GoogleFonts.dmMono(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: disabled
                      ? AppColors.textMuted
                      : (selected ? AppColors.gold : AppColors.textPrimary),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
