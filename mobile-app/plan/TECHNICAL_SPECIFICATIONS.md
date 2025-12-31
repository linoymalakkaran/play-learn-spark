# Technical Specifications - Play & Learn Spark Mobile App

## Flutter App Configuration

### Target Platforms
- **Android**: API Level 23+ (Android 6.0 Marshmallow)
- **iOS**: iOS 12.0+

### Flutter Version
- Flutter SDK: 3.19.0 or higher
- Dart: 3.3.0 or higher

## Dependencies

### Core Dependencies
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # UI & Animations
  flutter_animate: ^4.5.0
  lottie: ^3.1.0
  cached_network_image: ^3.3.1
  flutter_svg: ^2.0.10
  
  # State Management
  provider: ^6.1.2
  riverpod: ^2.5.1
  
  # Database & Storage
  sqflite: ^2.3.2
  path_provider: ^2.1.2
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # Localization
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0
  
  # Audio
  audioplayers: ^6.0.0
  just_audio: ^0.9.37
  
  # Device Features
  permission_handler: ^11.3.0
  package_info_plus: ^5.0.1
  device_info_plus: ^10.1.0
  
  # Utilities
  uuid: ^4.3.3
  equatable: ^2.0.5
  collection: ^1.18.0
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  mockito: ^5.4.4
  integration_test:
    sdk: flutter
```

## Database Schema (SQLite)

### Tables

#### 1. students
```sql
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK(age >= 3 AND age <= 6),
  avatar TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  preferences TEXT, -- JSON: {difficultyLevel, learningStyle, interests[]}
  is_active INTEGER DEFAULT 1
);
```

#### 2. progress
```sql
CREATE TABLE progress (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  total_activities_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  english_level INTEGER DEFAULT 1,
  math_level INTEGER DEFAULT 1,
  last_activity_date INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

#### 3. badges
```sql
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'english', 'math', 'milestone'
  date_earned INTEGER NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

#### 4. activities
```sql
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  difficulty_level INTEGER NOT NULL,
  icon TEXT NOT NULL,
  background_color TEXT NOT NULL,
  content_data TEXT, -- JSON with activity-specific data
  is_premium INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0
);
```

#### 5. activity_results
```sql
CREATE TABLE activity_results (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  time_spent INTEGER NOT NULL, -- seconds
  completed_at INTEGER NOT NULL,
  accuracy REAL, -- 0.0 to 1.0
  attempts INTEGER DEFAULT 1,
  performance_data TEXT, -- JSON with detailed metrics
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
```

#### 6. daily_sessions
```sql
CREATE TABLE daily_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date INTEGER NOT NULL, -- Unix timestamp (day start)
  activities_count INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- seconds
  points_earned INTEGER DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, date)
);
```

#### 7. content_assets
```sql
CREATE TABLE content_assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'image', 'audio', 'video'
  category TEXT NOT NULL,
  file_name TEXT NOT NULL,
  remote_url TEXT,
  local_path TEXT,
  file_size INTEGER,
  is_downloaded INTEGER DEFAULT 0,
  last_accessed INTEGER,
  created_at INTEGER NOT NULL
);
```

## Local Data Models

### Student Model
```dart
class Student {
  final String id;
  final String name;
  final int age;
  final String? avatar;
  final DateTime createdAt;
  final DateTime updatedAt;
  final StudentPreferences? preferences;
  final bool isActive;
}

class StudentPreferences {
  final int? difficultyLevel;
  final LearningStyle? learningStyle;
  final List<String>? interests;
}

enum LearningStyle { visual, auditory, kinesthetic, mixed }
```

### Activity Model
```dart
class Activity {
  final String id;
  final String title;
  final String description;
  final ActivityCategory category;
  final String subcategory;
  final int minAge;
  final int maxAge;
  final int estimatedDuration;
  final int difficultyLevel;
  final String icon;
  final String backgroundColor;
  final Map<String, dynamic>? contentData;
  final bool isPremium;
}

enum ActivityCategory {
  english, math, science, habits, art, 
  social, problem, physical, world, languages
}
```

### Progress Model
```dart
class StudentProgress {
  final String id;
  final String studentId;
  final int totalActivitiesCompleted;
  final int currentStreak;
  final int totalScore;
  final int englishLevel;
  final int mathLevel;
  final DateTime? lastActivityDate;
}
```

## App State Management

### Provider Architecture

```dart
// Main providers
- StudentProvider: Current student, profile management
- ProgressProvider: Progress tracking, statistics
- ActivityProvider: Activities list, filtering
- ThemeProvider: App theme, colors
- LocaleProvider: Language, translations
- AudioProvider: Sound effects, background music
```

## Asset Structure

```
assets/
├── images/
│   ├── icons/
│   │   ├── activities/
│   │   ├── badges/
│   │   └── ui/
│   ├── backgrounds/
│   ├── characters/
│   └── decorations/
├── audio/
│   ├── sounds/
│   │   ├── success.mp3
│   │   ├── tap.mp3
│   │   └── celebration.mp3
│   ├── music/
│   │   └── background.mp3
│   └── voice/
│       ├── en/
│       ├── ml/
│       └── ar/
├── animations/
│   └── lottie/
│       ├── loading.json
│       ├── success.json
│       └── confetti.json
└── fonts/
    ├── Nunito/
    └── NotoSans/
```

## Navigation Structure

```dart
// Route structure
/splash
/onboarding
/student-setup
/home (main dashboard)
  ├── /activities
  │   └── /activity/:id
  ├── /progress
  ├── /achievements
  ├── /settings
  └── /profile
```

## Performance Targets

- **Cold Start**: < 3 seconds
- **Activity Load**: < 1 second
- **Database Query**: < 100ms
- **Animation FPS**: 60fps
- **Memory Usage**: < 200MB
- **APK Size**: < 50MB (before assets)
- **Battery Impact**: Minimal (no background services)

## Localization Strategy

### Supported Languages
1. English (en)
2. Malayalam (ml)
3. Arabic (ar) - RTL support

### Translation Files
```dart
// lib/l10n/
app_en.arb
app_ml.arb
app_ar.arb
```

## Security Considerations

- No sensitive data stored (it's educational content)
- Local database encryption optional
- No network calls except for static assets
- No user authentication required
- Parental controls consideration for future

## Testing Strategy

### Unit Tests
- Database operations
- Business logic
- State management
- Utility functions

### Widget Tests
- UI components
- User interactions
- Navigation flows

### Integration Tests
- Complete user journeys
- Activity completion flows
- Progress tracking

## Build Configuration

### Android
```gradle
minSdkVersion: 23
targetSdkVersion: 34
compileSdkVersion: 34
```

### iOS
```
iOS Deployment Target: 12.0
Swift Version: 5.0
```

## Offline-First Strategy

1. **All Activities**: Pre-bundled in app
2. **Core Assets**: Included in APK/IPA
3. **Optional Content**: Can be downloaded on-demand
4. **No API Dependencies**: Fully functional without internet

## Future Enhancements

- Cloud sync (optional)
- Parent dashboard (web portal)
- More activities via updates
- Premium content (IAP)
- Social features (controlled)
- Advanced analytics

---

**Version**: 1.0  
**Last Updated**: 2025-12-31
