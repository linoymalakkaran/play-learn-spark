import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class PizzaFractionsActivity extends BaseActivity {
  const PizzaFractionsActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<PizzaFractionsActivity> createState() => _PizzaFractionsActivityState();
}

class _PizzaFractionsActivityState extends BaseActivityState<PizzaFractionsActivity> {
  final List<FractionQuestion> _questions = [
    FractionQuestion(
      slices: 2,
      total: 4,
      fraction: '1/2',
      question: 'How much pizza is shown?',
    ),
    FractionQuestion(
      slices: 1,
      total: 4,
      fraction: '1/4',
      question: 'What fraction is this?',
    ),
    FractionQuestion(
      slices: 3,
      total: 4,
      fraction: '3/4',
      question: 'How much pizza is here?',
    ),
    FractionQuestion(
      slices: 1,
      total: 2,
      fraction: '1/2',
      question: 'What part is shown?',
    ),
    FractionQuestion(
      slices: 2,
      total: 2,
      fraction: '1 whole',
      question: 'How many pizzas?',
    ),
  ];

  late FractionQuestion _currentQuestion;
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
    _currentQuestion = _questions[random.nextInt(_questions.length)];
    
    _options = ['1/4', '1/2', '3/4', '1 whole']
      ..removeWhere((opt) => opt == _currentQuestion.fraction)
      ..shuffle();
    _options = _options.take(2).toList()..add(_currentQuestion.fraction);
    _options.shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedFraction) {
    if (selectedFraction == _currentQuestion.fraction) {
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
        backgroundColor: Colors.red.shade700,
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
            colors: [Colors.orange.shade100, Colors.red.shade50],
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
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
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
                        const Text(
                          '🍕 Pizza!',
                          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            _currentQuestion.total,
                            (index) => Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: index < _currentQuestion.slices
                                      ? Colors.orange.shade400
                                      : Colors.grey.shade300,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.brown, width: 3),
                                ),
                                child: const Center(
                                  child: Text(
                                    '🍕',
                                    style: TextStyle(fontSize: 24),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._options.map((fraction) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(fraction),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.red.shade700,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              fraction,
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
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

class FractionQuestion {
  final int slices;
  final int total;
  final String fraction;
  final String question;

  FractionQuestion({
    required this.slices,
    required this.total,
    required this.fraction,
    required this.question,
  });
}
