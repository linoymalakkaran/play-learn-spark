import 'package:flutter/foundation.dart';
import '../data/models/activity_model.dart';
import '../data/repositories/activity_repository.dart';
import '../data/seeders/activity_seeder.dart';

class ActivityProvider with ChangeNotifier {
  final ActivityRepository _activityRepository = ActivityRepository();
  final ActivitySeeder _seeder = ActivitySeeder();

  List<ActivityModel> _activities = [];
  ActivityModel? _currentActivity;
  bool _isLoading = false;
  String? _error;
  String _selectedCategory = 'all';

  List<ActivityModel> get activities => _activities;
  ActivityModel? get currentActivity => _currentActivity;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get selectedCategory => _selectedCategory;

  List<ActivityModel> get filteredActivities {
    if (_selectedCategory == 'all') {
      return _activities;
    }
    return _activities.where((a) => a.category == _selectedCategory).toList();
  }

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Seed activities if needed
      await _seeder.seedActivities();
      
      // Load all activities
      await loadActivities();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadActivities() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _activities = await _activityRepository.getAll();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadByCategory(String category) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _activities = await _activityRepository.getByCategory(category);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadByAge(int age) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _activities = await _activityRepository.getByAgeRange(age);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  List<ActivityModel> getActivitiesByCategory(String category) {
    return _activities.where((a) => a.category == category).toList();
  }

  List<ActivityModel> getActivitiesForAge(int age) {
    return _activities.where((a) => a.minAge <= age && a.maxAge >= age).toList();
  }

  void setSelectedCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setCurrentActivity(ActivityModel activity) {
    _currentActivity = activity;
    notifyListeners();
  }

  Future<ActivityModel?> getActivityById(String id) async {
    try {
      return await _activityRepository.getById(id);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Map<String, int> getCategoryCounts() {
    final counts = <String, int>{};
    for (final activity in _activities) {
      counts[activity.category] = (counts[activity.category] ?? 0) + 1;
    }
    return counts;
  }
}
