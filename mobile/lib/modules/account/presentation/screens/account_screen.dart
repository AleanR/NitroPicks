import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../shared/theme/app_theme.dart';
import '../../../auth/domain/user.dart';
import '../../data/account_api_service.dart';
import '../../domain/account.dart';
import '../controllers/account_controller.dart';

class AccountScreen extends StatefulWidget {
  final String authToken;
  final User? initialUser;
  final ValueListenable<int> knightPointsListenable;
  final ValueChanged<int> onKnightPointsChanged;
  final VoidCallback? onSignOut;

  const AccountScreen({
    super.key,
    required this.authToken,
    required this.knightPointsListenable,
    required this.onKnightPointsChanged,
    this.initialUser,
    this.onSignOut,
  });

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  late final AccountController _controller;
  final List<_ActivityItem> _localActivities = [];

  @override
  void initState() {
    super.initState();
    final initialAccount = widget.initialUser == null
        ? null
        : Account.fromUser(widget.initialUser!).copyWith(
            knightPoints: widget.knightPointsListenable.value,
          );

    _controller = AccountController(
      apiService: AccountApiService(token: widget.authToken),
      initialAccount: initialAccount,
    );

    widget.knightPointsListenable.addListener(_syncExternalKnightPoints);
    _loadAccount();
  }

  @override
  void dispose() {
    widget.knightPointsListenable.removeListener(_syncExternalKnightPoints);
    _controller.dispose();
    super.dispose();
  }

  void _syncExternalKnightPoints() {
    _controller.setKnightPoints(widget.knightPointsListenable.value);
  }

  Future<void> _loadAccount() async {
    final account = await _controller.loadAccount();
    if (!mounted || account == null) return;
    widget.onKnightPointsChanged(account.knightPoints);
  }

  void _showCreditsLoaded(int nextBalance) {
    final previousBalance = widget.knightPointsListenable.value;
    final added = nextBalance - previousBalance;
    widget.onKnightPointsChanged(nextBalance);

    if (added > 0) {
      setState(() {
        _localActivities.insert(
          0,
          _ActivityItem(
            title: 'Credits loaded',
            subtitle: 'Ticket confirmation accepted',
            amount: '+${_formatPoints(added)}',
            positive: true,
          ),
        );
      });
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          added > 0
              ? '+${_formatPoints(added)} KP added to your balance'
              : 'KnightPoints balance updated',
          style: GoogleFonts.dmSans(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
        backgroundColor: AppColors.open,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }

  Future<void> _openLoadCreditsSheet() async {
    HapticFeedback.selectionClick();
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _LoadCreditsSheet(
        controller: _controller,
        currentBalance: widget.knightPointsListenable.value,
        onCreditsLoaded: _showCreditsLoaded,
      ),
    );
  }

  void _signOut() {
    HapticFeedback.mediumImpact();
    widget.onSignOut?.call();
    Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final account = _controller.account;

        return Scaffold(
          backgroundColor: AppColors.bgDark,
          body: SafeArea(
            child: RefreshIndicator(
              color: AppColors.gold,
              backgroundColor: AppColors.surfaceElevated,
              onRefresh: _loadAccount,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
                children: [
                  _AccountHeader(
                    account: account,
                    isLoading: _controller.isLoading,
                    onRefresh: _loadAccount,
                  ),
                  const SizedBox(height: 18),
                  ValueListenableBuilder<int>(
                    valueListenable: widget.knightPointsListenable,
                    builder: (context, knightPoints, _) {
                      return _KnightPointsPanel(knightPoints: knightPoints);
                    },
                  ),
                  const SizedBox(height: 14),
                  _LoadCreditsTile(onTap: _openLoadCreditsSheet),
                  if (_controller.errorMessage != null) ...[
                    const SizedBox(height: 14),
                    _ErrorBanner(message: _controller.errorMessage!),
                  ],
                  const SizedBox(height: 22),
                  _StatsSection(controller: _controller),
                  const SizedBox(height: 22),
                  _StudentInfo(account: account),
                  const SizedBox(height: 22),
                  _RecentActivity(items: _localActivities),
                  const SizedBox(height: 28),
                  _SignOutButton(onTap: _signOut),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _AccountHeader extends StatelessWidget {
  final Account? account;
  final bool isLoading;
  final Future<void> Function() onRefresh;

  const _AccountHeader({
    required this.account,
    required this.isLoading,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final name = account?.displayName ?? 'Knight';
    final email = account?.email ?? 'Loading account...';

    return Row(
      children: [
        _InitialsAvatar(initials: account?.initials ?? 'K'),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.dmSans(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  letterSpacing: 0,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                email,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.dmSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: isLoading ? null : onRefresh,
          child: Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: isLoading
                ? const Padding(
                    padding: EdgeInsets.all(10),
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.gold,
                    ),
                  )
                : const Icon(
                    Icons.refresh_rounded,
                    color: AppColors.textSecondary,
                    size: 18,
                  ),
          ),
        ),
      ],
    );
  }
}

class _InitialsAvatar extends StatelessWidget {
  final String initials;

  const _InitialsAvatar({required this.initials});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 58,
      height: 58,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFF1C1A10),
        shape: BoxShape.circle,
        border: Border.all(
          color: AppColors.gold.withValues(alpha: 0.45),
          width: 1.2,
        ),
      ),
      child: Text(
        initials,
        style: GoogleFonts.dmSans(
          fontSize: 18,
          fontWeight: FontWeight.w900,
          color: AppColors.gold,
          letterSpacing: 0,
        ),
      ),
    );
  }
}

class _KnightPointsPanel extends StatelessWidget {
  final int knightPoints;

  const _KnightPointsPanel({required this.knightPoints});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'YOUR KNIGHT POINTS',
                  style: GoogleFonts.dmSans(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textMuted,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _formatPoints(knightPoints),
                  style: GoogleFonts.dmSans(
                    fontSize: 42,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                    letterSpacing: 0,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'redeem for rewards',
                  style: GoogleFonts.dmSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.gold,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.gold,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.bolt_rounded,
              color: AppColors.textInverse,
              size: 32,
            ),
          ),
        ],
      ),
    );
  }
}

class _LoadCreditsTile extends StatelessWidget {
  final VoidCallback onTap;

  const _LoadCreditsTile({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFF0D2B1A),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.confirmation_number_outlined,
                color: AppColors.open,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Load Betting Credits',
                    style: GoogleFonts.dmSans(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Ticket confirmation number - +1000 KP',
                    style: GoogleFonts.dmSans(
                      fontSize: 12,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textMuted,
              size: 26,
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;

  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.closingBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.closing.withValues(alpha: 0.35)),
      ),
      child: Text(
        message,
        style: GoogleFonts.dmSans(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.closing,
        ),
      ),
    );
  }
}

class _StatsSection extends StatelessWidget {
  final AccountController controller;
  const _StatsSection({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionLabel(label: 'STATS'),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _StatPill(value: '${controller.totalBets}', label: 'Total bets')),
            const SizedBox(width: 10),
            Expanded(child: _StatPill(value: '${controller.betsWon}',   label: 'Won')),
            const SizedBox(width: 10),
            Expanded(child: _StatPill(value: '${controller.betsLost}',  label: 'Lost')),
          ],
        ),
      ],
    );
  }
}

class _StatPill extends StatelessWidget {
  final String value;
  final String label;

  const _StatPill({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 86,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: GoogleFonts.dmSans(
              fontSize: 25,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.dmSans(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _StudentInfo extends StatelessWidget {
  final Account? account;

  const _StudentInfo({required this.account});

  @override
  Widget build(BuildContext context) {
    final major = account?.major?.trim();
    final ucfId = account?.ucfId?.trim();

    if ((major == null || major.isEmpty) && (ucfId == null || ucfId.isEmpty)) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionLabel(label: 'STUDENT INFO'),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surfaceCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              if (major != null && major.isNotEmpty)
                _InfoRow(label: 'Major', value: major),
              if (major != null &&
                  major.isNotEmpty &&
                  ucfId != null &&
                  ucfId.isNotEmpty)
                const SizedBox(height: 12),
              if (ucfId != null && ucfId.isNotEmpty)
                _InfoRow(label: 'UCF ID', value: ucfId),
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: GoogleFonts.dmSans(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.dmSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}

class _RecentActivity extends StatelessWidget {
  final List<_ActivityItem> items;

  const _RecentActivity({required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionLabel(label: 'RECENT ACTIVITY'),
        const SizedBox(height: 10),
        if (items.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surfaceCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              'No recent account activity yet',
              style: GoogleFonts.dmSans(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textMuted,
              ),
            ),
          )
        else
          Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: List.generate(items.length, (index) {
                final item = items[index];
                return Column(
                  children: [
                    _ActivityRow(item: item),
                    if (index != items.length - 1)
                      Container(
                        height: 1,
                        margin: const EdgeInsets.symmetric(horizontal: 14),
                        color: AppColors.border,
                      ),
                  ],
                );
              }),
            ),
          ),
      ],
    );
  }
}

class _ActivityRow extends StatelessWidget {
  final _ActivityItem item;

  const _ActivityRow({required this.item});

  @override
  Widget build(BuildContext context) {
    final amountColor = item.positive ? AppColors.open : AppColors.closing;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: GoogleFonts.dmSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item.subtitle,
                  style: GoogleFonts.dmSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Text(
            item.amount,
            style: GoogleFonts.dmSans(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: amountColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _SignOutButton extends StatelessWidget {
  final VoidCallback onTap;

  const _SignOutButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 54,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Text(
          'Sign out',
          style: GoogleFonts.dmSans(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _LoadCreditsSheet extends StatefulWidget {
  final AccountController controller;
  final int currentBalance;
  final ValueChanged<int> onCreditsLoaded;

  const _LoadCreditsSheet({
    required this.controller,
    required this.currentBalance,
    required this.onCreditsLoaded,
  });

  @override
  State<_LoadCreditsSheet> createState() => _LoadCreditsSheetState();
}

class _LoadCreditsSheetState extends State<_LoadCreditsSheet> {
  final _codeController = TextEditingController();
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _codeController.addListener(_onCodeChanged);
  }

  @override
  void dispose() {
    _codeController
      ..removeListener(_onCodeChanged)
      ..dispose();
    super.dispose();
  }

  void _onCodeChanged() {
    if (_errorText == null) return;
    setState(() => _errorText = null);
  }

  Future<void> _submit() async {
    final code = _codeController.text.trim();
    if (code.length != 16) {
      setState(() => _errorText = 'Enter the 16 digit confirmation number.');
      return;
    }

    HapticFeedback.mediumImpact();
    final updatedBalance = await widget.controller.loadBettingCredits(code);
    if (!mounted) return;

    if (updatedBalance == null) {
      setState(() {
        _errorText = widget.controller.errorMessage ??
            'Could not load credits from this ticket.';
      });
      return;
    }

    Navigator.pop(context);
    widget.onCreditsLoaded(updatedBalance);
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad =
        MediaQuery.of(context).viewInsets.bottom + MediaQuery.of(context).padding.bottom;

    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        final isSubmitting = widget.controller.isSubmitting;
        final projected = widget.currentBalance + 1000;

        return Container(
          padding: EdgeInsets.fromLTRB(20, 8, 20, 20 + bottomPad),
          decoration: const BoxDecoration(
            color: Color(0xFF0E1014),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border: Border(
              top: BorderSide(color: Color(0xFF1E2028), width: 1),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 20),
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2D35),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Text(
                'Load Betting Credits',
                style: GoogleFonts.dmSans(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Enter the confirmation number from your UCF game ticket. '
                'Codes can only be used once.',
                style: GoogleFonts.dmSans(
                  fontSize: 13,
                  height: 1.45,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'TICKET CONFIRMATION NUMBER',
                style: GoogleFonts.dmSans(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textMuted,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF172231),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: (_errorText == null
                            ? AppColors.border
                            : AppColors.closing)
                        .withValues(alpha: 0.8),
                    width: 1.2,
                  ),
                ),
                child: TextField(
                  controller: _codeController,
                  enabled: !isSubmitting,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(16),
                  ],
                  style: GoogleFonts.dmSans(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: 0,
                  ),
                  decoration: InputDecoration(
                    hintText: '3023012102210202',
                    hintStyle: GoogleFonts.dmSans(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMuted.withValues(alpha: 0.65),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                  ),
                ),
              ),
              if (_errorText != null) ...[
                const SizedBox(height: 8),
                Text(
                  _errorText!,
                  style: GoogleFonts.dmSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.closing,
                  ),
                ),
              ],
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Text(
                      '+1000 KP',
                      style: GoogleFonts.dmSans(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.open,
                      ),
                    ),
                    const Spacer(),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'BALANCE AFTER',
                          style: GoogleFonts.dmSans(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textMuted,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '${_formatPoints(projected)} KP',
                          style: GoogleFonts.dmSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: isSubmitting ? null : _submit,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  height: 56,
                  width: double.infinity,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSubmitting ? AppColors.surfaceElevated : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: isSubmitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: AppColors.gold,
                          ),
                        )
                      : Text(
                          'Redeem Ticket',
                          style: GoogleFonts.dmSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Colors.black,
                          ),
                        ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;

  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: GoogleFonts.dmSans(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: AppColors.textMuted,
        letterSpacing: 1,
      ),
    );
  }
}

class _ActivityItem {
  final String title;
  final String subtitle;
  final String amount;
  final bool positive;

  const _ActivityItem({
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.positive,
  });
}

String _formatPoints(int value) {
  return NumberFormat.decimalPattern().format(value);
}
