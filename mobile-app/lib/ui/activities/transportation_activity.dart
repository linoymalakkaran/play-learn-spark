import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class TransportationActivity extends BaseActivity {
  const TransportationActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<TransportationActivity> createState() => _TransportationActivityState();
}

class _TransportationActivityState extends BaseActivityState<TransportationActivity> {
  final List<Vehicle> _vehicles = [
    Vehicle(name: 'Car', emoji: '🚗', sound: 'Vroom!', type: 'Land'),
    Vehicle(name: 'Airplane', emoji: '✈️', sound: 'Whoosh!', type: 'Air'),
    Vehicle(name: 'Boat', emoji: '🚢', sound: 'Horn!', type: 'Water'),
    Vehicle(name: 'Train', emoji: '🚂', sound: 'Choo-choo!', type: 'Land'),
    Vehicle(name: 'Bicycle', emoji: '🚲', sound: 'Ring!', type: 'Land'),
    Vehicle(name: 'Bus', emoji: '🚌', sound: 'Beep-beep!', type: 'Land'),
    Vehicle(name: 'Helicopter', emoji: '🚁', sound: 'Chop-chop!', type: 'Air'),
    Vehicle(name: 'Motorcycle', emoji: '🏍️', sound: 'Vroom!', type: 'Land'),
  ];

  late Vehicle _currentVehicle;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    generateNewQuestion();
  }

  @override


  void generateNewQuestion() {


    setState(() {
    final random = Random();
    _currentVehicle = _vehicles[random.nextInt(_vehicles.length)];
    
    final wrongVehicles = _vehicles.where((v) => v != _currentVehicle).toList()..shuffle();
    _options = [
      _currentVehicle.name,
      wrongVehicles[0].name,
      wrongVehicles[1].name,
    ]..shuffle();
    }); // setState
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentVehicle.name) {
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
        backgroundColor: Colors.blue.shade700,
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
            colors: [Colors.blue.shade100, Colors.lightBlue.shade100],
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
                    'What vehicle is this?',
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
                          _currentVehicle.emoji,
                          style: const TextStyle(fontSize: 80),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '"${_currentVehicle.sound}"',
                          style: const TextStyle(
                            fontSize: 24,
                            fontStyle: FontStyle.italic,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  ..._options.map((name) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _handleAnswer(name),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.blue.shade700,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 4,
                            ),
                            child: Text(
                              name,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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

class Vehicle {
  final String name;
  final String emoji;
  final String sound;
  final String type;

  Vehicle({
    required this.name,
    required this.emoji,
    required this.sound,
    required this.type,
  });
}
