import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class LogicPuzzlesActivity extends BaseActivity {
  const LogicPuzzlesActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<LogicPuzzlesActivity> createState() => _LogicPuzzlesActivityState();
}

class _LogicPuzzlesActivityState extends BaseActivityState<LogicPuzzlesActivity> {
  final List<LogicPuzzle> _puzzles = [
    LogicPuzzle(
      question: 'What comes next? 🔴 🔵 🔴 🔵 ?',
      correctAnswer: '🔴',
      options: ['🔴', '🔵', '🟢'],
    ),
    LogicPuzzle(
      question: 'What comes next? 1, 2, 3, 4, ?',
      correctAnswer: '5',
      options: ['5', '6', '7'],
    ),
    LogicPuzzle(
      question: 'What comes next? 🌟 🌙 🌟 🌙 ?',
      correctAnswer: '🌟',
      options: ['🌟', '🌙', '☀️'],
    ),
    LogicPuzzle(
      question: 'What shape has 3 sides?',
      correctAnswer: 'Triangle',
      options: ['Triangle', 'Square', 'Circle'],
    ),
    LogicPuzzle(
      question: 'What comes next? Big, Small, Big, Small, ?',
      correctAnswer: 'Big',
      options: ['Big', 'Small', 'Medium'],
    ),
    LogicPuzzle(
      question: 'Which one is different? 🍎 🍎 🍌 🍎',
      correctAnswer: '🍌',
      options: ['🍌', '🍎', '🍇'],
    ),
  ];

  late LogicPuzzle _currentPuzzle;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentPuzzle = _puzzles[random.nextInt(_puzzles.length)];
  }

  void _handleAnswer(String selected) {
    if (selected == _currentPuzzle.correctAnswer) {
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
        backgroundColor: Colors.deepOrange.shade600,
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
            colors: [Colors.orange.shade100, Colors.yellow.shade50],
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
                    '🧩 Logic Puzzle',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 24),
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
                    child: Text(
                      _currentPuzzle.question,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._currentPuzzle.options.map((option) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(option),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.deepOrange.shade600,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              option,
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
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

class LogicPuzzle {
  final String question;
  final String correctAnswer;
  final List<String> options;

  LogicPuzzle({
    required this.question,
    required this.correctAnswer,
    required this.options,
  });
}
