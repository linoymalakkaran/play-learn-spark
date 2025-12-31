import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/dimensions.dart';
import '../widgets/buttons.dart';

class AvatarSelectionScreen extends StatefulWidget {
  final String currentAvatar;

  const AvatarSelectionScreen({
    super.key,
    required this.currentAvatar,
  });

  @override
  State<AvatarSelectionScreen> createState() => _AvatarSelectionScreenState();
}

class _AvatarSelectionScreenState extends State<AvatarSelectionScreen> {
  late String _selectedAvatar;

  // Available avatars grouped by category
  final Map<String, List<String>> _avatarCategories = {
    'Kids': ['👦', '👧', '🧒', '👶', '🧑', '👨', '👩', '🧔'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    'Fantasy': ['🦄', '🐉', '🦋', '🐝', '🦖', '🦕', '🐙', '🦀'],
    'Fun': ['🤖', '👽', '🎃', '🎈', '⭐', '🌟', '💫', '✨', '🎨', '🎭', '🎪', '🎡'],
  };

  @override
  void initState() {
    super.initState();
    _selectedAvatar = widget.currentAvatar;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choose Avatar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: () => Navigator.of(context).pop(_selectedAvatar),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Selected avatar preview
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppDimensions.large),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.1),
                    AppColors.secondary.withValues(alpha: 0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
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
                        style: const TextStyle(fontSize: 50),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppDimensions.medium),
                  Text(
                    'Your Selected Avatar',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            // Avatar grid by category
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(AppDimensions.medium),
                itemCount: _avatarCategories.length,
                itemBuilder: (context, index) {
                  final category = _avatarCategories.keys.elementAt(index);
                  final avatars = _avatarCategories[category]!;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppDimensions.small,
                          vertical: AppDimensions.medium,
                        ),
                        child: Text(
                          category,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          crossAxisSpacing: AppDimensions.medium,
                          mainAxisSpacing: AppDimensions.medium,
                        ),
                        itemCount: avatars.length,
                        itemBuilder: (context, avatarIndex) {
                          final avatar = avatars[avatarIndex];
                          final isSelected = avatar == _selectedAvatar;

                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedAvatar = avatar;
                              });
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primary.withValues(alpha: 0.1)
                                    : AppColors.background,
                                borderRadius: BorderRadius.circular(
                                  AppDimensions.radiusMedium,
                                ),
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.textSecondary,
                                  width: isSelected ? 3 : 1,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  avatar,
                                  style: const TextStyle(fontSize: 40),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: AppDimensions.medium),
                    ],
                  );
                },
              ),
            ),

            // Bottom button
            Padding(
              padding: const EdgeInsets.all(AppDimensions.large),
              child: PrimaryButton(
                text: 'Select Avatar',
                onPressed: () => Navigator.of(context).pop(_selectedAvatar),
                icon: Icons.check_circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
