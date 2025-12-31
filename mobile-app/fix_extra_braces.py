import os
import re

activity_files = [
    "alphabet_adventure_activity.dart",
    "animal_safari_activity.dart",
    "arabic_learning_activity.dart",
    "art_studio_activity.dart",
    "daily_routine_activity.dart",
    "counting_train_activity.dart",
    "community_helpers_activity.dart",
    "color_match_activity.dart",
    "body_parts_activity.dart",
    "music_maker_activity.dart",
    "memory_cards_activity.dart",
    "math_adventure_activity.dart",
    "malayalam_learning_activity.dart",
    "logic_puzzles_activity.dart",
    "healthy_habits_activity.dart",
    "fruit_basket_activity.dart",
    "family_tree_activity.dart",
    "english_learning_activity.dart",
    "emotion_explorer_activity.dart",
    "nature_walk_activity.dart",
    "number_garden_activity.dart",
    "pizza_fractions_activity.dart",
    "physical_fun_activity.dart",
    "pet_parade_activity.dart",
    "pattern_builder_activity.dart",
    "rhyme_time_activity.dart",
    "shape_explorer_activity.dart",
    "science_lab_activity.dart",
    "weather_watcher_activity.dart",
    "vegetable_garden_activity.dart",
    "transportation_activity.dart",
    "toy_box_activity.dart",
    "story_sequencing_activity.dart",
    "social_skills_activity.dart",
    "size_sort_activity.dart",
    "simple_puzzles_activity.dart",
]

base_dir = r"d:\Projects\play-learn-spark\mobile-app\lib\ui\activities"

for activity_file in activity_files:
    file_path = os.path.join(base_dir, activity_file)
    
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the duplicate closing braces
    content = content.replace('}); // setState\n    });', '});')
    content = content.replace('}); // setState\n  });', '});')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fixed {activity_file}")

print("\nAll extra closing braces removed!")
