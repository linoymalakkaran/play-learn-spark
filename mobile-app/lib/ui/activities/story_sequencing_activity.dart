import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class StorySequencingActivity extends BaseActivity {
  const StorySequencingActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<StorySequencingActivity> createState() => _StorySequencingActivityState();
}

class _StorySequencingActivityState extends BaseActivityState<StorySequencingActivity> {
  final List<Story> _stories = [
    Story(
      steps: [
        StoryStep(emoji: '🌱', text: 'Plant seed'),
        StoryStep(emoji: '💧', text: 'Water it'),
        StoryStep(emoji: '🌿', text: 'It grows'),
        StoryStep(emoji: '🌻', text: 'Flower blooms'),
      ],
    ),
    Story(
      steps: [
        StoryStep(emoji: '🥚', text: 'Egg in nest'),
        StoryStep(emoji: '🐣', text: 'Chick hatches'),
        StoryStep(emoji: '🐥', text: 'Chick grows'),
        StoryStep(emoji: '🐔', text: 'Becomes hen'),
      ],
    ),
    Story(
      steps: [
        StoryStep(emoji: '🌙', text: 'Night time'),
        StoryStep(emoji: '🌅', text: 'Sun rises'),
        StoryStep(emoji: '☀️', text: 'Day time'),
        StoryStep(emoji: '🌆', text: 'Sun sets'),
      ],
    ),
  ];

  late Story _currentStory;
  late List<StoryStep> _shuffledSteps;
  List<StoryStep?> _orderedSteps = [];
  int _currentPosition = 0;

  @override
  void initializeActivity() {
    totalQuestions = 2; // 2 stories to sequence
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentStory = _stories[random.nextInt(_stories.length)];
    _shuffledSteps = List.from(_currentStory.steps)..shuffle();
    _orderedSteps = List.filled(_currentStory.steps.length, null);
    _currentPosition = 0;
  }

  void _handleStepSelection(StoryStep step) {
    if (_currentPosition >= _orderedSteps.length) return;

    setState(() {
      _orderedSteps[_currentPosition] = step;
      _shuffledSteps.remove(step);
      _currentPosition++;
    });

    if (_shuffledSteps.isEmpty) {
      _checkAnswer();
    }
  }

  void _checkAnswer() {
    bool isCorrect = true;
    for (int i = 0; i < _orderedSteps.length; i++) {
      if (_orderedSteps[i] != _currentStory.steps[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      onCorrectAnswer();
    } else {
      onIncorrectAnswer();
      // Reset for retry
      Future.delayed(const Duration(milliseconds: 1000), () {
        setState(() {
          _shuffledSteps = List.from(_currentStory.steps)..shuffle();
          _orderedSteps = List.filled(_currentStory.steps.length, null);
          _currentPosition = 0;
        });
      });
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
            colors: [Colors.orange.shade100, Colors.red.shade100],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const Padding(
                padding: EdgeInsets.all(24.0),
                child: Text(
                  'Put the story in order!',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
              ),
              // Ordered steps area
              Container(
                height: 120,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(_orderedSteps.length, (index) {
                    final step = _orderedSteps[index];
                    return Container(
                      width: 80,
                      height: 100,
                      decoration: BoxDecoration(
                        color: step != null ? Colors.white : Colors.white.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: step != null ? AppColors.primary : Colors.grey.shade300,
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            step?.emoji ?? '${index + 1}',
                            style: const TextStyle(fontSize: 32),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 32),
              const Divider(),
              const SizedBox(height: 16),
              const Text(
                'Tap in order:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              // Available steps
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(24),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1,
                  ),
                  itemCount: _shuffledSteps.length,
                  itemBuilder: (context, index) {
                    final step = _shuffledSteps[index];
                    return GestureDetector(
                      onTap: () => _handleStepSelection(step),
                      child: Container(
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
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(step.emoji, style: const TextStyle(fontSize: 48)),
                            const SizedBox(height: 8),
                            Text(
                              step.text,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class Story {
  final List<StoryStep> steps;

  Story({required this.steps});
}

class StoryStep {
  final String emoji;
  final String text;

  StoryStep({required this.emoji, required this.text});
}
