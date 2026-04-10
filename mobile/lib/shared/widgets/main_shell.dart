// lib/shared/widgets/main_shell.dart
//
// Drop-in shell that wraps the four main screens behind a bottom nav bar.
// Usage in app_router.dart:
//   case '/home':
//     final token = authController.state.token ?? '';
//     return _fade(MainShell(authToken: token));

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../modules/events/presentation/screens/events_screen.dart';
// TODO: swap these placeholders for your real screens when ready
// import '../../modules/bets/presentation/screens/bets_screen.dart';
// import '../../modules/rewards/presentation/screens/rewards_screen.dart';
// import '../../modules/account/presentation/screens/account_screen.dart';

class MainShell extends StatefulWidget {
  final String authToken;
  final double userBalance;
  const MainShell({super.key, required this.authToken, required this.userBalance});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  // Keep pages alive when switching tabs
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      EventsScreen(authToken: widget.authToken, userBalance: widget.userBalance),
      _PlaceholderPage(label: 'Bets', icon: Icons.attach_money_rounded),
      _PlaceholderPage(label: 'Rewards', icon: Icons.card_giftcard_rounded),
      _PlaceholderPage(label: 'Account', icon: Icons.person_outline_rounded),
    ];
  }

  void _onTap(int index) {
    if (index == _currentIndex) return;
    HapticFeedback.selectionClick();
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080A0E),
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: _NitroNavBar(
        currentIndex: _currentIndex,
        onTap: _onTap,
      ),
    );
  }
}

// ── Bottom nav bar ────────────────────────────────────────────────────────────

class _NitroNavBar extends StatelessWidget {
  final int currentIndex;
  final void Function(int) onTap;

  const _NitroNavBar({required this.currentIndex, required this.onTap});

  static const _items = [
    _NavItem(label: 'Events', icon: Icons.bolt_rounded),
    _NavItem(label: 'Bets', icon: Icons.attach_money_rounded),
    _NavItem(label: 'Rewards', icon: Icons.card_giftcard_rounded),
    _NavItem(label: 'Account', icon: Icons.person_outline_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).padding.bottom;
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0E1014),
        border: Border(
          top: BorderSide(color: Color(0xFF1E2028), width: 1),
        ),
      ),
      padding: EdgeInsets.only(bottom: bottom > 0 ? bottom : 8, top: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(_items.length, (i) {
          final selected = i == currentIndex;
          return _NavButton(
            item: _items[i],
            selected: selected,
            onTap: () => onTap(i),
          );
        }),
      ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  const _NavItem({required this.label, required this.icon});
}

class _NavButton extends StatelessWidget {
  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;

  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const gold = Color(0xFFFBBF24);

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 72,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              width: 44,
              height: 32,
              decoration: BoxDecoration(
                color: selected
                    ? gold.withValues(alpha: 0.15)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                item.icon,
                size: 22,
                color: selected ? gold : const Color(0xFF4B5563),
              ),
            ),
            const SizedBox(height: 3),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: GoogleFonts.dmSans(
                fontSize: 10,
                fontWeight:
                    selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? gold : const Color(0xFF4B5563),
              ),
              child: Text(item.label),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Placeholder for unbuilt pages ─────────────────────────────────────────────

class _PlaceholderPage extends StatelessWidget {
  final String label;
  final IconData icon;
  const _PlaceholderPage({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080A0E),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: const Color(0xFF374151)),
            const SizedBox(height: 12),
            Text(
              label,
              style: GoogleFonts.dmSans(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Coming soon',
              style: GoogleFonts.dmSans(
                fontSize: 13,
                color: const Color(0xFF1F2937),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
