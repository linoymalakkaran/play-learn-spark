import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/student_provider.dart';
import 'providers/activity_provider.dart';
import 'providers/progress_provider.dart';
import 'core/theme/app_theme.dart';
import 'ui/screens/home_screen.dart';
import 'core/constants/colors.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => StudentProvider()),
        ChangeNotifierProvider(create: (_) => ActivityProvider()),
        ChangeNotifierProvider(create: (_) => ProgressProvider()),
      ],
      child: MaterialApp(
        title: 'Play & Learn Spark',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        home: const SplashScreen(),
      ),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      // Initialize activities
      final activityProvider = Provider.of<ActivityProvider>(context, listen: false);
      await activityProvider.initialize();

      // Load students
      final studentProvider = Provider.of<StudentProvider>(context, listen: false);
      await studentProvider.loadStudents();

      // Wait a bit for splash screen
      await Future.delayed(const Duration(seconds: 2));

      if (!mounted) return;

      // Navigate to appropriate screen
      if (studentProvider.hasStudents && studentProvider.currentStudent != null) {
        // Load progress for current student
        final progressProvider = Provider.of<ProgressProvider>(context, listen: false);
        await progressProvider.loadProgressForStudent(studentProvider.currentStudent!.id);
        
        // Navigate to home screen (will be implemented in Phase 2)
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PlaceholderHomeScreen()),
        );
      } else {
        // Navigate to student setup (will be implemented in Phase 3)
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PlaceholderStudentSetup()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error initializing app: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary,
              AppColors.secondary,
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // App logo/icon
              Container(
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const 
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    '🎓',
                    style: TextStyle(fontSize: 60),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Play & Learn Spark',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Fun Learning for Kids 3-6',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 48),
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Temporary placeholder screens (will be replaced in future phases)
class PlaceholderHomeScreen extends StatelessWidget {
  const PlaceholderHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Play & Learn Spark'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, size: 80, color: Colors.green),
            const SizedBox(height: 24),
            const Text(
              'Phase 1 Complete! ✅',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'Database, models, repositories, and providers are set up.\n\nHome screen will be implemented in Phase 2.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 32),
            Consumer<StudentProvider>(
              builder: (context, provider, _) {
                return Column(
                  children: [
                    Text(
                      'Current Student: ${provider.currentStudent?.name ?? "None"}',
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Total Students: ${provider.students.length}',
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 16),
            Consumer<ActivityProvider>(
              builder: (context, provider, _) {
                return Text(
                  'Available Activities: ${provider.activities.length}',
                  style: const TextStyle(fontSize: 16),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class PlaceholderStudentSetup extends StatelessWidget {
  const PlaceholderStudentSetup({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person_add, size: 80, color: AppColors.primary),
            const SizedBox(height: 24),
            const Text(
              'Phase 1 Complete! ✅',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'Database, models, repositories, and providers are set up.\n\nStudent setup screen will be implemented in Phase 3.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 32),
            Consumer<ActivityProvider>(
              builder: (context, provider, _) {
                return Column(
                  children: [
                    Text(
                      'Activities loaded: ${provider.activities.length}',
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Ready to create your first student!',
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
