# Phase 5: Progress Tracking & Gamification

**Duration**: 3-4 days  
**Status**: Not Started  
**Dependencies**: Phase 1-4 Complete

## Objectives

1. Implement progress tracking dashboard
2. Create badge/achievement system
3. Build analytics and insights
4. Implement streak tracking
5. Create leaderboard (local)
6. Add reward animations
7. Build statistics visualization

## Steps

### Step 5.1: Progress Dashboard

**File**: `lib/ui/screens/home/progress_tab.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/progress_provider.dart';
import '../../../providers/student_provider.dart';
import '../../widgets/progress/stats_card.dart';
import '../../widgets/progress/activity_chart.dart';
import '../../widgets/progress/badge_showcase.dart';
import '../../widgets/progress/streak_tracker.dart';

class ProgressTab extends StatelessWidget {
  const ProgressTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<StudentProvider, ProgressProvider>(
      builder: (context, studentProvider, progressProvider, child) {
        final student = studentProvider.currentStudent;
        if (student == null) {
          return const Center(child: Text('No student selected'));
        }

        final progress = progressProvider.getProgressForStudent(student.id);
        final badges = progressProvider.getBadgesForStudent(student.id);
        final recentActivities =
            progressProvider.getRecentActivities(student.id, limit: 5);

        return Scaffold(
          appBar: AppBar(
            title: const Text('Your Progress'),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Welcome Message
                Text(
                  'Great job, ${student.name}! 🎉',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Keep up the amazing work!',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 24),

                // Streak Tracker
                StreakTracker(
                  currentStreak: progress?.currentStreak ?? 0,
                  longestStreak: 12, // Calculate from history
                ),
                const SizedBox(height: 16),

                // Stats Overview
                Row(
                  children: [
                    Expanded(
                      child: StatsCard(
                        title: 'Activities',
                        value: '${progress?.totalActivitiesCompleted ?? 0}',
                        icon: Icons.extension,
                        color: Colors.blue,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatsCard(
                        title: 'Points',
                        value: '${progress?.totalScore ?? 0}',
                        icon: Icons.star,
                        color: Colors.amber,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: StatsCard(
                        title: 'Level',
                        value:
                            '${(progress?.totalActivitiesCompleted ?? 0) ~/ 5 + 1}',
                        icon: Icons.emoji_events,
                        color: Colors.purple,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatsCard(
                        title: 'Badges',
                        value: '${badges.length}',
                        icon: Icons.workspace_premium,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Activity Chart
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Activity Over Time',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 200,
                          child: ActivityChart(
                            data: progressProvider.getDailyActivity(
                              student.id,
                              days: 7,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Badges Showcase
                if (badges.isNotEmpty) ...[
                  const Text(
                    'Your Badges',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  BadgeShowcase(badges: badges),
                  const SizedBox(height: 24),
                ],

                // Recent Activities
                if (recentActivities.isNotEmpty) ...[
                  const Text(
                    'Recent Activities',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...recentActivities.map((result) {
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.green[100],
                          child: const Icon(
                            Icons.check,
                            color: Colors.green,
                          ),
                        ),
                        title: Text(result.activityId), // Get activity name
                        subtitle: Text(
                          'Score: ${result.score} • ${result.timeSpent}s',
                        ),
                        trailing: Text(
                          _formatDate(result.completedAt),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.day}/${date.month}';
    }
  }
}
```

**Deliverable**: Progress dashboard

---

### Step 5.2: Stats Card Widget

**File**: `lib/ui/widgets/progress/stats_card.dart`

```dart
import 'package:flutter/material.dart';

class StatsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const StatsCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 32,
                color: color,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

**Deliverable**: Stats card widget

---

### Step 5.3: Streak Tracker Widget

**File**: `lib/ui/widgets/progress/streak_tracker.dart`

```dart
import 'package:flutter/material.dart';

class StreakTracker extends StatelessWidget {
  final int currentStreak;
  final int longestStreak;

  const StreakTracker({
    super.key,
    required this.currentStreak,
    required this.longestStreak,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.orange[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.orange,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.local_fire_department,
                size: 32,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Learning Streak',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '$currentStreak',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: Colors.orange,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'days',
                        style: TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                  Text(
                    'Longest: $longestStreak days',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            if (currentStreak >= 3)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  '🔥 Hot!',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

**Deliverable**: Streak tracker

---

### Step 5.4: Badge System Implementation

**File**: `lib/ui/widgets/progress/badge_showcase.dart`

```dart
import 'package:flutter/material.dart';
import '../../../data/models/badge_model.dart';

class BadgeShowcase extends StatelessWidget {
  final List<Badge> badges;

  const BadgeShowcase({
    super.key,
    required this.badges,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 140,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: badges.length,
        itemBuilder: (context, index) {
          final badge = badges[index];
          return _BadgeCard(badge: badge);
        },
      ),
    );
  }
}

class _BadgeCard extends StatelessWidget {
  final Badge badge;

  const _BadgeCard({required this.badge});

  @override
  Widget build(BuildContext context) {
    Color badgeColor;
    switch (badge.category) {
      case 'english':
        badgeColor = Colors.purple;
        break;
      case 'math':
        badgeColor = Colors.blue;
        break;
      default:
        badgeColor = Colors.amber;
    }

    return Container(
      width: 120,
      margin: const EdgeInsets.only(right: 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    badge.icon,
                    style: const TextStyle(fontSize: 32),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                badge.name,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**Deliverable**: Badge showcase

---

### Step 5.5: Badge Achievement Logic

**File**: `lib/services/badge_service.dart`

```dart
import 'package:uuid/uuid.dart';
import '../data/models/badge_model.dart';
import '../data/repositories/badge_repository.dart';
import '../data/repositories/progress_repository.dart';

class BadgeService {
  static final BadgeService instance = BadgeService._init();
  final _uuid = Uuid();
  final _badgeRepo = BadgeRepository();
  final _progressRepo = ProgressRepository();

  BadgeService._init();

  // Badge definitions
  final List<BadgeDefinition> _badgeDefinitions = [
    BadgeDefinition(
      id: 'first_activity',
      name: 'First Steps',
      description: 'Complete your first activity',
      icon: '🎯',
      category: 'milestone',
      requirement: (progress) => progress.totalActivitiesCompleted >= 1,
    ),
    BadgeDefinition(
      id: 'five_activities',
      name: 'Rising Star',
      description: 'Complete 5 activities',
      icon: '⭐',
      category: 'milestone',
      requirement: (progress) => progress.totalActivitiesCompleted >= 5,
    ),
    BadgeDefinition(
      id: 'ten_activities',
      name: 'Learning Champion',
      description: 'Complete 10 activities',
      icon: '🏆',
      category: 'milestone',
      requirement: (progress) => progress.totalActivitiesCompleted >= 10,
    ),
    BadgeDefinition(
      id: 'streak_3',
      name: 'Consistent Learner',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      category: 'milestone',
      requirement: (progress) => progress.currentStreak >= 3,
    ),
    BadgeDefinition(
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '💪',
      category: 'milestone',
      requirement: (progress) => progress.currentStreak >= 7,
    ),
    BadgeDefinition(
      id: 'math_master',
      name: 'Math Master',
      description: 'Reach Math Level 5',
      icon: '🔢',
      category: 'math',
      requirement: (progress) => progress.mathLevel >= 5,
    ),
    BadgeDefinition(
      id: 'english_expert',
      name: 'English Expert',
      description: 'Reach English Level 5',
      icon: '📚',
      category: 'english',
      requirement: (progress) => progress.englishLevel >= 5,
    ),
    BadgeDefinition(
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Earn 500 total points',
      icon: '💯',
      category: 'milestone',
      requirement: (progress) => progress.totalScore >= 500,
    ),
  ];

  Future<List<Badge>> checkAndAwardBadges(String studentId) async {
    final progress = await _progressRepo.getProgress(studentId);
    if (progress == null) return [];

    final existingBadges = await _badgeRepo.getBadgesForStudent(studentId);
    final existingBadgeIds = existingBadges.map((b) => b.id).toSet();

    final newBadges = <Badge>[];

    for (final definition in _badgeDefinitions) {
      // Skip if already earned
      if (existingBadgeIds.contains(definition.id)) continue;

      // Check if requirement is met
      if (definition.requirement(progress)) {
        final badge = Badge(
          id: _uuid.v4(),
          studentId: studentId,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
          dateEarned: DateTime.now(),
        );

        await _badgeRepo.createBadge(badge);
        newBadges.add(badge);
      }
    }

    return newBadges;
  }
}

class BadgeDefinition {
  final String id;
  final String name;
  final String description;
  final String icon;
  final String category;
  final bool Function(dynamic progress) requirement;

  BadgeDefinition({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.category,
    required this.requirement,
  });
}
```

**Deliverable**: Badge awarding system

---

### Step 5.6: Activity Chart Widget

**File**: `lib/ui/widgets/progress/activity_chart.dart`

```dart
import 'package:flutter/material.dart';

class ActivityChart extends StatelessWidget {
  final Map<String, int> data; // date -> activity count

  const ActivityChart({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    final maxValue = data.values.isEmpty
        ? 1
        : data.values.reduce((a, b) => a > b ? a : b);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: data.entries.map((entry) {
        final height = (entry.value / maxValue) * 150;
        return Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Container(
              width: 32,
              height: height,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              entry.key,
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
              ),
            ),
          ],
        );
      }).toList(),
    );
  }
}
```

**Deliverable**: Activity chart visualization

---

## Phase 5 Completion Checklist

- [ ] Progress dashboard implemented
- [ ] Stats cards showing key metrics
- [ ] Streak tracking working
- [ ] Badge system implemented
- [ ] Badge awarding logic functional
- [ ] Activity chart visualization complete
- [ ] Recent activities list showing
- [ ] Level calculation accurate
- [ ] Progress updates in real-time
- [ ] Badge celebration animations added

## Next Steps

Proceed to **Phase 6: Polish, Testing & Static Content Server**.
