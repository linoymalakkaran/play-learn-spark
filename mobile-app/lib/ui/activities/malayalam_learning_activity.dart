import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class MalayalamLearningActivity extends BaseActivity {
  const MalayalamLearningActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<MalayalamLearningActivity> createState() => _MalayalamLearningActivityState();
}

class _MalayalamLearningActivityState extends BaseActivityState<MalayalamLearningActivity> {
  final List<MalayalamLesson> _lessons = [
    MalayalamLesson(
      malayalam: 'അ',
      transliteration: 'A',
      english: 'First letter of Malayalam alphabet',
      emoji: '📝',
    ),
    MalayalamLesson(
      malayalam: 'ആ',
      transliteration: 'Aa',
      english: 'Second letter',
      emoji: '📝',
    ),
    MalayalamLesson(
      malayalam: 'നമസ്കാരം',
      transliteration: 'Namaskaram',
      english: 'Hello / Greetings',
      emoji: '👋',
    ),
    MalayalamLesson(
      malayalam: 'നന്ദി',
      transliteration: 'Nandi',
      english: 'Thank you',
      emoji: '🙏',
    ),
    MalayalamLesson(
      malayalam: 'പുസ്തകം',
      transliteration: 'Pusthakam',
      english: 'Book',
      emoji: '📚',
    ),
    MalayalamLesson(
      malayalam: 'പേന',
      transliteration: 'Pena',
      english: 'Pen',
      emoji: '✏️',
    ),
  ];

  late MalayalamLesson _currentLesson;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentLesson = _lessons[random.nextInt(_lessons.length)];
    
    final wrongLessons = _lessons.where((l) => l != _currentLesson).toList()..shuffle();
    _options = [
      _currentLesson.english,
      wrongLessons[0].english,
      wrongLessons[1].english,
    ]..shuffle();
  }

  void _handleAnswer(String selectedEnglish) {
    if (selectedEnglish == _currentLesson.english) {
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
        backgroundColor: Colors.deepOrange.shade700,
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
            colors: [Colors.orange.shade100, Colors.yellow.shade100],
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
                    'Learn Malayalam!',
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
                    child: Column(
                      children: [
                        Text(
                          _currentLesson.emoji,
                          style: const TextStyle(fontSize: 48),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _currentLesson.malayalam,
                          style: const TextStyle(
                            fontSize: 56,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '(${_currentLesson.transliteration})',
                          style: TextStyle(
                            fontSize: 20,
                            color: Colors.grey.shade700,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'What does it mean?',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),
                  ..._options.map((english) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(english),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.deepOrange.shade700,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              english,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
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

class MalayalamLesson {
  final String malayalam;
  final String transliteration;
  final String english;
  final String emoji;

  MalayalamLesson({
    required this.malayalam,
    required this.transliteration,
    required this.english,
    required this.emoji,
  });
}
