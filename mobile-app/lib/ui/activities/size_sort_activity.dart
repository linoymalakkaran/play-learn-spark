import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class SizeSortActivity extends BaseActivity {
  const SizeSortActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<SizeSortActivity> createState() => _SizeSortActivityState();
}

class _SizeSortActivityState extends BaseActivityState<SizeSortActivity> {
  final List<String> _objects = ['⚽', '🎈', '🍎', '⭐', '🌙'];
  late String _currentObject;
  late String _correctSize;
  late List<SizeOption> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentObject = _objects[random.nextInt(_objects.length)];
    
    _options = [
      SizeOption(label: 'Small', size: 40),
      SizeOption(label: 'Medium', size: 60),
      SizeOption(label: 'Big', size: 80),
    ];

    final correctIndex = random.nextInt(3);
    _correctSize = _options[correctIndex].label;
  }

  void _handleAnswer(String selectedSize) {
    if (selectedSize == _correctSize) {
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
            colors: [Colors.lime.shade100, Colors.teal.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Which one is $_correctSize?',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
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
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: _options.map((option) {
                      return GestureDetector(
                        onTap: () => _handleAnswer(option.label),
                        child: Column(
                          children: [
                            Text(
                              _currentObject,
                              style: TextStyle(fontSize: option.size),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              option.label,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class SizeOption {
  final String label;
  final double size;

  SizeOption({required this.label, required this.size});
}
