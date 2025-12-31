import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class RhymeTimeActivity extends BaseActivity {
  const RhymeTimeActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<RhymeTimeActivity> createState() => _RhymeTimeActivityState();
}

class _RhymeTimeActivityState extends BaseActivityState<RhymeTimeActivity> {
  final Map<String, List<String>> _rhymes = {
    'cat': ['hat', 'bat', 'mat'],
    'dog': ['frog', 'log', 'hog'],
    'bee': ['tree', 'sea', 'key'],
    'sun': ['fun', 'run', 'bun'],
    'car': ['star', 'far', 'jar'],
  };

  late String _baseWord;
  late String _correctRhyme;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    final keys = _rhymes.keys.toList();
    _baseWord = keys[random.nextInt(keys.length)];
    
    final rhymeList = _rhymes[_baseWord]!;
    _correctRhyme = rhymeList[random.nextInt(rhymeList.length)];
    
    // Get wrong options from other rhyme groups
    final wrongWords = <String>[];
    for (var key in keys) {
      if (key != _baseWord) {
        wrongWords.addAll(_rhymes[key]!);
      }
    }
    wrongWords.shuffle();
    
    _options = [_correctRhyme, wrongWords[0], wrongWords[1]]..shuffle();
  }

  void _handleAnswer(String selectedWord) {
    if (selectedWord == _correctRhyme) {
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
            colors: [Colors.deepPurple.shade100, Colors.blue.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Which word rhymes with:',
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
                  child: Text(
                    _baseWord.toUpperCase(),
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 48),
                ..._options.map((word) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(word),
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
                            word,
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
