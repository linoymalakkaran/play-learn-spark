# Phase 4: Learning Activities Implementation

**Duration**: 7-10 days  
**Status**: Not Started  
**Dependencies**: Phase 1-3 Complete

## Objectives

1. Implement activity framework and base classes
2. Create 15+ interactive learning activities
3. Build activity result tracking
4. Implement scoring and feedback systems
5. Add audio and animations
6. Create activity navigation

## Activity List (15+ Activities)

1. **Animal Safari** - Learn animal names and sounds
2. **Body Parts** - Identify body parts
3. **Color Rainbow** - Color recognition and matching
4. **Counting Train** - Count objects 1-10
5. **Emotion Faces** - Recognize emotions
6. **Family Tree** - Learn family relationships
7. **Number Garden** - Number recognition
8. **Shape Detective** - Shape identification
9. **Size Sorter** - Compare sizes
10. **Transportation** - Vehicle types
11. **Weather Station** - Weather concepts
12. **Pizza Fractions** - Basic fractions
13. **Pet Parade** - Pet care and responsibility
14. **Malayalam Learning** - Malayalam alphabet
15. **Arabic Learning** - Arabic alphabet

## Steps

### Step 4.1: Create Activity Base Classes

**File**: `lib/ui/screens/activities/base_activity.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/models/activity_model.dart';
import '../../../data/models/activity_result_model.dart';
import '../../../providers/progress_provider.dart';
import '../../../providers/student_provider.dart';
import 'package:uuid/uuid.dart';

abstract class BaseActivity extends StatefulWidget {
  final Activity activity;

  const BaseActivity({
    super.key,
    required this.activity,
  });
}

abstract class BaseActivityState<T extends BaseActivity> extends State<T> {
  final _uuid = Uuid();
  DateTime? _startTime;
  int _score = 0;
  int _totalQuestions = 0;
  int _correctAnswers = 0;

  @override
  void initState() {
    super.initState();
    _startTime = DateTime.now();
  }

  void incrementScore(int points) {
    setState(() {
      _score += points;
      _correctAnswers++;
    });
  }

  void incrementTotal() {
    setState(() {
      _totalQuestions++;
    });
  }

  double get accuracy =>
      _totalQuestions > 0 ? _correctAnswers / _totalQuestions : 0.0;

  Future<void> completeActivity() async {
    if (_startTime == null) return;

    final studentProvider = context.read<StudentProvider>();
    final progressProvider = context.read<ProgressProvider>();
    
    final student = studentProvider.currentStudent;
    if (student == null) return;

    final timeSpent =
        DateTime.now().difference(_startTime!).inSeconds;

    final result = ActivityResult(
      id: _uuid.v4(),
      studentId: student.id,
      activityId: widget.activity.id,
      score: _score,
      timeSpent: timeSpent,
      completedAt: DateTime.now(),
      accuracy: accuracy,
      attempts: 1,
    );

    await progressProvider.saveActivityResult(result);
    
    if (mounted) {
      _showCompletionDialog();
    }
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Well Done! 🎉'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'You scored $_score points!',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              'Accuracy: ${(accuracy * 100).toStringAsFixed(0)}%',
              style: const TextStyle(fontSize: 16),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Return to activities list
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  // Abstract method for building activity content
  Widget buildActivityContent();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.activity.title),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Center(
              child: Text(
                'Score: $_score',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
      body: buildActivityContent(),
    );
  }
}
```

**Deliverable**: Activity framework

---

### Step 4.2: Implement Sample Activity - Counting Train

**File**: `lib/ui/screens/activities/counting_train_activity.dart`

```dart
import 'package:flutter/material.dart';
import 'dart:math';
import 'base_activity.dart';
import '../../../data/models/activity_model.dart';

class CountingTrainActivity extends BaseActivity {
  const CountingTrainActivity({
    super.key,
    required super.activity,
  });

  @override
  State<CountingTrainActivity> createState() => _CountingTrainActivityState();
}

class _CountingTrainActivityState
    extends BaseActivityState<CountingTrainActivity> {
  int _currentLevel = 1;
  int _targetNumber = 0;
  List<String> _objects = [];
  final _random = Random();

  final List<String> _emojis = ['🍎', '⚽', '🌟', '🐶', '🎈'];

  @override
  void initState() {
    super.initState();
    _generateQuestion();
  }

  void _generateQuestion() {
    setState(() {
      _targetNumber = _random.nextInt(10) + 1; // 1-10
      final emoji = _emojis[_random.nextInt(_emojis.length)];
      _objects = List.generate(_targetNumber, (_) => emoji);
    });
  }

  void _checkAnswer(int answer) {
    incrementTotal();
    
    if (answer == _targetNumber) {
      incrementScore(10);
      _showFeedback(true);
    } else {
      _showFeedback(false);
    }

    Future.delayed(const Duration(seconds: 2), () {
      if (_currentLevel < 10) {
        setState(() {
          _currentLevel++;
        });
        _generateQuestion();
      } else {
        completeActivity();
      }
    });
  }

  void _showFeedback(bool correct) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: correct ? Colors.green[100] : Colors.red[100],
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              correct ? '🎉 Correct!' : '❌ Try Again!',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
            ),
            if (!correct) ...[
              const SizedBox(height: 8),
              Text(
                'The answer was $_targetNumber',
                style: const TextStyle(fontSize: 16),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget buildActivityContent() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Level Indicator
          Text(
            'Level $_currentLevel of 10',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 24),
          
          // Question
          const Text(
            'How many objects do you see?',
            style: TextStyle(fontSize: 20),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          
          // Objects Display
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(16),
            ),
            child: Wrap(
              spacing: 16,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: _objects
                  .map((obj) => Text(obj, style: const TextStyle(fontSize: 40)))
                  .toList(),
            ),
          ),
          const SizedBox(height: 32),
          
          // Answer Buttons
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: List.generate(10, (index) {
              final number = index + 1;
              return ElevatedButton(
                onPressed: () => _checkAnswer(number),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(60, 60),
                  shape: const CircleBorder(),
                ),
                child: Text(
                  '$number',
                  style: const TextStyle(fontSize: 24),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
```

**Deliverable**: Counting Train activity

---

### Step 4.3: Implement Color Rainbow Activity

**File**: `lib/ui/screens/activities/color_rainbow_activity.dart`

```dart
import 'package:flutter/material.dart';
import 'dart:math';
import 'base_activity.dart';
import '../../../data/models/activity_model.dart';

class ColorRainbowActivity extends BaseActivity {
  const ColorRainbowActivity({
    super.key,
    required super.activity,
  });

  @override
  State<ColorRainbowActivity> createState() => _ColorRainbowActivityState();
}

class _ColorRainbowActivityState
    extends BaseActivityState<ColorRainbowActivity> {
  int _currentLevel = 1;
  String _targetColorName = '';
  Color _targetColor = Colors.red;
  List<ColorOption> _options = [];
  final _random = Random();

  final Map<String, Color> _colors = {
    'Red': Colors.red,
    'Blue': Colors.blue,
    'Green': Colors.green,
    'Yellow': Colors.yellow,
    'Orange': Colors.orange,
    'Purple': Colors.purple,
    'Pink': Colors.pink,
    'Brown': Colors.brown,
  };

  @override
  void initState() {
    super.initState();
    _generateQuestion();
  }

  void _generateQuestion() {
    final colorNames = _colors.keys.toList()..shuffle(_random);
    _targetColorName = colorNames.first;
    _targetColor = _colors[_targetColorName]!;

    // Generate 4 options (1 correct + 3 wrong)
    final options = <ColorOption>[];
    options.add(ColorOption(
      name: _targetColorName,
      color: _targetColor,
      isCorrect: true,
    ));

    while (options.length < 4) {
      final randomName = colorNames[_random.nextInt(colorNames.length)];
      if (!options.any((o) => o.name == randomName)) {
        options.add(ColorOption(
          name: randomName,
          color: _colors[randomName]!,
          isCorrect: false,
        ));
      }
    }

    setState(() {
      _options = options..shuffle(_random);
    });
  }

  void _checkAnswer(ColorOption selected) {
    incrementTotal();
    
    if (selected.isCorrect) {
      incrementScore(10);
      _showFeedback(true);
    } else {
      _showFeedback(false);
    }

    Future.delayed(const Duration(seconds: 2), () {
      if (_currentLevel < 10) {
        setState(() {
          _currentLevel++;
        });
        _generateQuestion();
      } else {
        completeActivity();
      }
    });
  }

  void _showFeedback(bool correct) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: correct ? Colors.green[100] : Colors.red[100],
        content: Text(
          correct ? '🎉 Correct!' : '❌ Try Again!',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  @override
  Widget buildActivityContent() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            'Level $_currentLevel of 10',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 24),
          
          const Text(
            'Which color is this?',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 32),
          
          // Color Display
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              color: _targetColor,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.black, width: 3),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 48),
          
          // Answer Options
          Wrap(
            spacing: 16,
            runSpacing: 16,
            alignment: WrapAlignment.center,
            children: _options.map((option) {
              return ElevatedButton(
                onPressed: () => _checkAnswer(option),
                style: ElevatedButton.styleFrom(
                  backgroundColor: option.color,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(140, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  option.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class ColorOption {
  final String name;
  final Color color;
  final bool isCorrect;

  ColorOption({
    required this.name,
    required this.color,
    required this.isCorrect,
  });
}
```

**Deliverable**: Color Rainbow activity

---

### Step 4.4: Activities List Screen

**File**: `lib/ui/screens/home/activities_tab.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/activity_provider.dart';
import '../../../providers/progress_provider.dart';
import '../../widgets/common/activity_card.dart';
import '../activities/counting_train_activity.dart';
import '../activities/color_rainbow_activity.dart';
// Import other activities...

class ActivitiesTab extends StatefulWidget {
  const ActivitiesTab({super.key});

  @override
  State<ActivitiesTab> createState() => _ActivitiesTabState();
}

class _ActivitiesTabState extends State<ActivitiesTab> {
  String _selectedCategory = 'all';

  @override
  Widget build(BuildContext context) {
    return Consumer2<ActivityProvider, ProgressProvider>(
      builder: (context, activityProvider, progressProvider, child) {
        final activities = _selectedCategory == 'all'
            ? activityProvider.activities
            : activityProvider.getActivitiesByCategory(_selectedCategory);

        return Scaffold(
          appBar: AppBar(
            title: const Text('Activities'),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(60),
              child: _buildCategoryFilter(),
            ),
          ),
          body: activities.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.85,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: activities.length,
                  itemBuilder: (context, index) {
                    final activity = activities[index];
                    final isCompleted =
                        progressProvider.isActivityCompleted(activity.id);

                    return ActivityCard(
                      activity: activity,
                      isCompleted: isCompleted,
                      onTap: () => _launchActivity(activity),
                    );
                  },
                ),
        );
      },
    );
  }

  Widget _buildCategoryFilter() {
    final categories = [
      {'id': 'all', 'label': 'All', 'icon': Icons.apps},
      {'id': 'math', 'label': 'Math', 'icon': Icons.calculate},
      {'id': 'english', 'label': 'English', 'icon': Icons.abc},
      {'id': 'art', 'label': 'Art', 'icon': Icons.palette},
      {'id': 'science', 'label': 'Science', 'icon': Icons.science},
    ];

    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = _selectedCategory == category['id'];

          return Padding(
            padding: const EdgeInsets.only(right: 8, bottom: 8),
            child: FilterChip(
              selected: isSelected,
              label: Row(
                children: [
                  Icon(
                    category['icon'] as IconData,
                    size: 16,
                  ),
                  const SizedBox(width: 4),
                  Text(category['label'] as String),
                ],
              ),
              onSelected: (selected) {
                setState(() {
                  _selectedCategory = category['id'] as String;
                });
              },
            ),
          );
        },
      ),
    );
  }

  void _launchActivity(activity) {
    Widget activityScreen;
    
    // Route to appropriate activity
    switch (activity.subcategory) {
      case 'counting':
        activityScreen = CountingTrainActivity(activity: activity);
        break;
      case 'colors':
        activityScreen = ColorRainbowActivity(activity: activity);
        break;
      // Add other activity routes...
      default:
        activityScreen = CountingTrainActivity(activity: activity);
    }

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => activityScreen),
    );
  }
}
```

**Deliverable**: Activities list with filtering

---

### Step 4.5: Create Remaining Activities

Create similar activity files for:

1. **animal_safari_activity.dart** - Matching animals to sounds
2. **body_parts_activity.dart** - Identifying body parts
3. **emotion_faces_activity.dart** - Recognizing emotions
4. **shape_detective_activity.dart** - Shape matching
5. **size_sorter_activity.dart** - Sorting by size
6. **number_garden_activity.dart** - Number recognition
7. **family_tree_activity.dart** - Family relationships
8. **transportation_activity.dart** - Vehicle types
9. **weather_station_activity.dart** - Weather concepts
10. **pizza_fractions_activity.dart** - Basic fractions
11. **malayalam_learning_activity.dart** - Malayalam alphabet
12. **arabic_learning_activity.dart** - Arabic alphabet

**Deliverable**: All 15+ activities implemented

---

## Activity Implementation Checklist

- [ ] Base activity framework created
- [ ] Counting Train activity complete
- [ ] Color Rainbow activity complete
- [ ] Animal Safari activity complete
- [ ] Body Parts activity complete
- [ ] Emotion Faces activity complete
- [ ] Shape Detective activity complete
- [ ] Size Sorter activity complete
- [ ] All 15+ activities functional
- [ ] Activity results saving correctly
- [ ] Score calculation working
- [ ] Completion feedback implemented
- [ ] Audio feedback added (optional)
- [ ] Animations smooth

## Next Steps

Proceed to **Phase 5: Progress Tracking & Gamification**.
