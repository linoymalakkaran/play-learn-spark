import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class VegetableGardenActivity extends BaseActivity {
  const VegetableGardenActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<VegetableGardenActivity> createState() => _VegetableGardenActivityState();
}

class _VegetableGardenActivityState extends BaseActivityState<VegetableGardenActivity> {
  final List<Vegetable> _vegetables = [
    Vegetable(name: 'Carrot', emoji: '🥕', color: 'Orange'),
    Vegetable(name: 'Broccoli', emoji: '🥦', color: 'Green'),
    Vegetable(name: 'Tomato', emoji: '🍅', color: 'Red'),
    Vegetable(name: 'Corn', emoji: '🌽', color: 'Yellow'),
    Vegetable(name: 'Potato', emoji: '🥔', color: 'Brown'),
    Vegetable(name: 'Cucumber', emoji: '🥒', color: 'Green'),
    Vegetable(name: 'Pepper', emoji: '🌶️', color: 'Red'),
    Vegetable(name: 'Lettuce', emoji: '🥬', color: 'Green'),
  ];

  late Vegetable _currentVeggie;
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
    _currentVeggie = _vegetables[random.nextInt(_vegetables.length)];
    
    final wrongVeggies = _vegetables.where((v) => v != _currentVeggie).toList()..shuffle();
    _options = [
      _currentVeggie.name,
      wrongVeggies[0].name,
      wrongVeggies[1].name,
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentVeggie.name) {
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
        backgroundColor: Colors.green.shade700,
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
            colors: [Colors.green.shade100, Colors.lime.shade100],
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
                    'What vegetable is this?',
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
                      _currentVeggie.emoji,
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
                              foregroundColor: Colors.green.shade700,
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

class Vegetable {
  final String name;
  final String emoji;
  final String color;

  Vegetable({required this.name, required this.emoji, required this.color});
}
