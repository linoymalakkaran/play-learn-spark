import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class SocialSkillsActivity extends BaseActivity {
  const SocialSkillsActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<SocialSkillsActivity> createState() => _SocialSkillsActivityState();
}

class _SocialSkillsActivityState extends BaseActivityState<SocialSkillsActivity> {
  final List<SocialScenario> _scenarios = [
    SocialScenario(
      question: 'Someone is sad. What should you do?',
      correctAnswer: 'Give them a hug',
      options: ['Give them a hug', 'Ignore them', 'Laugh at them'],
      emoji: '🤗',
    ),
    SocialScenario(
      question: 'You want to play with a toy. What should you say?',
      correctAnswer: 'May I play please?',
      options: ['May I play please?', 'Give it to me!', 'Take it away'],
      emoji: '🙏',
    ),
    SocialScenario(
      question: 'Someone helps you. What should you say?',
      correctAnswer: 'Thank you',
      options: ['Thank you', 'Go away', 'Nothing'],
      emoji: '😊',
    ),
    SocialScenario(
      question: 'You accidentally bump into someone. What should you say?',
      correctAnswer: 'Sorry',
      options: ['Sorry', 'Your fault', 'Nothing'],
      emoji: '😔',
    ),
    SocialScenario(
      question: 'Your friend shares a toy with you. What should you say?',
      correctAnswer: 'Thank you!',
      options: ['Thank you!', 'Mine now!', 'Go away'],
      emoji: '🎁',
    ),
    SocialScenario(
      question: 'You see someone new. What should you say?',
      correctAnswer: 'Hello! My name is...',
      options: ['Hello! My name is...', 'Go away', 'Nothing'],
      emoji: '👋',
    ),
  ];

  late SocialScenario _currentScenario;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    generateNewQuestion();
  }

  @override


  void generateNewQuestion() {


    setState(() {
    final random = Random();
    _currentScenario = _scenarios[random.nextInt(_scenarios.length)];
    }); // setState
  }

  void _handleAnswer(String selected) {
    if (selected == _currentScenario.correctAnswer) {
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
        backgroundColor: Colors.lightBlue.shade600,
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
            colors: [Colors.lightBlue.shade100, Colors.blue.shade50],
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
                    _currentScenario.emoji,
                    style: const TextStyle(fontSize: 64),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '💝 Social Skills',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
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
                      _currentScenario.question,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._currentScenario.options.map((option) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(option),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.lightBlue.shade600,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              option,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
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

class SocialScenario {
  final String question;
  final String correctAnswer;
  final List<String> options;
  final String emoji;

  SocialScenario({
    required this.question,
    required this.correctAnswer,
    required this.options,
    required this.emoji,
  });
}
