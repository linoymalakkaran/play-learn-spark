import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class HealthyHabitsActivity extends BaseActivity {
  const HealthyHabitsActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<HealthyHabitsActivity> createState() => _HealthyHabitsActivityState();
}

class _HealthyHabitsActivityState extends BaseActivityState<HealthyHabitsActivity> {
  final List<HabitQuestion> _habits = [
    HabitQuestion(
      question: 'What should you do before eating?',
      correctAnswer: 'Wash hands',
      wrongAnswers: ['Watch TV', 'Play games'],
      emoji: '🧼',
    ),
    HabitQuestion(
      question: 'When should you brush your teeth?',
      correctAnswer: 'Morning & Night',
      wrongAnswers: ['Never', 'Once a week'],
      emoji: '🦷',
    ),
    HabitQuestion(
      question: 'What helps you grow strong?',
      correctAnswer: 'Eat vegetables',
      wrongAnswers: ['Eat candy', 'Skip meals'],
      emoji: '🥗',
    ),
    HabitQuestion(
      question: 'How much sleep do you need?',
      correctAnswer: 'Plenty of sleep',
      wrongAnswers: ['No sleep', 'Very little'],
      emoji: '😴',
    ),
    HabitQuestion(
      question: 'What keeps you healthy?',
      correctAnswer: 'Exercise',
      wrongAnswers: ['Sit all day', 'Stay indoors'],
      emoji: '🏃',
    ),
  ];

  late HabitQuestion _currentQuestion;
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
    _currentQuestion = _habits[random.nextInt(_habits.length)];
    
    _options = [
      _currentQuestion.correctAnswer,
      ..._currentQuestion.wrongAnswers,
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedAnswer) {
    if (selectedAnswer == _currentQuestion.correctAnswer) {
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
            colors: [Colors.green.shade100, Colors.teal.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
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
                        _currentQuestion.emoji,
                        style: const TextStyle(fontSize: 60),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _currentQuestion.question,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                ..._options.map((answer) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(answer),
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
                            answer,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
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

class HabitQuestion {
  final String question;
  final String correctAnswer;
  final List<String> wrongAnswers;
  final String emoji;

  HabitQuestion({
    required this.question,
    required this.correctAnswer,
    required this.wrongAnswers,
    required this.emoji,
  });
}
