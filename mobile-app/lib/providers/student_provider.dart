import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../data/models/student_model.dart';
import '../data/models/progress_model.dart';
import '../data/repositories/student_repository.dart';
import '../data/repositories/progress_repository.dart';

class StudentProvider with ChangeNotifier {
  final StudentRepository _studentRepository = StudentRepository();
  final ProgressRepository _progressRepository = ProgressRepository();
  final _uuid = const Uuid();

  StudentModel? _currentStudent;
  List<StudentModel> _students = [];
  bool _isLoading = false;
  String? _error;

  StudentModel? get currentStudent => _currentStudent;
  List<StudentModel> get students => _students;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasStudents => _students.isNotEmpty;

  Future<void> loadStudents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _students = await _studentRepository.getActiveStudents();
      
      // Set first student as current if none selected
      if (_currentStudent == null && _students.isNotEmpty) {
        _currentStudent = _students.first;
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createStudent({
    required String name,
    required int age,
    String? avatar,
    Map<String, dynamic>? preferences,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final now = DateTime.now();
      final student = StudentModel(
        id: _uuid.v4(),
        name: name,
        age: age,
        avatar: avatar,
        createdAt: now,
        updatedAt: now,
        preferences: preferences,
        isActive: true,
      );

      await _studentRepository.create(student);

      // Create initial progress record
      final progress = ProgressModel(
        id: _uuid.v4(),
        studentId: student.id,
        createdAt: now,
        updatedAt: now,
      );
      await _progressRepository.create(progress);

      _students.add(student);
      
      // Set as current student if it's the first one
      if (_students.length == 1) {
        _currentStudent = student;
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateStudent(StudentModel student) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final updatedStudent = student.copyWith(
        updatedAt: DateTime.now(),
      );
      
      await _studentRepository.update(updatedStudent);

      final index = _students.indexWhere((s) => s.id == student.id);
      if (index != -1) {
        _students[index] = updatedStudent;
      }

      if (_currentStudent?.id == student.id) {
        _currentStudent = updatedStudent;
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteStudent(String studentId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _studentRepository.delete(studentId);
      _students.removeWhere((s) => s.id == studentId);

      if (_currentStudent?.id == studentId) {
        _currentStudent = _students.isNotEmpty ? _students.first : null;
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCurrentStudent(StudentModel student) {
    _currentStudent = student;
    notifyListeners();
  }

  Future<void> switchStudent(String studentId) async {
    final student = await _studentRepository.getById(studentId);
    if (student != null) {
      _currentStudent = student;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
