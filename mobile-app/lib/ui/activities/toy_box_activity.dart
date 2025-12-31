import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class ToyBoxActivity extends BaseActivity {
  const ToyBoxActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<ToyBoxActivity> createState() => _ToyBoxActivityState();
}

class _ToyBoxActivityState extends BaseActivityState<ToyBoxActivity> {
  final List<Toy> _toys = [
    Toy(name: 'Ball', emoji: '⚽', category: 'Sports'),
    Toy(name: 'Teddy Bear', emoji: '🧸', category: 'Stuffed'),
    Toy(name: 'Robot', emoji: '🤖', category: 'Electronic'),
    Toy(name: 'Doll', emoji: '🪆', category: 'Play'),
    Toy(name: 'Car', emoji: '🚗', category: 'Vehicle'),
    Toy(name: 'Blocks', emoji: '🧱', category: 'Building'),
    Toy(name: 'Kite', emoji: '🪁', category: 'Outdoor'),
    Toy(name: 'Puzzle', emoji: '🧩', category: 'Brain'),
  ];

  late Toy _currentToy;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentToy = _toys[random.nextInt(_toys.length)];
    
    final wrongToys = _toys.where((t) => t != _currentToy).toList()..shuffle();
    _options = [
      _currentToy.name,
      wrongToys[0].name,
      wrongToys[1].name,
    ]..shuffle();
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentToy.name) {
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
        backgroundColor: Colors.indigo.shade400,
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
            colors: [Colors.indigo.shade100, Colors.blue.shade50],
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
                    'What toy is this?',
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
                      _currentToy.emoji,
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
                              foregroundColor: Colors.indigo.shade400,
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

class Toy {
  final String name;
  final String emoji;
  final String category;

  Toy({required this.name, required this.emoji, required this.category});
}
