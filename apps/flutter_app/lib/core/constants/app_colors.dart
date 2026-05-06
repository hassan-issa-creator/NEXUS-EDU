import 'package:flutter/material.dart';

/// Nexus EDU Color Palette - Ultra Premium Dark Edition
class AppColors {
  AppColors._();

  // ═══════════════════════════════════════════
  // PRIMARY - Deep Emerald Green (الأخضر الزمردي)
  // ═══════════════════════════════════════════
  static const Color primary = Color(0xFF10B981);
  static const Color primaryLight = Color(0xFF34D399);
  static const Color primaryDark = Color(0xFF059669);
  static const Color primary50 = Color(0xFFECFDF5);
  static const Color primary100 = Color(0xFFD1FAE5);
  static const Color primary200 = Color(0xFFA7F3D0);
  static const Color primary300 = Color(0xFF6EE7B7);
  static const Color primary400 = Color(0xFF34D399);
  static const Color primary500 = Color(0xFF10B981);
  static const Color primary600 = Color(0xFF059669);
  static const Color primary700 = Color(0xFF047857);
  static const Color primary800 = Color(0xFF065F46);
  static const Color primary900 = Color(0xFF064E3B);

  // Material Color Swatch
  static const MaterialColor primarySwatch = MaterialColor(0xFF10B981, {
    50: primary50,
    100: primary100,
    200: primary200,
    300: primary300,
    400: primary400,
    500: Color(0xFF10B981),
    600: primary600,
    700: primary700,
    800: primary800,
    900: primary900,
  });

  // ═══════════════════════════════════════════
  // ACCENT - Amber Gold (الذهبي)
  // ═══════════════════════════════════════════
  static const Color accent = Color(0xFFF59E0B);
  static const Color accentLight = Color(0xFFFBBF24);
  static const Color accentDark = Color(0xFFD97706);

  // ═══════════════════════════════════════════
  // SEMANTIC COLORS
  // ═══════════════════════════════════════════
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);

  // ═══════════════════════════════════════════
  // NEUTRALS - Ultra Dark Mode
  // ═══════════════════════════════════════════
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color background = Color(0xFFF8FAFC);
  static const Color backgroundDark = Color(0xFF020A1B);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF0F1A2E);
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFF131E33);
  static const Color surfaceElevated = Color(0xFF182438);

  // Text Colors
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textHint = Color(0xFF94A3B8);
  static const Color textPrimaryDark = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFF94A3B8);

  // Border Colors
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderDark = Color(0xFF1E2D45);
  static const Color divider = Color(0xFFF1F5F9);

  // ═══════════════════════════════════════════
  // GRADIENT PRESETS
  // ═══════════════════════════════════════════
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF0D9488), Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF020D08), Color(0xFF0A2A1F), Color(0xFF0D4A38)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [accent, accentLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkSurface = LinearGradient(
    colors: [Color(0xFF0F1A2E), Color(0xFF131E33)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Subject Colors (for charts & cards)
  static const Color math = Color(0xFF3B82F6);
  static const Color physics = Color(0xFFA855F7);
  static const Color chemistry = Color(0xFF10B981);
  static const Color arabic = Color(0xFFF59E0B);
  static const Color english = Color(0xFFEF4444);
  static const Color computerScience = Color(0xFF6366F1);
}
