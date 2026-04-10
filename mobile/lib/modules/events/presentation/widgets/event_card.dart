// lib/modules/events/presentation/widgets/event_card.dart

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../domain/event.dart';

class EventCard extends StatefulWidget {
  final EventModel event;
  final void Function(String team, double odds) onSideSelected;

  const EventCard({
    super.key,
    required this.event,
    required this.onSideSelected,
  });

  @override
  State<EventCard> createState() => _EventCardState();
}

class _EventCardState extends State<EventCard>
    with SingleTickerProviderStateMixin {
  int _selectedSide = -1; // -1 = none, 0 = home, 1 = away
  late AnimationController _pressCtrl;
  Timer? _countdownTimer;
  Duration? _remaining;

  bool get _isTerminal =>
      widget.event.computedStatus == EventStatus.finished ||
      widget.event.computedStatus == EventStatus.cancelled;

  bool get _isBettable =>
      widget.event.computedStatus == EventStatus.upcoming ||
      widget.event.computedStatus == EventStatus.live;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _remaining = widget.event.timeUntilClose;
    if (_remaining != null) _startCountdown();
  }

  void _startCountdown() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      final r = widget.event.timeUntilClose;
      if (!mounted) return;
      setState(() => _remaining = r);
      if (r == null) _countdownTimer?.cancel();
    });
  }

  @override
  void dispose() {
    _pressCtrl.dispose();
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _selectSide(int side) {
    if (_isTerminal || !_isBettable) return;
    HapticFeedback.selectionClick();
    setState(() {
      _selectedSide = _selectedSide == side ? -1 : side;
    });
    if (_selectedSide != -1) {
      final team = side == 0 ? 'home' : 'away';
      final odds = side == 0
          ? widget.event.homeWin.odds
          : widget.event.awayWin.odds;
      widget.onSideSelected(team, odds);
    }
  }

  Color get _accentColor {
    switch (widget.event.computedStatus) {
      case EventStatus.live:
        return const Color(0xFF4ADE80);
      case EventStatus.upcoming:
        return const Color(0xFFFBBF24);
      case EventStatus.finished:
        return const Color(0xFF94A3B8);
      case EventStatus.cancelled:
        return const Color(0xFFEF4444);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF3A3939),
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: _accentColor.withValues(alpha: 0.10),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
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
                      _accentColor,
                      _accentColor.withValues(alpha: 0.2)
                    ],
                  ),
                ),
              ),
              Expanded(
                child: _CardBody(
                  event: widget.event,
                  selectedSide: _selectedSide,
                  onSelectSide: _selectSide,
                  isTerminal: _isTerminal,
                  isBettable: _isBettable,
                  accentColor: _accentColor,
                  remaining: _remaining,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Card body ─────────────────────────────────────────────────────────────────

class _CardBody extends StatelessWidget {
  final EventModel event;
  final int selectedSide;
  final void Function(int) onSelectSide;
  final bool isTerminal;
  final bool isBettable;
  final Color accentColor;
  final Duration? remaining;

  const _CardBody({
    required this.event,
    required this.selectedSide,
    required this.onSelectSide,
    required this.isTerminal,
    required this.isBettable,
    required this.accentColor,
    required this.remaining,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _TopRow(event: event, accentColor: accentColor, remaining: remaining),
          const SizedBox(height: 10),
          _TeamsRow(event: event),
          const SizedBox(height: 4),
          _PoolRow(event: event),
          const SizedBox(height: 12),
          _OddsRow(
            event: event,
            selectedSide: selectedSide,
            onSelectSide: onSelectSide,
            isDisabled: isTerminal || !isBettable,
          ),
        ],
      ),
    );
  }
}

// ── Top row ───────────────────────────────────────────────────────────────────

class _TopRow extends StatelessWidget {
  final EventModel event;
  final Color accentColor;
  final Duration? remaining;

  const _TopRow({
    required this.event,
    required this.accentColor,
    required this.remaining,
  });

  String get _dateLabel {
    final d = event.bettingOpensAt;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDay = DateTime(d.year, d.month, d.day);
    if (eventDay == today) {
      final h = d.hour % 12 == 0 ? 12 : d.hour % 12;
      final m = d.minute.toString().padLeft(2, '0');
      final ampm = d.hour < 12 ? 'AM' : 'PM';
      return 'Today · $h:$m $ampm';
    }
    final diff = eventDay.difference(today).inDays;
    if (diff == 1) return 'Tomorrow';
    return '${_monthName(d.month)} ${d.day}';
  }

  String _monthName(int m) {
    const names = [
      '',
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return names[m];
  }

  String get _countdownLabel {
    final r = remaining;
    if (r == null) return '';
    final h = r.inHours;
    final m = r.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = r.inSeconds.remainder(60).toString().padLeft(2, '0');
    if (h > 0) return 'Closes in ${h}h ${m}m';
    return 'Closes in $m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(5),
          ),
          child: Text(
            _dateLabel,
            style: GoogleFonts.dmSans(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF94A3B8),
            ),
          ),
        ),
        const SizedBox(width: 8),
        if (remaining != null && event.computedStatus == EventStatus.live)
          Text(
            _countdownLabel,
            style: GoogleFonts.dmMono(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFFBBF24),
            ),
          ),
        const Spacer(),
        _StatusBadge(status: event.computedStatus, accentColor: accentColor),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final EventStatus status;
  final Color accentColor;

  const _StatusBadge({required this.status, required this.accentColor});

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

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: accentColor.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: accentColor.withValues(alpha: 0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (status == EventStatus.live) ...[
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                color: accentColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
          ],
          Text(
            _label,
            style: GoogleFonts.dmSans(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              color: accentColor,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Teams row ─────────────────────────────────────────────────────────────────

class _TeamsRow extends StatelessWidget {
  final EventModel event;
  const _TeamsRow({required this.event});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            event.homeTeam,
            style: GoogleFonts.dmSans(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.3,
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
              color: const Color(0xFF64748B),
            ),
          ),
        ),
        Expanded(
          child: Text(
            event.awayTeam,
            textAlign: TextAlign.right,
            style: GoogleFonts.dmSans(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.3,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Pool / bettors row ────────────────────────────────────────────────────────

class _PoolRow extends StatelessWidget {
  final EventModel event;
  const _PoolRow({required this.event});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatPill(
          icon: Icons.people_outline_rounded,
          label: '${event.totalBettors} bets',
        ),
        const SizedBox(width: 8),
        _StatPill(
          icon: Icons.toll_rounded,
          label: '${event.betPool.toStringAsFixed(0)} KP pool',
        ),
      ],
    );
  }
}

class _StatPill extends StatelessWidget {
  final IconData icon;
  final String label;
  const _StatPill({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 11, color: const Color(0xFF64748B)),
        const SizedBox(width: 3),
        Text(
          label,
          style: GoogleFonts.dmSans(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }
}

// ── Odds buttons ──────────────────────────────────────────────────────────────

class _OddsRow extends StatelessWidget {
  final EventModel event;
  final int selectedSide;
  final void Function(int) onSelectSide;
  final bool isDisabled;

  const _OddsRow({
    required this.event,
    required this.selectedSide,
    required this.onSelectSide,
    required this.isDisabled,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _OddsButton(
            teamName: event.homeTeam.split(' ').last,
            oddsLabel: event.homeWin.displayOdds,
            bettors: event.numBettorsHome,
            isSelected: selectedSide == 0,
            isDisabled: isDisabled,
            onTap: () => onSelectSide(0),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _OddsButton(
            teamName: event.awayTeam.split(' ').last,
            oddsLabel: event.awayWin.displayOdds,
            bettors: event.numBettorsAway,
            isSelected: selectedSide == 1,
            isDisabled: isDisabled,
            onTap: () => onSelectSide(1),
          ),
        ),
      ],
    );
  }
}

class _OddsButton extends StatelessWidget {
  final String teamName;
  final String oddsLabel;
  final int bettors;
  final bool isSelected;
  final bool isDisabled;
  final VoidCallback onTap;

  const _OddsButton({
    required this.teamName,
    required this.oddsLabel,
    required this.bettors,
    required this.isSelected,
    required this.isDisabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const selectedColor = Color(0xFFFBBF24);
    final bg = isSelected
        ? selectedColor.withValues(alpha: 0.15)
        : Colors.white.withValues(alpha: 0.05);
    final border = isSelected
        ? selectedColor.withValues(alpha: 0.6)
        : Colors.white.withValues(alpha: 0.08);

    return GestureDetector(
      onTap: isDisabled ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: border, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              teamName,
              style: GoogleFonts.dmSans(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: isDisabled
                    ? const Color(0xFF475569)
                    : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              oddsLabel,
              style: GoogleFonts.dmMono(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: isDisabled
                    ? const Color(0xFF475569)
                    : isSelected
                        ? selectedColor
                        : Colors.white,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '$bettors bettors',
              style: GoogleFonts.dmSans(
                fontSize: 9,
                color: const Color(0xFF475569),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
