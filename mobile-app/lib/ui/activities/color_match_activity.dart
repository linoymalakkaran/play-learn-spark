import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class ColorMatchActivity extends BaseActivity {
  const ColorMatchActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<ColorMatchActivity> createState() => _ColorMatchActivityState();
}

class _ColorMatchActivityState extends BaseActivityState<ColorMatchActivity> {
  final List<ColorItem> _colors = [
    ColorItem(name: 'Red', color: Colors.red),
    ColorItem(name: 'Blue', color: Colors.blue),
    ColorItem(name: 'Green', color: Colors.green),
    ColorItem(name: 'Yellow', color: Colors.yellow),
    ColorItem(name: 'Orange', color: Colors.orange),
    ColorItem(name: 'Purple', color: Colors.purple),
    ColorItem(name: 'Pink', color: Colors.pink),
    ColorItem(name: 'Brown', color: Colors.brown),
  ];

  late ColorItem _currentColor;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentColor = _colors[random.nextInt(_colors.length)];

    // Generate options
    final wrongColors = _colors.where((c) => c != _currentColor).toList()
      ..shuffle();
    _options = [
      _currentColor.name,
      wrongColors[0].name,
      wrongColors[1].name,
    ]..shuffle();
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentColor.name) {
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
            colors: [Colors.cyan.shade100, Colors.teal.shade100],
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
                  'What color is this?',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Color display
                Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    color: _currentColor.color,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),

                // Answer options
                ..._options.map((name) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(name),
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
                            name,
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

class ColorItem {
  final String name;
  final Color color;

  ColorItem({
    required this.name,
    required this.color,
  });
}
