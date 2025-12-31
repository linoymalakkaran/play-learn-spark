import 'package:flutter/material.dart';
import 'dart:math';
import '../../data/models/activity_model.dart';
import '../../core/constants/colors.dart';
import 'base_activity.dart';

class SimplePuzzlesActivity extends BaseActivity {
  const SimplePuzzlesActivity({
    super.key,
    required super.activity,
    required super.onComplete,
  });

  @override
  State<SimplePuzzlesActivity> createState() => _SimplePuzzlesActivityState();
}

class _SimplePuzzlesActivityState extends BaseActivityState<SimplePuzzlesActivity> {
  late List<PuzzlePiece> _pieces;
  late List<int?> _slots;
  PuzzlePiece? _draggedPiece;
  int _puzzlesCompleted = 0;

  @override
  void initializeActivity() {
    totalQuestions = 3; // 3 puzzles to complete
    _generatePuzzle();
  }

  void _generatePuzzle() {
    final colors = [Colors.red, Colors.blue, Colors.green, Colors.yellow];
    _pieces = List.generate(4, (index) {
      return PuzzlePiece(id: index, color: colors[index]);
    })..shuffle();
    
    _slots = List.filled(4, null);
  }

  void _handleDrop(int slotIndex, PuzzlePiece piece) {
    setState(() {
      _slots[slotIndex] = piece.id;
      _pieces.removeWhere((p) => p.id == piece.id);
    });

    if (_pieces.isEmpty) {
      _puzzlesCompleted++;
      onCorrectAnswer();
      
      if (_puzzlesCompleted >= totalQuestions) {
        Future.delayed(const Duration(milliseconds: 800), completeActivity);
      } else {
        Future.delayed(const Duration(milliseconds: 800), () {
          setState(() {
            _generatePuzzle();
          });
        });
      }
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
                '$_puzzlesCompleted/$totalQuestions',
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
            colors: [Colors.lightBlue.shade100, Colors.lightGreen.shade100],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Padding(
                padding: EdgeInsets.all(24.0),
                child: Text(
                  'Drag pieces to complete the puzzle!',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 32),
              // Puzzle slots
              Container(
                padding: const EdgeInsets.all(16),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: 4,
                  itemBuilder: (context, index) {
                    return DragTarget<PuzzlePiece>(
                      onAcceptWithDetails: (details) => _handleDrop(index, details.data),
                      builder: (context, candidateData, rejectedData) {
                        final pieceId = _slots[index];
                        final colors = [Colors.red, Colors.blue, Colors.green, Colors.yellow];
                        
                        return Container(
                          decoration: BoxDecoration(
                            color: pieceId != null ? colors[pieceId] : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: candidateData.isNotEmpty 
                                  ? AppColors.primary 
                                  : Colors.grey.shade300,
                              width: 3,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Center(
                            child: pieceId != null 
                                ? const Icon(Icons.check, size: 40, color: Colors.white)
                                : Text('${index + 1}', 
                                    style: TextStyle(
                                      fontSize: 24,
                                      color: Colors.grey.shade400,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 48),
              // Available pieces
              Wrap(
                spacing: 16,
                children: _pieces.map((piece) {
                  return Draggable<PuzzlePiece>(
                    data: piece,
                    feedback: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: piece.color.withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                    ),
                    childWhenDragging: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: piece.color,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class PuzzlePiece {
  final int id;
  final Color color;

  PuzzlePiece({required this.id, required this.color});
}
