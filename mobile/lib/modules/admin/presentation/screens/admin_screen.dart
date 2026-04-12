// lib/modules/admin/presentation/screens/admin_screen.dart

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../../../../shared/theme/app_theme.dart';

class AdminScreen extends StatefulWidget {
  final String authToken;
  final VoidCallback? onGameResolved;

  const AdminScreen({super.key, required this.authToken, this.onGameResolved});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  static const _base = 'http://localhost:8080/api';

  List<Map<String, dynamic>> _games = [];
  bool _loading = true;
  String? _error;

  // Per-game resolve state
  String? _resolvingId;
  String _selectedWinner = '';
  bool _resolving = false;
  String? _resolveError;
  String? _resolveSuccess;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${widget.authToken}',
      };

  @override
  void initState() {
    super.initState();
    _fetchGames();
  }

  Future<void> _fetchGames() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await http.get(Uri.parse('$_base/games'), headers: _headers);
      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        setState(() {
          final now = DateTime.now();
          _games = data
              .map((g) => Map<String, dynamic>.from(g as Map))
              .where((g) {
                // Game is resolvable if betting window has passed and no winner set yet
                final closesAt = g['bettingClosesAt'] != null
                    ? DateTime.tryParse(g['bettingClosesAt'].toString())
                    : null;
                final isClosed = closesAt != null && now.isAfter(closesAt);
                final hasNoWinner = g['winner'] == null || g['winner'] == '';
                final notCancelled = g['status'] != 'cancelled';
                return isClosed && hasNoWinner && notCancelled;
              })
              .toList();
          _loading = false;
        });
      } else {
        setState(() { _error = 'Failed to load games (${res.statusCode})'; _loading = false; });
      }
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _resolveGame(String gameId) async {
    if (_selectedWinner.isEmpty) return;
    setState(() { _resolving = true; _resolveError = null; _resolveSuccess = null; });
    try {
      final res = await http.put(
        Uri.parse('$_base/games/$gameId/end'),
        headers: _headers,
        body: jsonEncode({'winner': _selectedWinner}),
      );
      if (res.statusCode == 200) {
        setState(() {
          _resolveSuccess = 'Game resolved — all bets settled!';
          _resolvingId = null;
          _selectedWinner = '';
        });
        widget.onGameResolved?.call();
        await _fetchGames();
      } else {
        final body = jsonDecode(res.body) as Map?;
        setState(() { _resolveError = body?['message']?.toString() ?? 'Failed to resolve game'; });
      }
    } catch (e) {
      setState(() { _resolveError = e.toString(); });
    } finally {
      setState(() { _resolving = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 8),
            if (_resolveSuccess != null)
              _Banner(
                message: _resolveSuccess!,
                isError: false,
                onDismiss: () => setState(() => _resolveSuccess = null),
              ),
            if (_resolveError != null)
              _Banner(
                message: _resolveError!,
                isError: true,
                onDismiss: () => setState(() => _resolveError = null),
              ),
            Expanded(child: _buildBody()),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Admin',
                style: GoogleFonts.dmSans(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.8,
                ),
              ),
              Text(
                'Resolve game outcomes',
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  color: AppColors.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const Spacer(),
          IconButton(
            onPressed: _fetchGames,
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFFBBF24)),
      );
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded, color: AppColors.textMuted, size: 48),
            const SizedBox(height: 12),
            Text('Could not load games',
                style: GoogleFonts.dmSans(
                    fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
            const SizedBox(height: 6),
            Text(_error!,
                style: GoogleFonts.dmSans(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _fetchGames,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text('Try Again',
                    style: GoogleFonts.dmSans(
                        fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              ),
            ),
          ],
        ),
      );
    }
    if (_games.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.sports_score_rounded, color: AppColors.textMuted, size: 48),
            const SizedBox(height: 12),
            Text('No games to resolve',
                style: GoogleFonts.dmSans(
                    fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
            const SizedBox(height: 6),
            Text('Closed games will appear here once betting ends',
                style: GoogleFonts.dmSans(fontSize: 13, color: AppColors.textMuted)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      itemCount: _games.length,
      itemBuilder: (_, i) {
        final game = _games[i];
        final id = game['_id'] as String;
        return _GameCard(
          game: game,
          isResolving: _resolvingId == id,
          selectedWinner: _resolvingId == id ? _selectedWinner : '',
          resolving: _resolving,
          onSetResult: () => setState(() {
            _resolvingId = id;
            _selectedWinner = '';
            _resolveError = null;
            _resolveSuccess = null;
          }),
          onWinnerChanged: (w) => setState(() => _selectedWinner = w),
          onConfirm: () => _resolveGame(id),
          onCancel: () => setState(() { _resolvingId = null; _selectedWinner = ''; }),
        );
      },
    );
  }
}

// ── Game card ─────────────────────────────────────────────────────────────────

class _GameCard extends StatelessWidget {
  final Map<String, dynamic> game;
  final bool isResolving;
  final String selectedWinner;
  final bool resolving;
  final VoidCallback onSetResult;
  final ValueChanged<String> onWinnerChanged;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const _GameCard({
    required this.game,
    required this.isResolving,
    required this.selectedWinner,
    required this.resolving,
    required this.onSetResult,
    required this.onWinnerChanged,
    required this.onConfirm,
    required this.onCancel,
  });

  String _formatDate(DateTime dt) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    final h = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final m = dt.minute.toString().padLeft(2, '0');
    final ampm = dt.hour < 12 ? 'AM' : 'PM';
    return '${months[dt.month - 1]} ${dt.day}, $h:$m $ampm';
  }

  @override
  Widget build(BuildContext context) {
    final homeTeam = game['homeTeam']?.toString() ?? '?';
    final awayTeam = game['awayTeam']?.toString() ?? '?';
    final status   = game['status']?.toString() ?? '';
    final closesAt = game['bettingClosesAt'] != null
        ? DateTime.tryParse(game['bettingClosesAt'].toString())?.toLocal()
        : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    '$homeTeam  vs  $awayTeam',
                    style: GoogleFonts.dmSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                _StatusChip(status: status),
              ],
            ),
            if (closesAt != null) ...[
              const SizedBox(height: 4),
              Text(
                'Closes ${_formatDate(closesAt)}',
                style: GoogleFonts.dmSans(fontSize: 11, color: AppColors.textMuted),
              ),
            ],
            const SizedBox(height: 14),

            if (!isResolving)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onSetResult,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFFBBF24),
                    side: const BorderSide(color: Color(0xFFFBBF24)),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: Text('Set Result',
                      style: GoogleFonts.dmSans(
                          fontSize: 13, fontWeight: FontWeight.w700)),
                ),
              )
            else ...[
              Text('Who won?',
                  style: GoogleFonts.dmSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _WinnerButton(
                    label: homeTeam,
                    value: 'home',
                    selected: selectedWinner == 'home',
                    onTap: onWinnerChanged,
                  ),
                  const SizedBox(width: 8),
                  _WinnerButton(
                    label: awayTeam,
                    value: 'away',
                    selected: selectedWinner == 'away',
                    onTap: onWinnerChanged,
                  ),
                  const SizedBox(width: 8),
                  _WinnerButton(
                    label: 'Tie',
                    value: 'tie',
                    selected: selectedWinner == 'tie',
                    onTap: onWinnerChanged,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: FilledButton(
                      onPressed: selectedWinner.isEmpty || resolving ? null : onConfirm,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFFFBBF24),
                        foregroundColor: Colors.black,
                        disabledBackgroundColor:
                            const Color(0xFFFBBF24).withValues(alpha: 0.3),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: resolving
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.black),
                            )
                          : Text('Confirm',
                              style: GoogleFonts.dmSans(
                                  fontSize: 13, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: resolving ? null : onCancel,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.textSecondary,
                        side: BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text('Cancel',
                          style: GoogleFonts.dmSans(
                              fontSize: 13, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Winner toggle button ──────────────────────────────────────────────────────

class _WinnerButton extends StatelessWidget {
  final String label;
  final String value;
  final bool selected;
  final ValueChanged<String> onTap;

  const _WinnerButton({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: () => onTap(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected
                ? const Color(0xFFFBBF24).withValues(alpha: 0.15)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: selected ? const Color(0xFFFBBF24) : AppColors.border,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.dmSans(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: selected ? const Color(0xFFFBBF24) : AppColors.textMuted,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Status chip ───────────────────────────────────────────────────────────────

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final isLive = status == 'live';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isLive
            ? const Color(0xFFFBBF24).withValues(alpha: 0.12)
            : AppColors.border.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isLive
              ? const Color(0xFFFBBF24).withValues(alpha: 0.5)
              : AppColors.border,
        ),
      ),
      child: Text(
        status.toUpperCase(),
        style: GoogleFonts.dmSans(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: isLive ? const Color(0xFFFBBF24) : AppColors.textMuted,
        ),
      ),
    );
  }
}

// ── Dismissible banner ────────────────────────────────────────────────────────

class _Banner extends StatelessWidget {
  final String message;
  final bool isError;
  final VoidCallback onDismiss;

  const _Banner({
    required this.message,
    required this.isError,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final color = isError ? const Color(0xFFEF4444) : const Color(0xFF22C55E);
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Icon(
            isError
                ? Icons.error_outline_rounded
                : Icons.check_circle_outline_rounded,
            size: 16,
            color: color,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.dmSans(
                  fontSize: 12, fontWeight: FontWeight.w600, color: color),
            ),
          ),
          GestureDetector(
            onTap: onDismiss,
            child: Icon(Icons.close_rounded, size: 16, color: color),
          ),
        ],
      ),
    );
  }
}
