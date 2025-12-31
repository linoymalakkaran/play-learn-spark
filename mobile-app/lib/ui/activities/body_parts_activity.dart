import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class BodyPartsActivity extends BaseActivity {
  const BodyPartsActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<BodyPartsActivity> createState() => _BodyPartsActivityState();
}

class _BodyPartsActivityState extends BaseActivityState<BodyPartsActivity> {
  final List<BodyPart> _bodyParts = [
    BodyPart(name: 'Eyes', emoji: '👀', function: 'To see'),
    BodyPart(name: 'Ears', emoji: '👂', function: 'To hear'),
    BodyPart(name: 'Nose', emoji: '👃', function: 'To smell'),
    BodyPart(name: 'Mouth', emoji: '👄', function: 'To eat'),
    BodyPart(name: 'Hands', emoji: '👐', function: 'To hold'),
    BodyPart(name: 'Feet', emoji: '👣', function: 'To walk'),
  ];

  late BodyPart _currentPart;
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
    _currentPart = _bodyParts[random.nextInt(_bodyParts.length)];
    
    final wrongParts = _bodyParts.where((p) => p != _currentPart).toList()..shuffle();
    _options = [
      _currentPart.name,
      wrongParts[0].name,
      wrongParts[1].name,
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentPart.name) {
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
            colors: [Colors.pink.shade100, Colors.red.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'What body part is this?',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
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
                        _currentPart.emoji,
                        style: const TextStyle(fontSize: 80),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _currentPart.function,
                        style: const TextStyle(
                          fontSize: 18,
                          fontStyle: FontStyle.italic,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
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

class BodyPart {
  final String name;
  final String emoji;
  final String function;

  BodyPart({required this.name, required this.emoji, required this.function});
}
