// lib/widgets/step_indicator.dart
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StepIndicator extends StatelessWidget {
  final int currentStep; // 0-indexed
  final int totalSteps;

  const StepIndicator({
    super.key,
    required this.currentStep,
    required this.totalSteps,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(totalSteps * 2 - 1, (i) {
        if (i.isOdd) {
          // Connector line
          final stepIndex = i ~/ 2;
          final isCompleted = stepIndex < currentStep;
          return Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 3,
              margin: const EdgeInsets.symmetric(horizontal: 6),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                color: isCompleted
                    ? AppColors.gold
                    : Colors.white.withValues(alpha: 0.10),
              ),
            ),
          );
        } else {
          // Step dot
          final stepIndex = i ~/ 2;
          final isCurrent = stepIndex == currentStep;
          final isCompleted = stepIndex < currentStep;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isCurrent
                  ? AppColors.gold.withValues(alpha: 0.14)
                  : Colors.white.withValues(alpha: 0.03),
              border: Border.all(
                color: (isCurrent || isCompleted)
                    ? AppColors.gold
                    : Colors.white.withValues(alpha: 0.14),
                width: 1.5,
              ),
            ),
            child: Center(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: isCurrent ? 12 : (isCompleted ? 9 : 0),
                height: isCurrent ? 12 : (isCompleted ? 9 : 0),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (isCurrent || isCompleted)
                      ? AppColors.gold
                      : Colors.transparent,
                ),
              ),
            ),
          );
        }
      }),
    );
  }
}
