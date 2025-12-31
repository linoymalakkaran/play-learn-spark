class AppConstants {
  // Shared Preferences Keys
  static const String keyFirstLaunch = 'first_launch';
  static const String keyCurrentStudentId = 'current_student_id';
  static const String keyLanguage = 'language';
  static const String keySoundEnabled = 'sound_enabled';
  static const String keyMusicEnabled = 'music_enabled';
  static const String keyThemeMode = 'theme_mode';
  
  // Animation Durations
  static const int splashDuration = 2000; // milliseconds
  static const int transitionDuration = 300;
  static const int feedbackDuration = 2000;
  
  // Activity Categories
  static const List<String> activityCategories = [
    'english',
    'math',
    'science',
    'art',
    'social',
    'physical',
    'world',
    'languages',
  ];
  
  // Badge Categories
  static const List<String> badgeCategories = [
    'english',
    'math',
    'milestone',
  ];
}
