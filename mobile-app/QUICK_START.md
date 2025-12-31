# 🚀 Quick Start Guide

## Get the Play & Learn Spark Mobile App Running in 5 Minutes!

### Prerequisites
✅ Flutter SDK installed ([flutter.dev](https://flutter.dev))
✅ Android Studio or Xcode
✅ A device/emulator

---

## Step 1: Navigate to Project
```bash
cd d:/Projects/play-learn-spark/mobile-app
```

## Step 2: Install Dependencies
```bash
flutter pub get
```

## Step 3: Run the App
```bash
flutter run
```

That's it! The app should launch on your connected device or emulator.

---

## 🎮 What to Try First

### 1. Create a Student Profile
- Tap through the onboarding carousel
- Enter a name and age (3-6)
- Choose an avatar
- Tap "Start Learning"

### 2. Explore the Dashboard
- See the welcome card with your name
- Check out the stats (activities, streak, points, badges)
- Tap "Detailed Progress" to see charts
- Tap "My Badges" to view achievements

### 3. Try an Activity
- Go to Activities tab (bottom navigation)
- Tap any activity card (e.g., "Animal Safari")
- Complete the questions
- View your results

### 4. Check Progress
- Return to Home tab
- See your updated stats
- View earned points and badges
- Check your streak

---

## 📱 Testing on Different Platforms

### Android
```bash
flutter run -d android
```

### iOS (Mac only)
```bash
flutter run -d ios
```

### Chrome (for testing)
```bash
flutter run -d chrome
```

---

## 🔍 Verify Installation

### Check Flutter Setup
```bash
flutter doctor
```

### Check App Structure
```bash
ls lib/
# Should see: core/, data/, providers/, ui/, main.dart
```

### Run Tests (when available)
```bash
flutter test
```

---

## 🎯 Key Features to Test

### Activities (All 19 Available!)
1. **Animal Safari** - Animal sounds
2. **Counting Train** - Numbers 1-10
3. **Shape Explorer** - Shapes
4. **Color Match** - Colors
5. **Alphabet Adventure** - Letters A-Z
6. **Memory Cards** - Memory game
7. **Pattern Builder** - Patterns
8. **Rhyme Time** - Rhyming
9. **Size Sort** - Sizes
10. **Emotion Explorer** - Emotions
11. **Simple Puzzles** - Puzzles
12. **Story Sequencing** - Sequences
13. **Weather Watcher** - Weather
14. **Healthy Habits** - Health
15. **Music Maker** - Instruments
16. **Nature Walk** - Nature
17. **Community Helpers** - Jobs
18. **Body Parts** - Anatomy
19. **Daily Routine** - Time

### Progress Features
- ✅ Enhanced Dashboard with charts
- ✅ Badge System (15+ badges)
- ✅ Streak Tracking
- ✅ Level Progression
- ✅ Weekly Activity Charts
- ✅ Category Mastery

---

## 🐛 Troubleshooting

### Issue: Dependencies not found
```bash
flutter clean
flutter pub get
```

### Issue: Build errors
```bash
flutter clean
flutter pub get
flutter run
```

### Issue: Device not detected
```bash
# Check connected devices
flutter devices

# Enable USB debugging on Android
# Or trust computer on iOS
```

### Issue: Hot reload not working
- Press 'r' in terminal for hot reload
- Press 'R' for hot restart

---

## 🎨 What's Included

### ✅ Fully Implemented
- 19 learning activities
- Student profile management
- Progress tracking
- Badge system
- Enhanced analytics
- Beautiful UI with animations
- Offline functionality

### 📝 Documentation
- README.md - Overview
- TESTING.md - Testing guide
- DEPLOYMENT.md - Deployment guide
- PROJECT_SUMMARY.md - Complete summary
- QUICK_START.md - This guide

---

## 🚀 Next Steps

1. **Test All Features**
   - Try all 19 activities
   - Create multiple student profiles
   - Check all screens and navigation

2. **Customize**
   - Update colors in `lib/core/constants/colors.dart`
   - Add more activities
   - Customize badges

3. **Build for Release**
   - See DEPLOYMENT.md for instructions
   - Configure signing for Android/iOS
   - Submit to app stores

---

## 📚 Learning Resources

### Flutter Documentation
- [Flutter Docs](https://docs.flutter.dev)
- [Widget Catalog](https://docs.flutter.dev/development/ui/widgets)
- [State Management](https://docs.flutter.dev/development/data-and-backend/state-mgmt/intro)

### Project-Specific
- See inline code comments
- Check model classes for data structure
- Review provider classes for state management
- Explore activity implementations for examples

---

## 💡 Tips

### Hot Reload
- Press `r` for hot reload while app is running
- Press `R` for full restart
- Press `q` to quit

### Debugging
- Use `print()` statements
- Check Flutter DevTools
- Use VS Code debugger

### Performance
- Run in release mode: `flutter run --release`
- Profile performance: `flutter run --profile`
- Check memory: Flutter DevTools

---

## 🎉 Success!

You now have a fully functional educational app with:
- ✅ 19 interactive learning activities
- ✅ Progress tracking and analytics
- ✅ Badge and reward system
- ✅ Multiple student profiles
- ✅ Beautiful, child-friendly UI

**Happy Learning! 🎮📚**

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the terminal output for errors
2. Review the documentation files
3. Run `flutter doctor` to check setup
4. Clean and rebuild: `flutter clean && flutter pub get && flutter run`

---

*Made with ❤️ for curious young minds*
