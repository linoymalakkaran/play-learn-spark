import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class ScienceLabActivity extends BaseActivity {
  const ScienceLabActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<ScienceLabActivity> createState() => _ScienceLabActivityState();
}

class _ScienceLabActivityState extends BaseActivityState<ScienceLabActivity> {
  final List<ScienceQuestion> _questions = [
    ScienceQuestion(
      question: 'Which planet do we live on?',
      correctAnswer: 'Earth',
      options: ['Earth', 'Mars', 'Moon'],
      emoji: '🌍',
    ),
    ScienceQuestion(
      question: 'What do plants need to grow?',
      correctAnswer: 'Sunlight',
      options: ['Sunlight', 'Toys', 'Music'],
      emoji: '🌱',
    ),
    ScienceQuestion(
      question: 'What is water made of?',
      correctAnswer: 'H2O',
      options: ['H2O', 'CO2', 'O2'],
      emoji: '💧',
    ),
    ScienceQuestion(
      question: 'What helps us see in the dark?',
      correctAnswer: 'Light',
      options: ['Light', 'Sound', 'Smell'],
      emoji: '💡',
    ),
    ScienceQuestion(
      question: 'What do bees make?',
      correctAnswer: 'Honey',
      options: ['Honey', 'Milk', 'Bread'],
      emoji: '🐝',
    ),
    ScienceQuestion(
      question: 'What comes out of volcanoes?',
      correctAnswer: 'Lava',
      options: ['Lava', 'Water', 'Air'],
      emoji: '🌋',
    ),
    ScienceQuestion(
      question: 'What do we breathe?',
      correctAnswer: 'Air',
      options: ['Air', 'Water', 'Fire'],
      emoji: '💨',
    ),
    ScienceQuestion(
      question: 'What gives us light during the day?',
      correctAnswer: 'Sun',
      options: ['Sun', 'Moon', 'Stars'],
      emoji: '☀️',
    ),
  ];

  late ScienceQuestion _currentQuestion;

  @override
  void initializeActivity() {
    totalQuestions = 8;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentQuestion = _questions[random.nextInt(_questions.length)];
  }

  void _handleAnswer(String selected) {
    if (selected == _currentQuestion.correctAnswer) {
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
        backgroundColor: Colors.teal.shade700,
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
            colors: [Colors.teal.shade100, Colors.cyan.shade50],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  Text(
                    _currentQuestion.emoji,
                    style: const TextStyle(fontSize: 64),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _currentQuestion.question,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  ..._currentQuestion.options.map((option) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(option),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.teal.shade700,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              option,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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

class ScienceQuestion {
  final String question;
  final String correctAnswer;
  final List<String> options;
  final String emoji;

  ScienceQuestion({
    required this.question,
    required this.correctAnswer,
    required this.options,
    required this.emoji,
  });
}
