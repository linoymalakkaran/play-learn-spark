import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class EmotionExplorerActivity extends BaseActivity {
  const EmotionExplorerActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<EmotionExplorerActivity> createState() => _EmotionExplorerActivityState();
}

class _EmotionExplorerActivityState extends BaseActivityState<EmotionExplorerActivity> {
  final List<EmotionItem> _emotions = [
    EmotionItem(name: 'Happy', emoji: '😊'),
    EmotionItem(name: 'Sad', emoji: '😢'),
    EmotionItem(name: 'Angry', emoji: '😠'),
    EmotionItem(name: 'Surprised', emoji: '😲'),
    EmotionItem(name: 'Scared', emoji: '😨'),
    EmotionItem(name: 'Excited', emoji: '🤩'),
  ];

  late EmotionItem _currentEmotion;
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
    _currentEmotion = _emotions[random.nextInt(_emotions.length)];
    
    final wrongEmotions = _emotions.where((e) => e != _currentEmotion).toList()..shuffle();
    _options = [
      _currentEmotion.name,
      wrongEmotions[0].name,
      wrongEmotions[1].name,
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentEmotion.name) {
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
            colors: [Colors.yellow.shade100, Colors.amber.shade200],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'How does this person feel?',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
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
                      _currentEmotion.emoji,
                      style: const TextStyle(fontSize: 100),
                    ),
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

class EmotionItem {
  final String name;
  final String emoji;

  EmotionItem({required this.name, required this.emoji});
}
