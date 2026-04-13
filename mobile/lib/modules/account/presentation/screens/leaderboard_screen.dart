// lib/modules/account/presentation/screens/leaderboard_screen.dart

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;

import '../../../../core/constants/api_constants.dart';
import '../../../../shared/theme/app_theme.dart';

class LeaderboardScreen extends StatefulWidget {
  final String authToken;
  final String currentUserId;

  const LeaderboardScreen({
    super.key,
    required this.authToken,
    required this.currentUserId,
  });

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  List<_LeaderEntry> _entries = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/users/leaderboard'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.authToken}',
        },
      );
      if (res.statusCode == 200) {
        final list = jsonDecode(res.body) as List<dynamic>;
        setState(() {
          _entries = list.map((j) => _LeaderEntry.fromJson(j as Map<String, dynamic>)).toList();
          _loading = false;
        });
      } else {
        setState(() { _error = 'Failed to load leaderboard'; _loading = false; });
      }
    } catch (e) {
      setState(() { _error = 'Could not connect'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Leaderboard',
          style: GoogleFonts.dmSans(
            fontSize: 20, fontWeight: FontWeight.w900,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFBBF24)))
          : _error != null
              ? _ErrorView(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  color: const Color(0xFFFBBF24),
                  backgroundColor: AppColors.surfaceElevated,
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                    children: [
                      if (_entries.length >= 3) ...[
                        _Podium(entries: _entries.take(3).toList(), currentUserId: widget.currentUserId),
                        const SizedBox(height: 24),
                      ],
                      if (_entries.length > 3) ...[
                        Text('RANKINGS',
                            style: GoogleFonts.dmSans(
                              fontSize: 11, fontWeight: FontWeight.w800,
                              color: AppColors.textMuted, letterSpacing: 1,
                            )),
                        const SizedBox(height: 10),
                        ..._entries.skip(3).map((e) => _RankRow(
                              entry: e,
                              isCurrentUser: e.id == widget.currentUserId,
                            )),
                      ],
                    ],
                  ),
                ),
    );
  }
}

// ── Podium (top 3) ────────────────────────────────────────────────────────────

class _Podium extends StatelessWidget {
  final List<_LeaderEntry> entries;
  final String currentUserId;

  const _Podium({required this.entries, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    final first  = entries[0];
    final second = entries[1];
    final third  = entries[2];

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // 2nd place
        Expanded(child: _PodiumSlot(entry: second, rank: 2, height: 100, isCurrentUser: second.id == currentUserId)),
        const SizedBox(width: 8),
        // 1st place
        Expanded(child: _PodiumSlot(entry: first,  rank: 1, height: 130, isCurrentUser: first.id == currentUserId)),
        const SizedBox(width: 8),
        // 3rd place
        Expanded(child: _PodiumSlot(entry: third,  rank: 3, height: 80,  isCurrentUser: third.id == currentUserId)),
      ],
    );
  }
}

class _PodiumSlot extends StatelessWidget {
  final _LeaderEntry entry;
  final int rank;
  final double height;
  final bool isCurrentUser;

  const _PodiumSlot({
    required this.entry,
    required this.rank,
    required this.height,
    required this.isCurrentUser,
  });

  Color get _medalColor => rank == 1
      ? const Color(0xFFFBBF24)
      : rank == 2
          ? const Color(0xFF9CA3AF)
          : const Color(0xFFB45309);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Avatar
        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            color: isCurrentUser
                ? const Color(0xFFFBBF24).withValues(alpha: 0.15)
                : AppColors.surfaceElevated,
            shape: BoxShape.circle,
            border: Border.all(
              color: isCurrentUser ? const Color(0xFFFBBF24) : _medalColor,
              width: isCurrentUser ? 2.5 : 1.5,
            ),
          ),
          child: Center(
            child: Text(
              entry.initials,
              style: GoogleFonts.dmSans(
                fontSize: 16, fontWeight: FontWeight.w900,
                color: isCurrentUser ? const Color(0xFFFBBF24) : AppColors.textPrimary,
              ),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          entry.name.split(' ').first,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.dmSans(
            fontSize: 12, fontWeight: FontWeight.w700,
            color: isCurrentUser ? const Color(0xFFFBBF24) : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          entry.points,
          style: GoogleFonts.dmSans(
            fontSize: 11, fontWeight: FontWeight.w700,
            color: _medalColor,
          ),
        ),
        const SizedBox(height: 6),
        // Podium block
        Container(
          height: height,
          decoration: BoxDecoration(
            color: _medalColor.withValues(alpha: 0.12),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
            border: Border(
              top: BorderSide(color: _medalColor.withValues(alpha: 0.5), width: 1.5),
              left: BorderSide(color: _medalColor.withValues(alpha: 0.2)),
              right: BorderSide(color: _medalColor.withValues(alpha: 0.2)),
            ),
          ),
          child: Center(
            child: Text(
              '#$rank',
              style: GoogleFonts.dmSans(
                fontSize: 22, fontWeight: FontWeight.w900,
                color: _medalColor,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Rank row (4th+) ───────────────────────────────────────────────────────────

class _RankRow extends StatelessWidget {
  final _LeaderEntry entry;
  final bool isCurrentUser;

  const _RankRow({required this.entry, required this.isCurrentUser});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isCurrentUser
            ? const Color(0xFFFBBF24).withValues(alpha: 0.08)
            : AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrentUser
              ? const Color(0xFFFBBF24).withValues(alpha: 0.4)
              : AppColors.border,
        ),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 28,
            child: Text(
              '#${entry.rank}',
              style: GoogleFonts.dmSans(
                fontSize: 13, fontWeight: FontWeight.w800,
                color: AppColors.textMuted,
              ),
            ),
          ),
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: isCurrentUser
                  ? const Color(0xFFFBBF24).withValues(alpha: 0.15)
                  : AppColors.surfaceCard,
              shape: BoxShape.circle,
              border: Border.all(
                color: isCurrentUser
                    ? const Color(0xFFFBBF24).withValues(alpha: 0.6)
                    : AppColors.border,
              ),
            ),
            child: Center(
              child: Text(
                entry.initials,
                style: GoogleFonts.dmSans(
                  fontSize: 13, fontWeight: FontWeight.w900,
                  color: isCurrentUser ? const Color(0xFFFBBF24) : AppColors.textPrimary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              entry.name + (isCurrentUser ? ' (you)' : ''),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.dmSans(
                fontSize: 14, fontWeight: FontWeight.w700,
                color: isCurrentUser ? const Color(0xFFFBBF24) : AppColors.textPrimary,
              ),
            ),
          ),
          Row(
            children: [
              const Icon(Icons.bolt_rounded, color: Color(0xFFFBBF24), size: 14),
              const SizedBox(width: 3),
              Text(
                entry.points,
                style: GoogleFonts.dmSans(
                  fontSize: 14, fontWeight: FontWeight.w800,
                  color: const Color(0xFFFBBF24),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Error view ────────────────────────────────────────────────────────────────

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.wifi_off_rounded, color: AppColors.textMuted, size: 48),
          const SizedBox(height: 12),
          Text(message,
              style: GoogleFonts.dmSans(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: onRetry,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Text('Try Again',
                  style: GoogleFonts.dmSans(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Data model ────────────────────────────────────────────────────────────────

class _LeaderEntry {
  final String id;
  final String name;
  final String initials;
  final int rank;
  final String points;

  const _LeaderEntry({
    required this.id,
    required this.name,
    required this.initials,
    required this.rank,
    required this.points,
  });

  factory _LeaderEntry.fromJson(Map<String, dynamic> json) {
    return _LeaderEntry(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? 'Knight').toString(),
      initials: (json['initials'] ?? 'K').toString().toUpperCase(),
      rank: (json['rank'] as num?)?.toInt() ?? 0,
      points: (json['points'] ?? '0').toString(),
    );
  }
}
