import os
import re

# Fix all activity files by:
# 1. Replacing _generateQuestion with generateNewQuestion
# 2. Adding @override annotation
# 3. Wrapping in setState if not already present

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
    
    # First, revert any double setState wrapping from previous run
    content = re.sub(r'}\); // setState\s*}\);', '});', content)
    
    # Pattern 1: Replace the method signature
    content = re.sub(
        r'(\s+)void _generateQuestion\(\) \{',
        r'\1@override\n\1void generateNewQuestion() {',
        content
    )
    
    # Pattern 2: Ensure the method body is wrapped in setState if it's not already
    # Find the method and wrap its content in setState
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Found our method
        if '@override' in line and i + 1 < len(lines) and 'void generateNewQuestion()' in lines[i + 1]:
            # Add the @override line
            new_lines.append(line)
            i += 1
            # Add the method signature line
            new_lines.append(lines[i])
            i += 1
            
            # Check if next line already has setState
            if i < len(lines) and 'setState(() {' in lines[i]:
                # Already has setState, just copy as is
                while i < len(lines):
                    new_lines.append(lines[i])
                    if lines[i].strip() == '}':
                        break
                    i += 1
                i += 1
                continue
            
            # Need to add setState wrapper
            # Get the method's indentation
            method_indent = len(lines[i-1]) - len(lines[i-1].lstrip())
            setState_indent = ' ' * (method_indent + 2)
            body_indent = ' ' * (method_indent + 4)
            
            # Add setState opening
            new_lines.append(f"{setState_indent}setState(() {{")
            
            # Copy method body with adjusted indentation
            brace_count = 1
            while i < len(lines) and brace_count > 0:
                current_line = lines[i]
                brace_count += current_line.count('{') - current_line.count('}')
                
                if brace_count == 0:
                    # This is the closing brace of the method
                    new_lines.append(f"{setState_indent}}});")
                    new_lines.append(current_line)
                else:
                    # Regular line in method body - add extra indentation
                    if current_line.strip():
                        extra_indent = '  '
                        new_lines.append(extra_indent + current_line)
                    else:
                        new_lines.append(current_line)
                i += 1
            continue
        
        new_lines.append(line)
        i += 1
    
    content = '\n'.join(new_lines)
    
    # Fix the call site
    content = content.replace('_generateQuestion();', 'generateNewQuestion();')
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fixed {activity_file}")

print("\nAll activities fixed!")
