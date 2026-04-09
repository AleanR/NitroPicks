import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTextStyles {
  static TextStyle display({double size = 40}) => GoogleFonts.dmSans(
        fontSize: size,
        fontWeight: FontWeight.w900,
        fontStyle: FontStyle.italic,
        color: AppColors.textPrimary,
        letterSpacing: -1.5,
        height: 1.1,
      );

  static TextStyle heading({double size = 22}) => GoogleFonts.dmSans(
        fontSize: size,
        fontWeight: FontWeight.w800,
        color: AppColors.textPrimary,
        letterSpacing: -0.5,
      );

  static TextStyle subheading({double size = 18}) => GoogleFonts.dmSans(
        fontSize: size,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
        letterSpacing: 0,
        height: 1.4,
      );

  static TextStyle body({double size = 14, Color? color}) => GoogleFonts.dmSans(
        fontSize: size,
        fontWeight: FontWeight.w400,
        color: color ?? AppColors.textSecondary,
      );

  static TextStyle label({double size = 11, Color? color}) =>
      GoogleFonts.dmSans(
        fontSize: size,
        fontWeight: FontWeight.w700,
        color: color ?? AppColors.textMuted,
        letterSpacing: 0.8,
      );

  static TextStyle button({double size = 30, Color? color}) =>
      GoogleFonts.dmSans(
        fontSize: size,
        fontWeight: FontWeight.w700,
        color: color ?? AppColors.textInverse,
        letterSpacing: -0.2,
      );

  static TextStyle mono({double size = 14, Color? color}) => GoogleFonts.dmMono(
        fontSize: size,
        fontWeight: FontWeight.w600,
        color: color ?? AppColors.gold,
      );
}
