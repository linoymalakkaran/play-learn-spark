import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class DailyRoutineActivity extends BaseActivity {
  const DailyRoutineActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<DailyRoutineActivity> createState() => _DailyRoutineActivityState();
}

class _DailyRoutineActivityState extends BaseActivityState<DailyRoutineActivity> {
  final List<RoutineItem> _routines = [
    RoutineItem(activity: 'Wake up', time: 'Morning', emoji: '🌅'),
    RoutineItem(activity: 'Breakfast', time: 'Morning', emoji: '🍳'),
    RoutineItem(activity: 'Play time', time: 'Afternoon', emoji: '🎮'),
    RoutineItem(activity: 'Lunch', time: 'Afternoon', emoji: '🍱'),
    RoutineItem(activity: 'Dinner', time: 'Evening', emoji: '🍽️'),
    RoutineItem(activity: 'Bedtime', time: 'Night', emoji: '🌙'),
  ];

  late RoutineItem _currentRoutine;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentRoutine = _routines[random.nextInt(_routines.length)];
    
    final times = ['Morning', 'Afternoon', 'Evening', 'Night'].toSet();
    times.remove(_currentRoutine.time);
    final wrongTimes = times.toList()..shuffle();
    
    _options = [
      _currentRoutine.time,
      wrongTimes[0],
      wrongTimes[1],
    ]..shuffle();
  }

  void _handleAnswer(String selectedTime) {
    if (selectedTime == _currentRoutine.time) {
      onCorrectAnswer();
    } else {
      onIncorrectAnswer();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.activity.title),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                '${currentQuestion + 1}/$totalQuestions',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.amber.shade100, Colors.orange.shade200],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'When do we do this?',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        _currentRoutine.emoji,
                        style: const TextStyle(fontSize: 80),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _currentRoutine.activity,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                ..._options.map((time) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(time),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 4,
                          ),
                          child: Text(
                            time,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    )),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class RoutineItem {
  final String activity;
  final String time;
  final String emoji;

  RoutineItem({required this.activity, required this.time, required this.emoji});
}
