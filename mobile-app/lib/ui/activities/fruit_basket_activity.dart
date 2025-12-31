import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class FruitBasketActivity extends BaseActivity {
  const FruitBasketActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<FruitBasketActivity> createState() => _FruitBasketActivityState();
}

class _FruitBasketActivityState extends BaseActivityState<FruitBasketActivity> {
  final List<Fruit> _fruits = [
    Fruit(name: 'Apple', emoji: '🍎', color: 'Red'),
    Fruit(name: 'Banana', emoji: '🍌', color: 'Yellow'),
    Fruit(name: 'Orange', emoji: '🍊', color: 'Orange'),
    Fruit(name: 'Grapes', emoji: '🍇', color: 'Purple'),
    Fruit(name: 'Strawberry', emoji: '🍓', color: 'Red'),
    Fruit(name: 'Watermelon', emoji: '🍉', color: 'Green'),
    Fruit(name: 'Pineapple', emoji: '🍍', color: 'Yellow'),
    Fruit(name: 'Cherry', emoji: '🍒', color: 'Red'),
  ];

  late Fruit _currentFruit;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentFruit = _fruits[random.nextInt(_fruits.length)];
    
    final wrongFruits = _fruits.where((f) => f != _currentFruit).toList()..shuffle();
    _options = [
      _currentFruit.name,
      wrongFruits[0].name,
      wrongFruits[1].name,
    ]..shuffle();
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentFruit.name) {
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
        backgroundColor: Colors.pink,
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
            colors: [Colors.pink.shade100, Colors.orange.shade100],
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
                    'What fruit is this?',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(32),
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
                      _currentFruit.emoji,
                      style: const TextStyle(fontSize: 80),
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._options.map((name) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(name),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.pink,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              name,
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

class Fruit {
  final String name;
  final String emoji;
  final String color;

  Fruit({required this.name, required this.emoji, required this.color});
}
