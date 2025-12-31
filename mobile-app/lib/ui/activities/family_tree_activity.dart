import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class FamilyTreeActivity extends BaseActivity {
  const FamilyTreeActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<FamilyTreeActivity> createState() => _FamilyTreeActivityState();
}

class _FamilyTreeActivityState extends BaseActivityState<FamilyTreeActivity> {
  final List<FamilyMember> _members = [
    FamilyMember(name: 'Mother', emoji: '👩', description: 'She takes care of you'),
    FamilyMember(name: 'Father', emoji: '👨', description: 'He protects the family'),
    FamilyMember(name: 'Grandmother', emoji: '👵', description: 'Your mom or dad\'s mom'),
    FamilyMember(name: 'Grandfather', emoji: '👴', description: 'Your mom or dad\'s dad'),
    FamilyMember(name: 'Sister', emoji: '👧', description: 'Your female sibling'),
    FamilyMember(name: 'Brother', emoji: '👦', description: 'Your male sibling'),
    FamilyMember(name: 'Baby', emoji: '👶', description: 'A very young child'),
    FamilyMember(name: 'Aunt', emoji: '👩‍🦱', description: 'Your parent\'s sister'),
  ];

  late FamilyMember _currentMember;
  late List<String> _options;

  @override
  void initializeActivity() {
    totalQuestions = 6;
    _generateQuestion();
  }

  void _generateQuestion() {
    final random = Random();
    _currentMember = _members[random.nextInt(_members.length)];
    
    final wrongMembers = _members.where((m) => m != _currentMember).toList()..shuffle();
    _options = [
      _currentMember.name,
      wrongMembers[0].name,
      wrongMembers[1].name,
    ]..shuffle();
  }

  void _handleAnswer(String selectedName) {
    if (selectedName == _currentMember.name) {
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
        backgroundColor: Colors.pink.shade400,
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
            colors: [Colors.pink.shade50, Colors.purple.shade50],
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
                    'Who is this family member?',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
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
                          _currentMember.emoji,
                          style: const TextStyle(fontSize: 80),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _currentMember.description,
                          style: const TextStyle(
                            fontSize: 16,
                            fontStyle: FontStyle.italic,
                          ),
                          textAlign: TextAlign.center,
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
                              foregroundColor: Colors.pink.shade400,
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

class FamilyMember {
  final String name;
  final String emoji;
  final String description;

  FamilyMember({
    required this.name,
    required this.emoji,
    required this.description,
  });
}
