# Phase 1: Project Setup & Database Design

**Duration**: 2-3 days  
**Status**: Not Started

## Objectives

1. Initialize Flutter project with proper configuration
2. Set up project structure and folder organization
3. Implement SQLite database with all tables
4. Create data models and repositories
5. Set up state management (Provider/Riverpod)
6. Configure build settings for Android & iOS

## Steps

### Step 1.1: Create Flutter Project

**File**: Setup script

```bash
# Create new Flutter project
flutter create --org com.playlearnspark --project-name play_learn_spark play_learn_spark

# Navigate to project
cd play_learn_spark

# Add dependencies
flutter pub add sqflite path_provider shared_preferences provider uuid intl flutter_animate lottie audioplayers just_audio permission_handler

# Add dev dependencies
flutter pub add --dev flutter_lints mockito integration_test
```

**Deliverable**: Basic Flutter project structure

---

### Step 1.2: Configure Project Structure

**Create folder structure**:

```
lib/
├── main.dart
├── app.dart
├── config/
│   ├── app_config.dart
│   ├── theme_config.dart
│   └── database_config.dart
├── core/
│   ├── constants/
│   │   ├── app_constants.dart
│   │   ├── colors.dart
│   │   └── dimensions.dart
│   ├── utils/
│   │   ├── date_utils.dart
│   │   └── string_utils.dart
│   └── errors/
│       └── exceptions.dart
├── data/
│   ├── models/
│   │   ├── student_model.dart
│   │   ├── activity_model.dart
│   │   ├── progress_model.dart
│   │   ├── badge_model.dart
│   │   └── activity_result_model.dart
│   ├── repositories/
│   │   ├── student_repository.dart
│   │   ├── activity_repository.dart
│   │   ├── progress_repository.dart
│   │   └── content_repository.dart
│   └── database/
│       ├── database_helper.dart
│       ├── tables/
│       │   ├── students_table.dart
│       │   ├── activities_table.dart
│       │   ├── progress_table.dart
│       │   ├── badges_table.dart
│       │   └── activity_results_table.dart
│       └── seeds/
│           └── initial_activities.dart
├── providers/
│   ├── student_provider.dart
│   ├── activity_provider.dart
│   ├── progress_provider.dart
│   └── theme_provider.dart
├── ui/
│   ├── screens/
│   │   ├── splash_screen.dart
│   │   ├── onboarding/
│   │   ├── student_setup/
│   │   ├── home/
│   │   ├── activities/
│   │   ├── progress/
│   │   └── settings/
│   ├── widgets/
│   │   ├── common/
│   │   ├── buttons/
│   │   ├── cards/
│   │   └── animations/
│   └── theme/
│       ├── app_theme.dart
│       └── text_styles.dart
└── l10n/
    ├── app_en.arb
    ├── app_ml.arb
    └── app_ar.arb
```

**Deliverable**: Organized folder structure

---

### Step 1.3: Implement Database Helper

**File**: `lib/data/database/database_helper.dart`

```dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('play_learn_spark.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Create students table
    await db.execute('''
      CREATE TABLE students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL CHECK(age >= 3 AND age <= 6),
        avatar TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        preferences TEXT,
        is_active INTEGER DEFAULT 1
      )
    ''');

    // Create progress table
    await db.execute('''
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
      )
    ''');

    // Create badges table
    await db.execute('''
      CREATE TABLE badges (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        date_earned INTEGER NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    ''');

    // Create activities table
    await db.execute('''
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
        content_data TEXT,
        is_premium INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0
      )
    ''');

    // Create activity_results table
    await db.execute('''
      CREATE TABLE activity_results (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        time_spent INTEGER NOT NULL,
        completed_at INTEGER NOT NULL,
        accuracy REAL,
        attempts INTEGER DEFAULT 1,
        performance_data TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
      )
    ''');

    // Create daily_sessions table
    await db.execute('''
      CREATE TABLE daily_sessions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        date INTEGER NOT NULL,
        activities_count INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        points_earned INTEGER DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(student_id, date)
      )
    ''');

    // Create content_assets table
    await db.execute('''
      CREATE TABLE content_assets (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        file_name TEXT NOT NULL,
        remote_url TEXT,
        local_path TEXT,
        file_size INTEGER,
        is_downloaded INTEGER DEFAULT 0,
        last_accessed INTEGER,
        created_at INTEGER NOT NULL
      )
    ''');

    // Create indexes for better query performance
    await db.execute('CREATE INDEX idx_student_active ON students(is_active)');
    await db.execute('CREATE INDEX idx_progress_student ON progress(student_id)');
    await db.execute('CREATE INDEX idx_badges_student ON badges(student_id)');
    await db.execute('CREATE INDEX idx_results_student ON activity_results(student_id)');
    await db.execute('CREATE INDEX idx_results_activity ON activity_results(activity_id)');
  }

  Future<void> _upgradeDB(Database db, int oldVersion, int newVersion) async {
    // Handle database upgrades here
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}
```

**Deliverable**: Working database with all tables

---

### Step 1.4: Create Data Models

**File**: `lib/data/models/student_model.dart`

```dart
import 'dart:convert';

enum LearningStyle { visual, auditory, kinesthetic, mixed }

class Student {
  final String id;
  final String name;
  final int age;
  final String? avatar;
  final DateTime createdAt;
  final DateTime updatedAt;
  final StudentPreferences? preferences;
  final bool isActive;

  Student({
    required this.id,
    required this.name,
    required this.age,
    this.avatar,
    required this.createdAt,
    required this.updatedAt,
    this.preferences,
    this.isActive = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'age': age,
      'avatar': avatar,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
      'preferences': preferences?.toJson(),
      'is_active': isActive ? 1 : 0,
    };
  }

  factory Student.fromMap(Map<String, dynamic> map) {
    return Student(
      id: map['id'],
      name: map['name'],
      age: map['age'],
      avatar: map['avatar'],
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at']),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updated_at']),
      preferences: map['preferences'] != null
          ? StudentPreferences.fromJson(map['preferences'])
          : null,
      isActive: map['is_active'] == 1,
    );
  }

  Student copyWith({
    String? name,
    int? age,
    String? avatar,
    StudentPreferences? preferences,
    bool? isActive,
  }) {
    return Student(
      id: id,
      name: name ?? this.name,
      age: age ?? this.age,
      avatar: avatar ?? this.avatar,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      preferences: preferences ?? this.preferences,
      isActive: isActive ?? this.isActive,
    );
  }
}

class StudentPreferences {
  final int? difficultyLevel;
  final LearningStyle? learningStyle;
  final List<String>? interests;

  StudentPreferences({
    this.difficultyLevel,
    this.learningStyle,
    this.interests,
  });

  String toJson() => json.encode({
        'difficultyLevel': difficultyLevel,
        'learningStyle': learningStyle?.toString().split('.').last,
        'interests': interests,
      });

  factory StudentPreferences.fromJson(String str) {
    final map = json.decode(str);
    return StudentPreferences(
      difficultyLevel: map['difficultyLevel'],
      learningStyle: map['learningStyle'] != null
          ? LearningStyle.values.firstWhere(
              (e) => e.toString().split('.').last == map['learningStyle'])
          : null,
      interests: List<String>.from(map['interests'] ?? []),
    );
  }
}
```

**Additional Models**: Create similar files for:
- `activity_model.dart`
- `progress_model.dart`
- `badge_model.dart`
- `activity_result_model.dart`

**Deliverable**: All data models implemented

---

### Step 1.5: Implement Repositories

**File**: `lib/data/repositories/student_repository.dart`

```dart
import '../database/database_helper.dart';
import '../models/student_model.dart';

class StudentRepository {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<String> createStudent(Student student) async {
    final db = await _dbHelper.database;
    await db.insert('students', student.toMap());
    return student.id;
  }

  Future<Student?> getStudent(String id) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'students',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;
    return Student.fromMap(maps.first);
  }

  Future<List<Student>> getAllStudents() async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'students',
      where: 'is_active = ?',
      whereArgs: [1],
      orderBy: 'created_at DESC',
    );

    return maps.map((map) => Student.fromMap(map)).toList();
  }

  Future<int> updateStudent(Student student) async {
    final db = await _dbHelper.database;
    return await db.update(
      'students',
      student.toMap(),
      where: 'id = ?',
      whereArgs: [student.id],
    );
  }

  Future<int> deleteStudent(String id) async {
    final db = await _dbHelper.database;
    return await db.update(
      'students',
      {'is_active': 0, 'updated_at': DateTime.now().millisecondsSinceEpoch},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<Student?> getActiveStudent() async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'students',
      where: 'is_active = ?',
      whereArgs: [1],
      orderBy: 'updated_at DESC',
      limit: 1,
    );

    if (maps.isEmpty) return null;
    return Student.fromMap(maps.first);
  }
}
```

**Additional Repositories**: Create similar files for:
- `activity_repository.dart`
- `progress_repository.dart`
- `badge_repository.dart`

**Deliverable**: All repositories implemented

---

### Step 1.6: Seed Initial Activities Data

**File**: `lib/data/database/seeds/initial_activities.dart`

```dart
import 'package:uuid/uuid.dart';
import '../../models/activity_model.dart';

class InitialActivities {
  static final _uuid = Uuid();

  static List<Activity> getActivities() {
    return [
      Activity(
        id: _uuid.v4(),
        title: 'Animal Safari',
        description: 'Learn about different animals and their sounds',
        category: ActivityCategory.world,
        subcategory: 'animals',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 10,
        difficultyLevel: 1,
        icon: 'assets/icons/activities/animal.svg',
        backgroundColor: '#FFE5B4',
        isPremium: false,
      ),
      Activity(
        id: _uuid.v4(),
        title: 'Body Parts',
        description: 'Learn the names of body parts',
        category: ActivityCategory.science,
        subcategory: 'body',
        minAge: 3,
        maxAge: 5,
        estimatedDuration: 8,
        difficultyLevel: 1,
        icon: 'assets/icons/activities/body.svg',
        backgroundColor: '#FFD4D4',
        isPremium: false,
      ),
      Activity(
        id: _uuid.v4(),
        title: 'Color Rainbow',
        description: 'Explore colors and create beautiful rainbows',
        category: ActivityCategory.art,
        subcategory: 'colors',
        minAge: 3,
        maxAge: 5,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: 'assets/icons/activities/rainbow.svg',
        backgroundColor: '#E6F7FF',
        isPremium: false,
      ),
      Activity(
        id: _uuid.v4(),
        title: 'Counting Train',
        description: 'Count objects and learn numbers 1-10',
        category: ActivityCategory.math,
        subcategory: 'counting',
        minAge: 3,
        maxAge: 5,
        estimatedDuration: 10,
        difficultyLevel: 1,
        icon: 'assets/icons/activities/train.svg',
        backgroundColor: '#FFF4E6',
        isPremium: false,
      ),
      Activity(
        id: _uuid.v4(),
        title: 'Emotion Faces',
        description: 'Learn to identify different emotions',
        category: ActivityCategory.social,
        subcategory: 'emotions',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 10,
        difficultyLevel: 2,
        icon: 'assets/icons/activities/emoji.svg',
        backgroundColor: '#FFF0E6',
        isPremium: false,
      ),
      // Add 10+ more activities...
    ];
  }

  static Future<void> seedActivities(database) async {
    final activities = getActivities();
    for (final activity in activities) {
      await database.insert('activities', activity.toMap());
    }
  }
}
```

**Deliverable**: Initial activities seeded in database

---

### Step 1.7: Set Up State Management

**File**: `lib/providers/student_provider.dart`

```dart
import 'package:flutter/foundation.dart';
import '../data/models/student_model.dart';
import '../data/repositories/student_repository.dart';
import 'package:uuid/uuid.dart';

class StudentProvider with ChangeNotifier {
  final StudentRepository _repository = StudentRepository();
  final _uuid = Uuid();

  Student? _currentStudent;
  List<Student> _students = [];
  bool _isLoading = false;

  Student? get currentStudent => _currentStudent;
  List<Student> get students => _students;
  bool get isLoading => _isLoading;
  bool get hasStudent => _currentStudent != null;

  Future<void> loadStudents() async {
    _isLoading = true;
    notifyListeners();

    try {
      _students = await _repository.getAllStudents();
      if (_students.isNotEmpty) {
        _currentStudent = await _repository.getActiveStudent();
      }
    } catch (e) {
      debugPrint('Error loading students: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createStudent(String name, int age, String? avatar) async {
    final student = Student(
      id: _uuid.v4(),
      name: name,
      age: age,
      avatar: avatar,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    await _repository.createStudent(student);
    _currentStudent = student;
    _students.add(student);
    notifyListeners();
  }

  Future<void> updateStudent(Student student) async {
    await _repository.updateStudent(student);
    _currentStudent = student;
    final index = _students.indexWhere((s) => s.id == student.id);
    if (index != -1) {
      _students[index] = student;
    }
    notifyListeners();
  }

  Future<void> switchStudent(String studentId) async {
    final student = await _repository.getStudent(studentId);
    if (student != null) {
      _currentStudent = student;
      notifyListeners();
    }
  }

  Future<void> deleteStudent(String studentId) async {
    await _repository.deleteStudent(studentId);
    _students.removeWhere((s) => s.id == studentId);
    if (_currentStudent?.id == studentId) {
      _currentStudent = _students.isNotEmpty ? _students.first : null;
    }
    notifyListeners();
  }
}
```

**Additional Providers**: Create similar files for:
- `activity_provider.dart`
- `progress_provider.dart`
- `theme_provider.dart`

**Deliverable**: State management setup complete

---

### Step 1.8: Configure App Entry Point

**File**: `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'providers/student_provider.dart';
import 'providers/activity_provider.dart';
import 'providers/progress_provider.dart';
import 'providers/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => StudentProvider()),
        ChangeNotifierProvider(create: (_) => ActivityProvider()),
        ChangeNotifierProvider(create: (_) => ProgressProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const PlayLearnSparkApp(),
    ),
  );
}
```

**File**: `lib/app.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'ui/screens/splash_screen.dart';
import 'ui/theme/app_theme.dart';
import 'providers/theme_provider.dart';

class PlayLearnSparkApp extends StatelessWidget {
  const PlayLearnSparkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'Play & Learn Spark',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeProvider.themeMode,
          home: const SplashScreen(),
        );
      },
    );
  }
}
```

**Deliverable**: App entry point configured

---

### Step 1.9: Configure Android & iOS Build Settings

**Android Configuration** (`android/app/build.gradle`):

```gradle
android {
    namespace "com.playlearnspark.play_learn_spark"
    compileSdk 34

    defaultConfig {
        applicationId "com.playlearnspark.play_learn_spark"
        minSdk 23
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

**iOS Configuration** (`ios/Runner/Info.plist`):

Add required permissions and configurations.

**Deliverable**: Build configurations completed

---

## Testing & Verification

### Unit Tests

**File**: `test/database_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:play_learn_spark/data/database/database_helper.dart';

void main() {
  test('Database initialization test', () async {
    final db = await DatabaseHelper.instance.database;
    expect(db, isNotNull);
    expect(db.isOpen, true);
  });

  test('Student CRUD operations', () async {
    // Test create, read, update, delete
  });
}
```

---

## Phase 1 Completion Checklist

- [ ] Flutter project created
- [ ] Folder structure organized
- [ ] Database helper implemented
- [ ] All tables created with indexes
- [ ] All data models created
- [ ] All repositories implemented
- [ ] Initial activities seeded
- [ ] State management configured
- [ ] App entry point setup
- [ ] Build configurations completed
- [ ] Unit tests written
- [ ] App runs successfully on emulator/device

## Next Steps

Once Phase 1 is complete, proceed to **Phase 2: Core UI & Navigation**.

---

**Notes**: 
- Test database operations thoroughly
- Ensure all models have proper serialization
- Verify state management updates UI correctly
