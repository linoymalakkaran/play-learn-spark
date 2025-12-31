import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/reward_provider.dart';
import '../../providers/student_provider.dart';
import '../../data/models/reward_model.dart';
import '../../data/models/daily_challenge_model.dart';
import '../../core/constants/colors.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
        title: const Text('Rewards Store'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white.withValues(alpha: 0.7),
          tabs: const [
            Tab(text: 'Shop'),
            Tab(text: 'Challenges'),
            Tab(text: 'My Rewards'),
          ],
        ),
      ),
      body: Consumer2<RewardProvider, StudentProvider>(
        builder: (context, rewardProvider, studentProvider, child) {
          return Column(
            children: [
              _buildPointsHeader(rewardProvider, studentProvider),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildShopTab(rewardProvider),
                    _buildChallengesTab(rewardProvider),
                    _buildMyRewardsTab(rewardProvider),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPointsHeader(
      RewardProvider rewardProvider, StudentProvider studentProvider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    studentProvider.currentStudent?.name ?? 'Student',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.stars, color: Colors.amber, size: 20),
                      const SizedBox(width: 4),
                      Text(
                        '${rewardProvider.availablePoints} Points Available',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                children: [
                  _getLevelBadge(rewardProvider.currentLevel),
                  const SizedBox(height: 4),
                  Text(
                    rewardProvider.currentLevel,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.local_fire_department,
                  color: Colors.orange, size: 20),
              const SizedBox(width: 4),
              Text(
                '${rewardProvider.streakDays} Day Streak',
                style: const TextStyle(color: Colors.white, fontSize: 14),
              ),
              const Spacer(),
              Text(
                'Total: ${rewardProvider.totalPoints} points',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _getLevelBadge(String level) {
    Color color;
    IconData icon;

    switch (level) {
      case 'Diamond':
        color = Colors.cyan;
        icon = Icons.diamond;
        break;
      case 'Platinum':
        color = Colors.grey.shade300;
        icon = Icons.star;
        break;
      case 'Gold':
        color = Colors.amber;
        icon = Icons.star;
        break;
      case 'Silver':
        color = Colors.grey;
        icon = Icons.star;
        break;
      default:
        color = Colors.brown;
        icon = Icons.star_outline;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.3),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 32),
    );
  }

  Widget _buildShopTab(RewardProvider rewardProvider) {
    final categories = ['all', 'treats', 'privileges', 'activities', 'items'];

    return Column(
      children: [
        // Category filter
        SizedBox(
          height: 60,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              final isSelected = _selectedCategory == category;

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(
                    category == 'all' ? 'All' : category.toUpperCase(),
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCategory = category;
                    });
                  },
                ),
              );
            },
          ),
        ),
        // Rewards grid
        Expanded(
          child: _buildRewardsGrid(rewardProvider),
        ),
      ],
    );
  }

  Widget _buildRewardsGrid(RewardProvider rewardProvider) {
    final rewards = _selectedCategory == 'all'
        ? rewardProvider.availableRewards
        : rewardProvider.availableRewards
            .where((r) => r.category == _selectedCategory)
            .toList();

    if (rewards.isEmpty) {
      return const Center(
        child: Text('No rewards available in this category'),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.85,
      ),
      itemCount: rewards.length,
      itemBuilder: (context, index) {
        return _buildRewardCard(rewards[index], rewardProvider);
      },
    );
  }

  Widget _buildRewardCard(RewardModel reward, RewardProvider rewardProvider) {
    final canAfford = rewardProvider.availablePoints >= reward.pointsCost;

    return Card(
      elevation: canAfford ? 4 : 1,
      color: canAfford ? Colors.white : Colors.grey.shade200,
      child: InkWell(
        onTap: canAfford
            ? () => _showRedeemDialog(reward, rewardProvider)
            : null,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    reward.icon,
                    style: const TextStyle(fontSize: 32),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: canAfford
                          ? AppColors.primary
                          : Colors.grey.shade400,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.stars,
                            color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${reward.pointsCost}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                reward.title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: canAfford ? Colors.black : Colors.grey.shade600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                reward.description,
                style: TextStyle(
                  fontSize: 11,
                  color: canAfford ? Colors.grey.shade700 : Colors.grey.shade500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const Spacer(),
              if (reward.requiresParentApproval)
                const Row(
                  children: [
                    Icon(Icons.info_outline, size: 12, color: Colors.orange),
                    SizedBox(width: 4),
                    Text(
                      'Parent approval needed',
                      style: TextStyle(fontSize: 10, color: Colors.orange),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showRedeemDialog(RewardModel reward, RewardProvider rewardProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(reward.title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              reward.description,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.stars, color: Colors.amber),
                const SizedBox(width: 8),
                Text(
                  '${reward.pointsCost} points',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            if (reward.requiresParentApproval) ...[
              const SizedBox(height: 12),
              const Text(
                'This reward requires parent approval',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.orange,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final success = await rewardProvider.requestReward(reward.id);
              if (!context.mounted) return;

              Navigator.pop(context);

              if (success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      reward.requiresParentApproval
                          ? 'Reward requested! Waiting for parent approval.'
                          : 'Reward redeemed successfully!',
                    ),
                    backgroundColor: Colors.green,
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Not enough points!'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            child: const Text('Redeem'),
          ),
        ],
      ),
    );
  }

  Widget _buildChallengesTab(RewardProvider rewardProvider) {
    final challenges = rewardProvider.dailyChallenges;

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: challenges.length,
      itemBuilder: (context, index) {
        return _buildChallengeCard(challenges[index]);
      },
    );
  }

  Widget _buildChallengeCard(DailyChallengeModel challenge) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  challenge.icon,
                  style: const TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        challenge.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        challenge.description,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: challenge.isCompleted
                        ? Colors.green
                        : AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        challenge.isCompleted ? Icons.check : Icons.stars,
                        color: Colors.white,
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '+${challenge.rewardPoints}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: challenge.progress,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation(
                      challenge.isCompleted ? Colors.green : AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${challenge.currentValue}/${challenge.targetValue}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade700,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyRewardsTab(RewardProvider rewardProvider) {
    final pendingRewards = rewardProvider.pendingRequests;
    final redeemedRewards = rewardProvider.redeemedRewards;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (pendingRewards.isNotEmpty) ...[
          const Text(
            'Pending Approval',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ...pendingRewards.map((reward) => _buildRewardHistoryCard(reward)),
          const SizedBox(height: 24),
        ],
        const Text(
          'Redeemed Rewards',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        if (redeemedRewards.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32),
              child: Text(
                'No rewards redeemed yet.\nStart earning points to get rewards!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ),
          )
        else
          ...redeemedRewards.map((reward) => _buildRewardHistoryCard(reward)),
      ],
    );
  }

  Widget _buildRewardHistoryCard(RewardModel reward) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Text(
          reward.icon,
          style: const TextStyle(fontSize: 32),
        ),
        title: Text(reward.title),
        subtitle: Text(
          reward.redeemedAt != null
              ? 'Redeemed ${_formatDate(reward.redeemedAt!)}'
              : 'Waiting for approval',
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: reward.status == 'requested'
                ? Colors.orange
                : Colors.green,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            reward.status == 'requested' ? 'Pending' : 'Approved',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
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
      return '${date.month}/${date.day}/${date.year}';
    }
  }
}
