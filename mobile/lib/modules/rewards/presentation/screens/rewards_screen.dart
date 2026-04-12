// lib/modules/rewards/presentation/screens/rewards_screen.dart

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../shared/theme/app_theme.dart';
import '../../data/rewards_api_service.dart';
import '../../data/rewards_repository.dart';
import '../../domain/reward.dart';
import '../controllers/rewards_controller.dart';

// Category display config
const _categoryMeta = {
  'food':       _CatMeta('Food',        Icons.fastfood_rounded),
  'merch':      _CatMeta('Merch',       Icons.shopping_bag_rounded),
  'campus':     _CatMeta('Campus',      Icons.school_rounded),
  'athletics':  _CatMeta('Athletics',   Icons.sports_rounded),
  'digital':    _CatMeta('Digital',     Icons.star_rounded),
  'experience': _CatMeta('Experience',  Icons.celebration_rounded),
};

class _CatMeta {
  final String label;
  final IconData icon;
  const _CatMeta(this.label, this.icon);
}

class RewardsScreen extends StatefulWidget {
  final String authToken;
  final String userId;
  final ValueListenable<int> knightPointsListenable;
  final ValueChanged<int> onKnightPointsChanged;

  const RewardsScreen({
    super.key,
    required this.authToken,
    required this.userId,
    required this.knightPointsListenable,
    required this.onKnightPointsChanged,
  });

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  late final RewardsController _controller;
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    _controller = RewardsController(
      repository: RewardsRepository(
        service: RewardsApiService(token: widget.authToken),
      ),
    );
    _controller.addListener(() => setState(() {}));
    _controller.loadRewards();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  List<Reward> get _filtered {
    if (_selectedCategory == 'all') return _controller.rewards;
    return _controller.rewards.where((r) => r.category == _selectedCategory).toList();
  }

  Future<void> _onRedeem(Reward reward) async {
    final balance = widget.knightPointsListenable.value;
    if (balance < reward.pointsCost) {
      _showSnack('Not enough Knight Points');
      return;
    }

    final confirmed = await _ConfirmSheet.show(context, reward: reward, balance: balance);
    if (!mounted || confirmed != true) return;

    try {
      final result = await _controller.redeem(
        userId: widget.userId,
        rewardId: reward.id,
      );
      if (!mounted) return;
      widget.onKnightPointsChanged((result['remainingKnightPoints'] as num).toInt());
      await _VoucherSheet.show(
        context,
        rewardName: reward.name,
        voucherCode: result['voucherCode'] as String,
        userEmail: '', // email shown generically
      );
      _controller.loadRewards(); // refresh stock count
    } catch (e) {
      if (!mounted) return;
      _showSnack(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: GoogleFonts.dmSans(fontSize: 13)),
        backgroundColor: const Color(0xFF1F2937),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _RewardsHeader(knightPointsListenable: widget.knightPointsListenable),
            const SizedBox(height: 12),
            _CategoryBar(
              selected: _selectedCategory,
              onSelected: (c) => setState(() => _selectedCategory = c),
            ),
            const SizedBox(height: 8),
            Expanded(child: _buildBody()),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_controller.isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFFFBBF24)));
    }
    if (_controller.errorMessage != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded, color: AppColors.textMuted, size: 48),
            const SizedBox(height: 12),
            Text('Could not load rewards',
                style: GoogleFonts.dmSans(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _controller.loadRewards,
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
    final rewards = _filtered;
    if (rewards.isEmpty) {
      return Center(
        child: Text('No rewards in this category',
            style: GoogleFonts.dmSans(fontSize: 14, color: AppColors.textMuted)),
      );
    }
    return RefreshIndicator(
      color: const Color(0xFFFBBF24),
      backgroundColor: AppColors.surfaceElevated,
      onRefresh: _controller.loadRewards,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        itemCount: rewards.length,
        itemBuilder: (_, i) => _RewardCard(
          reward: rewards[i],
          balance: widget.knightPointsListenable.value,
          onRedeem: () => _onRedeem(rewards[i]),
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _RewardsHeader extends StatelessWidget {
  final ValueListenable<int> knightPointsListenable;
  const _RewardsHeader({required this.knightPointsListenable});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Rewards',
              style: GoogleFonts.dmSans(
                fontSize: 26, fontWeight: FontWeight.w900,
                color: AppColors.textPrimary, letterSpacing: -0.8,
              )),
          const SizedBox(height: 12),
          ValueListenableBuilder<int>(
            valueListenable: knightPointsListenable,
            builder: (_, kp, __) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFFBBF24).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('YOUR KNIGHT POINTS',
                          style: GoogleFonts.dmSans(
                            fontSize: 11, fontWeight: FontWeight.w700,
                            color: const Color(0xFFFBBF24).withValues(alpha: 0.7),
                            letterSpacing: 0.8,
                          )),
                      const SizedBox(height: 2),
                      Text(
                        _formatPoints(kp),
                        style: GoogleFonts.dmSans(
                          fontSize: 32, fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary, letterSpacing: -1,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    width: 48, height: 48,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFBBF24),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bolt_rounded, color: Colors.black, size: 26),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatPoints(int kp) {
    return kp.toString().replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]},',
    );
  }
}

// ── Category filter bar ───────────────────────────────────────────────────────

class _CategoryBar extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onSelected;

  const _CategoryBar({required this.selected, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    final cats = ['all', ..._categoryMeta.keys];
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: cats.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final cat = cats[i];
          final isAll = cat == 'all';
          final isSelected = cat == selected;
          final label = isAll ? 'All' : _categoryMeta[cat]!.label;
          return GestureDetector(
            onTap: () => onSelected(cat),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFFBBF24) : AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? const Color(0xFFFBBF24) : AppColors.border,
                ),
              ),
              child: Text(label,
                  style: GoogleFonts.dmSans(
                    fontSize: 12, fontWeight: FontWeight.w700,
                    color: isSelected ? Colors.black : AppColors.textMuted,
                  )),
            ),
          );
        },
      ),
    );
  }
}

// ── Reward card ───────────────────────────────────────────────────────────────

class _RewardCard extends StatelessWidget {
  final Reward reward;
  final int balance;
  final VoidCallback onRedeem;

  const _RewardCard({
    required this.reward,
    required this.balance,
    required this.onRedeem,
  });

  @override
  Widget build(BuildContext context) {
    final canAfford = balance >= reward.pointsCost;
    final meta = _categoryMeta[reward.category] ?? const _CatMeta('Other', Icons.redeem_rounded);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category icon
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFFBBF24).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(meta.icon, color: const Color(0xFFFBBF24), size: 22),
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(reward.name,
                      style: GoogleFonts.dmSans(
                        fontSize: 14, fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      )),
                  const SizedBox(height: 2),
                  Text(meta.label,
                      style: GoogleFonts.dmSans(fontSize: 11, color: AppColors.textMuted)),
                  const SizedBox(height: 6),
                  Text(reward.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.dmSans(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.bolt_rounded, color: Color(0xFFFBBF24), size: 14),
                      const SizedBox(width: 3),
                      Text('${reward.pointsCost} KP',
                          style: GoogleFonts.dmSans(
                            fontSize: 13, fontWeight: FontWeight.w800,
                            color: const Color(0xFFFBBF24),
                          )),
                      const Spacer(),
                      GestureDetector(
                        onTap: reward.inStock ? onRedeem : null,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: !reward.inStock
                                ? AppColors.border
                                : canAfford
                                    ? const Color(0xFFFBBF24)
                                    : const Color(0xFFFBBF24).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: !reward.inStock
                                  ? AppColors.border
                                  : const Color(0xFFFBBF24),
                            ),
                          ),
                          child: Text(
                            !reward.inStock ? 'Sold Out' : 'Redeem',
                            style: GoogleFonts.dmSans(
                              fontSize: 12, fontWeight: FontWeight.w700,
                              color: !reward.inStock
                                  ? AppColors.textMuted
                                  : canAfford
                                      ? Colors.black
                                      : const Color(0xFFFBBF24),
                            ),
                          ),
                        ),
                      ),
                    ],
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

// ── Confirm redemption bottom sheet ──────────────────────────────────────────

class _ConfirmSheet extends StatelessWidget {
  final Reward reward;
  final int balance;

  const _ConfirmSheet({required this.reward, required this.balance});

  static Future<bool?> show(BuildContext context, {required Reward reward, required int balance}) {
    return showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _ConfirmSheet(reward: reward, balance: balance),
    );
  }

  @override
  Widget build(BuildContext context) {
    final balanceAfter = balance - reward.pointsCost;
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0E1014),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(width: 36, height: 4,
                decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
          ),
          const SizedBox(height: 20),
          Text(reward.name,
              style: GoogleFonts.dmSans(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text(reward.description,
              style: GoogleFonts.dmSans(fontSize: 13, color: AppColors.textMuted, height: 1.4)),
          const SizedBox(height: 20),
          _Row('COST', '${reward.pointsCost} KP', const Color(0xFFFBBF24)),
          const SizedBox(height: 8),
          _Row('BALANCE AFTER', '$balanceAfter KP',
              balanceAfter >= 0 ? AppColors.textSecondary : const Color(0xFFEF4444)),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => Navigator.pop(context, true),
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF22C55E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('Confirm Redemption',
                  style: GoogleFonts.dmSans(fontSize: 15, fontWeight: FontWeight.w800)),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => Navigator.pop(context, false),
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('Cancel',
                  style: GoogleFonts.dmSans(fontSize: 15, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final Color valueColor;
  const _Row(this.label, this.value, this.valueColor);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.w600,
                color: AppColors.textMuted, letterSpacing: 0.5)),
        Text(value,
            style: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.w800, color: valueColor)),
      ],
    );
  }
}

// ── Voucher sent bottom sheet ─────────────────────────────────────────────────

class _VoucherSheet extends StatefulWidget {
  final String rewardName;
  final String voucherCode;

  const _VoucherSheet({required this.rewardName, required this.voucherCode});

  static Future<void> show(BuildContext context, {
    required String rewardName,
    required String voucherCode,
    required String userEmail,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: false,
      builder: (_) => _VoucherSheet(rewardName: rewardName, voucherCode: voucherCode),
    );
  }

  @override
  State<_VoucherSheet> createState() => _VoucherSheetState();
}

class _VoucherSheetState extends State<_VoucherSheet> {
  bool _copied = false;

  void _copyCode() async {
    await Clipboard.setData(ClipboardData(text: widget.voucherCode));
    setState(() => _copied = true);
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) setState(() => _copied = false);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0E1014),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(
              color: const Color(0xFF22C55E).withValues(alpha: 0.15),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF22C55E).withValues(alpha: 0.4), width: 2),
            ),
            child: const Icon(Icons.check_rounded, color: Color(0xFF22C55E), size: 32),
          ),
          const SizedBox(height: 16),
          Text('Voucher sent!',
              style: GoogleFonts.dmSans(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          Text('Emailed to your UCF address. Show this code at\n${widget.rewardName}.',
              textAlign: TextAlign.center,
              style: GoogleFonts.dmSans(fontSize: 13, color: AppColors.textMuted, height: 1.4)),
          const SizedBox(height: 24),
          // Voucher code box
          GestureDetector(
            onTap: _copyCode,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                color: _copied
                    ? const Color(0xFF22C55E).withValues(alpha: 0.08)
                    : const Color(0xFFFBBF24).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _copied
                      ? const Color(0xFF22C55E).withValues(alpha: 0.5)
                      : const Color(0xFFFBBF24).withValues(alpha: 0.5),
                  width: 1.5,
                ),
              ),
              child: Column(
                children: [
                  Text('YOUR CODE',
                      style: GoogleFonts.dmSans(
                        fontSize: 11, fontWeight: FontWeight.w700,
                        color: _copied
                            ? const Color(0xFF22C55E).withValues(alpha: 0.7)
                            : const Color(0xFFFBBF24).withValues(alpha: 0.6),
                        letterSpacing: 1.5,
                      )),
                  const SizedBox(height: 6),
                  Text(widget.voucherCode,
                      style: GoogleFonts.dmSans(
                        fontSize: 28, fontWeight: FontWeight.w900,
                        color: _copied ? const Color(0xFF22C55E) : const Color(0xFFFBBF24),
                        letterSpacing: 3,
                      )),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _copied ? Icons.check_circle_rounded : Icons.copy_rounded,
                        size: 12,
                        color: _copied ? const Color(0xFF22C55E) : const Color(0xFFFBBF24),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _copied ? 'Successfully copied' : 'Tap to copy',
                        style: GoogleFonts.dmSans(
                          fontSize: 11,
                          fontWeight: _copied ? FontWeight.w700 : FontWeight.w500,
                          color: _copied
                              ? const Color(0xFF22C55E)
                              : const Color(0xFFFBBF24).withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => Navigator.pop(context),
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFFBBF24),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('Done',
                  style: GoogleFonts.dmSans(fontSize: 15, fontWeight: FontWeight.w800)),
            ),
          ),
        ],
      ),
    );
  }
}
