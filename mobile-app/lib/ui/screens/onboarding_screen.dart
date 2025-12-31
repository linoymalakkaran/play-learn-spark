import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../core/constants/colors.dart';
import '../../core/constants/dimensions.dart';
import '../widgets/buttons.dart';
import 'student_setup_screen.dart';

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
      title: 'Welcome to PlayLearn Spark!',
      description: 'A fun and educational adventure designed just for preschoolers!',
      icon: Icons.celebration,
      color: AppColors.primary,
    ),
    OnboardingPage(
      title: 'Learn Through Play',
      description: 'Explore 19+ engaging activities in language, math, creativity, and more!',
      icon: Icons.school,
      color: AppColors.secondary,
    ),
    OnboardingPage(
      title: 'Track Your Progress',
      description: 'Earn badges, build streaks, and watch your child grow!',
      icon: Icons.emoji_events,
      color: AppColors.accent,
    ),
    OnboardingPage(
      title: 'Multiple Students',
      description: 'Create profiles for all your little learners in one app!',
      icon: Icons.people,
      color: AppColors.success,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _navigateToSetup();
    }
  }

  void _skipOnboarding() {
    _navigateToSetup();
  }

  void _navigateToSetup() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) => const StudentSetupScreen(isFirstTime: true),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            if (_currentPage < _pages.length - 1)
              Padding(
                padding: const EdgeInsets.all(AppDimensions.medium),
                child: Align(
                  alignment: Alignment.topRight,
                  child: TextButtonCustom(
                    text: 'Skip',
                    onPressed: _skipOnboarding,
                  ),
                ),
              )
            else
              const SizedBox(height: 56),

            // Page view
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _buildPage(_pages[index]);
                },
              ),
            ),

            // Page indicator
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppDimensions.large),
              child: SmoothPageIndicator(
                controller: _pageController,
                count: _pages.length,
                effect: WormEffect(
                  dotHeight: 12,
                  dotWidth: 12,
                  activeDotColor: AppColors.primary,
                  dotColor: AppColors.textSecondary,
                ),
              ),
            ),

            // Next/Get Started button
            Padding(
              padding: const EdgeInsets.all(AppDimensions.large),
              child: PrimaryButton(
                text: _currentPage < _pages.length - 1 ? 'Next' : 'Get Started',
                onPressed: _nextPage,
                icon: _currentPage < _pages.length - 1
                    ? Icons.arrow_forward
                    : Icons.rocket_launch,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(OnboardingPage page) {
    return Padding(
      padding: const EdgeInsets.all(AppDimensions.large),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Icon
          Container(
            width: 150,
            height: 150,
            decoration: BoxDecoration(
              color: page.color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              page.icon,
              size: 80,
              color: page.color,
            ),
          ),
          const SizedBox(height: AppDimensions.xLarge),

          // Title
          Text(
            page.title,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: page.color,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.medium),

          // Description
          Text(
            page.description,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
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
