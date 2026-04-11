// lib/modules/events/presentation/widgets/event_card.dart

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../domain/event.dart';

class EventCard extends StatefulWidget {
  final EventModel event;
  final void Function(String team, double odds) onSideSelected;

  /// 'home' or 'away' if the user already placed a bet on this event.
  final String? userPickedTeam;

  /// true = won, false = lost, null = no bet placed yet.
  final bool? userWon;

  const EventCard({
    super.key,
    required this.event,
    required this.onSideSelected,
    this.userPickedTeam,
    this.userWon,
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
      widget.event.computedStatus == EventStatus.live;

  /// True when the betting window has < 10 minutes remaining.
  bool get _isClosing {
    if (widget.event.computedStatus != EventStatus.live) return false;
    final r = _remaining;
    return r != null && r.inSeconds <= 600;
  }

  bool get _hasResult =>
      _isTerminal && widget.userPickedTeam != null && widget.userWon != null;

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
      final odds =
          side == 0 ? widget.event.homeWin.odds : widget.event.awayWin.odds;
      widget.onSideSelected(team, odds);
    }
  }

  Color get _borderColor {
    if (_hasResult) {
      return widget.userWon! ? const Color(0xFF22C55E) : const Color(0xFFEF4444);
    }
    switch (widget.event.computedStatus) {
      case EventStatus.upcoming:
        return const Color(0xFF6B7280); // grey — not open yet
      case EventStatus.live:
        return _isClosing
            ? const Color(0xFFF59E0B) // amber — closing soon
            : const Color(0xFF22C55E); // green — open
      case EventStatus.finished:
        return const Color(0xFF4B5563); // grey — closed
      case EventStatus.cancelled:
        return const Color(0xFFEF4444);
    }
  }

  Color get _cardBg {
    if (_hasResult && widget.userWon == true) return const Color(0xFF0A1F12);
    if (_hasResult && widget.userWon == false) return const Color(0xFF1F0A0A);
    return const Color(0xFF111318);
  }

  String get _statusLabel {
    if (_hasResult) return widget.userWon! ? 'Won' : 'Lost';
    switch (widget.event.computedStatus) {
      case EventStatus.upcoming:
        return 'Upcoming';
      case EventStatus.live:
        if (_isClosing) {
          final r = _remaining!;
          // Ceiling division: e.g. 9m 30s → "Closing in 10 min"
          final minLeft = (r.inSeconds + 59) ~/ 60;
          return 'Closing in $minLeft min';
        }
        return 'Open';
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
    const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const wdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    final h = d.hour % 12 == 0 ? 12 : d.hour % 12;
    final mi = d.minute.toString().padLeft(2, '0');
    final ampm = d.hour < 12 ? 'AM' : 'PM';
    if (eventDay == today) return 'Today · $h:$mi $ampm';
    return '${wdays[d.weekday - 1]} ${months[d.month]} ${d.day}, $h:$mi $ampm';
  }

  String get _countdownLabel {
    final r = _remaining;
    if (r == null) return '';
    final h = r.inHours;
    final m = r.inMinutes.remainder(60);
    if (h > 0) return 'Closes in ${h}h ${m}m';
    return 'Closes in ${m}m ${r.inSeconds.remainder(60)}s';
  }

  String get _sportLabel {
    final s = '${widget.event.homeTeam} ${widget.event.awayTeam}'.toLowerCase();
    if (s.contains('softball')) return 'Softball';
    if (s.contains('baseball')) return 'Baseball';
    if (s.contains('tennis')) return 'Tennis';
    if (s.contains('basketball')) return 'Basketball';
    return 'Sports';
  }

  @override
  Widget build(BuildContext context) {
    final accent = _borderColor;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: _cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border(left: BorderSide(color: accent, width: 3)),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row
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
                _StatusBadge(label: _statusLabel, color: accent),
              ],
            ),
            const SizedBox(height: 10),

            // Team names stacked
            Text(widget.event.homeTeam,
                style: GoogleFonts.dmSans(
                    fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.4)),
            Text('vs',
                style: GoogleFonts.dmSans(
                    fontSize: 13, color: const Color(0xFF6B7280), height: 1.4)),
            Text(widget.event.awayTeam,
                style: GoogleFonts.dmSans(
                    fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.4)),
            const SizedBox(height: 12),

            // Odds chips
            Row(
              children: [
                Expanded(
                  child: _OddsChip(
                    teamName: widget.event.homeTeam,
                    oddsLabel: widget.event.homeWin.displayOdds,
                    isSelected: _selectedSide == 0,
                    isDisabled: _isTerminal || !_isBettable,
                    isUserPick: widget.userPickedTeam == 'home',
                    userWon: _hasResult ? widget.userWon : null,
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
                    isUserPick: widget.userPickedTeam == 'away',
                    userWon: _hasResult ? widget.userWon : null,
                    onTap: () => _selectSide(1),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Footer
            Row(
              children: [
                if (_isClosing && _remaining != null)
                  Text(_countdownLabel,
                      style: GoogleFonts.dmSans(
                          fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFFF59E0B))),
                const Spacer(),
                Text('${widget.event.totalBettors} bets placed',
                    style: GoogleFonts.dmSans(fontSize: 11, color: const Color(0xFF6B7280))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1.5),
      ),
      child: Text(label,
          style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

class _OddsChip extends StatelessWidget {
  final String teamName;
  final String oddsLabel;
  final bool isSelected;
  final bool isDisabled;
  final bool isUserPick;
  final bool? userWon; // null = no result yet
  final VoidCallback onTap;

  const _OddsChip({
    required this.teamName,
    required this.oddsLabel,
    required this.isSelected,
    required this.isDisabled,
    required this.isUserPick,
    required this.userWon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const gold = Color(0xFFFBBF24);
    const green = Color(0xFF22C55E);
    const red = Color(0xFFEF4444);

    late Color borderColor;
    late Color textColor;
    late Color bg;
    String? subLabel;

    if (isUserPick && userWon == true) {
      borderColor = green; textColor = green;
      bg = green.withValues(alpha: 0.1); subLabel = 'Winner';
    } else if (isUserPick && userWon == false) {
      borderColor = red; textColor = red;
      bg = red.withValues(alpha: 0.08); subLabel = 'Your pick';
    } else if (isSelected) {
      borderColor = gold.withValues(alpha: 0.7); textColor = gold;
      bg = gold.withValues(alpha: 0.12);
    } else {
      borderColor = const Color(0xFF2A2D35); textColor = Colors.white;
      bg = const Color(0xFF1C1F26);
    }

    return GestureDetector(
      onTap: isDisabled ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(teamName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.w500, color: const Color(0xFF9CA3AF))),
            const SizedBox(height: 2),
            Text(oddsLabel,
                style: GoogleFonts.dmSans(
                    fontSize: 20, fontWeight: FontWeight.w800, color: textColor, letterSpacing: -0.5)),
            if (subLabel != null) ...[
              const SizedBox(height: 2),
              Text(subLabel,
                  style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.w600, color: textColor)),
            ],
          ],
        ),
      ),
    );
  }
}
