import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class NumberGardenActivity extends BaseActivity {
  const NumberGardenActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<NumberGardenActivity> createState() => _NumberGardenActivityState();
}

class _NumberGardenActivityState extends BaseActivityState<NumberGardenActivity> {
  late int _targetNumber;
  late List<int> _options;
  late String _flowerEmoji;

  @override
  void initializeActivity() {
    totalQuestions = 8;
    generateNewQuestion();
  }

  @override


  void generateNewQuestion() {


    setState(() {
    final random = Random();
    _targetNumber = random.nextInt(10) + 1;
    _flowerEmoji = ['🌻', '🌹', '🌷', '🌺', '🌸'][random.nextInt(5)];
    
    _options = [
      _targetNumber,
      (_targetNumber - 1).clamp(1, 10),
      (_targetNumber + 1).clamp(1, 10),
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(int selected) {
    if (selected == _targetNumber) {
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
        backgroundColor: Colors.purple.shade400,
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
            colors: [Colors.green.shade200, Colors.yellow.shade100],
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
                    'Count the flowers!',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
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
                    child: Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      alignment: WrapAlignment.center,
                      children: List.generate(
                        _targetNumber,
                        (index) => Text(
                          _flowerEmoji,
                          style: const TextStyle(fontSize: 48),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._options.map((number) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(number),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.purple.shade400,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              number.toString(),
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
