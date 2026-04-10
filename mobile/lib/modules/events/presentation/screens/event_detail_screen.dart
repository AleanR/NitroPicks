// lib/modules/events/presentation/screens/event_detail_screen.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../domain/event.dart';

/// A read-only detail view for a finished/cancelled event.
/// For live/upcoming events, betting happens directly from EventsScreen
/// via the BettingSlipSheet bottom sheet.
class EventDetailScreen extends StatelessWidget {
  const EventDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final event = ModalRoute.of(context)?.settings.arguments as EventModel?;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: AppColors.textPrimary, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          event != null
              ? '${event.homeTeam} vs ${event.awayTeam}'
              : 'Event Detail',
          style: GoogleFonts.dmSans(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ),
      body: event == null
          ? const Center(
              child: Text('Event not found',
                  style: TextStyle(color: AppColors.textMuted)),
            )
          : _EventDetailBody(event: event),
    );
  }
}

class _EventDetailBody extends StatelessWidget {
  final EventModel event;
  const _EventDetailBody({required this.event});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionLabel('MATCHUP'),
          const SizedBox(height: 8),
          _MatchupCard(event: event),
          const SizedBox(height: 20),
          _SectionLabel('ODDS'),
          const SizedBox(height: 8),
          _OddsDetailCard(event: event),
          const SizedBox(height: 20),
          _SectionLabel('POOL'),
          const SizedBox(height: 8),
          _PoolDetailCard(event: event),
          if (event.winner.isNotEmpty) ...[
            const SizedBox(height: 20),
            _SectionLabel('RESULT'),
            const SizedBox(height: 8),
            _ResultCard(event: event),
          ],
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: GoogleFonts.dmSans(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: AppColors.textMuted,
        letterSpacing: 1.2,
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF3A3939),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}

class _MatchupCard extends StatelessWidget {
  final EventModel event;
  const _MatchupCard({required this.event});

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Row(
        children: [
          Expanded(
            child: Text(
              event.homeTeam,
              style: GoogleFonts.dmSans(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          Text('vs',
              style: GoogleFonts.dmSans(
                  fontSize: 12, color: AppColors.textMuted)),
          Expanded(
            child: Text(
              event.awayTeam,
              textAlign: TextAlign.right,
              style: GoogleFonts.dmSans(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OddsDetailCard extends StatelessWidget {
  final EventModel event;
  const _OddsDetailCard({required this.event});

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Row(
        children: [
          Expanded(
            child: _OddsItem(
              label: event.homeWin.label.isNotEmpty
                  ? event.homeWin.label
                  : '${event.homeTeam.split(' ').last} Win',
              odds: event.homeWin.displayOdds,
            ),
          ),
          Container(width: 1, height: 40, color: AppColors.border),
          Expanded(
            child: _OddsItem(
              label: event.awayWin.label.isNotEmpty
                  ? event.awayWin.label
                  : '${event.awayTeam.split(' ').last} Win',
              odds: event.awayWin.displayOdds,
              alignRight: true,
            ),
          ),
        ],
      ),
    );
  }
}

class _OddsItem extends StatelessWidget {
  final String label;
  final String odds;
  final bool alignRight;
  const _OddsItem(
      {required this.label, required this.odds, this.alignRight = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
          left: alignRight ? 16 : 0, right: alignRight ? 0 : 16),
      child: Column(
        crossAxisAlignment:
            alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Text(label,
              style: GoogleFonts.dmSans(
                  fontSize: 11, color: AppColors.textMuted)),
          const SizedBox(height: 4),
          Text(
            odds,
            style: GoogleFonts.dmMono(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.gold,
            ),
          ),
        ],
      ),
    );
  }
}

class _PoolDetailCard extends StatelessWidget {
  final EventModel event;
  const _PoolDetailCard({required this.event});

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        children: [
          _PoolRow('Total Pool', '${event.betPool.toStringAsFixed(0)} KP'),
          const SizedBox(height: 8),
          _PoolRow('Total Bettors', '${event.totalBettors}'),
          const SizedBox(height: 8),
          _PoolRow('Home Bettors', '${event.numBettorsHome}'),
          const SizedBox(height: 8),
          _PoolRow('Away Bettors', '${event.numBettorsAway}'),
        ],
      ),
    );
  }
}

class _PoolRow extends StatelessWidget {
  final String label;
  final String value;
  const _PoolRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: GoogleFonts.dmSans(
                fontSize: 13, color: AppColors.textSecondary)),
        Text(value,
            style: GoogleFonts.dmMono(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            )),
      ],
    );
  }
}

class _ResultCard extends StatelessWidget {
  final EventModel event;
  const _ResultCard({required this.event});

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Row(
        children: [
          const Icon(Icons.emoji_events_rounded,
              color: AppColors.gold, size: 20),
          const SizedBox(width: 10),
          Text(
            'Winner: ${event.winner}',
            style: GoogleFonts.dmSans(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
