// lib/modules/events/presentation/screens/events_screen.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../data/event_api_service.dart';
import '../../domain/event.dart';
import '../widgets/event_card.dart';
import '../widgets/events_search_bar.dart';
import '../widgets/filter_tab_bar.dart';
import 'bet_slip_panel.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen>
    with SingleTickerProviderStateMixin {
  static const _tabs = ['All', 'Open', 'Soon', 'Closing', 'Closed'];

  int _selectedTab = 0;
  String _query = '';
  final _searchController = TextEditingController();
  late final AnimationController _listAnimCtrl;

  @override
  void initState() {
    super.initState();
    _listAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..forward();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _listAnimCtrl.dispose();
    super.dispose();
  }

  List<EventModel> get _filteredEvents {
    var events = mockEvents;

    // Filter by tab
    if (_selectedTab != 0) {
      final statusMap = {
        1: EventStatus.open,
        2: EventStatus.soon,
        3: EventStatus.closing,
        4: EventStatus.closed,
      };
      final target = statusMap[_selectedTab];
      if (target != null) {
        events = events.where((e) => e.status == target).toList();
      }
    }

    // Filter by search
    if (_query.isNotEmpty) {
      final q = _query.toLowerCase();
      events = events.where((e) {
        return e.home.name.toLowerCase().contains(q) ||
            e.away.name.toLowerCase().contains(q) ||
            e.league.toLowerCase().contains(q);
      }).toList();
    }

    return events;
  }

  void _onTabChanged(int index) {
    setState(() => _selectedTab = index);
    _listAnimCtrl.forward(from: 0);
  }

  void _onSearchChanged(String val) {
    setState(() => _query = val);
  }

  void _onClearSearch() {
    _searchController.clear();
    setState(() => _query = '');
  }

  void _onCardTap(EventModel event) {
    Navigator.of(context).pushNamed('/event-detail', arguments: event);
  }

  @override
  Widget build(BuildContext context) {
    final events = _filteredEvents;

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
              child: events.isEmpty
                  ? _EmptyState(query: _query)
                  : _EventsList(
                      events: events,
                      animCtrl: _listAnimCtrl,
                      onCardTap: _onCardTap,
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
          const Spacer(),
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: const Icon(Icons.tune_rounded,
                color: AppColors.textSecondary, size: 18),
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
  final void Function(EventModel) onCardTap;

  const _EventsList({
    required this.events,
    required this.animCtrl,
    required this.onCardTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.only(bottom: 24),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final delay = (index * 0.07).clamp(0.0, 0.6);
        final Animation<double> opacity = CurvedAnimation(
          parent: animCtrl,
          curve: Interval(delay, (delay + 0.5).clamp(0.0, 1.0),
              curve: Curves.easeOut),
        );
        final Animation<Offset> slide = Tween<Offset>(
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
          child: _CardWithSlip(
            event: events[index],
            onTap: () => onCardTap(events[index]),
          ),
        );
      },
    );
  }
}

// Wraps EventCard and handles opening the betting slip on selection
class _CardWithSlip extends StatelessWidget {
  final EventModel event;
  final VoidCallback onTap;

  const _CardWithSlip({required this.event, required this.onTap});

  bool get _canBet =>
      event.status == EventStatus.open ||
      event.status == EventStatus.soon ||
      event.status == EventStatus.closing;

  void _handleTap(BuildContext context) {
    if (_canBet) {
      BettingSlipSheet.show(
        context,
        teamName: event.home.name,
        odds: event.home.odds,
        league: event.league,
      );
    } else {
      onTap();
    }
  }

  @override
  Widget build(BuildContext context) {
    return EventCard(
      event: event,
      onTap: () => _handleTap(context),
    );
  }
}

// ── Empty state ───────────────────────────────────────────────────────────────

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
              fontSize: 13,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
