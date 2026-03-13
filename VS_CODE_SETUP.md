# VS Code Setup Guide for BoxDrop

This guide covers built-in VS Code tools and recommended extensions for running both the Micronaut backend and Expo mobile application.

## Quick Start

1. **Open project in VS Code**:
   ```bash
   cd /Users/mark/development/projects/boxdrop
   code .
   ```

2. **Install recommended extensions**: VS Code will prompt you to install extensions from `.vscode/extensions.json`. Click "Install All" or search for them manually.

3. **Open the workspace**: The `.vscode/settings.json` is configured as a **multi-folder workspace** with both `backend` and `mobile-web` folders visible in the Explorer.

---

## VS Code Built-in Features

### 1. **Terminal** (Built-in)
- **Shortcut**: `Ctrl` + `` ` `` (or `Cmd` + `` ` `` on Mac)
- Run the `dev.sh` script directly:
  ```bash
  ./dev.sh backend:run
  ./dev.sh mobile:start
  ```
- Open multiple terminals for concurrent development

### 2. **Command Palette** (Built-in)
- **Shortcut**: `Cmd` + `Shift` + `P` (Mac) / `Ctrl` + `Shift` + `P` (Windows/Linux)
- Run VS Code tasks: Type "Task: Run Task" then select:
  - `Gradle: Run Backend`
  - `Expo: Start Dev Server`
  - `Expo: Run on Android/iOS/Web`
  - And more…

### 3. **Debug Panel** (Built-in)
- **View**: Click the Debug icon in the sidebar (or `Cmd` + `Shift` + `D`)
- **Launch configs available**:
  - ✅ **Debug Backend (Micronaut)** - Launches with debugger attached
  - ✅ **Attach to Backend (Port 5005)** - Connects to running backend
  - ✅ **Full Stack (Backend + Expo Web)** - Compound configuration for debugging both simultaneously

### 4. **Problem Matcher** (Built-in)
- Errors and warnings from build tools automatically appear in the **Problems panel**
- Filter by Backend/Mobile source
- Click to jump to offending line

---

## Recommended Extensions

### Backend Development (Kotlin/Micronaut)

#### **Extension Pack for Java** (`ms-vscode.extension-pack-for-java`)
- Includes Debugger for Java, Test Runner, Maven for Java
- **Use case**: Debug backend, run unit tests
- **Keyboard shortcut**: Debug view shows "Run" and "Debug" buttons

#### **Kotlin Language** (`fwcd.kotlin`)
- Kotlin syntax highlighting, completion, and navigation
- **Features**: Go to definition, refactoring, type hints

#### **Gradle Tasks** (`mhutchie.vscode-gradle`, `gabrielBaltazar.gradle-tasks`)
- Task explorer for running Gradle commands
- **View**: Sidebar icon or open with `Ctrl` + `Shift` + `D` → "Gradle Tasks"
- **Quick access**: Right-click `build.gradle.kts` → "Run Gradle Task"

### Mobile Development (React Native/Expo)

#### **Expo Tools** (`MS-VSCode-Expo.expo-tools`)
- **Official Expo extension** - Simplest way to manage Expo projects
- **Features**:
  - Quick access to Expo CLI commands
  - QR code generation for mobile testing
  - Fast refresh integration
  - EAS Build integration
- **View**: Sidebar Expo icon or when you open `app.json`

#### **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
- React component templates and shortcuts
- Type `rfc` → autocomplete React functional component

#### **ESLint** (`dbaeumer.vscode-eslint`)
- Real-time linting for TypeScript/JavaScript
- Auto-fix on save (configured in settings)

### General Development

#### **Prettier** (`esbenp.prettier-vscode`)
- Code formatter for all languages
- Auto-format on save (enabled in settings)

#### **Code Spell Checker** (`streetsidesoftware.code-spell-checker`)
- Catch typos in code, comments, strings

---

## Running Applications from VS Code

### Option 1: Using Tasks (Recommended for quick access)

**Command Palette** → Type "Task: Run Task" → Select:

**Backend**:
- `Gradle: Run Backend` - Starts Micronaut on http://localhost:8080
- `Gradle: Build Backend` - Compiles Kotlin code
- `Gradle: Test Backend` - Runs JUnit tests
- `Gradle: Detekt (Lint)` - Code quality analysis

**Mobile**:
- `Expo: Start Dev Server` - Interactive Expo menu
- `Expo: Run on Android` - Android emulator
- `Expo: Run on iOS` - iOS simulator
- `Expo: Run on Web` - Browser
- `NPM: Test Mobile` - Jest tests

**Docker**:
- `Docker: Start Services` - PostgreSQL + Redis

### Option 2: Using the Debug Panel

1. Click **Debug** icon in sidebar (or `Cmd` + `Shift` + `D`)
2. Select configuration from dropdown at top
3. Click **▶ Start Debugging** (or `F5`)

**Configurations**:
- **Debug Backend (Micronaut)** - Builds and launches with debugger
- **Attach to Backend (Port 5005)** - Connect to already-running backend
- **Full Stack** - Debug both backend and Expo web simultaneously

### Option 3: Using Terminal

Open integrated terminal (`Cmd` + `` ` ``) and run:

```bash
# Backend
cd backend
./gradlew run          # or: ./gradlew build; ./gradlew run

# Mobile
cd mobile-web
npm start              # Interactive menu
npm run android        # Android emulator
npm run ios            # iOS simulator
npm run web            # Web browser
```

### Option 4: Using Gradle Tasks Extension

1. Click **Gradle** icon in sidebar
2. Expand `backend` → `Tasks` → `verification`
3. Right-click → `Run` (e.g., `test`, `detekt`)

---

## Debugging Features

### Backend (Java/Kotlin)

**Breakpoints**:
1. Click gutter next to line number to set breakpoint
2. Run task: `Gradle: Run Backend` or use Debug panel
3. Execution pauses at breakpoint
4. **Debug Console** shows variables, expressions

**Debug Controls**:
- **Continue** (`F5`)
- **Step Over** (`F10`)
- **Step Into** (`F11`)
- **Step Out** (`Shift` + `F11`)
- **Restart** (`Cmd` + `Shift` + `F5`)

**Watch Variables**:
- Add expression in Debug panel → **Watch** section
- Evaluate in Debug Console

### Mobile (JavaScript/TypeScript)

Currently limited. VS Code doesn't have built-in JS debugging for React Native without additional setup. Use:
- **React Native Debugger** (separate app)
- **Chrome DevTools** (for web-only debugging)
- **Console.log** statements with Metro fast refresh

---

## Multi-Folder Workspace

VS Code is configured with **both projects in one workspace**:

**Explorer shows**:
- 📁 `backend` (Kotlin/Gradle)
- 📁 `mobile-web` (React Native/npm)

**Benefits**:
- ✅ Search across both projects
- ✅ Unified source control (one Git repo)
- ✅ Shared settings and tasks
- ✅ Easy file navigation with `Cmd` + `P`

**Navigate between folders**:
- Click project name in Explorer
- Or: `Cmd` + `Shift` + `P` → "File: Change Default Build Task"

---

## Useful Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd` + `` ` `` | Open integrated terminal |
| `Cmd` + `Shift` + `D` | Open Debug view |
| `Cmd` + `Shift` + `P` | Command Palette (tasks, settings) |
| `F5` | Start/Continue debugging |
| `F9` | Toggle breakpoint |
| `F10` | Step over |
| `F11` | Step into |
| `Cmd` + `Shift` + `F` | Search in all files |
| `Cmd` + `P` | Quick file open |
| `Cmd` + `B` | Toggle sidebar |
| `Cmd` + `J` | Toggle terminal |

---

## VS Code Settings Configured

The `.vscode/settings.json` includes:

✅ **Multi-folder workspace** setup
✅ **Format on save** with Prettier
✅ **Auto-fix ESLint** errors
✅ **Kotlin language** support
✅ **Gradle** nesting
✅ **Java 17** runtime
✅ **File exclusions** for build artifacts, node_modules
✅ **Spell checker** with BoxDrop-specific words

---

## Troubleshooting

### Extensions not working?

```bash
# In VS Code:
1. Command Palette → "Developer: Reload Window"
2. Or: Click profile icon → Settings → Extensions → Reinstall
```

### Gradle tasks not appearing?

```bash
# Refresh Gradle extension:
Cmd + Shift + P → "Gradle: Refresh" (if using gabrielBaltazar extension)
```

### Backend debug not connecting?

```bash
# Ensure backend is running with debug mode:
./dev.sh backend:run    # Auto-enables JDWP on port 5005

# Or manually:
cd backend
./gradlew run           # Starts with jdwp=transport=dt_socket,server=y,suspend=n,address=5005
```

### Expo QR code not appearing?

With **Expo Tools** extension:
1. Open terminal running `npm start`
2. Press `i` for iOS or `a` for Android
3. QR code appears in terminal

---

## Quick Reference: Running Everything

**Start all services**:

```bash
# Terminal 1 (Backend)
Task: Run and select "Gradle: Run Backend"

# Terminal 2 (Expo)
Task: Run and select "Expo: Start Dev Server"

# Terminal 3 (Docker - optional)
Task: Run and select "Docker: Start Services"
```

Or use the **Compound Debug Configuration**:
1. Debug view → Select "Full Stack (Backend + Expo Web)"
2. Click ▶ Start

---

## Next Steps

1. ✅ Install recommended extensions from `.vscode/extensions.json`
2. ✅ Open `.vscode/tasks.json` to see all available tasks
3. ✅ Try running: `Task: Run Task` → `Gradle: Run Backend`
4. ✅ Set a breakpoint and debug using the Debug panel
5. ✅ Customize keyboard shortcuts in `.vscode/keybindings.json` if needed

Happy coding! 🚀
