// lib/widgets/events/status_chip.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/event_model.dart';
import '../../theme/app_theme.dart';

class StatusChip extends StatelessWidget {
  final EventStatus status;
  final Duration? closingIn;

  const StatusChip({super.key, required this.status, this.closingIn});

  @override
  Widget build(BuildContext context) {
    final config = _configFor(status);
    final label = status == EventStatus.closing && closingIn != null
        ? _formatCountdown(closingIn!)
        : config.label;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: config.bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: config.color.withValues(alpha: 0.35), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(
              color: config.color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.dmMono(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: config.color,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }

  static String _formatCountdown(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  static _StatusConfig _configFor(EventStatus status) {
    switch (status) {
      case EventStatus.open:
        return _StatusConfig('OPEN', AppColors.open, AppColors.openBg);
      case EventStatus.soon:
        return _StatusConfig('SOON', AppColors.soon, AppColors.soonBg);
      case EventStatus.closing:
        return _StatusConfig('CLOSING', AppColors.closing, AppColors.closingBg);
      case EventStatus.closed:
        return _StatusConfig('CLOSED', AppColors.closed, AppColors.closedBg);
      case EventStatus.won:
        return _StatusConfig('WON', AppColors.open, AppColors.openBg);
      case EventStatus.lost:
        return _StatusConfig('LOST', AppColors.closing, AppColors.closingBg);
    }
  }
}

class _StatusConfig {
  final String label;
  final Color color;
  final Color bg;
  const _StatusConfig(this.label, this.color, this.bg);
}
