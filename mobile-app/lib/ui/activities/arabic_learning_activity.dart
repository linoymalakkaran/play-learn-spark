import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class ArabicLearningActivity extends BaseActivity {
  const ArabicLearningActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<ArabicLearningActivity> createState() => _ArabicLearningActivityState();
}

class _ArabicLearningActivityState extends BaseActivityState<ArabicLearningActivity> {
  final List<ArabicLesson> _lessons = [
    ArabicLesson(
      arabic: 'أ',
      transliteration: 'Alif',
      english: 'A',
      emoji: '🔤',
      question: 'Which letter is Alif?',
      options: ['أ', 'ب', 'ت'],
      correctAnswer: 0,
    ),
    ArabicLesson(
      arabic: 'ب',
      transliteration: 'Ba',
      english: 'B',
      emoji: '📝',
      question: 'Which letter is Ba?',
      options: ['أ', 'ب', 'ت'],
      correctAnswer: 1,
    ),
    ArabicLesson(
      arabic: 'سلام',
      transliteration: 'Salam',
      english: 'Peace/Hello',
      emoji: '👋',
      question: 'What does "سلام" mean?',
      options: ['Hello', 'Goodbye', 'Thank you'],
      correctAnswer: 0,
    ),
    ArabicLesson(
      arabic: 'شكرا',
      transliteration: 'Shukran',
      english: 'Thank you',
      emoji: '🙏',
      question: 'What does "شكرا" mean?',
      options: ['Please', 'Thank you', 'Sorry'],
      correctAnswer: 1,
    ),
    ArabicLesson(
      arabic: 'كتاب',
      transliteration: 'Kitab',
      english: 'Book',
      emoji: '📚',
      question: 'What does "كتاب" mean?',
      options: ['Book', 'Pen', 'Paper'],
      correctAnswer: 0,
    ),
    ArabicLesson(
      arabic: 'قلم',
      transliteration: 'Qalam',
      english: 'Pen',
      emoji: '✏️',
      question: 'What does "قلم" mean?',
      options: ['Book', 'Pen', 'Desk'],
      correctAnswer: 1,
    ),
  ];

  late ArabicLesson _currentLesson;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    generateNewQuestion();
  }

  @override


  void generateNewQuestion() {


    setState(() {
    final random = Random();
    _currentLesson = _lessons[random.nextInt(_lessons.length)];
    }); // setState
  }

  void _handleAnswer(int selectedIndex) {
    if (selectedIndex == _currentLesson.correctAnswer) {
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
        backgroundColor: AppColors.secondary,
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
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [Colors.teal.shade100, Colors.cyan.shade100],
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
                    _currentLesson.question,
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
                    child: Column(
                      children: [
                        Text(
                          _currentLesson.emoji,
                          style: const TextStyle(fontSize: 48),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _currentLesson.arabic,
                          style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
                          textDirection: TextDirection.rtl,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _currentLesson.transliteration,
                          style: TextStyle(fontSize: 20, color: Colors.grey[700]),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  ...List.generate(_currentLesson.options.length, (index) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(index),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.secondary,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 4,
                          ),
                          child: Text(
                            _currentLesson.options[index],
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    );
                  }),
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

class ArabicLesson {
  final String arabic;
  final String transliteration;
  final String english;
  final String emoji;
  final String question;
  final List<String> options;
  final int correctAnswer;

  ArabicLesson({
    required this.arabic,
    required this.transliteration,
    required this.english,
    required this.emoji,
    required this.question,
    required this.options,
    required this.correctAnswer,
  });
}
