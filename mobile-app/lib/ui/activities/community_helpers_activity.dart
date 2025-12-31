import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class CommunityHelpersActivity extends BaseActivity {
  const CommunityHelpersActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<CommunityHelpersActivity> createState() => _CommunityHelpersActivityState();
}

class _CommunityHelpersActivityState extends BaseActivityState<CommunityHelpersActivity> {
  final List<Helper> _helpers = [
    Helper(job: 'Doctor', emoji: '👨‍⚕️', role: 'Helps sick people'),
    Helper(job: 'Firefighter', emoji: '👨‍🚒', role: 'Puts out fires'),
    Helper(job: 'Teacher', emoji: '👨‍🏫', role: 'Teaches students'),
    Helper(job: 'Police', emoji: '👮', role: 'Keeps us safe'),
    Helper(job: 'Chef', emoji: '👨‍🍳', role: 'Cooks food'),
  ];

  late Helper _currentHelper;
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
    _currentHelper = _helpers[random.nextInt(_helpers.length)];
    
    final wrongHelpers = _helpers.where((h) => h != _currentHelper).toList()..shuffle();
    _options = [
      _currentHelper.job,
      wrongHelpers[0].job,
      wrongHelpers[1].job,
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedJob) {
    if (selectedJob == _currentHelper.job) {
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
            colors: [Colors.blue.shade100, Colors.indigo.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Who is this helper?',
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
                        _currentHelper.emoji,
                        style: const TextStyle(fontSize: 80),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _currentHelper.role,
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
                ..._options.map((job) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _handleAnswer(job),
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
                            job,
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

class Helper {
  final String job;
  final String emoji;
  final String role;

  Helper({required this.job, required this.emoji, required this.role});
}
