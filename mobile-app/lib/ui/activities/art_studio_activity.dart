import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class ArtStudioActivity extends BaseActivity {
  const ArtStudioActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<ArtStudioActivity> createState() => _ArtStudioActivityState();
}

class _ArtStudioActivityState extends BaseActivityState<ArtStudioActivity> {
  final List<ArtQuestion> _questions = [
    ArtQuestion(
      question: 'What tool do we use to paint?',
      correctAnswer: 'Paintbrush',
      options: ['Paintbrush', 'Scissors', 'Hammer'],
      emoji: '🖌️',
    ),
    ArtQuestion(
      question: 'What color do you get when you mix red and blue?',
      correctAnswer: 'Purple',
      options: ['Purple', 'Green', 'Orange'],
      emoji: '🎨',
    ),
    ArtQuestion(
      question: 'What do artists draw on?',
      correctAnswer: 'Canvas',
      options: ['Canvas', 'Book', 'Phone'],
      emoji: '🖼️',
    ),
    ArtQuestion(
      question: 'What color is the sun usually drawn as?',
      correctAnswer: 'Yellow',
      options: ['Yellow', 'Blue', 'Green'],
      emoji: '☀️',
    ),
    ArtQuestion(
      question: 'What tool is used to cut paper?',
      correctAnswer: 'Scissors',
      options: ['Scissors', 'Glue', 'Pencil'],
      emoji: '✂️',
    ),
    ArtQuestion(
      question: 'What do you use to stick things together?',
      correctAnswer: 'Glue',
      options: ['Glue', 'Eraser', 'Ruler'],
      emoji: '📎',
    ),
  ];

  late ArtQuestion _currentQuestion;

  @override
  void initializeActivity() {
    totalQuestions = 6;
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
        backgroundColor: Colors.pink.shade600,
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
            colors: [Colors.pink.shade100, Colors.purple.shade100],
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
                              foregroundColor: Colors.pink.shade600,
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

class ArtQuestion {
  final String question;
  final String correctAnswer;
  final List<String> options;
  final String emoji;

  ArtQuestion({
    required this.question,
    required this.correctAnswer,
    required this.options,
    required this.emoji,
  });
}
