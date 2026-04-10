// lib/modules/events/presentation/widgets/status_chip.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../domain/event.dart';

class StatusChip extends StatelessWidget {
  final EventStatus status;

  /// Kept for API compatibility but no longer used — countdown is on the card.
  final Duration? closingIn;

  const StatusChip({
    super.key,
    required this.status,
    this.closingIn,
  });

  String get _label {
    switch (status) {
      case EventStatus.upcoming:
        return 'OPEN';
      case EventStatus.live:
        return 'LIVE';
      case EventStatus.finished:
        return 'CLOSED';
      case EventStatus.cancelled:
        return 'CANCELLED';
    }
  }

  Color get _color {
    switch (status) {
      case EventStatus.upcoming:
        return const Color(0xFFFBBF24);
      case EventStatus.live:
        return const Color(0xFF4ADE80);
      case EventStatus.finished:
        return const Color(0xFF94A3B8);
      case EventStatus.cancelled:
        return const Color(0xFFEF4444);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: _color.withValues(alpha: 0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (status == EventStatus.live) ...[
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(color: _color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 4),
          ],
          Text(
            _label,
            style: GoogleFonts.dmSans(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              color: _color,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}
