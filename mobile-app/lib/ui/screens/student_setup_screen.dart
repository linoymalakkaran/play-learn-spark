import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/dimensions.dart';
import '../../data/models/student_model.dart';
import '../../providers/student_provider.dart';
import '../widgets/buttons.dart';
import '../widgets/inputs.dart';
import 'avatar_selection_screen.dart';
import 'home_screen.dart';

class StudentSetupScreen extends StatefulWidget {
  final bool isFirstTime;
  final StudentModel? existingStudent; // For editing

  const StudentSetupScreen({
    super.key,
    this.isFirstTime = false,
    this.existingStudent,
  });

  @override
  State<StudentSetupScreen> createState() => _StudentSetupScreenState();
}

class _StudentSetupScreenState extends State<StudentSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  
  int _selectedAge = 4;
  String _selectedAvatar = '👦';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.existingStudent != null) {
      _nameController.text = widget.existingStudent!.name;
      _selectedAge = widget.existingStudent!.age;
      _selectedAvatar = widget.existingStudent!.avatar ?? '👶';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _saveStudent() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final studentProvider = context.read<StudentProvider>();

      if (widget.existingStudent != null) {
        // Update existing student
        final updatedStudent = widget.existingStudent!.copyWith(
          name: _nameController.text.trim(),
          age: _selectedAge,
          avatar: _selectedAvatar,
        );
        await studentProvider.updateStudent(updatedStudent);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Student profile updated!')),
          );
          Navigator.of(context).pop();
        }
      } else {
        // Create new student
        await studentProvider.createStudent(
          name: _nameController.text.trim(),
          age: _selectedAge,
          avatar: _selectedAvatar,
        );

        if (mounted) {
          if (widget.isFirstTime) {
            // Navigate to home screen
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const HomeScreen()),
            );
          } else {
            // Go back with success message
            Navigator.of(context).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Student profile created!')),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _openAvatarSelection() async {
    final selected = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (context) => AvatarSelectionScreen(
          currentAvatar: _selectedAvatar,
        ),
      ),
    );

    if (selected != null) {
      setState(() {
        _selectedAvatar = selected;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.existingStudent != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Profile' : 'Create Student Profile'),
        leading: widget.isFirstTime
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.of(context).pop(),
              ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.large),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (widget.isFirstTime) ...[
                  // Welcome message for first-time setup
                  const Text(
                    "Let's Get Started! 🎉",
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppDimensions.small),
                  const Text(
                    "Create a profile for your little learner",
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppDimensions.xLarge),
                ],

                // Avatar selection
                Center(
                  child: GestureDetector(
                    onTap: _openAvatarSelection,
                    child: Stack(
                      children: [
                        Container(
                          width: 120,
                          height: 120,
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
                              _selectedAvatar,
                              style: const TextStyle(fontSize: 60),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: AppColors.accent,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 2,
                              ),
                            ),
                            child: const Icon(
                              Icons.edit,
                              size: 20,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppDimensions.small),
                Center(
                  child: TextButtonCustom(
                    text: 'Change Avatar',
                    onPressed: _openAvatarSelection,
                  ),
                ),
                const SizedBox(height: AppDimensions.xLarge),

                // Name input
                const Text(
                  "Student's Name",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppDimensions.small),
                CustomTextField(
                  controller: _nameController,
                  label: 'Enter name',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter a name';
                    }
                    if (value.trim().length < 2) {
                      return 'Name must be at least 2 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppDimensions.large),

                // Age selection
                const Text(
                  "Age",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppDimensions.small),
                AgeSelector(
                  selectedAge: _selectedAge,
                  onAgeSelected: (age) {
                    setState(() {
                      _selectedAge = age;
                    });
                  },
                ),
                const SizedBox(height: AppDimensions.xLarge),

                // Info card
                Container(
                  padding: const EdgeInsets.all(AppDimensions.medium),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: AppColors.secondary,
                      ),
                      const SizedBox(width: AppDimensions.medium),
                      Expanded(
                        child: Text(
                          'Activities will be personalized based on age and progress',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.secondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppDimensions.xLarge),

                // Save button
                PrimaryButton(
                  text: isEditing ? 'Save Changes' : 'Create Profile',
                  onPressed: _saveStudent,
                  isLoading: _isLoading,
                  icon: isEditing ? Icons.check : Icons.person_add,
                ),

                if (!widget.isFirstTime && !isEditing) ...[
                  const SizedBox(height: AppDimensions.medium),
                  SecondaryButton(
                    text: 'Cancel',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
