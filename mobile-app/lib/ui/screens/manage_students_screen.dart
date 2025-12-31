import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/dimensions.dart';
import '../../providers/student_provider.dart';
import '../widgets/buttons.dart';
import '../widgets/common_widgets.dart';
import 'student_setup_screen.dart';

class ManageStudentsScreen extends StatelessWidget {
  const ManageStudentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Students'),
      ),
      body: SafeArea(
        child: Consumer<StudentProvider>(
          builder: (context, studentProvider, child) {
            final students = studentProvider.students;

            if (students.isEmpty) {
              return EmptyState(
                title: 'No Students',
                icon: Icons.people_outline,
                message: 'No student profiles yet',
                actionLabel: 'Add First Student',
                onAction: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const StudentSetupScreen(),
                    ),
                  );
                },
              );
            }

            return Column(
              children: [
                // Header info
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppDimensions.large),
                  color: AppColors.primary.withValues(alpha: 0.05),
                  child: Column(
                    children: [
                      Icon(
                        Icons.people,
                        size: 48,
                        color: AppColors.primary,
                      ),
                      const SizedBox(height: AppDimensions.small),
                      Text(
                        '${students.length} Student${students.length == 1 ? '' : 's'}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: AppDimensions.small),
                      const Text(
                        'Tap a student to edit or delete',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),

                // Student list
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppDimensions.medium),
                    itemCount: students.length,
                    itemBuilder: (context, index) {
                      final student = students[index];
                      final isActive = studentProvider.currentStudent?.id == student.id;

                      return Card(
                        margin: const EdgeInsets.only(bottom: AppDimensions.medium),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(AppDimensions.medium),
                          leading: Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.primary,
                                  AppColors.secondary,
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                student.avatar ?? '👶',
                                style: const TextStyle(fontSize: 30),
                              ),
                            ),
                          ),
                          title: Row(
                            children: [
                              Text(
                                student.name,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (isActive) ...[
                                const SizedBox(width: AppDimensions.small),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: AppDimensions.small,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.success,
                                    borderRadius: BorderRadius.circular(
                                      AppDimensions.radiusSmall,
                                    ),
                                  ),
                                  child: const Text(
                                    'Active',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: AppDimensions.small),
                              Text(
                                'Age: ${student.age} years',
                                style: const TextStyle(fontSize: 12),
                              ),
                              Text(
                                'Since ${_formatDate(student.createdAt)}',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          trailing: PopupMenuButton<String>(
                            onSelected: (value) async {
                              if (value == 'edit') {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => StudentSetupScreen(
                                      existingStudent: student,
                                    ),
                                  ),
                                );
                              } else if (value == 'delete') {
                                _showDeleteConfirmation(context, student.id, student.name);
                              } else if (value == 'switch') {
                                await studentProvider.switchStudent(student.id);
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Switched to ${student.name}'),
                                    ),
                                  );
                                }
                              }
                            },
                            itemBuilder: (context) => [
                              if (!isActive)
                                const PopupMenuItem(
                                  value: 'switch',
                                  child: Row(
                                    children: [
                                      Icon(Icons.swap_horiz),
                                      SizedBox(width: AppDimensions.small),
                                      Text('Switch to this student'),
                                    ],
                                  ),
                                ),
                              const PopupMenuItem(
                                value: 'edit',
                                child: Row(
                                  children: [
                                    Icon(Icons.edit),
                                    SizedBox(width: AppDimensions.small),
                                    Text('Edit Profile'),
                                  ],
                                ),
                              ),
                              if (students.length > 1)
                                const PopupMenuItem(
                                  value: 'delete',
                                  child: Row(
                                    children: [
                                      Icon(Icons.delete, color: Colors.red),
                                      SizedBox(width: AppDimensions.small),
                                      Text('Delete', style: TextStyle(color: Colors.red)),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => StudentSetupScreen(
                                  existingStudent: student,
                                ),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),

                // Add new student button
                Padding(
                  padding: const EdgeInsets.all(AppDimensions.large),
                  child: PrimaryButton(
                    text: 'Add New Student',
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => const StudentSetupScreen(),
                        ),
                      );
                    },
                    icon: Icons.person_add,
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[date.month - 1]} ${date.year}';
  }

  void _showDeleteConfirmation(BuildContext context, String studentId, String studentName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Student Profile'),
        content: Text('Are you sure you want to delete $studentName\'s profile? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              
              try {
                await context.read<StudentProvider>().deleteStudent(studentId);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Student profile deleted')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
