import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class NatureWalkActivity extends BaseActivity {
  const NatureWalkActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<NatureWalkActivity> createState() => _NatureWalkActivityState();
}

class _NatureWalkActivityState extends BaseActivityState<NatureWalkActivity> {
  final Map<String, List<NatureItem>> _categories = {
    'Animals': [
      NatureItem(name: 'Bird', emoji: '🐦'),
      NatureItem(name: 'Butterfly', emoji: '🦋'),
      NatureItem(name: 'Bee', emoji: '🐝'),
    ],
    'Plants': [
      NatureItem(name: 'Tree', emoji: '🌳'),
      NatureItem(name: 'Flower', emoji: '🌸'),
      NatureItem(name: 'Grass', emoji: '🌿'),
    ],
  };

  late String _correctCategory;
  late NatureItem _currentItem;
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
    final categoryKeys = _categories.keys.toList();
    _correctCategory = categoryKeys[random.nextInt(categoryKeys.length)];
    
    final items = _categories[_correctCategory]!;
    _currentItem = items[random.nextInt(items.length)];
    
    _options = categoryKeys..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedCategory) {
    if (selectedCategory == _correctCategory) {
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
            colors: [Colors.lightGreen.shade100, Colors.green.shade200],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'What type is this?',
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
                        _currentItem.emoji,
                        style: const TextStyle(fontSize: 80),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _currentItem.name,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                ..._options.map((category) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(category),
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
                            category,
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

class NatureItem {
  final String name;
  final String emoji;

  NatureItem({required this.name, required this.emoji});
}
