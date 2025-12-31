import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class MathAdventureActivity extends BaseActivity {
  const MathAdventureActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<MathAdventureActivity> createState() => _MathAdventureActivityState();
}

class _MathAdventureActivityState extends BaseActivityState<MathAdventureActivity> {
  late MathProblem _currentProblem;
  late List<int> _options;

  @override
  void initializeActivity() {
    totalQuestions = 8;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    final a = random.nextInt(10) + 1;
    final b = random.nextInt(10) + 1;
    final operation = ['+', '-'][random.nextInt(2)];
    
    int answer;
    String question;
    
    if (operation == '+') {
      answer = a + b;
      question = '$a + $b = ?';
    } else {
      if (a < b) {
        answer = b - a;
        question = '$b - $a = ?';
      } else {
        answer = a - b;
        question = '$a - $b = ?';
      }
    }
    
    _currentProblem = MathProblem(question: question, answer: answer);
    
    _options = [
      answer,
      (answer - 1).clamp(0, 20),
      (answer + 1).clamp(0, 20),
    ].toSet().toList()..shuffle();
  }

  void _handleAnswer(int selected) {
    if (selected == _currentProblem.answer) {
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
        backgroundColor: Colors.deepPurple.shade700,
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
            colors: [Colors.purple.shade100, Colors.blue.shade100],
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
                    '🧮 Math Adventure',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(40),
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
                    child: Text(
                      _currentProblem.question,
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._options.map((number) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(number),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.deepPurple.shade700,
                              padding: const EdgeInsets.symmetric(vertical: 20),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              number.toString(),
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      )),
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

class MathProblem {
  final String question;
  final int answer;

  MathProblem({required this.question, required this.answer});
}
