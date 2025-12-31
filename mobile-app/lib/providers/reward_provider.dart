import 'package:flutter/foundation.dart';
import '../data/models/reward_model.dart';
import '../data/models/daily_challenge_model.dart';

class RewardProvider with ChangeNotifier {
  int _totalPoints = 0;
  int _availablePoints = 0;
  int _spentPoints = 0;
  String _currentLevel = 'Bronze'; // Bronze, Silver, Gold, Platinum, Diamond
  int _streakDays = 0;
  DateTime? _lastActivityDate;

  final List<RewardModel> _availableRewards = [];
  final List<RewardModel> _redeemedRewards = [];
  final List<RewardModel> _pendingRequests = [];
  final List<DailyChallengeModel> _dailyChallenges = [];

  // Getters
  int get totalPoints => _totalPoints;
  int get availablePoints => _availablePoints;
  int get spentPoints => _spentPoints;
  String get currentLevel => _currentLevel;
  int get streakDays => _streakDays;
  DateTime? get lastActivityDate => _lastActivityDate;
  List<RewardModel> get availableRewards => _availableRewards;
  List<RewardModel> get redeemedRewards => _redeemedRewards;
  List<RewardModel> get pendingRequests => _pendingRequests;
  List<DailyChallengeModel> get dailyChallenges => _dailyChallenges;

  // Initialize with default rewards
  RewardProvider() {
    _initializeRewards();
    _initializeDailyChallenges();
  }

  void _initializeRewards() {
    _availableRewards.addAll([
      RewardModel(
        id: 'extra_screen_time_30',
        title: '30 Minutes Extra Screen Time',
        description: 'Enjoy 30 extra minutes of screen time',
        pointsCost: 50,
        category: 'screen_time',
        icon: '📱',
        backgroundColor: '#E3F2FD',
        minAge: 3,
        maxAge: 6,
        requiresParentApproval: true,
      ),
      RewardModel(
        id: 'pick_dinner',
        title: 'Pick Tonight\'s Dinner',
        description: 'Choose what the family eats for dinner',
        pointsCost: 75,
        category: 'privileges',
        icon: '🍽️',
        backgroundColor: '#FFF3E0',
        minAge: 3,
        maxAge: 6,
        requiresParentApproval: true,
      ),
      RewardModel(
        id: 'stay_up_late',
        title: 'Stay Up 30 Minutes Late',
        description: 'Extend bedtime by 30 minutes',
        pointsCost: 100,
        category: 'privileges',
        icon: '🌙',
        backgroundColor: '#F3E5F5',
        minAge: 4,
        maxAge: 6,
        requiresParentApproval: true,
      ),
      RewardModel(
        id: 'ice_cream_treat',
        title: 'Ice Cream Treat',
        description: 'Get a special ice cream treat',
        pointsCost: 60,
        category: 'treats',
        icon: '🍦',
        backgroundColor: '#E8F5E9',
        minAge: 3,
        maxAge: 6,
        requiresParentApproval: true,
      ),
      RewardModel(
        id: 'park_visit',
        title: 'Visit to the Park',
        description: 'Special trip to your favorite park',
        pointsCost: 150,
        category: 'activities',
        icon: '🎮',
        backgroundColor: '#FFEBEE',
        minAge: 3,
        maxAge: 6,
        requiresParentApproval: true,
      ),
      RewardModel(
        id: 'movie_night',
        title: 'Family Movie Night',
        description: 'Pick the movie for family movie night',
        pointsCost: 120,
        category: 'activities',
        icon: '🎬',
        backgroundColor: '#FFF8E1',
        minAge: 3,
        maxAge: 6,
        requiresParentApproval: true,
      ),
      RewardModel(
        id: 'sticker_pack',
        title: 'Sticker Pack',
        description: 'A pack of fun stickers',
        pointsCost: 40,
        category: 'items',
        icon: '⭐',
        backgroundColor: '#E1F5FE',
        minAge: 3,
        maxAge: 6,
        requiresParentApproval: false,
      ),
      RewardModel(
        id: 'coloring_book',
        title: 'Coloring Book',
        description: 'A new coloring book to enjoy',
        pointsCost: 80,
        category: 'items',
        icon: '🎨',
        backgroundColor: '#FCE4EC',
        minAge: 3,
        maxAge: 6,
        requiresParentApproval: false,
      ),
    ]);
  }

  void _initializeDailyChallenges() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));

    _dailyChallenges.addAll([
      DailyChallengeModel(
        id: 'daily_complete_3',
        title: 'Complete 3 Activities',
        description: 'Complete any 3 learning activities today',
        type: 'activity_completion',
        targetValue: 3,
        rewardPoints: 20,
        icon: '🎯',
        startDate: today,
        endDate: tomorrow,
      ),
      DailyChallengeModel(
        id: 'daily_streak',
        title: 'Keep Your Streak',
        description: 'Learn for 2 days in a row',
        type: 'streak',
        targetValue: 2,
        rewardPoints: 15,
        icon: '🔥',
        startDate: today,
        endDate: tomorrow,
      ),
      DailyChallengeModel(
        id: 'daily_score',
        title: 'Score 80% or Higher',
        description: 'Get 80% or more on any activity',
        type: 'score',
        targetValue: 80,
        rewardPoints: 25,
        icon: '⭐',
        startDate: today,
        endDate: tomorrow,
      ),
    ]);
  }

  // Award points
  void awardPoints(int points, String reason) {
    _totalPoints += points;
    _availablePoints += points;
    notifyListeners();
  }

  // Request reward
  Future<bool> requestReward(String rewardId) async {
    final reward = _availableRewards.firstWhere((r) => r.id == rewardId);

    if (_availablePoints < reward.pointsCost) {
      return false; // Not enough points
    }

    // Deduct points
    _availablePoints -= reward.pointsCost;
    _spentPoints += reward.pointsCost;

    // Move to pending if requires approval, otherwise redeem directly
    if (reward.requiresParentApproval) {
      _pendingRequests
          .add(reward.copyWith(status: 'requested', redeemedAt: DateTime.now()));
    } else {
      _redeemedRewards
          .add(reward.copyWith(status: 'redeemed', redeemedAt: DateTime.now()));
    }

    notifyListeners();
    return true;
  }

  // Update streak
  void updateStreak() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    if (_lastActivityDate == null) {
      _streakDays = 1;
    } else {
      final lastDay = DateTime(_lastActivityDate!.year,
          _lastActivityDate!.month, _lastActivityDate!.day);
      final daysDifference = today.difference(lastDay).inDays;

      if (daysDifference == 1) {
        _streakDays++;
      } else if (daysDifference > 1) {
        _streakDays = 1; // Reset streak
      }
      // If same day, don't change streak
    }

    _lastActivityDate = now;
    notifyListeners();
  }

  // Update level based on total points
  void updateLevel() {
    if (_totalPoints >= 1000) {
      _currentLevel = 'Diamond';
    } else if (_totalPoints >= 500) {
      _currentLevel = 'Platinum';
    } else if (_totalPoints >= 250) {
      _currentLevel = 'Gold';
    } else if (_totalPoints >= 100) {
      _currentLevel = 'Silver';
    } else {
      _currentLevel = 'Bronze';
    }
    notifyListeners();
  }

  // Update daily challenge progress
  void updateChallengeProgress(String challengeId, int value) {
    final index = _dailyChallenges.indexWhere((c) => c.id == challengeId);
    if (index != -1) {
      final challenge = _dailyChallenges[index];
      final newValue = challenge.currentValue + value;
      final isCompleted = newValue >= challenge.targetValue;

      _dailyChallenges[index] = challenge.copyWith(
        currentValue: newValue,
        isCompleted: isCompleted,
        completedAt: isCompleted ? DateTime.now() : null,
      );

      // Award points if completed
      if (isCompleted && !challenge.isCompleted) {
        awardPoints(challenge.rewardPoints, 'Completed ${challenge.title}');
      }

      notifyListeners();
    }
  }

  // Get points needed for next level
  int getPointsForNextLevel() {
    switch (_currentLevel) {
      case 'Bronze':
        return 100 - _totalPoints;
      case 'Silver':
        return 250 - _totalPoints;
      case 'Gold':
        return 500 - _totalPoints;
      case 'Platinum':
        return 1000 - _totalPoints;
      default:
        return 0;
    }
  }
}
