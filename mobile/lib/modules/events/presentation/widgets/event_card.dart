// lib/modules/events/presentation/widgets/event_card.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../domain/event.dart';
import 'status_chip.dart';
import 'odds_chip.dart';

class EventCard extends StatefulWidget {
  final EventModel event;
  final VoidCallback onTap;

  const EventCard({super.key, required this.event, required this.onTap});

  @override
  State<EventCard> createState() => _EventCardState();
}

class _EventCardState extends State<EventCard>
    with SingleTickerProviderStateMixin {
  // -1 = none, 0 = home, 1 = away
  int _selectedSide = -1;
  late AnimationController _flashCtrl;
  late Animation<double> _flashAnim;

  bool get _isTerminal =>
      widget.event.status == EventStatus.closed ||
      widget.event.status == EventStatus.won ||
      widget.event.status == EventStatus.lost;

  @override
  void initState() {
    super.initState();
    _flashCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _flashAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _flashCtrl, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _flashCtrl.dispose();
    super.dispose();
  }

  void _selectSide(int side) {
    if (_isTerminal) return;
    HapticFeedback.selectionClick();
    setState(() {
      _selectedSide = _selectedSide == side ? -1 : side;
    });
    _flashCtrl.forward(from: 0);
  }

  Color _cardLeftBorderColor() {
    switch (widget.event.status) {
      case EventStatus.open:
        return AppColors.open;
      case EventStatus.soon:
        return AppColors.soon;
      case EventStatus.closing:
        return AppColors.closing;
      case EventStatus.closed:
        return AppColors.closed;
      case EventStatus.won:
        return AppColors.open;
      case EventStatus.lost:
        return AppColors.closing;
    }
  }

  @override
  Widget build(BuildContext context) {
    final event = widget.event;
    final borderColor = _cardLeftBorderColor();

    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _flashAnim,
        builder: (context, child) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.surfaceCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.border,
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: borderColor.withValues(alpha: 0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
                const BoxShadow(
                  color: Color(0x14000000),
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Left accent bar
                    Container(
                      width: 3,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            borderColor,
                            borderColor.withValues(alpha: 0.3),
                          ],
                        ),
                      ),
                    ),
                    // Card content
                    Expanded(child: _CardContent(event: event, selectedSide: _selectedSide, onSelectSide: _selectSide, isTerminal: _isTerminal)),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _CardContent extends StatelessWidget {
  final EventModel event;
  final int selectedSide;
  final void Function(int) onSelectSide;
  final bool isTerminal;

  const _CardContent({
    required this.event,
    required this.selectedSide,
    required this.onSelectSide,
    required this.isTerminal,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _TopRow(event: event),
          const SizedBox(height: 12),
          _TeamsVsRow(event: event),
          const SizedBox(height: 12),
          _OddsRow(
            event: event,
            selectedSide: selectedSide,
            onSelectSide: onSelectSide,
            isTerminal: isTerminal,
          ),
        ],
      ),
    );
  }
}

class _TopRow extends StatelessWidget {
  final EventModel event;
  const _TopRow({required this.event});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(5),
          ),
          child: Text(
            event.league,
            style: GoogleFonts.dmSans(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
              letterSpacing: 0.6,
            ),
          ),
        ),
        const SizedBox(width: 8),
        if (event.gameTime != null)
          Text(
            event.gameTime!,
            style: GoogleFonts.dmSans(
              fontSize: 11,
              color: AppColors.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
        const Spacer(),
        StatusChip(
          status: event.status,
          closingIn: event.closingIn,
        ),
      ],
    );
  }
}

class _TeamsVsRow extends StatelessWidget {
  final EventModel event;
  const _TeamsVsRow({required this.event});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            event.home.name,
            style: GoogleFonts.dmSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              letterSpacing: -0.2,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Text(
            'vs',
            style: GoogleFonts.dmSans(
              fontSize: 11,
              fontWeight: FontWeight.w400,
              color: AppColors.textMuted,
            ),
          ),
        ),
        Expanded(
          child: Text(
            event.away.name,
            textAlign: TextAlign.right,
            style: GoogleFonts.dmSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              letterSpacing: -0.2,
            ),
          ),
        ),
      ],
    );
  }
}

class _OddsRow extends StatelessWidget {
  final EventModel event;
  final int selectedSide;
  final void Function(int) onSelectSide;
  final bool isTerminal;

  const _OddsRow({
    required this.event,
    required this.selectedSide,
    required this.onSelectSide,
    required this.isTerminal,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OddsButton(
            teamName: event.home.shortName,
            odds: event.home.odds,
            isSelected: selectedSide == 0,
            isDisabled: isTerminal,
            onTap: () => onSelectSide(0),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: OddsButton(
            teamName: event.away.shortName,
            odds: event.away.odds,
            isSelected: selectedSide == 1,
            isDisabled: isTerminal,
            onTap: () => onSelectSide(1),
          ),
        ),
      ],
    );
  }
}
