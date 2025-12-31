# Deployment Guide for Play & Learn Spark

## Overview
This guide covers the deployment process for both Android and iOS platforms.

## Pre-Deployment Checklist

### 1. Code Quality
- [x] All features implemented and tested
- [x] No critical bugs
- [x] Code reviewed
- [ ] Performance optimized
- [ ] Memory leaks fixed

### 2. Assets
- [ ] All images optimized (WebP format where possible)
- [ ] App icons generated for all sizes
- [ ] Splash screen configured
- [ ] Audio files optimized

### 3. Configuration
- [ ] App name finalized
- [ ] Bundle ID/Package name set
- [ ] Version number updated
- [ ] Build number incremented
- [ ] API keys configured (if any)

## Android Deployment

### 1. Generate Keystore
```bash
keytool -genkey -v -keystore play-learn-spark.jks -keyalg RSA -keysize 2048 -validity 10000 -alias play-learn-spark
```

### 2. Configure Signing
Create `android/key.properties`:
```properties
storePassword=<your-password>
keyPassword=<your-password>
keyAlias=play-learn-spark
storeFile=<path-to-keystore>/play-learn-spark.jks
```

### 3. Update build.gradle
Already configured in `android/app/build.gradle`

### 4. Build APK
```bash
flutter build apk --release
```

### 5. Build App Bundle (for Play Store)
```bash
flutter build appbundle --release
```

### 6. Test Release Build
```bash
flutter install --release
```

### 7. Google Play Store Upload
1. Create a developer account ($25 one-time fee)
2. Create a new app in Play Console
3. Fill in store listing details:
   - App title: Play & Learn Spark
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (minimum 2, recommended 8)
   - Feature graphic (1024x500)
   - App icon (512x512)
4. Set content rating
5. Select app category: Education
6. Upload app bundle
7. Set pricing & distribution
8. Submit for review

## iOS Deployment

### 1. Apple Developer Account
- Enroll in Apple Developer Program ($99/year)
- Create App ID
- Generate provisioning profile

### 2. Xcode Configuration
```bash
open ios/Runner.xcworkspace
```

Update in Xcode:
- Bundle Identifier
- Team
- Signing certificates

### 3. Build IPA
```bash
flutter build ios --release
```

### 4. App Store Connect
1. Create new app
2. Fill in app information:
   - App name: Play & Learn Spark
   - Subtitle
   - Description
   - Keywords
   - Screenshots for all device sizes
   - App preview video (optional)
3. Set privacy policy URL
4. Configure age rating
5. Upload build using Xcode or Transporter
6. Submit for review

## Version Management

### Semantic Versioning
Format: `MAJOR.MINOR.PATCH+BUILD`
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes
- BUILD: Build number (auto-increment)

Update in `pubspec.yaml`:
```yaml
version: 1.0.0+1
```

## Firebase Setup (Optional for Analytics)

### 1. Create Firebase Project
```bash
firebase login
firebase projects:create play-learn-spark
```

### 2. Add Firebase to Flutter
```bash
flutterfire configure
```

### 3. Add Firebase Dependencies
```yaml
dependencies:
  firebase_core: latest
  firebase_analytics: latest
  firebase_crashlytics: latest
```

## Release Notes Template

### Version 1.0.0
**What's New:**
- 🎉 Initial release
- 19 engaging learning activities
- Progress tracking and badges
- Personalized learning paths
- Daily goals and streaks

**Activities Include:**
- Animal Safari
- Counting Train
- Shape Explorer
- Color Match
- Alphabet Adventure
- Memory Cards
- Pattern Builder
- And 12 more!

**Features:**
- Track your child's progress
- Earn badges and rewards
- Daily learning streaks
- Age-appropriate content (3-6 years)
- Offline support

## App Store Optimization (ASO)

### Keywords (for both stores)
- Kids learning
- Educational games
- Preschool activities
- Early childhood education
- Learning games for kids
- Toddler learning
- Educational apps
- Kids education
- Learning activities
- Preschool games

### Screenshots Required
1. **Phone (Required)**
   - iPhone 6.7" (1290x2796)
   - iPhone 5.5" (1242x2208)
   
2. **Tablet (Recommended)**
   - iPad Pro 12.9" (2048x2732)
   - iPad Pro 11" (1668x2388)

3. **Android**
   - Phone: 1080x1920
   - 7-inch tablet: 1200x1920
   - 10-inch tablet: 1600x2560

## Post-Launch

### Monitoring
- [ ] Set up crash reporting
- [ ] Configure analytics
- [ ] Monitor app store reviews
- [ ] Track key metrics (DAU, retention, completion rates)

### Updates
- [ ] Plan content updates
- [ ] Bug fix releases
- [ ] Feature enhancements
- [ ] Seasonal content

### Marketing
- [ ] Create landing page
- [ ] Social media presence
- [ ] Press kit
- [ ] User testimonials
- [ ] Educational blog content

## Support & Maintenance

### User Support Channels
- Email: support@playlearnspark.com
- FAQ page
- In-app help
- Tutorial videos

### Regular Maintenance
- Monthly dependency updates
- Quarterly feature releases
- Security patches
- Performance optimization

## Rollback Plan
In case of critical issues:
1. Stop staged rollout
2. Revert to previous version
3. Fix issues
4. Increment build number
5. Re-submit

## Success Metrics
- Downloads: Target 10K in first month
- Daily Active Users: 60%+ retention
- Activity Completion Rate: >80%
- App Store Rating: 4.5+ stars
- Crash-free Rate: >99%

## Legal Requirements
- [ ] Privacy policy published
- [ ] Terms of service
- [ ] COPPA compliance (children's privacy)
- [ ] GDPR compliance (if EU users)
- [ ] Parental consent mechanisms
- [ ] Data collection disclosure

## Timeline
- Week 1: Final testing and bug fixes
- Week 2: Store listings and assets
- Week 3: Submit to stores
- Week 4: Review and launch
- Ongoing: Monitor and iterate
