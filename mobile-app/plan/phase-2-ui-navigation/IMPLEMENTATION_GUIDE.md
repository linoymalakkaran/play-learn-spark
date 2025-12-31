# Phase 2: Core UI & Navigation

**Duration**: 3-4 days  
**Status**: Not Started  
**Dependencies**: Phase 1 Complete

## Objectives

1. Design and implement app theme
2. Create reusable UI components
3. Implement navigation structure
4. Build splash screen and onboarding
5. Create home dashboard layout
6. Implement bottom navigation
7. Add animations and transitions

## Steps

### Step 2.1: Define App Theme

**File**: `lib/ui/theme/app_theme.dart`

```dart
import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryColor = Color(0xFF6366F1); // Indigo
  static const Color secondaryColor = Color(0xFFF59E0B); // Amber
  static const Color accentColor = Color(0xFF10B981); // Green
  static const Color errorColor = Color(0xFFEF4444); // Red
  
  // Background Colors
  static const Color backgroundColor = Color(0xFFF9FAFB);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  
  // Activity Category Colors
  static const Map<String, Color> categoryColors = {
    'english': Color(0xFF8B5CF6),
    'math': Color(0xFF3B82F6),
    'science': Color(0xFF10B981),
    'art': Color(0xFFF59E0B),
    'social': Color(0xFFEC4899),
    'physical': Color(0xFF14B8A6),
    'world': Color(0xFF6366F1),
    'languages': Color(0xFFEF4444),
  };

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: backgroundColor,
    fontFamily: 'Nunito',
    
    // AppBar Theme
    appBarTheme: const AppBarTheme(
      elevation: 0,
      centerTitle: true,
      backgroundColor: Colors.transparent,
      foregroundColor: textPrimary,
    ),
    
    // Card Theme
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      color: surfaceColor,
    ),
    
    // Button Themes
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    
    // Input Decoration Theme
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceColor,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.dark,
    ),
    scaffoldBackgroundColor: const Color(0xFF111827),
    fontFamily: 'Nunito',
  );
}
```

**File**: `lib/ui/theme/text_styles.dart`

```dart
import 'package:flutter/material.dart';

class AppTextStyles {
  // Headings
  static const TextStyle h1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
  );

  static const TextStyle h2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
  );

  static const TextStyle h3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
  );

  // Body Text
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
  );

  // Button Text
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
  );

  // Caption
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
  );
}
```

**Deliverable**: Complete theme system

---

### Step 2.2: Create Common UI Components

**File**: `lib/ui/widgets/common/custom_button.dart`

```dart
import 'package:flutter/material.dart';

enum ButtonVariant { primary, secondary, outline, text }
enum ButtonSize { small, medium, large }

class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final IconData? icon;
  final bool isLoading;
  final bool fullWidth;

  const CustomButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.fullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    EdgeInsets padding;
    double fontSize;
    
    switch (size) {
      case ButtonSize.small:
        padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
        fontSize = 14;
        break;
      case ButtonSize.medium:
        padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 12);
        fontSize = 16;
        break;
      case ButtonSize.large:
        padding = const EdgeInsets.symmetric(horizontal: 32, vertical: 16);
        fontSize = 18;
        break;
    }

    Widget child = Row(
      mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null && !isLoading) ...[
          Icon(icon, size: fontSize + 2),
          const SizedBox(width: 8),
        ],
        if (isLoading)
          SizedBox(
            width: fontSize,
            height: fontSize,
            child: const CircularProgressIndicator(strokeWidth: 2),
          )
        else
          Text(label, style: TextStyle(fontSize: fontSize)),
      ],
    );

    switch (variant) {
      case ButtonVariant.primary:
        return ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            padding: padding,
            minimumSize: fullWidth ? const Size.fromHeight(50) : null,
          ),
          child: child,
        );
      case ButtonVariant.secondary:
        return FilledButton.tonal(
          onPressed: isLoading ? null : onPressed,
          style: FilledButton.styleFrom(
            padding: padding,
            minimumSize: fullWidth ? const Size.fromHeight(50) : null,
          ),
          child: child,
        );
      case ButtonVariant.outline:
        return OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            padding: padding,
            minimumSize: fullWidth ? const Size.fromHeight(50) : null,
          ),
          child: child,
        );
      case ButtonVariant.text:
        return TextButton(
          onPressed: isLoading ? null : onPressed,
          style: TextButton.styleFrom(padding: padding),
          child: child,
        );
    }
  }
}
```

**File**: `lib/ui/widgets/common/activity_card.dart`

```dart
import 'package:flutter/material.dart';
import '../../../data/models/activity_model.dart';

class ActivityCard extends StatelessWidget {
  final Activity activity;
  final VoidCallback onTap;
  final bool isCompleted;

  const ActivityCard({
    super.key,
    required this.activity,
    required this.onTap,
    this.isCompleted = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = Color(int.parse(activity.backgroundColor.replaceFirst('#', '0xFF')));
    
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color.withOpacity(0.3), color.withOpacity(0.1)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.extension, color: Colors.white),
                  ),
                  const Spacer(),
                  if (isCompleted)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.check, size: 14, color: Colors.white),
                          SizedBox(width: 4),
                          Text(
                            'Completed',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                activity.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                activity.description,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.person, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${activity.minAge}-${activity.maxAge} years',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(width: 12),
                  Icon(Icons.timer, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${activity.estimatedDuration} min',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**Additional Widgets**: Create:
- `badge_widget.dart`
- `progress_bar.dart`
- `loading_spinner.dart`
- `empty_state.dart`

**Deliverable**: Reusable UI components

---

### Step 2.3: Implement Splash Screen

**File**: `lib/ui/screens/splash_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/student_provider.dart';
import 'onboarding/onboarding_screen.dart';
import 'home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _controller.forward();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Load student data
    await context.read<StudentProvider>().loadStudents();
    
    // Wait for animation
    await Future.delayed(const Duration(seconds: 2));
    
    // Navigate to appropriate screen
    if (mounted) {
      final hasStudent = context.read<StudentProvider>().hasStudent;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => hasStudent
              ? const HomeScreen()
              : const OnboardingScreen(),
        ),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: ScaleTransition(
              scale: _scaleAnimation,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Icon(
                      Icons.child_care,
                      size: 60,
                      color: Color(0xFF6366F1),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Play & Learn Spark',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Learning Made Fun!',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

**Deliverable**: Animated splash screen

---

### Step 2.4: Create Navigation Structure

**File**: `lib/ui/screens/home/home_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'activities_tab.dart';
import 'progress_tab.dart';
import 'profile_tab.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const ActivitiesTab(),
    const ProgressTab(),
    const ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.extension_outlined),
            selectedIcon: Icon(Icons.extension),
            label: 'Activities',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart),
            label: 'Progress',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
```

**Deliverable**: Bottom navigation implemented

---

### Step 2.5: Build Onboarding Screens

**File**: `lib/ui/screens/onboarding/onboarding_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../student_setup/student_setup_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      title: 'Welcome to Play & Learn',
      description: 'Fun educational activities for children aged 3-6',
      icon: Icons.child_care,
      color: const Color(0xFF6366F1),
    ),
    OnboardingPage(
      title: 'Learn Through Play',
      description: 'Interactive activities that make learning exciting',
      icon: Icons.extension,
      color: const Color(0xFFF59E0B),
    ),
    OnboardingPage(
      title: 'Track Progress',
      description: 'Monitor growth and celebrate achievements',
      icon: Icons.emoji_events,
      color: const Color(0xFF10B981),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _buildPage(_pages[index]);
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _pages.length,
                      (index) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: _currentPage == index ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _currentPage == index
                              ? Theme.of(context).colorScheme.primary
                              : Colors.grey[300],
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      if (_currentPage == _pages.length - 1) {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(
                            builder: (_) => const StudentSetupScreen(),
                          ),
                        );
                      } else {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(50),
                    ),
                    child: Text(
                      _currentPage == _pages.length - 1
                          ? 'Get Started'
                          : 'Next',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(OnboardingPage page) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              color: page.color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              page.icon,
              size: 100,
              color: page.color,
            ),
          ),
          const SizedBox(height: 48),
          Text(
            page.title,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            page.description,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class OnboardingPage {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  OnboardingPage({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}
```

**Deliverable**: Onboarding flow complete

---

## Phase 2 Completion Checklist

- [ ] App theme defined
- [ ] Text styles created
- [ ] Common UI components built
- [ ] Splash screen implemented
- [ ] Onboarding screens created
- [ ] Bottom navigation working
- [ ] All screens have proper layouts
- [ ] Animations smooth (60fps)
- [ ] UI responsive to different screen sizes
- [ ] Theme switcher functional

## Next Steps

Proceed to **Phase 3: Student Management & Local Storage**.
