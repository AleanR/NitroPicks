// lib/modules/bets/presentation/widgets/bet_card.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../domain/bet.dart';

class BetCard extends StatelessWidget {
  final Bet bet;

  const BetCard({super.key, required this.bet});

  // ── Colours ────────────────────────────────────────────────────────────────
  static const _green  = Color(0xFF22C55E);
  static const _red    = Color(0xFFEF4444);
  static const _gold   = Color(0xFFFBBF24);
  static const _grey   = Color(0xFF6B7280);
  static const _bgDark = Color(0xFF111318);

  Color get _accentColor {
    if (bet.isWon) return _green;
    if (bet.isLost) return _red;
    return _gold; // active / pending
  }

  Color get _cardBg {
    if (bet.isWon) return const Color(0xFF0A1F12);
    if (bet.isLost) return const Color(0xFF1F0A0A);
    return _bgDark;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  String _formatPoints(double v) {
    final n = v.round().abs();
    if (n >= 1000) {
      final k = n / 1000;
      return k == k.truncate() ? '${k.truncate()}K' : '${k.toStringAsFixed(1)}K';
    }
    return n.toString();
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return '';
    final local = dt.toLocal();
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[local.month]} ${local.day}';
  }

  String get _badgeLabel {
    if (bet.isWon) return 'Won';
    if (bet.isLost) return 'Lost';
    return 'Pending';
  }

  @override
  Widget build(BuildContext context) {
    final leg = bet.primaryLeg;
    final game = leg?.game;
    final accent = _accentColor;

    // Header meta: "Basketball · UCF Athletics"
    final sport = game?.sport ?? '';
    final sportLabel = sport.isNotEmpty ? '$sport · UCF Athletics' : 'UCF Athletics';

    // Team they picked vs opponent
    final pickedTeam  = leg?.pickedTeamName ?? '—';
    final opponent    = leg?.opposingTeamName ?? '—';

    // Game date label
    final gameDate = game != null ? _gameDate(game.bettingClosesAt) : '';
    final vsLine = 'vs $opponent${gameDate.isNotEmpty ? ' · $gameDate' : ''}';

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
            // ── Top row: meta + badge ─────────────────────────────────────
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    sportLabel,
                    style: GoogleFonts.dmSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: _grey,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                _Badge(label: _badgeLabel, color: accent),
              ],
            ),
            const SizedBox(height: 8),

            // ── Won payout banner ─────────────────────────────────────────
            if (bet.isWon) ...[
              Text(
                'Total payout: ${_formatPoints(bet.expectedPayout)} credits',
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: _green,
                ),
              ),
              const SizedBox(height: 6),
            ],

            // ── Picked team name ──────────────────────────────────────────
            Text(
              pickedTeam,
              style: GoogleFonts.dmSans(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.4,
              ),
            ),

            // ── vs line ───────────────────────────────────────────────────
            Text(
              vsLine,
              style: GoogleFonts.dmSans(
                fontSize: 12,
                color: _grey,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 12),

            // ── Stats row ─────────────────────────────────────────────────
            Row(
              children: [
                _StatBox(label: 'STAKE', value: _formatPoints(bet.stake), color: _gold),
                const SizedBox(width: 8),
                _StatBox(label: 'LOCKED ODDS', value: leg != null ? leg.odds.toStringAsFixed(2) : '—', color: Colors.white),
                const SizedBox(width: 8),
                if (bet.isActive)
                  _StatBox(
                    label: 'POTENTIAL WIN',
                    value: '${_formatPoints(bet.expectedPayout)} KP',
                    color: _gold,
                  )
                else
                  _StatBox(
                    label: 'RESULT',
                    value: bet.isWon
                        ? '+${_formatPoints(bet.profit)}'
                        : '-${_formatPoints(bet.stake)}',
                    color: bet.isWon ? _green : _red,
                  ),
              ],
            ),
            const SizedBox(height: 10),

            // ── Footer: date + settled label ──────────────────────────────
            Row(
              children: [
                if (bet.isActive)
                  Text(
                    'Placed ${_formatDate(bet.createdAt)}',
                    style: GoogleFonts.dmSans(fontSize: 11, color: _grey),
                  )
                else ...[
                  Text(
                    'Settled ${_formatDate(bet.updatedAt ?? bet.createdAt)}',
                    style: GoogleFonts.dmSans(fontSize: 11, color: _grey),
                  ),
                  const Spacer(),
                  Text(
                    bet.isWon ? 'Credited to balance' : 'Forfeited',
                    style: GoogleFonts.dmSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: bet.isWon ? _green : _red,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _gameDate(DateTime bettingClosesAt) {
    final d = bettingClosesAt.toLocal();
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final h = d.hour % 12 == 0 ? 12 : d.hour % 12;
    final mi = d.minute.toString().padLeft(2, '0');
    final ampm = d.hour < 12 ? 'AM' : 'PM';
    return '${months[d.month]} ${d.day}, $h:$mi $ampm';
  }
}

// ── Subwidgets ──────────────────────────────────────────────────────────────

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1.5),
      ),
      child: Text(
        label,
        style: GoogleFonts.dmSans(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _StatBox({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF1C1F26),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF2A2D35), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.dmSans(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF6B7280),
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              value,
              style: GoogleFonts.dmSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: color,
                letterSpacing: -0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
