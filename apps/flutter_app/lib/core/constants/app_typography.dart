import 'package:flutter/material.dart';

/// Typography system for Nexus EDU
/// Uses system default fonts to avoid network dependency
class AppTypography {
  AppTypography._();

  // ═══════════════════════════════════════════
  // DISPLAY STYLES
  // ═══════════════════════════════════════════
  static TextStyle get displayLarge => const TextStyle(
        fontSize: 36, fontWeight: FontWeight.w900, height: 1.2,
      );

  static TextStyle get displayMedium => const TextStyle(
        fontSize: 28, fontWeight: FontWeight.w800, height: 1.25,
      );

  static TextStyle get displaySmall => const TextStyle(
        fontSize: 24, fontWeight: FontWeight.w700, height: 1.3,
      );

  // ═══════════════════════════════════════════
  // HEADLINE STYLES
  // ═══════════════════════════════════════════
  static TextStyle get headlineLarge => const TextStyle(
        fontSize: 22, fontWeight: FontWeight.w700, height: 1.3,
      );

  static TextStyle get headlineMedium => const TextStyle(
        fontSize: 20, fontWeight: FontWeight.w600, height: 1.35,
      );

  static TextStyle get headlineSmall => const TextStyle(
        fontSize: 18, fontWeight: FontWeight.w600, height: 1.4,
      );

  // ═══════════════════════════════════════════
  // TITLE STYLES
  // ═══════════════════════════════════════════
  static TextStyle get titleLarge => const TextStyle(
        fontSize: 16, fontWeight: FontWeight.w700, height: 1.4,
      );

  static TextStyle get titleMedium => const TextStyle(
        fontSize: 14, fontWeight: FontWeight.w600, height: 1.4,
      );

  static TextStyle get titleSmall => const TextStyle(
        fontSize: 13, fontWeight: FontWeight.w600, height: 1.5,
      );

  // ═══════════════════════════════════════════
  // BODY STYLES
  // ═══════════════════════════════════════════
  static TextStyle get bodyLarge => const TextStyle(
        fontSize: 16, fontWeight: FontWeight.w400, height: 1.5,
      );

  static TextStyle get bodyMedium => const TextStyle(
        fontSize: 14, fontWeight: FontWeight.w400, height: 1.5,
      );

  static TextStyle get bodySmall => const TextStyle(
        fontSize: 12, fontWeight: FontWeight.w400, height: 1.5,
      );

  // ═══════════════════════════════════════════
  // LABEL STYLES
  // ═══════════════════════════════════════════
  static TextStyle get labelLarge => const TextStyle(
        fontSize: 14, fontWeight: FontWeight.w600, height: 1.4,
      );

  static TextStyle get labelMedium => const TextStyle(
        fontSize: 12, fontWeight: FontWeight.w600, height: 1.4,
      );

  static TextStyle get labelSmall => const TextStyle(
        fontSize: 11, fontWeight: FontWeight.w500, height: 1.4,
      );
}
