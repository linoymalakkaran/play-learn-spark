import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../data/models/progress_model.dart';
import '../data/models/badge_model.dart';
import '../data/models/activity_result_model.dart';
import '../data/models/daily_session_model.dart';
import '../data/repositories/progress_repository.dart';
import '../data/repositories/badge_repository.dart';
import '../data/repositories/activity_result_repository.dart';
import '../data/repositories/daily_session_repository.dart';

class ProgressProvider with ChangeNotifier {
  final ProgressRepository _progressRepository = ProgressRepository();
  final BadgeRepository _badgeRepository = BadgeRepository();
  final ActivityResultRepository _resultRepository = ActivityResultRepository();
  final DailySessionRepository _sessionRepository = DailySessionRepository();
  final _uuid = const Uuid();

  ProgressModel? _currentProgress;
  List<BadgeModel> _badges = [];
  List<ActivityResultModel> _recentResults = [];
  DailySessionModel? _todaySession;
  bool _isLoading = false;
  String? _error;

  ProgressModel? get currentProgress => _currentProgress;
  List<BadgeModel> get badges => _badges;
  List<ActivityResultModel> get recentResults => _recentResults;
  DailySessionModel? get todaySession => _todaySession;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProgressForStudent(String studentId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentProgress = await _progressRepository.getByStudentId(studentId);
      _badges = await _badgeRepository.getByStudentId(studentId);
      _recentResults = await _resultRepository.getByStudentId(studentId, limit: 10);
      _todaySession = await _sessionRepository.getTodaySession(studentId);

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> recordActivityCompletion({
    required String studentId,
    required String activityId,
    required int score,
    required int timeSpent,
    double? accuracy,
    Map<String, dynamic>? performanceData,
  }) async {
    try {
      final now = DateTime.now();
      
      // Create activity result
      final result = ActivityResultModel(
        id: _uuid.v4(),
        studentId: studentId,
        activityId: activityId,
        score: score,
        timeSpent: timeSpent,
        completedAt: now,
        accuracy: accuracy,
        performanceData: performanceData,
      );
      await _resultRepository.create(result);

      // Update progress
      await _progressRepository.incrementActivityCompleted(studentId);
      await _progressRepository.updateScore(studentId, score);

      // Update or create today's session
      final today = DateTime(now.year, now.month, now.day);
      DailySessionModel? session = await _sessionRepository.getTodaySession(studentId);
      
      if (session == null) {
        session = DailySessionModel(
          id: _uuid.v4(),
          studentId: studentId,
          date: today,
          activitiesCount: 1,
          timeSpent: timeSpent,
          pointsEarned: score,
        );
        await _sessionRepository.create(session);
      } else {
        await _sessionRepository.incrementActivitiesCount(studentId, now);
        await _sessionRepository.addTimeSpent(studentId, now, timeSpent);
        await _sessionRepository.addPointsEarned(studentId, now, score);
      }

      // Check for new badges
      await _checkAndAwardBadges(studentId);

      // Reload progress
      await loadProgressForStudent(studentId);
      
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> _checkAndAwardBadges(String studentId) async {
    final progress = await _progressRepository.getByStudentId(studentId);
    if (progress == null) return;

    final badges = <BadgeModel>[];
    final now = DateTime.now();

    // First Activity Badge
    if (progress.totalActivitiesCompleted == 1) {
      final hasBadge = await _badgeRepository.hasBadge(studentId, 'First Steps');
      if (!hasBadge) {
        badges.add(BadgeModel(
          id: _uuid.v4(),
          studentId: studentId,
          name: 'First Steps',
          description: 'Completed your first activity!',
          icon: '🎯',
          category: 'milestone',
          dateEarned: now,
        ));
      }
    }

    // Activity Milestones
    if (progress.totalActivitiesCompleted == 10) {
      final hasBadge = await _badgeRepository.hasBadge(studentId, 'Learning Explorer');
      if (!hasBadge) {
        badges.add(BadgeModel(
          id: _uuid.v4(),
          studentId: studentId,
          name: 'Learning Explorer',
          description: 'Completed 10 activities!',
          icon: '🌟',
          category: 'milestone',
          dateEarned: now,
        ));
      }
    }

    if (progress.totalActivitiesCompleted == 50) {
      final hasBadge = await _badgeRepository.hasBadge(studentId, 'Super Learner');
      if (!hasBadge) {
        badges.add(BadgeModel(
          id: _uuid.v4(),
          studentId: studentId,
          name: 'Super Learner',
          description: 'Completed 50 activities!',
          icon: '🏆',
          category: 'milestone',
          dateEarned: now,
        ));
      }
    }

    // Streak Badges
    if (progress.currentStreak >= 7) {
      final hasBadge = await _badgeRepository.hasBadge(studentId, 'Week Warrior');
      if (!hasBadge) {
        badges.add(BadgeModel(
          id: _uuid.v4(),
          studentId: studentId,
          name: 'Week Warrior',
          description: '7-day learning streak!',
          icon: '🔥',
          category: 'streak',
          dateEarned: now,
        ));
      }
    }

    // Score Milestones
    if (progress.totalScore >= 1000) {
      final hasBadge = await _badgeRepository.hasBadge(studentId, 'Point Master');
      if (!hasBadge) {
        badges.add(BadgeModel(
          id: _uuid.v4(),
          studentId: studentId,
          name: 'Point Master',
          description: 'Earned 1000 points!',
          icon: '💎',
          category: 'score',
          dateEarned: now,
        ));
      }
    }

    // Insert new badges
    for (final badge in badges) {
      await _badgeRepository.create(badge);
    }
  }

  Future<void> updateStreak(String studentId) async {
    try {
      final streak = await _sessionRepository.getStreak(studentId);
      await _progressRepository.updateStreak(studentId, streak);
      await loadProgressForStudent(studentId);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> getStudentStats(String studentId) async {
    try {
      return await _resultRepository.getStudentStats(studentId);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return {};
    }
  }

  Future<Map<String, dynamic>> getWeeklySummary(String studentId) async {
    try {
      return await _sessionRepository.getWeeklySummary(studentId);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return {};
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
