import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class PhysicalFunActivity extends BaseActivity {
  const PhysicalFunActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<PhysicalFunActivity> createState() => _PhysicalFunActivityState();
}

class _PhysicalFunActivityState extends BaseActivityState<PhysicalFunActivity> {
  final List<PhysicalExercise> _exercises = [
    PhysicalExercise(
      name: 'Jump',
      emoji: '🦘',
      instruction: 'Jump up and down 5 times!',
      benefit: 'Strengthens legs',
    ),
    PhysicalExercise(
      name: 'Clap',
      emoji: '👏',
      instruction: 'Clap your hands 10 times!',
      benefit: 'Improves coordination',
    ),
    PhysicalExercise(
      name: 'Touch Toes',
      emoji: '🤸',
      instruction: 'Bend and touch your toes!',
      benefit: 'Increases flexibility',
    ),
    PhysicalExercise(
      name: 'Spin',
      emoji: '🌀',
      instruction: 'Spin around 3 times!',
      benefit: 'Improves balance',
    ),
    PhysicalExercise(
      name: 'March',
      emoji: '🚶',
      instruction: 'March in place for 10 steps!',
      benefit: 'Builds endurance',
    ),
    PhysicalExercise(
      name: 'Reach Up',
      emoji: '🙆',
      instruction: 'Reach your arms up high!',
      benefit: 'Stretches muscles',
    ),
  ];

  late PhysicalExercise _currentExercise;
  bool _hasCompleted = false;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    _generateExercise();
  }

  @override
  void generateNewQuestion() {
    // Physical fun uses its own exercise generation
    _generateExercise();
  }

  void _generateExercise() {
    final random = Random();
    _currentExercise = _exercises[random.nextInt(_exercises.length)];
    _hasCompleted = false;
  }

  void _handleComplete() {
    if (!_hasCompleted) {
      _hasCompleted = true;
      onCorrectAnswer();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.activity.title),
        backgroundColor: Colors.green.shade600,
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
            colors: [Colors.green.shade100, Colors.lime.shade50],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  const Text(
                    '🏃 Physical Fun!',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 24),
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
                          _currentExercise.emoji,
                          style: const TextStyle(fontSize: 80),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _currentExercise.name,
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _currentExercise.instruction,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '💪 ${_currentExercise.benefit}',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey.shade700,
                            fontStyle: FontStyle.italic,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _handleComplete,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 4,
                      ),
                      child: const Text(
                        'I Did It! ✓',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class PhysicalExercise {
  final String name;
  final String emoji;
  final String instruction;
  final String benefit;

  PhysicalExercise({
    required this.name,
    required this.emoji,
    required this.instruction,
    required this.benefit,
  });
}
