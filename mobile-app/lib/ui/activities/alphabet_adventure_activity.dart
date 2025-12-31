import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class AlphabetAdventureActivity extends BaseActivity {
  const AlphabetAdventureActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<AlphabetAdventureActivity> createState() => _AlphabetAdventureActivityState();
}

class _AlphabetAdventureActivityState
    extends BaseActivityState<AlphabetAdventureActivity> {
  final List<String> _letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  late String _targetLetter;
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
    _targetLetter = _letters[random.nextInt(_letters.length)];

    // Generate wrong options
    final wrongLetters = _letters.where((l) => l != _targetLetter).toList()
      ..shuffle();
    _options = [
      _targetLetter,
      wrongLetters[0],
      wrongLetters[1],
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedLetter) {
    if (selectedLetter == _targetLetter) {
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
            colors: [Colors.amber.shade100, Colors.yellow.shade200],
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
                  'Find the letter:',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Target letter
                Container(
                  width: 200,
                  height: 200,
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
                  child: Center(
                    child: Text(
                      _targetLetter,
                      style: TextStyle(
                        fontSize: 100,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 48),

                // Answer options
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: _options.map((letter) {
                    return GestureDetector(
                      onTap: () => _handleAnswer(letter),
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            letter,
                            style: TextStyle(
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                              color: AppColors.secondary,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
