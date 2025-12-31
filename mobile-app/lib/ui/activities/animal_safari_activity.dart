import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class AnimalSafariActivity extends BaseActivity {
  const AnimalSafariActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<AnimalSafariActivity> createState() => _AnimalSafariActivityState();
}

class _AnimalSafariActivityState extends BaseActivityState<AnimalSafariActivity> {
  final List<AnimalCard> _animals = [
    AnimalCard(name: 'Dog', emoji: '🐶', sound: 'Woof!'),
    AnimalCard(name: 'Cat', emoji: '🐱', sound: 'Meow!'),
    AnimalCard(name: 'Cow', emoji: '🐮', sound: 'Moo!'),
    AnimalCard(name: 'Lion', emoji: '🦁', sound: 'Roar!'),
    AnimalCard(name: 'Elephant', emoji: '🐘', sound: 'Trumpet!'),
    AnimalCard(name: 'Monkey', emoji: '🐵', sound: 'Ooh-ooh!'),
    AnimalCard(name: 'Pig', emoji: '🐷', sound: 'Oink!'),
    AnimalCard(name: 'Sheep', emoji: '🐑', sound: 'Baa!'),
  ];

  late AnimalCard _currentAnimal;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentAnimal = _animals[random.nextInt(_animals.length)];

    // Generate options
    final wrongAnimals = _animals.where((a) => a != _currentAnimal).toList()
      ..shuffle();
    _options = [
      _currentAnimal.name,
      wrongAnimals[0].name,
      wrongAnimals[1].name,
    ]..shuffle();
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentAnimal.name) {
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
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
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
            colors: [Colors.green.shade100, Colors.blue.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Instructions
                const Text(
                  'Which animal makes this sound?',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Animal sound
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
                  child: Column(
                    children: [
                      Text(
                        _currentAnimal.emoji,
                        style: const TextStyle(fontSize: 80),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '"${_currentAnimal.sound}"',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w600,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),

                // Answer options
                ..._options.map((name) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(name),
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
                            name,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
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

class AnimalCard {
  final String name;
  final String emoji;
  final String sound;

  AnimalCard({
    required this.name,
    required this.emoji,
    required this.sound,
  });
}
