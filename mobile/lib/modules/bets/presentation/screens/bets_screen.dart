// lib/modules/bets/presentation/screens/bets_screen.dart

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../data/bet_api_service.dart';
import '../../data/bet_repository.dart';
import '../../domain/bet.dart';
import '../controllers/bets_controller.dart';
import '../widgets/bet_card.dart';

class BetsScreen extends StatefulWidget {
  final String authToken;
  final ValueListenable<int> knightPointsListenable;

  const BetsScreen({
    super.key,
    required this.authToken,
    required this.knightPointsListenable,
  });

  @override
  State<BetsScreen> createState() => _BetsScreenState();
}

class _BetsScreenState extends State<BetsScreen>
    with SingleTickerProviderStateMixin {
  late final BetsController _controller;
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _controller = BetsController(
      repository: BetRepository(
        service: BetApiService(token: widget.authToken),
      ),
    );
    _tabController = TabController(length: 2, vsync: this);
    _controller.addListener(() => setState(() {}));
    _controller.loadBets();
  }

  @override
  void dispose() {
    _controller.dispose();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() => _controller.loadBets();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080A0E),
      body: SafeArea(
        child: Column(
          children: [
            _BetsHeader(
              knightPointsListenable: widget.knightPointsListenable,
              tabController: _tabController,
              activeBetCount: _controller.activeBets.length,
              pastBetCount: _controller.pastBets.length,
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _BetsList(
                    bets: _controller.activeBets,
                    loadState: _controller.state,
                    errorMessage: _controller.errorMessage,
                    emptyMessage: 'No active bets',
                    onRefresh: _onRefresh,
                    sectionLabel: 'PENDING RESULTS',
                  ),
                  _BetsList(
                    bets: _controller.pastBets,
                    loadState: _controller.state,
                    errorMessage: _controller.errorMessage,
                    emptyMessage: 'No past bets',
                    onRefresh: _onRefresh,
                    sectionLabel: null, // past bets use per-status sections
                    groupByStatus: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header ───────────────────────────────────────────────────────────────────

class _BetsHeader extends StatelessWidget {
  final ValueListenable<int> knightPointsListenable;
  final TabController tabController;
  final int activeBetCount;
  final int pastBetCount;

  const _BetsHeader({
    required this.knightPointsListenable,
    required this.tabController,
    required this.activeBetCount,
    required this.pastBetCount,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 16, 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'My Bets',
                style: GoogleFonts.dmSans(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const Spacer(),
              ValueListenableBuilder<int>(
                valueListenable: knightPointsListenable,
                builder: (_, kp, __) => Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFFFBBF24),
                      width: 1.5,
                    ),
                  ),
                  child: Text(
                    '${_formatPoints(kp)} Credits',
                    style: GoogleFonts.dmSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFFBBF24),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        TabBar(
          controller: tabController,
          labelColor: Colors.white,
          unselectedLabelColor: const Color(0xFF6B7280),
          indicatorColor: const Color(0xFFFBBF24),
          indicatorSize: TabBarIndicatorSize.label,
          labelStyle: GoogleFonts.dmSans(
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
          unselectedLabelStyle: GoogleFonts.dmSans(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          dividerColor: const Color(0xFF1E2028),
          tabs: [
            Tab(text: 'Active  $activeBetCount'),
            Tab(text: 'Past  $pastBetCount'),
          ],
        ),
      ],
    );
  }

  String _formatPoints(int kp) {
    if (kp >= 1000) {
      final k = kp / 1000;
      return '${k == k.truncate() ? k.truncate() : k.toStringAsFixed(1)}K';
    }
    return kp.toString();
  }
}

// ── Bet list (one tab) ────────────────────────────────────────────────────────

class _BetsList extends StatelessWidget {
  final List<Bet> bets;
  final BetsLoadState loadState;
  final String? errorMessage;
  final String emptyMessage;
  final Future<void> Function() onRefresh;
  final String? sectionLabel;
  final bool groupByStatus;

  const _BetsList({
    required this.bets,
    required this.loadState,
    required this.errorMessage,
    required this.emptyMessage,
    required this.onRefresh,
    this.sectionLabel,
    this.groupByStatus = false,
  });

  @override
  Widget build(BuildContext context) {
    if (loadState == BetsLoadState.loading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFFBBF24)),
      );
    }

    if (loadState == BetsLoadState.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded,
                  color: Color(0xFF6B7280), size: 40),
              const SizedBox(height: 12),
              Text(
                errorMessage ?? 'Something went wrong',
                textAlign: TextAlign.center,
                style: GoogleFonts.dmSans(
                    color: const Color(0xFF6B7280), fontSize: 14),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: onRefresh,
                child: Text('Retry',
                    style: GoogleFonts.dmSans(
                        color: const Color(0xFFFBBF24),
                        fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ),
      );
    }

    if (bets.isEmpty) {
      return Center(
        child: Text(
          emptyMessage,
          style: GoogleFonts.dmSans(
              color: const Color(0xFF4B5563), fontSize: 15),
        ),
      );
    }

    return RefreshIndicator(
      color: const Color(0xFFFBBF24),
      backgroundColor: const Color(0xFF111318),
      onRefresh: onRefresh,
      child: groupByStatus
          ? _GroupedList(bets: bets)
          : ListView(
              padding: const EdgeInsets.only(top: 8, bottom: 24),
              children: [
                if (sectionLabel != null) _SectionLabel(label: sectionLabel!),
                ...bets.map((b) => BetCard(bet: b)),
              ],
            ),
    );
  }
}

/// Past tab: group into WON and LOST sections.
class _GroupedList extends StatelessWidget {
  final List<Bet> bets;
  const _GroupedList({required this.bets});

  @override
  Widget build(BuildContext context) {
    final won  = bets.where((b) => b.isWon).toList();
    final lost = bets.where((b) => b.isLost).toList();
    final other = bets.where((b) => !b.isWon && !b.isLost).toList();

    return ListView(
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      children: [
        if (won.isNotEmpty) ...[
          const _SectionLabel(label: 'WON'),
          ...won.map((b) => BetCard(bet: b)),
        ],
        if (lost.isNotEmpty) ...[
          const _SectionLabel(label: 'LOST'),
          ...lost.map((b) => BetCard(bet: b)),
        ],
        if (other.isNotEmpty) ...[
          const _SectionLabel(label: 'OTHER'),
          ...other.map((b) => BetCard(bet: b)),
        ],
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
      child: Text(
        label,
        style: GoogleFonts.dmSans(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: const Color(0xFF4B5563),
          letterSpacing: 1.0,
        ),
      ),
    );
  }
}
