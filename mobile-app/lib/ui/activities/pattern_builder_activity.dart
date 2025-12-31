import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class PatternBuilderActivity extends BaseActivity {
  const PatternBuilderActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<PatternBuilderActivity> createState() => _PatternBuilderActivityState();
}

class _PatternBuilderActivityState extends BaseActivityState<PatternBuilderActivity> {
  final List<String> _shapes = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
  late List<String> _pattern;
  late String _missingShape;
  late int _missingIndex;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    generateNewQuestion();
  }

  @override


  void generateNewQuestion() {


    setState(() {
    final random = Random();
    final patternLength = 4;
    final baseShape = _shapes[random.nextInt(_shapes.length)];
    
    // Create simple AB pattern
    _pattern = List.generate(patternLength, (index) {
      return index % 2 == 0 ? baseShape : _shapes[(random.nextInt(_shapes.length))];
    });

    _missingIndex = random.nextInt(patternLength);
    _missingShape = _pattern[_missingIndex];

    // Generate options
    final wrongShapes = _shapes.where((s) => s != _missingShape).toList()..shuffle();
    _options = [_missingShape, wrongShapes[0], wrongShapes[1]]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedShape) {
    if (selectedShape == _missingShape) {
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
            colors: [Colors.pink.shade100, Colors.orange.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Complete the pattern!',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
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
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(_pattern.length, (index) {
                      return Text(
                        index == _missingIndex ? '❓' : _pattern[index],
                        style: const TextStyle(fontSize: 50),
                      );
                    }),
                  ),
                ),
                const SizedBox(height: 48),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: _options.map((shape) {
                    return GestureDetector(
                      onTap: () => _handleAnswer(shape),
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
                          child: Text(shape, style: const TextStyle(fontSize: 40)),
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
