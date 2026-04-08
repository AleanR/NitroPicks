// lib/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Brand
  static const gold = Color(0xFFFFB800);
  static const goldLight = Color(0xFFFFCC33);
  static const goldDark = Color(0xFFCC9200);

  // Background gradient colors (from screenshot)
  static const bgDark = Color(0xFF080C10);       // near-black base
  static const bgBlue = Color(0xFF0D1B2A);       // deep navy
  static const bgGold = Color(0xFF2A1F00);       // dark gold tint

  // Surfaces
  static const surface = Color(0xFF111111);
  static const surfaceCard = Color(0xFF1A1A1A);
  static const surfaceElevated = Color(0xFF222222);

  // Borders
  static const border = Color(0xFF2A2A2A);
  static const borderLight = Color(0xFF3A3A3A);

  // Text
  static const textPrimary = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFAAAAAA);
  static const textMuted = Color(0xFF666666);
  static const textInverse = Color(0xFF0A0A0A);

  // Status
  static const open = Color(0xFF22C55E);
  static const openBg = Color(0xFF0D2B1A);
  static const closing = Color(0xFFEF4444);
  static const closingBg = Color(0xFF2B0D0D);
  static const soon = Color(0xFFF97316);
  static const soonBg = Color(0xFF2B1A0D);
  static const closed = Color(0xFF6B7280);
  static const closedBg = Color(0xFF1A1A1A);
}

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

  static TextStyle label({double size = 11, Color? color}) => GoogleFonts.dmSans(
        fontSize: size,
        fontWeight: FontWeight.w700,
        color: color ?? AppColors.textMuted,
        letterSpacing: 0.8,
      );

  static TextStyle button({double size = 16, Color? color}) => GoogleFonts.dmSans(
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

class AppTheme {
  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.bgDark,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.gold,
          surface: AppColors.surface,
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: const IconThemeData(color: AppColors.textPrimary),
          titleTextStyle: GoogleFonts.dmSans(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: -0.3,
          ),
        ),
        textTheme: GoogleFonts.dmSansTextTheme(ThemeData.dark().textTheme),
      );
}
