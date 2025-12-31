import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/student_provider.dart';
import '../../providers/progress_provider.dart';
import '../../core/constants/colors.dart';

class BadgesScreen extends StatefulWidget {
  const BadgesScreen({super.key});

  @override
  State<BadgesScreen> createState() => _BadgesScreenState();
}

class _BadgesScreenState extends State<BadgesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Badges'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white.withValues(alpha: 0.7),
          tabs: const [
            Tab(text: 'Earned'),
            Tab(text: 'Locked'),
          ],
        ),
      ),
      body: Consumer2<StudentProvider, ProgressProvider>(
        builder: (context, studentProvider, progressProvider, child) {
          if (studentProvider.currentStudent == null) {
            return const Center(
              child: Text('No student selected'),
            );
          }

          return TabBarView(
            controller: _tabController,
            children: [
              _buildEarnedBadges(),
              _buildLockedBadges(),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEarnedBadges() {
    // Sample earned badges
    final earnedBadges = [
      _Badge('First Steps', '👣', 'Complete your first activity', DateTime.now()),
      _Badge('Rising Star', '⭐', 'Earn 100 points', DateTime.now().subtract(const Duration(days: 2))),
      _Badge('Animal Expert', '🦁', 'Master Animal Safari', DateTime.now().subtract(const Duration(days: 5))),
      _Badge('3-Day Streak', '🔥', 'Learn for 3 days in a row', DateTime.now().subtract(const Duration(days: 1))),
    ];

    if (earnedBadges.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.emoji_events_outlined,
              size: 80,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No badges earned yet',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Keep learning to earn your first badge!',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.85,
      ),
      itemCount: earnedBadges.length,
      itemBuilder: (context, index) {
        final badge = earnedBadges[index];
        return _buildBadgeCard(badge, isEarned: true);
      },
    );
  }

  Widget _buildLockedBadges() {
    // Sample locked badges
    final lockedBadges = [
      _Badge('Super Learner', '🌟', 'Earn 500 points', null, requiredPoints: 500),
      _Badge('Champion', '🏆', 'Earn 1000 points', null, requiredPoints: 1000),
      _Badge('Math Wizard', '🔢', 'Master Counting Train', null),
      _Badge('Shape Master', '🔷', 'Master Shape Explorer', null),
      _Badge('7-Day Streak', '🚀', 'Learn for 7 days in a row', null),
      _Badge('Perfect Score', '💯', 'Get 100% on an activity', null),
    ];

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.85,
      ),
      itemCount: lockedBadges.length,
      itemBuilder: (context, index) {
        final badge = lockedBadges[index];
        return _buildBadgeCard(badge, isEarned: false);
      },
    );
  }

  Widget _buildBadgeCard(_Badge badge, {required bool isEarned}) {
    return GestureDetector(
      onTap: () => _showBadgeDetails(badge, isEarned),
      child: Container(
        decoration: BoxDecoration(
          gradient: isEarned
              ? LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.amber.shade100,
                    Colors.orange.shade100,
                  ],
                )
              : null,
          color: isEarned ? null : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: isEarned
                  ? Colors.amber.withValues(alpha: 0.3)
                  : Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isEarned)
              Stack(
                alignment: Alignment.center,
                children: [
                  Opacity(
                    opacity: 0.3,
                    child: Text(
                      badge.emoji,
                      style: const TextStyle(fontSize: 64),
                    ),
                  ),
                  Icon(
                    Icons.lock,
                    size: 40,
                    color: Colors.grey.shade600,
                  ),
                ],
              )
            else
              Text(
                badge.emoji,
                style: const TextStyle(fontSize: 64),
              ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                badge.name,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isEarned ? AppColors.primary : Colors.grey.shade600,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(height: 4),
            if (isEarned && badge.earnedDate != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  _formatDate(badge.earnedDate!),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showBadgeDetails(_Badge badge, bool isEarned) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: isEarned
                    ? LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.amber.shade200,
                          Colors.orange.shade200,
                        ],
                      )
                    : null,
                color: isEarned ? null : Colors.grey.shade200,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: isEarned
                    ? Text(
                        badge.emoji,
                        style: const TextStyle(fontSize: 48),
                      )
                    : Stack(
                        alignment: Alignment.center,
                        children: [
                          Opacity(
                            opacity: 0.3,
                            child: Text(
                              badge.emoji,
                              style: const TextStyle(fontSize: 48),
                            ),
                          ),
                          Icon(
                            Icons.lock,
                            size: 32,
                            color: Colors.grey.shade600,
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              badge.name,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              badge.description,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
            if (isEarned && badge.earnedDate != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle, color: Colors.green.shade600, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Earned ${_formatDate(badge.earnedDate!)}',
                      style: TextStyle(
                        color: Colors.green.shade700,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (badge.requiredPoints != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Requires ${badge.requiredPoints} points',
                  style: TextStyle(
                    color: Colors.blue.shade700,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      return 'Today';
    } else if (diff.inDays == 1) {
      return 'Yesterday';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}

class _Badge {
  final String name;
  final String emoji;
  final String description;
  final DateTime? earnedDate;
  final int? requiredPoints;

  _Badge(
    this.name,
    this.emoji,
    this.description,
    this.earnedDate, {
    this.requiredPoints,
  });
}
