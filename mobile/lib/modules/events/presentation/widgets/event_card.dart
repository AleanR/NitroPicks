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

class _EventCardState extends State<EventCard> {
  int _selectedSide = -1;
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
    _remaining = widget.event.timeUntilClose;
    if (_remaining != null) _startCountdown();
  }

  void _startCountdown() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _remaining = widget.event.timeUntilClose);
      if (_remaining == null) _countdownTimer?.cancel();
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _selectSide(int side) {
    if (_isTerminal || !_isBettable) return;
    HapticFeedback.selectionClick();
    setState(() => _selectedSide = _selectedSide == side ? -1 : side);
    if (_selectedSide != -1) {
      final team = side == 0 ? 'home' : 'away';
      final odds = side == 0
          ? widget.event.homeWin.odds
          : widget.event.awayWin.odds;
      widget.onSideSelected(team, odds);
    }
  }

  // Status color
  Color get _statusColor {
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

  String get _statusLabel {
    switch (widget.event.computedStatus) {
      case EventStatus.upcoming:
        return 'Open';
      case EventStatus.live:
        return 'Live';
      case EventStatus.finished:
        return 'Closed';
      case EventStatus.cancelled:
        return 'Cancelled';
    }
  }

  String get _dateLabel {
    final d = widget.event.bettingOpensAt;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDay = DateTime(d.year, d.month, d.day);
    final months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    final days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    final weekday = days[d.weekday - 1];
    final h = d.hour % 12 == 0 ? 12 : d.hour % 12;
    final m = d.minute.toString().padLeft(2, '0');
    final ampm = d.hour < 12 ? 'AM' : 'PM';
    if (eventDay == today) return 'Today · $h:$m $ampm';
    return '$weekday ${months[d.month]} ${d.day}, $h:$m $ampm';
  }

  String get _countdownLabel {
    final r = _remaining;
    if (r == null) return '';
    final h = r.inHours;
    final m = r.inMinutes.remainder(60);
    final s = r.inSeconds.remainder(60).toString().padLeft(2, '0');
    if (h > 0) return 'Closes in ${h}h ${m}m';
    return 'Closes in $m:$s';
  }

  // Guess sport from team names / context — you can improve this
  String get _sportLabel {
    final home = widget.event.homeTeam.toLowerCase();
    final away = widget.event.awayTeam.toLowerCase();
    if (home.contains('baseball') || away.contains('baseball')) return 'Baseball';
    if (home.contains('softball') || away.contains('softball')) return 'Softball';
    if (home.contains('tennis') || away.contains('tennis')) return 'Tennis';
    if (home.contains('basketball') || away.contains('basketball')) return 'Basketball';
    return 'Sports';
  }

  @override
  Widget build(BuildContext context) {
    final isOpen = widget.event.computedStatus == EventStatus.upcoming;
    final isLive = widget.event.computedStatus == EventStatus.live;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF111318),
        borderRadius: BorderRadius.circular(14),
        border: Border(
          left: BorderSide(color: const Color(0xFFFBBF24), width: 3),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Top row: sport + date + status badge ──
            Row(
              children: [
                Text(
                  '$_sportLabel · $_dateLabel',
                  style: GoogleFonts.dmSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF6B7280),
                  ),
                ),
                const Spacer(),
                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _statusColor,
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isLive) ...[
                        Container(
                          width: 5,
                          height: 5,
                          decoration: BoxDecoration(
                            color: _statusColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 4),
                      ],
                      Text(
                        _statusLabel,
                        style: GoogleFonts.dmSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: _statusColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // ── Team names stacked ──
            Text(
              widget.event.homeTeam,
              style: GoogleFonts.dmSans(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.4,
              ),
            ),
            Text(
              'vs',
              style: GoogleFonts.dmSans(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: const Color(0xFF6B7280),
                height: 1.4,
              ),
            ),
            Text(
              widget.event.awayTeam,
              style: GoogleFonts.dmSans(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.4,
              ),
            ),

            const SizedBox(height: 12),

            // ── Odds chips ──
            Row(
              children: [
                Expanded(
                  child: _OddsChip(
                    teamName: widget.event.homeTeam,
                    oddsLabel: widget.event.homeWin.displayOdds,
                    isSelected: _selectedSide == 0,
                    isDisabled: _isTerminal || !_isBettable,
                    onTap: () => _selectSide(0),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _OddsChip(
                    teamName: widget.event.awayTeam,
                    oddsLabel: widget.event.awayWin.displayOdds,
                    isSelected: _selectedSide == 1,
                    isDisabled: _isTerminal || !_isBettable,
                    onTap: () => _selectSide(1),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // ── Footer: countdown + bets placed ──
            Row(
              children: [
                if (_remaining != null)
                  Text(
                    _countdownLabel,
                    style: GoogleFonts.dmSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF6B7280),
                    ),
                  ),
                const Spacer(),
                Text(
                  '${widget.event.totalBettors} bets placed',
                  style: GoogleFonts.dmSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _OddsChip extends StatelessWidget {
  final String teamName;
  final String oddsLabel;
  final bool isSelected;
  final bool isDisabled;
  final VoidCallback onTap;

  const _OddsChip({
    required this.teamName,
    required this.oddsLabel,
    required this.isSelected,
    required this.isDisabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const gold = Color(0xFFFBBF24);
    final bg = isSelected
        ? gold.withValues(alpha: 0.12)
        : const Color(0xFF1C1F26);
    final border = isSelected
        ? gold.withValues(alpha: 0.7)
        : const Color(0xFF2A2D35);

    return GestureDetector(
      onTap: isDisabled ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: border, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              teamName,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.dmSans(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF9CA3AF),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              oddsLabel,
              style: GoogleFonts.dmSans(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: isSelected ? gold : Colors.white,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
