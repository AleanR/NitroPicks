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
              height: 2,
              color: isCompleted
                  ? AppColors.gold
                  : const Color(0xFF3A3A3A),
            ),
          );
        } else {
          // Step dot
          final stepIndex = i ~/ 2;
          final isCurrent = stepIndex == currentStep;
          final isCompleted = stepIndex < currentStep;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isCurrent
                  ? Colors.transparent
                  : Colors.transparent,
              border: Border.all(
                color: (isCurrent || isCompleted)
                    ? AppColors.gold
                    : const Color(0xFF3A3A3A),
                width: 2,
              ),
            ),
            child: Center(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: isCurrent ? 12 : (isCompleted ? 10 : 0),
                height: isCurrent ? 12 : (isCompleted ? 10 : 0),
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
