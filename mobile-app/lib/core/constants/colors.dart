import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFF6366F1); // Indigo
  static const Color secondary = Color(0xFFF59E0B); // Amber
  static const Color accent = Color(0xFF10B981); // Green
  static const Color error = Color(0xFFEF4444); // Red
  
  // Background Colors
  static const Color background = Color(0xFFF9FAFB);
  static const Color surface = Color(0xFFFFFFFF);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  
  // Activity Category Colors
  static const Map<String, Color> categoryColors = {
    'english': Color(0xFF8B5CF6),
    'math': Color(0xFF3B82F6),
    'science': Color(0xFF10B981),
    'art': Color(0xFFF59E0B),
    'social': Color(0xFFEC4899),
    'physical': Color(0xFF14B8A6),
    'world': Color(0xFF6366F1),
    'languages': Color(0xFFEF4444),
  };
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
}
