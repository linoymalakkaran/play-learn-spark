import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/activity_provider.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/app_constants.dart';

class ActivitiesTab extends StatefulWidget {
  const ActivitiesTab({super.key});

  @override
  State<ActivitiesTab> createState() => _ActivitiesTabState();
}

class _ActivitiesTabState extends State<ActivitiesTab> {
  String _selectedCategory = 'all';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learning Activities'),
      ),
      body: Column(
        children: [
          // Category Filter
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildCategoryChip('all', 'All', Icons.apps),
                ...AppConstants.activityCategories.entries.map((entry) {
                  return _buildCategoryChip(
                    entry.key,
                    entry.value['display'],
                    entry.value['icon'],
                  );
                }),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Activities Grid
          Expanded(
            child: Consumer<ActivityProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                final activities = _selectedCategory == 'all'
                    ? provider.activities
                    : provider.getActivitiesByCategory(_selectedCategory);
                
                if (activities.isEmpty) {
                  return const Center(
                    child: Text('No activities available'),
                  );
                }
                
                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.75,
                  ),
                  itemCount: activities.length,
                  itemBuilder: (context, index) {
                    final activity = activities[index];
                    return GestureDetector(
                      onTap: () {
                        // Navigate to activity detail
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Starting ${activity.title}...')),
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Color(int.parse(activity.backgroundColor.replaceAll('#', '0xFF'))),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Stack(
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    activity.icon,
                                    style: const TextStyle(fontSize: 40),
                                  ),
                                  const Spacer(),
                                  Text(
                                    activity.title,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    activity.description,
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: AppColors.textSecondary,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.access_time,
                                        size: 14,
                                        color: AppColors.textSecondary,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${activity.estimatedDuration ~/ 60} min',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                      const Spacer(),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: _getDifficultyColor(activity.difficultyLevel),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          _getDifficultyText(activity.difficultyLevel),
                                          style: const TextStyle(
                                            fontSize: 10,
                                            color: Colors.white,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            if (activity.isPremium)
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: AppColors.warning,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.star,
                                    size: 16,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String key, String label, IconData icon) {
    final isSelected = _selectedCategory == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        selected: isSelected,
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16),
            const SizedBox(width: 4),
            Text(label),
          ],
        ),
        onSelected: (selected) {
          setState(() {
            _selectedCategory = key;
          });
        },
        selectedColor: AppColors.primary,
        backgroundColor: Colors.grey[200],
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
    );
  }

  Color _getDifficultyColor(int level) {
    switch (level) {
      case 1:
        return AppColors.success;
      case 2:
        return AppColors.warning;
      case 3:
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  String _getDifficultyText(int level) {
    switch (level) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      default:
        return 'Unknown';
    }
  }
}
