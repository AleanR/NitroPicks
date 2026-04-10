// lib/modules/events/presentation/screens/bet_slip_panel.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../domain/event.dart';
import '../controllers/event_detail_controller.dart';

class BettingSlipSheet extends StatefulWidget {
  final EventModel event;
  final String team;      // "home" or "away"
  final double odds;
  final EventDetailController controller;

  const BettingSlipSheet({
    super.key,
    required this.event,
    required this.team,
    required this.odds,
    required this.controller,
  });

  static Future<void> show(
    BuildContext context, {
    required EventModel event,
    required String team,
    required double odds,
    required EventDetailController controller,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BettingSlipSheet(
        event: event,
        team: team,
        odds: odds,
        controller: controller,
      ),
    );
  }

  @override
  State<BettingSlipSheet> createState() => _BettingSlipSheetState();
}

class _BettingSlipSheetState extends State<BettingSlipSheet> {
  final _stakeController = TextEditingController();
  double _stake = 0;

  String get _teamName =>
      widget.team == 'home' ? widget.event.homeTeam : widget.event.awayTeam;

  double get _toWin => _stake * widget.odds;

  @override
  void dispose() {
    _stakeController.dispose();
    super.dispose();
  }

  void _onStakeChanged(String val) {
    setState(() {
      _stake = double.tryParse(val) ?? 0;
    });
  }

  Future<void> _placeBet() async {
    if (_stake <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        _snackBar('Enter a stake amount', isError: true),
      );
      return;
    }

    HapticFeedback.mediumImpact();

    final success = await widget.controller.placeBet(
      event: widget.event,
      team: widget.team,
      stake: _stake,
      odds: widget.odds,
    );

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        _snackBar('Bet placed on $_teamName! To win: ${_toWin.toStringAsFixed(2)} KP'),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        _snackBar(widget.controller.errorMessage ?? 'Bet failed', isError: true),
      );
      widget.controller.reset();
    }
  }

  SnackBar _snackBar(String message, {bool isError = false}) {
    return SnackBar(
      content: Text(
        message,
        style: GoogleFonts.dmSans(
          color: AppColors.textInverse,
          fontWeight: FontWeight.w600,
        ),
      ),
      backgroundColor: isError ? const Color(0xFFEF4444) : AppColors.open,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      duration: const Duration(seconds: 3),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).viewInsets.bottom;

    return ListenableBuilder(
      listenable: widget.controller,
      builder: (context, _) {
        final isLoading = widget.controller.betState == BetState.loading;

        return Container(
          padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottomPad),
          decoration: const BoxDecoration(
            color: AppColors.surfaceCard,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(
              top: BorderSide(color: AppColors.border, width: 1),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Header row
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceElevated,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'MONEYLINE',
                      style: GoogleFonts.dmSans(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: isLoading ? null : () => Navigator.pop(context),
                    child: const Icon(Icons.close_rounded,
                        color: AppColors.textMuted, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Teams matchup summary
              Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.event.homeTeam,
                      style: GoogleFonts.dmSans(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: widget.team == 'home'
                            ? AppColors.textPrimary
                            : AppColors.textMuted,
                      ),
                    ),
                  ),
                  Text(
                    'vs',
                    style: GoogleFonts.dmSans(
                        fontSize: 11, color: AppColors.textMuted),
                  ),
                  Expanded(
                    child: Text(
                      widget.event.awayTeam,
                      textAlign: TextAlign.right,
                      style: GoogleFonts.dmSans(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: widget.team == 'away'
                            ? AppColors.textPrimary
                            : AppColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Selected team + odds
              Text(
                _teamName,
                style: GoogleFonts.dmSans(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${widget.odds.toStringAsFixed(2)}x payout',
                style: GoogleFonts.dmMono(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.gold,
                ),
              ),

              const SizedBox(height: 20),
              const Divider(color: AppColors.border, height: 1),
              const SizedBox(height: 20),

              // Stake label
              Text(
                'STAKE (KP)',
                style: GoogleFonts.dmSans(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 8),

              // Stake input
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 14),
                      child: Icon(Icons.toll_rounded,
                          color: AppColors.textSecondary, size: 18),
                    ),
                    Expanded(
                      child: TextField(
                        controller: _stakeController,
                        onChanged: _onStakeChanged,
                        enabled: !isLoading,
                        keyboardType:
                            const TextInputType.numberWithOptions(decimal: true),
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(
                              RegExp(r'^\d+\.?\d{0,2}')),
                        ],
                        style: GoogleFonts.dmMono(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                        decoration: const InputDecoration(
                          hintText: '0',
                          hintStyle: TextStyle(
                              color: AppColors.textMuted, fontSize: 20),
                          border: InputBorder.none,
                          contentPadding:
                              EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // To Win row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('To Win',
                      style: GoogleFonts.dmSans(
                          fontSize: 13, color: AppColors.textSecondary)),
                  Text(
                    '${_toWin.toStringAsFixed(2)} KP',
                    style: GoogleFonts.dmMono(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.open,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Place bet button
              GestureDetector(
                onTap: isLoading ? null : _placeBet,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  width: double.infinity,
                  height: 52,
                  decoration: BoxDecoration(
                    color: isLoading
                        ? AppColors.gold.withValues(alpha: 0.5)
                        : AppColors.gold,
                    borderRadius: BorderRadius.circular(26),
                    boxShadow: isLoading
                        ? []
                        : [
                            BoxShadow(
                              color: AppColors.gold.withValues(alpha: 0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                  ),
                  alignment: Alignment.center,
                  child: isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: AppColors.textInverse,
                          ),
                        )
                      : Text(
                          'Place Bet',
                          style: GoogleFonts.dmSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textInverse,
                            letterSpacing: -0.2,
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
