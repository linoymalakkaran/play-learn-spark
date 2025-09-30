import { TutorialStep } from '@/components/tutorial/TutorialOverlay';

// Main onboarding tutorial for first-time users
export const mainOnboardingSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Play Learn Spark! 🎉',
    description: 'Hi there! I\'m here to help you discover all the amazing learning adventures waiting for you. Let\'s take a quick tour together!',
    position: 'center',
    illustration: '🌟',
    duration: 3000
  },
  {
    id: 'profile',
    title: 'Your Learning Profile 👤',
    description: 'This shows your name, age, and learning progress. You can see how many activities you\'ve completed and your success rate!',
    position: 'top',
    targetElement: '.profile-section'
  },
  {
    id: 'categories',
    title: 'Learning Categories 📚',
    description: 'These colorful buttons help you find different types of activities. Try English for reading, Math for numbers, or Science for experiments!',
    position: 'bottom',
    targetElement: '.category-tabs'
  },
  {
    id: 'activities',
    title: 'Choose Your Adventure! 🎯',
    description: 'Each card is a fun learning activity. The colorful icons show what you\'ll learn. Tap any activity to start playing!',
    position: 'center',
    targetElement: '.activities-grid'
  },
  {
    id: 'difficulty',
    title: 'Perfect for Your Age 🎈',
    description: 'All activities are designed specially for your age group. As you get better, new activities will unlock automatically!',
    position: 'left',
    illustration: '🏆'
  },
  {
    id: 'progress',
    title: 'Track Your Progress 📈',
    description: 'Your progress is saved automatically! You can always come back to continue learning where you left off.',
    position: 'top',
    targetElement: '.progress-section'
  },
  {
    id: 'ready',
    title: 'Ready to Start Learning? 🚀',
    description: 'You\'re all set! Pick any activity that looks fun and start your learning adventure. Remember, learning should always be fun!',
    position: 'center',
    illustration: '🎓'
  }
];

// Activity tutorial for first-time activity users
export const activityTutorialSteps: TutorialStep[] = [
  {
    id: 'activity-welcome',
    title: 'Let\'s Learn Together! 📖',
    description: 'Welcome to your first activity! Each activity has instructions to help you learn something new and exciting.',
    position: 'center',
    illustration: '📚'
  },
  {
    id: 'activity-instructions',
    title: 'Follow the Instructions 👆',
    description: 'Read or listen to the instructions carefully. They\'ll tell you exactly what to do. Don\'t worry if you need to try a few times!',
    position: 'top',
    targetElement: '.activity-instructions'
  },
  {
    id: 'activity-interaction',
    title: 'Click and Interact 🖱️',
    description: 'Most activities let you click, drag, or tap on things. Try different interactions to see what happens!',
    position: 'center',
    illustration: '👆'
  },
  {
    id: 'activity-feedback',
    title: 'Listen for Sounds 🔊',
    description: 'The app will play happy sounds when you do something right, and gentle sounds to help you try again.',
    position: 'right',
    illustration: '🎵'
  },
  {
    id: 'activity-help',
    title: 'Need Help? 🤝',
    description: 'If you get stuck, look for hint buttons or ask a grown-up to help you. Learning together is more fun!',
    position: 'bottom',
    illustration: '💡'
  }
];

// Dashboard navigation tutorial
export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-overview',
    title: 'Your Learning Dashboard 🏠',
    description: 'This is your home base! Everything you need to learn and play is right here.',
    position: 'center',
    illustration: '🏠'
  },
  {
    id: 'switch-learner',
    title: 'Switch Learner Button 👥',
    description: 'If you share this device with siblings, you can switch between different learner profiles here.',
    position: 'right',
    targetElement: '.switch-learner-btn'
  },
  {
    id: 'category-filters',
    title: 'Filter by Subject 🎨',
    description: 'Use these colorful tabs to see only certain types of activities. Perfect when you want to focus on one subject!',
    position: 'bottom',
    targetElement: '.category-tabs'
  },
  {
    id: 'activity-cards',
    title: 'Activity Cards 🃏',
    description: 'Each card shows an activity with a fun icon, title, and description. Locked activities will unlock as you progress!',
    position: 'center',
    targetElement: '.activity-card'
  }
];

// Settings and help tutorial
export const helpTutorialSteps: TutorialStep[] = [
  {
    id: 'help-overview',
    title: 'Getting Help 🆘',
    description: 'If you ever need help while using Play Learn Spark, here are some tips!',
    position: 'center',
    illustration: '❓'
  },
  {
    id: 'help-sounds',
    title: 'Sound Feedback 🔊',
    description: 'Listen to the sounds! Happy sounds mean you\'re doing great, and gentle sounds mean try again.',
    position: 'center',
    illustration: '🎵'
  },
  {
    id: 'help-visual',
    title: 'Visual Clues 👀',
    description: 'Look for animations, colors, and visual hints. Green usually means correct, and other colors guide you.',
    position: 'center',
    illustration: '👁️'
  },
  {
    id: 'help-adults',
    title: 'Ask a Grown-Up 👨‍👩‍👧‍👦',
    description: 'It\'s always okay to ask parents, teachers, or other adults for help. Learning together is wonderful!',
    position: 'center',
    illustration: '👨‍👩‍👧‍👦'
  }
];

// Tutorial for parents/guardians
export const parentTutorialSteps: TutorialStep[] = [
  {
    id: 'parent-welcome',
    title: 'Welcome, Parents! 👋',
    description: 'Thank you for choosing Play Learn Spark! Here\'s how to help your child get the most out of their learning experience.',
    position: 'center',
    illustration: '👨‍👩‍👧‍👦'
  },
  {
    id: 'parent-progress',
    title: 'Monitor Progress 📊',
    description: 'Keep an eye on your child\'s progress stats. The dashboard shows completion rates, streaks, and areas of strength.',
    position: 'top',
    targetElement: '.progress-section'
  },
  {
    id: 'parent-difficulty',
    title: 'Age-Appropriate Content 🎯',
    description: 'All activities are designed for your child\'s age group. The app automatically adjusts difficulty as they improve.',
    position: 'center',
    illustration: '🎈'
  },
  {
    id: 'parent-encouragement',
    title: 'Encourage Learning 💪',
    description: 'Celebrate their achievements! Positive reinforcement helps build confidence and love for learning.',
    position: 'center',
    illustration: '🌟'
  },
  {
    id: 'parent-safety',
    title: 'Safe Learning Environment 🛡️',
    description: 'Play Learn Spark is designed to be safe, educational, and ad-free. Your child can explore independently.',
    position: 'center',
    illustration: '🛡️'
  }
];