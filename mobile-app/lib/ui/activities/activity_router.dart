import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/models/activity_model.dart';
import '../../providers/student_provider.dart';
import '../../providers/progress_provider.dart';
import '../activities/animal_safari_activity.dart';
import '../activities/counting_train_activity.dart';
import '../activities/shape_explorer_activity.dart';
import '../activities/color_match_activity.dart';
import '../activities/alphabet_adventure_activity.dart';
import '../activities/memory_cards_activity.dart';
import '../activities/pattern_builder_activity.dart';
import '../activities/rhyme_time_activity.dart';
import '../activities/size_sort_activity.dart';
import '../activities/emotion_explorer_activity.dart';
import '../activities/simple_puzzles_activity.dart';
import '../activities/story_sequencing_activity.dart';
import '../activities/weather_watcher_activity.dart';
import '../activities/healthy_habits_activity.dart';
import '../activities/music_maker_activity.dart';
import '../activities/nature_walk_activity.dart';
import '../activities/community_helpers_activity.dart';
import '../activities/body_parts_activity.dart';
import '../activities/daily_routine_activity.dart';

class ActivityRouter {
  static Widget getActivityWidget(
    BuildContext context,
    ActivityModel activity,
  ) {
    return _ActivityWrapper(
      activity: activity,
      child: _getActivity(activity),
    );
  }

  static Widget _getActivity(ActivityModel activity) {
    switch (activity.id) {
      case 'animal_safari':
        return AnimalSafariActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'counting_train':
        return CountingTrainActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'shape_explorer':
        return ShapeExplorerActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'color_match':
        return ColorMatchActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'alphabet_adventure':
        return AlphabetAdventureActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'memory_cards':
        return MemoryCardsActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'pattern_builder':
        return PatternBuilderActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'rhyme_time':
        return RhymeTimeActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'size_sort':
        return SizeSortActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'emotion_explorer':
        return EmotionExplorerActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'simple_puzzles':
        return SimplePuzzlesActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'story_sequencing':
        return StorySequencingActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'weather_watcher':
        return WeatherWatcherActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'healthy_habits':
        return HealthyHabitsActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'music_maker':
        return MusicMakerActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'nature_walk':
        return NatureWalkActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'community_helpers':
        return CommunityHelpersActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'body_parts':
        return BodyPartsActivity(
          activity: activity,
          onComplete: () {},
        );
      case 'daily_routine':
        return DailyRoutineActivity(
          activity: activity,
          onComplete: () {},
        );
      default:
        return _PlaceholderActivity(activity: activity);
    }
  }
}

class _ActivityWrapper extends StatelessWidget {
  final ActivityModel activity;
  final Widget child;

  const _ActivityWrapper({
    required this.activity,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        final shouldPop = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Exit Activity?'),
            content: const Text('Your progress will not be saved.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Continue'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Exit'),
              ),
            ],
          ),
        );
        return shouldPop ?? false;
      },
      child: child,
    );
  }
}

class _PlaceholderActivity extends StatelessWidget {
  final ActivityModel activity;

  const _PlaceholderActivity({required this.activity});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(activity.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.construction,
              size: 80,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 24),
            Text(
              'Coming Soon!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              activity.title,
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Go Back'),
            ),
          ],
        ),
      ),
    );
  }
}
