import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class WeatherWatcherActivity extends BaseActivity {
  const WeatherWatcherActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<WeatherWatcherActivity> createState() => _WeatherWatcherActivityState();
}

class _WeatherWatcherActivityState extends BaseActivityState<WeatherWatcherActivity> {
  final List<WeatherType> _weatherTypes = [
    WeatherType(name: 'Sunny', emoji: '☀️'),
    WeatherType(name: 'Rainy', emoji: '🌧️'),
    WeatherType(name: 'Cloudy', emoji: '☁️'),
    WeatherType(name: 'Snowy', emoji: '❄️'),
    WeatherType(name: 'Windy', emoji: '💨'),
  ];

  late WeatherType _currentWeather;
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
    _currentWeather = _weatherTypes[random.nextInt(_weatherTypes.length)];
    
    final wrongWeathers = _weatherTypes.where((w) => w != _currentWeather).toList()..shuffle();
    _options = [
      _currentWeather.name,
      wrongWeathers[0].name,
      wrongWeathers[1].name,
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentWeather.name) {
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
            colors: [Colors.lightBlue.shade200, Colors.blue.shade100],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'What is the weather?',
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
                      _currentWeather.emoji,
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

class WeatherType {
  final String name;
  final String emoji;

  WeatherType({required this.name, required this.emoji});
}
