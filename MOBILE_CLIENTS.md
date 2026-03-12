# Mobile Client Testing Guide

Instructions for building and testing the BoxDrop app on iOS and Android devices and simulators.

## Prerequisites

| Tool | Required For | Install |
|------|-------------|---------|
| Xcode 15+ | iOS Simulator & builds | Mac App Store |
| Android Studio | Android Emulator & builds | [developer.android.com](https://developer.android.com/studio) |
| Expo CLI | Dev server | Included via `npx expo` |
| Expo Go app | On-device testing (no native build) | App Store / Google Play |
| EAS CLI | Cloud builds & submissions | `npm install -g eas-cli` |
| Node.js 20+ | Frontend toolchain | [nodejs.org](https://nodejs.org) |

## Running on Simulators / Emulators

Start the backend infrastructure first:

```bash
docker compose up -d
cd backend && ./gradlew run
```

Then launch the mobile app:

```bash
cd mobile-web
npm install

# Start Expo dev server — press i for iOS, a for Android
npx expo start

# Or launch directly on a specific platform
npx expo start --ios       # Opens iOS Simulator (requires Xcode)
npx expo start --android   # Opens Android Emulator (requires Android Studio)
```

### iOS Simulator Setup

1. Install Xcode from the Mac App Store.
2. Open Xcode → **Settings → Platforms** → install the iOS Simulator runtime.
3. Open **Simulator.app** or let Expo launch it automatically.
4. To pick a specific device: `xcrun simctl list devices available`, then launch it from Simulator.app before running `npx expo start --ios`.

### Android Emulator Setup

1. Install Android Studio and open **SDK Manager** → install Android SDK 34+.
2. Open **Virtual Device Manager** → create an emulator (e.g., Pixel 7, API 34).
3. Start the emulator, then run `npx expo start --android`.
4. Ensure `ANDROID_HOME` is set (usually `~/Library/Android/sdk` on macOS).

## Running on Physical Devices

### With Expo Go (fastest, no native build required)

1. Install **Expo Go** on your iOS or Android device.
2. Start the dev server: `npx expo start`.
3. Scan the QR code shown in the terminal:
   - **iOS**: Use the Camera app.
   - **Android**: Use the Expo Go app's scanner.
4. The device must be on the same Wi-Fi network as your dev machine, or use `npx expo start --tunnel` to test over the internet.

> **Note:** Expo Go supports most features but may not support all custom native modules. Use a development build (see below) for full functionality.

### With a Development Build (full native support)

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Create a development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Install the resulting build on your device, then connect:
npx expo start --dev-client
```

## Environment Configuration

The app connects to the backend at `EXPO_PUBLIC_API_URL`. Create a `.env` file in `mobile-web/`:

```bash
# Local development (default)
EXPO_PUBLIC_API_URL=http://localhost:8080

# Physical device on local network (use your machine's LAN IP)
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:8080

# Staging / production
EXPO_PUBLIC_API_URL=https://api.boxdrop.example.com
```

When testing on a physical device or emulator, `localhost` won't resolve to your dev machine. Use your machine's local IP address instead:

```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

For Android Emulator specifically, `10.0.2.2` maps to the host machine's `localhost`.

## Building for Testing (EAS Build)

### Internal Distribution Builds

These produce installable binaries for testers without going through app store review:

```bash
# iOS (creates an .ipa for Ad Hoc distribution)
eas build --profile preview --platform ios

# Android (creates an .apk)
eas build --profile preview --platform android

# Both platforms
eas build --profile preview --platform all
```

### Local Builds (no EAS account required)

```bash
# iOS (requires Xcode, outputs .app for Simulator)
npx expo run:ios

# Android (requires Android Studio, outputs .apk)
npx expo run:android
```

## Platform-Specific Testing Checklist

### iOS

- [ ] App launches and displays splash screen correctly
- [ ] Location permissions prompt appears and map works after granting
- [ ] Camera/photo library permissions for image upload
- [ ] Secure token storage works (`expo-secure-store`)
- [ ] Deep links open via `boxdrop://` URL scheme
- [ ] Keyboard avoidance on forms (login, register, create sale)
- [ ] Safe area insets on notched devices (iPhone X+)
- [ ] Landscape is locked to portrait (`app.json` orientation)

### Android

- [ ] App launches and displays adaptive icon correctly
- [ ] Location permissions (foreground) prompt and map functionality
- [ ] Camera/photo library permissions for image upload
- [ ] Back button behavior on all screens (hardware + gesture)
- [ ] Deep links open via `boxdrop://` URL scheme
- [ ] Keyboard behavior on forms
- [ ] Status bar theming
- [ ] Tested on multiple API levels (minimum API 24+)

### Both Platforms

- [ ] Auth flow: register → OTP verify → home screen
- [ ] Browse nearby sales on home screen and map
- [ ] View sale detail and listing detail with photo carousel
- [ ] Save/unsave listings
- [ ] Claim a listing and complete payment
- [ ] Create a sale and add listings with images
- [ ] Messaging between buyer and seller
- [ ] Profile editing and settings
- [ ] Pull-to-refresh on list screens
- [ ] Network error handling (disable Wi-Fi to test)
- [ ] Token refresh works (wait for access token to expire)

## Debugging

```bash
# Open React Native Debugger (shake device or Cmd+D in Simulator)
# Or connect React DevTools:
npx react-devtools

# View native logs
# iOS:
xcrun simctl spawn booted log stream --level debug --predicate 'processImagePath contains "BoxDrop"'

# Android:
adb logcat *:S ReactNative:V ReactNativeJS:V

# Inspect network requests — use Flipper or React Native Debugger
```

## Troubleshooting

| Issue | Solution |
|-------|---------|
| iOS Simulator not found | Open Xcode once to install components, then retry |
| Android Emulator not detected | Ensure `ANDROID_HOME` is set and emulator is running |
| `localhost` unreachable from device | Use your machine's LAN IP in `EXPO_PUBLIC_API_URL` |
| Expo Go "unsupported SDK" | Update Expo Go to match SDK 52 |
| Metro bundler port conflict | Kill existing processes on port 8081: `lsof -ti:8081 \| xargs kill` |
| Maps not rendering on Android Emulator | Ensure the emulator uses Google Play images |
| `expo-secure-store` errors on web | Expected — web falls back to `localStorage` |
