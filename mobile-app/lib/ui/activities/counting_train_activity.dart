import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class CountingTrainActivity extends BaseActivity {
  const CountingTrainActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<CountingTrainActivity> createState() => _CountingTrainActivityState();
}

class _CountingTrainActivityState extends BaseActivityState<CountingTrainActivity> {
  late int _targetNumber;
  late List<int> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    generateNewQuestion();
  }

  @override


  void generateNewQuestion() {


    setState(() {
    final random = Random();
    _targetNumber = random.nextInt(10) + 1; // 1-10

    // Generate wrong options
    final wrongNumbers = <int>[];
    while (wrongNumbers.length < 2) {
      final num = random.nextInt(10) + 1;
      if (num != _targetNumber && !wrongNumbers.contains(num)) {
        wrongNumbers.add(num);
      }
    }

    _options = [_targetNumber, ...wrongNumbers]..shuffle();
    }); // setState
  }

  void _handleAnswer(int selectedNumber) {
    if (selectedNumber == _targetNumber) {
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
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
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
            colors: [Colors.orange.shade100, Colors.red.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Instructions
                const Text(
                  'Count the objects!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Objects to count
                Container(
                  padding: const EdgeInsets.all(24),
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
                  child: Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    alignment: WrapAlignment.center,
                    children: List.generate(
                      _targetNumber,
                      (index) => const Text(
                        '🚂',
                        style: TextStyle(fontSize: 40),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 48),

                // Answer options
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: _options.map((number) {
                    return GestureDetector(
                      onTap: () => _handleAnswer(number),
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            number.toString(),
                            style: TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
