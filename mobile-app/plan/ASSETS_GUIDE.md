# Assets Guide - Play & Learn Spark Mobile App

## Overview

This guide explains how to organize and manage assets for the mobile application.

## Asset Categories

### 1. Images

#### Activity Icons
- **Path**: `assets/images/icons/activities/`
- **Format**: SVG (preferred) or PNG
- **Size**: 512x512px minimum
- **Files**:
  - animal-safari.svg
  - body-parts.svg
  - color-rainbow.svg
  - counting-train.svg
  - emotion-faces.svg
  - family-tree.svg
  - number-garden.svg
  - shape-detective.svg
  - size-sorter.svg
  - transportation.svg
  - weather-station.svg
  - pizza-fractions.svg
  - malayalam-learning.svg
  - arabic-learning.svg

#### Badge Icons
- **Path**: `assets/images/icons/badges/`
- **Format**: PNG with transparency
- **Size**: 256x256px
- **Files**:
  - first-steps.png
  - rising-star.png
  - learning-champion.png
  - consistent-learner.png
  - week-warrior.png
  - math-master.png
  - english-expert.png
  - high-scorer.png

#### UI Icons
- **Path**: `assets/images/icons/ui/`
- Use Material Icons (built-in) or custom SVGs
- **Files**:
  - logo.svg
  - splash-background.svg

#### Characters & Decorations
- **Path**: `assets/images/characters/`
- **Format**: PNG with transparency
- **Size**: Various (optimize for usage)

### 2. Audio

#### Sound Effects
- **Path**: `assets/audio/sounds/`
- **Format**: MP3 (compressed)
- **Duration**: < 2 seconds
- **Files**:
  - tap.mp3 (button tap sound)
  - success.mp3 (correct answer)
  - error.mp3 (wrong answer)
  - celebration.mp3 (activity complete)
  - pop.mp3 (UI interaction)
  - whoosh.mp3 (transition)

#### Background Music
- **Path**: `assets/audio/music/`
- **Format**: MP3
- **Duration**: 30-60 seconds (loop)
- **Files**:
  - background-happy.mp3
  - background-calm.mp3

#### Voice Instructions (Multilingual)
- **Path**: `assets/audio/voice/{language}/`
- **Format**: MP3
- **Languages**: en, ml, ar
- **Files per language**:
  - welcome.mp3
  - great-job.mp3
  - try-again.mp3
  - activity-complete.mp3

### 3. Animations

#### Lottie Animations
- **Path**: `assets/animations/lottie/`
- **Format**: JSON
- **Files**:
  - loading.json
  - success.json
  - confetti.json
  - star-burst.json
  - trophy.json

### 4. Fonts

#### Primary Font (Nunito)
- **Path**: `assets/fonts/Nunito/`
- **Weights**: 400, 600, 700
- **Files**:
  - Nunito-Regular.ttf
  - Nunito-SemiBold.ttf
  - Nunito-Bold.ttf

#### Secondary Font (NotoSans for multilingual)
- **Path**: `assets/fonts/NotoSans/`
- **Files**:
  - NotoSans-Regular.ttf
  - NotoSans-Bold.ttf
  - NotoSansMalayalam-Regular.ttf
  - NotoSansArabic-Regular.ttf

## Asset Configuration

### pubspec.yaml

```yaml
flutter:
  uses-material-design: true

  assets:
    # Images
    - assets/images/icons/activities/
    - assets/images/icons/badges/
    - assets/images/icons/ui/
    - assets/images/characters/
    - assets/images/backgrounds/
    
    # Audio
    - assets/audio/sounds/
    - assets/audio/music/
    - assets/audio/voice/en/
    - assets/audio/voice/ml/
    - assets/audio/voice/ar/
    
    # Animations
    - assets/animations/lottie/
    
    # Data
    - assets/data/activities.json
    - assets/data/badges.json

  fonts:
    - family: Nunito
      fonts:
        - asset: assets/fonts/Nunito/Nunito-Regular.ttf
          weight: 400
        - asset: assets/fonts/Nunito/Nunito-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Nunito/Nunito-Bold.ttf
          weight: 700
    
    - family: NotoSans
      fonts:
        - asset: assets/fonts/NotoSans/NotoSans-Regular.ttf
        - asset: assets/fonts/NotoSans/NotoSans-Bold.ttf
          weight: 700
    
    - family: NotoSansMalayalam
      fonts:
        - asset: assets/fonts/NotoSans/NotoSansMalayalam-Regular.ttf
    
    - family: NotoSansArabic
      fonts:
        - asset: assets/fonts/NotoSans/NotoSansArabic-Regular.ttf
```

## Asset Optimization

### Image Optimization

```bash
# Install tools
npm install -g imagemin-cli imagemin-webp imagemin-pngquant imagemin-mozjpeg

# Optimize PNGs
imagemin assets/images/**/*.png --out-dir=assets/images/optimized --plugin=pngquant

# Optimize JPGs
imagemin assets/images/**/*.jpg --out-dir=assets/images/optimized --plugin=mozjpeg

# Convert to WebP (for web version)
imagemin assets/images/**/*.{jpg,png} --out-dir=assets/images/webp --plugin=webp
```

### Audio Optimization

```bash
# Install ffmpeg
brew install ffmpeg  # macOS
apt-get install ffmpeg  # Ubuntu

# Compress audio files
for file in assets/audio/**/*.{wav,mp3}; do
  ffmpeg -i "$file" -c:a libmp3lame -b:a 128k "${file%.*}.mp3"
done
```

### Animation Optimization

Use [LottieFiles](https://lottiefiles.com/) to:
1. Create/download animations
2. Optimize file size
3. Preview before use

## Asset Loading

### Images

```dart
// Local asset
Image.asset('assets/images/icons/activities/animal-safari.svg')

// With optimization
Image.asset(
  'assets/images/characters/bear.png',
  cacheWidth: 400,
  cacheHeight: 400,
)

// SVG
SvgPicture.asset('assets/images/icons/ui/logo.svg')
```

### Audio

```dart
import 'package:audioplayers/audioplayers.dart';

final player = AudioPlayer();

// Play sound effect
await player.play(AssetSource('audio/sounds/success.mp3'));

// Play background music (looped)
await player.play(
  AssetSource('audio/music/background-happy.mp3'),
  mode: PlayerMode.loop,
);
```

### Animations

```dart
import 'package:lottie/lottie.dart';

Lottie.asset('assets/animations/lottie/success.json')
```

## Size Guidelines

### Target Sizes

- **App Icon**: 1024x1024px
- **Activity Icons**: 512x512px
- **Badge Icons**: 256x256px
- **Character Images**: 1024x1024px (max)
- **Background Images**: 1920x1080px (max)

### File Size Limits

- **Images**: < 200 KB each
- **Sounds**: < 100 KB each
- **Music**: < 500 KB each
- **Animations**: < 50 KB each

### Total App Size Target

- **Android APK**: < 50 MB
- **iOS IPA**: < 50 MB
- With assets: < 100 MB total

## Asset Sources

### Free Resources

#### Images & Icons
- [Flaticon](https://www.flaticon.com/) - Free icons
- [unDraw](https://undraw.co/) - Illustrations
- [Freepik](https://www.freepik.com/) - Various graphics
- [Pixabay](https://pixabay.com/) - Free images

#### Audio
- [Freesound](https://freesound.org/) - Sound effects
- [Incompetech](https://incompetech.com/) - Royalty-free music
- [Zapsplat](https://www.zapsplat.com/) - Sound effects

#### Animations
- [LottieFiles](https://lottiefiles.com/) - Free animations
- [Rive](https://rive.app/) - Interactive animations

### Licensing

Ensure all assets have appropriate licenses:
- ✅ Free for commercial use
- ✅ Attribution not required (preferred)
- ✅ Modification allowed

## Asset Checklist

### Required Assets
- [ ] App icon (all sizes)
- [ ] Splash screen background
- [ ] 15+ activity icons
- [ ] 8+ badge icons
- [ ] 6+ sound effects
- [ ] 2+ background music tracks
- [ ] 5+ Lottie animations
- [ ] Fonts (2 families)

### Optional Assets
- [ ] Character illustrations
- [ ] Background patterns
- [ ] Voice instructions (3 languages)
- [ ] Tutorial videos

## Dynamic Assets

For assets that need frequent updates, use the Static Content Server:

```dart
// Check if asset needs update
final manifest = await contentService.fetchManifest();

// Download if needed
if (needsUpdate) {
  await contentService.downloadContent(
    manifest['images']['activities'][0]['url'],
    localPath,
  );
}
```

## Best Practices

1. ✅ **Optimize all assets** before adding to project
2. ✅ **Use SVG** for icons when possible
3. ✅ **Compress audio** to MP3 format
4. ✅ **Test on real devices** to verify performance
5. ✅ **Version control** large assets separately
6. ✅ **Lazy load** heavy assets
7. ✅ **Cache** frequently used assets
8. ✅ **Monitor** app size during development

---

**Note**: Keep total bundled assets under 20MB. Use the Static Content Server for larger media files.
