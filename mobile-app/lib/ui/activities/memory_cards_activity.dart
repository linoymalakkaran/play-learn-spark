import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class MemoryCardsActivity extends BaseActivity {
  const MemoryCardsActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<MemoryCardsActivity> createState() => _MemoryCardsActivityState();
}

class _MemoryCardsActivityState extends BaseActivityState<MemoryCardsActivity> {
  final List<String> _emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉'];
  late List<MemoryCard> _cards;
  MemoryCard? _firstCard;
  MemoryCard? _secondCard;
  bool _canTap = true;
  int _matchesFound = 0;

  @override
  void initializeActivity() {
    totalQuestions = 1; // Single game session
    _generateCards();
  }

  void _generateCards() {
    final selectedEmojis = _emojis.sublist(0, 3); // 3 pairs
    final cardEmojis = [...selectedEmojis, ...selectedEmojis]..shuffle();
    _cards = List.generate(
      6,
      (index) => MemoryCard(id: index, emoji: cardEmojis[index]),
    );
  }

  void _handleCardTap(MemoryCard card) {
    if (!_canTap || card.isMatched || card.isFlipped) return;

    setState(() {
      card.isFlipped = true;
    });

    if (_firstCard == null) {
      _firstCard = card;
    } else if (_secondCard == null) {
      _secondCard = card;
      _canTap = false;

      Future.delayed(const Duration(milliseconds: 500), () {
        _checkMatch();
      });
    }
  }

  void _checkMatch() {
    if (_firstCard!.emoji == _secondCard!.emoji) {
      setState(() {
        _firstCard!.isMatched = true;
        _secondCard!.isMatched = true;
        _matchesFound++;
      });
      onCorrectAnswer();

      if (_matchesFound == 3) {
        Future.delayed(const Duration(milliseconds: 800), completeActivity);
      }
    } else {
      onIncorrectAnswer();
      Future.delayed(const Duration(milliseconds: 800), () {
        setState(() {
          _firstCard!.isFlipped = false;
          _secondCard!.isFlipped = false;
        });
      });
    }

    setState(() {
      _firstCard = null;
      _secondCard = null;
      _canTap = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.activity.title),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.indigo.shade100, Colors.purple.shade100],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const Padding(
                padding: EdgeInsets.all(24.0),
                child: Text(
                  'Find matching pairs!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(24),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: _cards.length,
                  itemBuilder: (context, index) {
                    final card = _cards[index];
                    return GestureDetector(
                      onTap: () => _handleCardTap(card),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        decoration: BoxDecoration(
                          color: card.isFlipped || card.isMatched
                              ? Colors.white
                              : AppColors.primary,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            card.isFlipped || card.isMatched ? card.emoji : '?',
                            style: TextStyle(
                              fontSize: card.isFlipped || card.isMatched ? 50 : 40,
                              color: card.isFlipped || card.isMatched
                                  ? Colors.black
                                  : Colors.white,
                            ),
                          ),
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

class MemoryCard {
  final int id;
  final String emoji;
  bool isFlipped;
  bool isMatched;

  MemoryCard({
    required this.id,
    required this.emoji,
    this.isFlipped = false,
    this.isMatched = false,
  });
}
