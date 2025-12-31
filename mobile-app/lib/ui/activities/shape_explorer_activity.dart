import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class ShapeExplorerActivity extends BaseActivity {
  const ShapeExplorerActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<ShapeExplorerActivity> createState() => _ShapeExplorerActivityState();
}

class _ShapeExplorerActivityState extends BaseActivityState<ShapeExplorerActivity> {
  final List<ShapeItem> _shapes = [
    ShapeItem(name: 'Circle', icon: Icons.circle, color: Colors.red),
    ShapeItem(name: 'Square', icon: Icons.square, color: Colors.blue),
    ShapeItem(name: 'Triangle', icon: Icons.change_history, color: Colors.green),
    ShapeItem(name: 'Star', icon: Icons.star, color: Colors.yellow),
    ShapeItem(name: 'Heart', icon: Icons.favorite, color: Colors.pink),
  ];

  late ShapeItem _currentShape;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 5;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentShape = _shapes[random.nextInt(_shapes.length)];

    // Generate options
    final wrongShapes = _shapes.where((s) => s != _currentShape).toList()
      ..shuffle();
    _options = [
      _currentShape.name,
      wrongShapes[0].name,
      wrongShapes[1].name,
    ]..shuffle();
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentShape.name) {
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
            colors: [Colors.purple.shade100, Colors.pink.shade100],
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
                  'What shape is this?',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Shape display
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
                    child: Icon(
                      _currentShape.icon,
                      size: 120,
                      color: _currentShape.color,
                    ),
                  ),
                ),
                const SizedBox(height: 48),

                // Answer options
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

class ShapeItem {
  final String name;
  final IconData icon;
  final Color color;

  ShapeItem({
    required this.name,
    required this.icon,
    required this.color,
  });
}
