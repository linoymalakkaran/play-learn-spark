import os
import re

# List of all activity files to fix
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
        print(f"Skipping {activity_file} - file not found")
        continue
    
    print(f"Processing {activity_file}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace void _generateQuestion() { with @override\n  void generateNewQuestion() {
    # Pattern 1: Without setState already
    content = re.sub(
        r'(\s+)void _generateQuestion\(\) \{\n',
        r'\1@override\n\1void generateNewQuestion() {\n\1  setState(() {\n',
        content
    )
    
    # Find the closing brace of generateNewQuestion and add setState closing
    # We need to be smart about this - find the method end
    lines = content.split('\n')
    new_lines = []
    in_generate_method = False
    brace_count = 0
    method_start_indent = 0
    
    for i, line in enumerate(lines):
        if 'void generateNewQuestion()' in line:
            in_generate_method = True
            method_start_indent = len(line) - len(line.lstrip())
            new_lines.append(line)
            continue
            
        if in_generate_method:
            # Count braces
            brace_count += line.count('{') - line.count('}')
            
            # If we're back to 0 braces, this is the end of the method
            if brace_count == 0 and '}' in line:
                # Add closing brace for setState before method closing brace
                indent = ' ' * (method_start_indent + 2)
                new_lines.append(f"{indent}}}); // setState")
                new_lines.append(line)
                in_generate_method = False
                continue
        
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Update the call in initializeActivity
    content = content.replace('_generateQuestion();', 'generateNewQuestion();')
    
    # Write the fixed content back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fixed {activity_file}")

print("\nAll activities fixed!")
