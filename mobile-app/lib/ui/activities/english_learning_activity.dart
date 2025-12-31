import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class EnglishLearningActivity extends BaseActivity {
  const EnglishLearningActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<EnglishLearningActivity> createState() => _EnglishLearningActivityState();
}

class _EnglishLearningActivityState extends BaseActivityState<EnglishLearningActivity> {
  final List<EnglishQuestion> _questions = [
    // Alphabet
    EnglishQuestion(
      question: 'Which letter comes after A?',
      options: ['B', 'C', 'D'],
      correctAnswer: 0,
      emoji: '🔤',
    ),
    EnglishQuestion(
      question: 'What sound does the letter C make?',
      options: ['Kuh', 'Sss', 'Tuh'],
      correctAnswer: 0,
      emoji: '🗣️',
    ),
    // Vocabulary
    EnglishQuestion(
      question: 'What color is an apple?',
      options: ['Red', 'Blue', 'Yellow'],
      correctAnswer: 0,
      emoji: '🍎',
    ),
    EnglishQuestion(
      question: 'What do we use to write?',
      options: ['Pencil', 'Fork', 'Shoe'],
      correctAnswer: 0,
      emoji: '✏️',
    ),
    EnglishQuestion(
      question: 'What says "Woof"?',
      options: ['Dog', 'Cat', 'Bird'],
      correctAnswer: 0,
      emoji: '🐶',
    ),
    EnglishQuestion(
      question: 'Which is a fruit?',
      options: ['Banana', 'Carrot', 'Potato'],
      correctAnswer: 0,
      emoji: '🍌',
    ),
    // Reading
    EnglishQuestion(
      question: 'What word rhymes with "cat"?',
      options: ['Bat', 'Dog', 'Run'],
      correctAnswer: 0,
      emoji: '🎵',
    ),
    EnglishQuestion(
      question: 'How many letters in "dog"?',
      options: ['3', '4', '5'],
      correctAnswer: 0,
      emoji: '🔢',
    ),
  ];

  late EnglishQuestion _currentQuestion;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    generateNewQuestion();
  }

  @override
  void generateNewQuestion() {
    setState(() {
      final random = Random();
      _currentQuestion = _questions[random.nextInt(_questions.length)];
      _options = List.from(_currentQuestion.options)..shuffle();
    });
  }

  void _handleAnswer(String selected) {
    final isCorrect = selected == _currentQuestion.options[_currentQuestion.correctAnswer];
    if (isCorrect) {
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
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.blue.shade100, Colors.purple.shade100],
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
                    _currentQuestion.question,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
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
                      _currentQuestion.emoji,
                      style: const TextStyle(fontSize: 64),
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._options.map((option) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(option),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.primary,
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

class EnglishQuestion {
  final String question;
  final List<String> options;
  final int correctAnswer;
  final String emoji;

  EnglishQuestion({
    required this.question,
    required this.options,
    required this.correctAnswer,
    required this.emoji,
  });
}
