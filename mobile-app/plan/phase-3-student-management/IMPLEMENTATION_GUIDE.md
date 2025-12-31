# Phase 3: Student Management & Local Storage

**Duration**: 2-3 days  
**Status**: Not Started  
**Dependencies**: Phase 1 & 2 Complete

## Objectives

1. Implement student profile creation
2. Build student selection interface
3. Create profile editing functionality
4. Implement avatar selection
5. Set up shared preferences for app settings
6. Create data migration utilities
7. Implement data backup/restore

## Steps

### Step 3.1: Student Setup Screen

**File**: `lib/ui/screens/student_setup/student_setup_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/student_provider.dart';
import '../home/home_screen.dart';
import 'avatar_selector.dart';

class StudentSetupScreen extends StatefulWidget {
  const StudentSetupScreen({super.key});

  @override
  State<StudentSetupScreen> createState() => _StudentSetupScreenState();
}

class _StudentSetupScreenState extends State<StudentSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  int _selectedAge = 4;
  String? _selectedAvatar;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _createStudent() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      await context.read<StudentProvider>().createStudent(
            _nameController.text.trim(),
            _selectedAge,
            _selectedAvatar,
          );

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating profile: $e')),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                "Let's Get Started!",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Create a profile to track your learning journey',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              
              // Avatar Selection
              AvatarSelector(
                selectedAvatar: _selectedAvatar,
                onAvatarSelected: (avatar) {
                  setState(() {
                    _selectedAvatar = avatar;
                  });
                },
              ),
              const SizedBox(height: 32),
              
              // Name Input
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Name',
                  hintText: 'Enter your name',
                  prefixIcon: Icon(Icons.person),
                ),
                textCapitalization: TextCapitalization.words,
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
              const SizedBox(height: 24),
              
              // Age Selection
              const Text(
                'Age',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [3, 4, 5, 6].map((age) {
                  final isSelected = _selectedAge == age;
                  return ChoiceChip(
                    label: Text('$age years'),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedAge = age;
                        });
                      }
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),
              
              // Create Button
              ElevatedButton(
                onPressed: _isLoading ? null : _createStudent,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Create Profile'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**Deliverable**: Student creation screen

---

### Step 3.2: Avatar Selection Component

**File**: `lib/ui/screens/student_setup/avatar_selector.dart`

```dart
import 'package:flutter/material.dart';

class AvatarSelector extends StatelessWidget {
  final String? selectedAvatar;
  final Function(String) onAvatarSelected;

  const AvatarSelector({
    super.key,
    required this.selectedAvatar,
    required this.onAvatarSelected,
  });

  static const List<String> avatars = [
    '👦', '👧', '🧒', '👶',
    '🐶', '🐱', '🐭', '🐹',
    '🐰', '🦊', '🐻', '🐼',
    '🦁', '🐯', '🐨', '🐸',
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Selected Avatar Display
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primaryContainer,
            shape: BoxShape.circle,
            border: Border.all(
              color: Theme.of(context).colorScheme.primary,
              width: 3,
            ),
          ),
          child: Center(
            child: Text(
              selectedAvatar ?? '👤',
              style: const TextStyle(fontSize: 60),
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Choose Your Avatar',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        
        // Avatar Grid
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(16),
          ),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: avatars.length,
            itemBuilder: (context, index) {
              final avatar = avatars[index];
              final isSelected = selectedAvatar == avatar;
              
              return GestureDetector(
                onTap: () => onAvatarSelected(avatar),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : Colors.grey[300]!,
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      avatar,
                      style: const TextStyle(fontSize: 32),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
```

**Deliverable**: Avatar selection UI

---

### Step 3.3: Profile Management Screen

**File**: `lib/ui/screens/home/profile_tab.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/student_provider.dart';
import '../../../providers/progress_provider.dart';
import '../settings/settings_screen.dart';
import '../student_setup/student_setup_screen.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<StudentProvider, ProgressProvider>(
      builder: (context, studentProvider, progressProvider, child) {
        final student = studentProvider.currentStudent;
        
        if (student == null) {
          return const Center(child: Text('No student profile'));
        }

        final progress = progressProvider.getProgressForStudent(student.id);

        return Scaffold(
          appBar: AppBar(
            title: const Text('Profile'),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SettingsScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // Profile Header
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      student.avatar ?? '👤',
                      style: const TextStyle(fontSize: 60),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  student.name,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${student.age} years old',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 24),
                
                // Stats Cards
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        context,
                        'Activities',
                        progress?.totalActivitiesCompleted.toString() ?? '0',
                        Icons.extension,
                        Colors.blue,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        context,
                        'Points',
                        progress?.totalScore.toString() ?? '0',
                        Icons.star,
                        Colors.amber,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        context,
                        'Streak',
                        '${progress?.currentStreak ?? 0} days',
                        Icons.local_fire_department,
                        Colors.orange,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        context,
                        'Level',
                        'Level ${(progress?.totalActivitiesCompleted ?? 0) ~/ 5 + 1}',
                        Icons.emoji_events,
                        Colors.purple,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                
                // Action Buttons
                _buildActionButton(
                  context,
                  'Edit Profile',
                  Icons.edit,
                  () {
                    // Navigate to edit profile
                  },
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  context,
                  'Switch Profile',
                  Icons.swap_horiz,
                  () {
                    _showProfileSwitcher(context, studentProvider);
                  },
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  context,
                  'Add New Profile',
                  Icons.person_add,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const StudentSetupScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context,
    String label,
    IconData icon,
    VoidCallback onTap,
  ) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(label),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  void _showProfileSwitcher(
    BuildContext context,
    StudentProvider provider,
  ) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Switch Profile',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 16),
              ...provider.students.map((student) {
                final isCurrent = student.id == provider.currentStudent?.id;
                return ListTile(
                  leading: Text(
                    student.avatar ?? '👤',
                    style: const TextStyle(fontSize: 32),
                  ),
                  title: Text(student.name),
                  subtitle: Text('${student.age} years old'),
                  trailing: isCurrent
                      ? const Icon(Icons.check_circle, color: Colors.green)
                      : null,
                  onTap: () {
                    if (!isCurrent) {
                      provider.switchStudent(student.id);
                      Navigator.pop(context);
                    }
                  },
                );
              }).toList(),
            ],
          ),
        );
      },
    );
  }
}
```

**Deliverable**: Profile management UI

---

### Step 3.4: Settings and Preferences

**File**: `lib/ui/screens/settings/settings_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../providers/theme_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _soundEnabled = true;
  bool _musicEnabled = true;
  bool _notificationsEnabled = true;
  String _selectedLanguage = 'en';

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _soundEnabled = prefs.getBool('sound_enabled') ?? true;
      _musicEnabled = prefs.getBool('music_enabled') ?? true;
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _selectedLanguage = prefs.getString('language') ?? 'en';
    });
  }

  Future<void> _saveSetting(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is String) {
      await prefs.setString(key, value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Appearance',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          
          // Theme Selector
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return ListTile(
                leading: const Icon(Icons.palette),
                title: const Text('Theme'),
                subtitle: Text(
                  themeProvider.themeMode == ThemeMode.light
                      ? 'Light'
                      : themeProvider.themeMode == ThemeMode.dark
                          ? 'Dark'
                          : 'System',
                ),
                onTap: () => _showThemeSelector(context, themeProvider),
              );
            },
          ),

          const Divider(),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Audio',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          
          // Sound Effects
          SwitchListTile(
            secondary: const Icon(Icons.volume_up),
            title: const Text('Sound Effects'),
            subtitle: const Text('Play sounds during activities'),
            value: _soundEnabled,
            onChanged: (value) {
              setState(() {
                _soundEnabled = value;
              });
              _saveSetting('sound_enabled', value);
            },
          ),
          
          // Background Music
          SwitchListTile(
            secondary: const Icon(Icons.music_note),
            title: const Text('Background Music'),
            subtitle: const Text('Play music while learning'),
            value: _musicEnabled,
            onChanged: (value) {
              setState(() {
                _musicEnabled = value;
              });
              _saveSetting('music_enabled', value);
            },
          ),

          const Divider(),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Language',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          
          // Language Selector
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('App Language'),
            subtitle: Text(_getLanguageName(_selectedLanguage)),
            onTap: () => _showLanguageSelector(context),
          ),

          const Divider(),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'About',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          
          ListTile(
            leading: const Icon(Icons.info),
            title: const Text('Version'),
            subtitle: const Text('1.0.0'),
          ),
          
          ListTile(
            leading: const Icon(Icons.privacy_tip),
            title: const Text('Privacy Policy'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Navigate to privacy policy
            },
          ),
        ],
      ),
    );
  }

  void _showThemeSelector(BuildContext context, ThemeProvider provider) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.brightness_5),
              title: const Text('Light'),
              trailing: provider.themeMode == ThemeMode.light
                  ? const Icon(Icons.check)
                  : null,
              onTap: () {
                provider.setThemeMode(ThemeMode.light);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.brightness_2),
              title: const Text('Dark'),
              trailing: provider.themeMode == ThemeMode.dark
                  ? const Icon(Icons.check)
                  : null,
              onTap: () {
                provider.setThemeMode(ThemeMode.dark);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.brightness_auto),
              title: const Text('System'),
              trailing: provider.themeMode == ThemeMode.system
                  ? const Icon(Icons.check)
                  : null,
              onTap: () {
                provider.setThemeMode(ThemeMode.system);
                Navigator.pop(context);
              },
            ),
          ],
        );
      },
    );
  }

  void _showLanguageSelector(BuildContext context) {
    final languages = {
      'en': 'English',
      'ml': 'Malayalam',
      'ar': 'Arabic',
    };

    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: languages.entries.map((entry) {
            return ListTile(
              title: Text(entry.value),
              trailing: _selectedLanguage == entry.key
                  ? const Icon(Icons.check)
                  : null,
              onTap: () {
                setState(() {
                  _selectedLanguage = entry.key;
                });
                _saveSetting('language', entry.key);
                Navigator.pop(context);
              },
            );
          }).toList(),
        );
      },
    );
  }

  String _getLanguageName(String code) {
    final languages = {
      'en': 'English',
      'ml': 'Malayalam',
      'ar': 'Arabic',
    };
    return languages[code] ?? 'English';
  }
}
```

**Deliverable**: Settings screen

---

## Phase 3 Completion Checklist

- [ ] Student profile creation working
- [ ] Avatar selection implemented
- [ ] Profile editing functional
- [ ] Multiple profiles supported
- [ ] Profile switching smooth
- [ ] Settings persisted in SharedPreferences
- [ ] Language selection working
- [ ] Theme switching functional
- [ ] All data saved to SQLite correctly

## Next Steps

Proceed to **Phase 4: Learning Activities Implementation**.
