import 'package:flutter/material.dart';
import '../../data/models/activity_model.dart';

/// Base class for all learning activities
abstract class BaseActivity extends StatefulWidget {
  final ActivityModel activity;
  final VoidCallback onComplete;

  const BaseActivity({
    super.key,
    required this.activity,
    required this.onComplete,
  });
}

/// Base state for activity implementations
abstract class BaseActivityState<T extends BaseActivity> extends State<T> {
  int _score = 0;
  int _totalQuestions = 0;
  int _correctAnswers = 0;
  int _currentQuestion = 0;
  bool _isCompleted = false;
  DateTime? _startTime;

  @override
  void initState() {
    super.initState();
    _startTime = DateTime.now();
    initializeActivity();
  }

  /// Initialize activity-specific data
  void initializeActivity();

  /// Handle correct answer
  void onCorrectAnswer() {
    setState(() {
      _correctAnswers++;
      _score += 10; // Base points per correct answer
    });
    playCorrectSound();
    showFeedback(isCorrect: true);
  }

  /// Handle incorrect answer
  void onIncorrectAnswer() {
    playIncorrectSound();
    showFeedback(isCorrect: false);
  }

  /// Move to next question
  void nextQuestion() {
    if (_currentQuestion < _totalQuestions - 1) {
      setState(() {
        _currentQuestion++;
      });
    } else {
      completeActivity();
    }
  }

  /// Complete the activity
  void completeActivity() {
    if (_isCompleted) return;

    setState(() {
      _isCompleted = true;
    });

    final duration = DateTime.now().difference(_startTime!);
    
    // Navigate to result screen
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) => ActivityResultScreen(
          activity: widget.activity,
          score: _score,
          correctAnswers: _correctAnswers,
          totalQuestions: _totalQuestions,
          duration: duration,
          onContinue: widget.onComplete,
        ),
      ),
    );
  }

  /// Play correct answer sound
  void playCorrectSound() {
    // TODO: Implement audio playback
  }

  /// Play incorrect answer sound
  void playIncorrectSound() {
    // TODO: Implement audio playback
  }

  /// Show feedback animation
  void showFeedback({required bool isCorrect}) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => FeedbackOverlay(isCorrect: isCorrect),
    );

    overlay.insert(overlayEntry);
    Future.delayed(const Duration(milliseconds: 1500), () {
      overlayEntry.remove();
      if (isCorrect) {
        Future.delayed(const Duration(milliseconds: 300), () {
          nextQuestion();
        });
      }
    });
  }

  // Getters for subclasses
  int get score => _score;
  int get totalQuestions => _totalQuestions;
  int get correctAnswers => _correctAnswers;
  int get currentQuestion => _currentQuestion;
  bool get isCompleted => _isCompleted;

  // Setters for subclasses
  set totalQuestions(int value) => _totalQuestions = value;
  set score(int value) => _score = value;
}

/// Feedback overlay widget
class FeedbackOverlay extends StatefulWidget {
  final bool isCorrect;

  const FeedbackOverlay({super.key, required this.isCorrect});

  @override
  State<FeedbackOverlay> createState() => _FeedbackOverlayState();
}

class _FeedbackOverlayState extends State<FeedbackOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );

    _fadeAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.7, 1.0, curve: Curves.easeOut),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Opacity(
            opacity: _fadeAnimation.value,
            child: Transform.scale(
              scale: _scaleAnimation.value,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: widget.isCorrect ? Colors.green : Colors.red,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  widget.isCorrect ? Icons.check : Icons.close,
                  size: 60,
                  color: Colors.white,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Activity result screen
class ActivityResultScreen extends StatelessWidget {
  final ActivityModel activity;
  final int score;
  final int correctAnswers;
  final int totalQuestions;
  final Duration duration;
  final VoidCallback onContinue;

  const ActivityResultScreen({
    super.key,
    required this.activity,
    required this.score,
    required this.correctAnswers,
    required this.totalQuestions,
    required this.duration,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final percentage = (correctAnswers / totalQuestions * 100).round();
    final isPerfect = correctAnswers == totalQuestions;
    final isGood = percentage >= 70;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isPerfect
                ? [Colors.amber.shade300, Colors.orange.shade400]
                : isGood
                    ? [Colors.green.shade300, Colors.teal.shade400]
                    : [Colors.blue.shade300, Colors.indigo.shade400],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Trophy/Star icon
                  Icon(
                    isPerfect ? Icons.emoji_events : Icons.star,
                    size: 100,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 24),

                  // Result message
                  Text(
                    isPerfect
                        ? 'Perfect! 🎉'
                        : isGood
                            ? 'Great Job! 👏'
                            : 'Good Try! 💪',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Score card
                  Card(
                    elevation: 8,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        children: [
                          // Activity name
                          Text(
                            activity.title,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),

                          // Stats
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildStat(
                                icon: Icons.score,
                                label: 'Score',
                                value: score.toString(),
                              ),
                              _buildStat(
                                icon: Icons.check_circle,
                                label: 'Correct',
                                value: '$correctAnswers/$totalQuestions',
                              ),
                              _buildStat(
                                icon: Icons.timer,
                                label: 'Time',
                                value: _formatDuration(duration),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Percentage
                          Text(
                            '$percentage%',
                            style: TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: isPerfect
                                  ? Colors.amber
                                  : isGood
                                      ? Colors.green
                                      : Colors.blue,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Continue button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: onContinue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: isPerfect
                            ? Colors.orange
                            : isGood
                                ? Colors.teal
                                : Colors.indigo,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Continue',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStat({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Colors.grey[700]),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    }
    return '${seconds}s';
  }
}
