// lib/modules/events/presentation/screens/events_screen.dart

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../bets/data/bet_api_service.dart';
import '../../../bets/data/bet_repository.dart';
import '../../data/event_api_service.dart';
import '../../data/event_repository.dart';
import '../../domain/event.dart';
// GameDayStatus enum is defined in event.dart and used for the Upcoming tab filter
import '../controllers/event_detail_controller.dart';
import '../controllers/events_controller.dart';
import '../widgets/event_card.dart';
import '../widgets/events_search_bar.dart';
import '../widgets/filter_tab_bar.dart';
import 'bet_slip_panel.dart';

class EventsScreen extends StatefulWidget {
  final String authToken;
  final ValueListenable<int> knightPointsListenable;
  final ValueChanged<int> onKnightPointsChanged;

  const EventsScreen({
    super.key,
    required this.authToken,
    required this.knightPointsListenable,
    required this.onKnightPointsChanged,
  });

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}


class _EventsScreenState extends State<EventsScreen>
    with SingleTickerProviderStateMixin {
  static const _tabs = ['All', 'Open', 'Closing', 'Upcoming', 'Closed'];

  late final EventsController _eventsController;
  late final EventDetailController _detailController;

  int _selectedTab = 0;
  String _query = '';
  final _searchController = TextEditingController();
  late final AnimationController _listAnimCtrl;

  @override
  void initState() {
    super.initState();

    // Wire up the full data stack
    final eventRepo = EventRepository(
      service: EventApiService(token: widget.authToken),
    );
    final betRepo = BetRepository(
      service: BetApiService(token: widget.authToken),
    );

    _eventsController = EventsController(repository: eventRepo);
    _detailController = EventDetailController(betRepository: betRepo);

    _listAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..forward();

    // Load events on mount
    _eventsController.loadEvents();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _listAnimCtrl.dispose();
    _eventsController.dispose();
    _detailController.dispose();
    super.dispose();
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  // Returns true when an event's betting window closes within 10 minutes.
  bool _isClosing(EventModel e) {
    if (e.computedStatus != EventStatus.live) return false;
    final r = e.timeUntilClose;
    return r != null && r.inSeconds <= 600;
  }

  // Sort priority: Closing (0) > Open (1) > Upcoming game day (2) > Closed/Past (3)
  int _sortPriority(EventModel e) {
    if (_isClosing(e)) return 0;
    if (e.computedStatus == EventStatus.live) return 1;
    if (e.gameDayStatus == GameDayStatus.upcoming) return 2;
    return 3;
  }

  List<EventModel> get _filteredEvents {
    var events = List<EventModel>.from(_eventsController.events);

    if (_selectedTab != 0) {
      events = events.where((e) {
        switch (_selectedTab) {
          case 1: // 'Open' — betting open, not closing
            return e.computedStatus == EventStatus.live && !_isClosing(e);
          case 2: // 'Closing' — within 10 min of closing
            return _isClosing(e);
          case 3: // 'Upcoming' — game day is a future calendar day
            return e.gameDayStatus == GameDayStatus.upcoming;
          case 4: // 'Closed' — betting window closed / game started
            return e.computedStatus == EventStatus.finished ||
                e.computedStatus == EventStatus.cancelled ||
                e.gameDayStatus == GameDayStatus.past;
          default:
            return true;
        }
      }).toList();
    }

    // Sort: Closing → Open → Upcoming → Closed, then by bettingClosesAt within same group
    events.sort((a, b) {
      final pa = _sortPriority(a);
      final pb = _sortPriority(b);
      if (pa != pb) return pa.compareTo(pb);
      return a.bettingOpensAt.compareTo(b.bettingOpensAt);
    });

    return events;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  void _onTabChanged(int index) {
    setState(() => _selectedTab = index);
    _listAnimCtrl.forward(from: 0);
  }

  void _onSearchChanged(String val) {
    setState(() => _query = val);
    // Debounce: search API on every change (could debounce with a Timer if needed)
    _eventsController.loadEvents(query: val);
  }

  void _onClearSearch() {
    _searchController.clear();
    setState(() => _query = '');
    _eventsController.loadEvents();
  }

  Future<void> _onSideSelected(
    EventModel event,
    String team,
    double odds,
  ) async {
    final stake = await BettingSlipSheet.show(
      context,
      event: event,
      team: team,
      odds: odds,
      controller: _detailController,
      userBalance: widget.knightPointsListenable.value.toDouble(),
    );

    if (!mounted || stake == null) return;

    final nextBalance = widget.knightPointsListenable.value - stake.round();
    widget.onKnightPointsChanged(nextBalance);
    _detailController.reset();

    // Refresh events so the updated odds and bettor count are shown immediately
    _eventsController.loadEvents(query: _query);
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _EventsHeader(),
            const SizedBox(height: 14),
            EventsSearchBar(
              controller: _searchController,
              onChanged: _onSearchChanged,
              onClear: _onClearSearch,
            ),
            const SizedBox(height: 12),
            FilterTabBar(
              tabs: _tabs,
              selectedIndex: _selectedTab,
              onTabSelected: _onTabChanged,
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListenableBuilder(
                listenable: _eventsController,
                builder: (context, _) {
                  if (_eventsController.isLoading) {
                    return const _LoadingState();
                  }
                  if (_eventsController.error != null) {
                    return _ErrorState(
                      message: _eventsController.error!,
                      onRetry: () => _eventsController.loadEvents(query: _query),
                    );
                  }
                  final events = _filteredEvents;
                  if (events.isEmpty) {
                    return _EmptyState(query: _query);
                  }
                  return _EventsList(
                    events: events,
                    animCtrl: _listAnimCtrl,
                    onSideSelected: _onSideSelected,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _EventsHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Events',
                style: GoogleFonts.dmSans(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.8,
                ),
              ),
              Text(
                'Pick your winners',
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  color: AppColors.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── List ──────────────────────────────────────────────────────────────────────

class _EventsList extends StatelessWidget {
  final List<EventModel> events;
  final AnimationController animCtrl;
  final void Function(EventModel, String, double) onSideSelected;

  const _EventsList({
    required this.events,
    required this.animCtrl,
    required this.onSideSelected,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.only(bottom: 24),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final delay = (index * 0.07).clamp(0.0, 0.6);
        final opacity = CurvedAnimation(
          parent: animCtrl,
          curve: Interval(delay, (delay + 0.5).clamp(0.0, 1.0),
              curve: Curves.easeOut),
        );
        final slide = Tween<Offset>(
          begin: const Offset(0, 0.06),
          end: Offset.zero,
        ).animate(CurvedAnimation(
          parent: animCtrl,
          curve: Interval(delay, (delay + 0.5).clamp(0.0, 1.0),
              curve: Curves.easeOutCubic),
        ));

        return AnimatedBuilder(
          animation: animCtrl,
          builder: (context, child) => FadeTransition(
            opacity: opacity,
            child: SlideTransition(position: slide, child: child),
          ),
          child: EventCard(
            event: events[index],
            onSideSelected: (team, odds) =>
                onSideSelected(events[index], team, odds),
          ),
        );
      },
    );
  }
}

// ── States ────────────────────────────────────────────────────────────────────

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: 4,
      itemBuilder: (_, __) => _SkeletonCard(),
    );
  }
}

class _SkeletonCard extends StatefulWidget {
  @override
  State<_SkeletonCard> createState() => _SkeletonCardState();
}

class _SkeletonCardState extends State<_SkeletonCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 0.8).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        height: 140,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: _anim.value * 0.07),
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.wifi_off_rounded,
              color: AppColors.textMuted, size: 48),
          const SizedBox(height: 16),
          Text(
            'Could not load events',
            style: GoogleFonts.dmSans(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            message,
            style: GoogleFonts.dmSans(
                fontSize: 12, color: AppColors.textMuted),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: onRetry,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Text(
                'Try Again',
                style: GoogleFonts.dmSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String query;
  const _EmptyState({required this.query});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            query.isNotEmpty
                ? Icons.search_off_rounded
                : Icons.sports_rounded,
            color: AppColors.textMuted,
            size: 48,
          ),
          const SizedBox(height: 16),
          Text(
            query.isNotEmpty ? 'No results for "$query"' : 'No events here',
            style: GoogleFonts.dmSans(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            query.isNotEmpty
                ? 'Try a different search term'
                : 'Check back soon for new games',
            style: GoogleFonts.dmSans(
                fontSize: 13, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}
