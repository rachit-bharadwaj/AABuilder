<div align="center">

# 📱 AABuilder

### React Native Build Automator

<p align="center">
  <img src="https://img.shields.io/badge/Electron-39.2.3-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"/>
  <img src="https://img.shields.io/badge/TypeScript-4.5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<p align="center">
  <strong>A powerful desktop application that automates building Android App Bundles (AAB) and Android Package (APK) files from React Native projects</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Windows-Supported-0078D6?style=flat-square&logo=windows&logoColor=white" alt="Windows"/>
  <img src="https://img.shields.io/badge/Linux-Supported-FCC624?style=flat-square&logo=linux&logoColor=black" alt="Linux (Debian/Ubuntu)"/>
</p>

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Prerequisites](#-prerequisites) • [Building](#-building-from-source) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

<table>
<tr>
<td width="50%">

### 🚀 Build Automation

- **One-Click AAB Building** - Generate Android App Bundles with a single click
- **Automated APK Generation** - Convert AAB to universal APK automatically
- **Clean Build Option** - Start fresh with Gradle clean before building
- **Real-time Progress** - Live build logs with color-coded messages

</td>
<td width="50%">

### 💼 Project Management

- **Save & Load Projects** - Store your build configurations for reuse
- **Multiple Project Support** - Manage multiple React Native projects
- **Export/Import Config** - Share configurations as JSON files
- **Undo Changes** - Revert to original project settings

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Modern UI

- **Beautiful Interface** - Clean, modern design with Tailwind CSS
- **Intuitive Navigation** - Easy-to-use form-based configuration
- **Dark Terminal** - Professional build log viewer
- **Responsive Layout** - Optimized for various screen sizes

</td>
<td width="50%">

### 🔧 Advanced Options

- **Build Mode Selection** - Choose between Release and Debug builds
- **Custom Output Names** - Specify your own file naming
- **Auto-naming** - Smart automatic file naming with dates
- **Keystore Management** - Secure handling of signing credentials

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">

### Main Interface

<img src="/public/images/main-screen.png" alt="AABuilder Main Interface" width="800"/>

_Clean and intuitive interface for configuring your React Native builds_

### Build in Progress

<img src="/public/images/build.png" alt="Build Progress" width="800"/>

_Real-time build logs with color-coded messages for easy monitoring_

</div>

---

## 🎯 Why AABuilder?

Building Android apps from React Native projects can be tedious and error-prone. AABuilder streamlines this process by:

- ✅ **Eliminating Manual Commands** - No more typing complex Gradle or bundletool commands
- ✅ **Reducing Errors** - Automated validation ensures all required fields are filled
- ✅ **Saving Time** - One-click builds instead of multiple terminal commands
- ✅ **Managing Complexity** - Simple UI for complex build configurations
- ✅ **Maintaining Consistency** - Reusable project configs ensure consistent builds

---

## 📋 Prerequisites

Before using AABuilder, ensure you have the following installed:

### Required

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/

2. **Java Runtime Environment (JRE)** (for APK building)
   - Download: https://www.java.com/download/
   - Required for bundletool to convert AAB to APK

3. **Android SDK & React Native Environment**
   - Follow the official [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
   - Ensure Android SDK is properly configured

### Optional

- **Keystore File** - Required for APK generation (not needed for AAB-only builds)

---

## 📥 Installation

### Option 1: Download Pre-built Binary (Recommended)

1. Go to the [Releases](https://github.com/rachit-bharadwaj/AABuilder-Electron/releases) page
2. Download the installer for your platform:
   - **Windows**: `AABuilder-Setup.exe`
   - **Linux (Debian/Ubuntu)**: `aabuilder-electron_1.0.0_amd64.deb`
3. **Windows**: Run the installer, then launch AABuilder from your Start Menu or Desktop
4. **Linux**: Install the .deb package and launch from your application menu:
   ```bash
   sudo dpkg -i aabuilder-electron_*_amd64.deb
   sudo apt-get install -f   # if dependencies are missing
   ```

### Option 2: Build from Source

See the [Building from Source](#-building-from-source) section below.

---

## 🚀 Usage

### Quick Start Guide

1. **Launch AABuilder**
   - **Windows**: Open from your Start Menu or Desktop
   - **Linux**: Open from your application menu (e.g. **AABuilder** or **aabuilder-electron**)

2. **Configure Your Project**

   Fill in the following fields:
   - **Project Path**: Select your React Native project directory
   - **Output Path**: Choose where to save the generated files
   - **Keystore**: Select your Android keystore file (for APK builds)
   - **Keystore Password**: Enter your keystore password
   - **Key Alias**: Enter your key alias
   - **Key Password**: Enter your key password

3. **Choose Build Options**
   - **Build Mode**: Select `Release` (production) or `Debug`
   - **Clean Build**: Check this to run Gradle clean first
   - **Output Name**: Optionally specify a custom filename

4. **Build Your App**
   - Click **Build AAB** to generate an Android App Bundle
   - Click **Build APK** to generate a universal APK (builds AAB first, then converts)

5. **Monitor Progress**
   - Watch real-time logs in the Build Log section
   - Green messages indicate success
   - Red messages indicate errors

### Project Management

#### Saving a Project

1. Configure all your build settings
2. Click the **Save Project** button
3. Enter a project name
4. Your configuration is now saved for future use

#### Loading a Project

1. Click the **Load Project** button
2. Select a project from the list
3. Click **Load** to apply the configuration

#### Updating a Project

1. Load an existing project
2. Make your changes
3. Click **Update "[Project Name]"** to save changes

#### Undoing Changes

- Click **Undo Changes** to revert to the original loaded configuration

#### Export/Import

- **Save As File**: Export configuration as a JSON file
- **Load from File**: Import a previously exported configuration

---

## 🔧 Configuration Details

### Project Path

The root directory of your React Native project (must contain `package.json`).

```
Windows: C:\Users\YourName\Projects\MyReactNativeApp
Linux:   /home/username/projects/MyReactNativeApp
```

### Output Path

Directory where generated AAB/APK files will be saved.

```
Windows: C:\Users\YourName\Desktop\Builds
Linux:   /home/username/Desktop/Builds
```

### Keystore Configuration

- **Keystore Path**: Path to your `.keystore` or `.jks` file
- **Keystore Password**: Password for the keystore file
- **Key Alias**: Alias name of the key in the keystore
- **Key Password**: Password for the specific key

> 💡 **Tip**: If you don't have a keystore, you can generate one using:
>
> ```bash
> keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
> ```

### Build Modes

- **Release**: Production-ready build with optimizations (default)
- **Debug**: Development build with debugging enabled

---

## 🏗️ Building from Source

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

### Steps

1. **Clone the Repository**

```bash
git clone https://github.com/rachit-bharadwaj/AABuilder-Electron.git
cd AABuilder-Electron
```

2. **Install Dependencies**

```bash
npm install
```

3. **Download bundletool**

Download `bundletool.jar` from the [official repository](https://github.com/google/bundletool/releases) and place it in the project root directory.

4. **Run in Development Mode**

```bash
npm start
```

5. **Build for Production**

**Windows:**

```bash
npm run make:win
```

**Linux (Debian/Ubuntu):**

```bash
npm run make:linux
```

(Requires `dpkg` and `fakeroot`: `sudo apt-get install dpkg fakeroot`)

**All platforms (from respective OS):**

```bash
npm run make
```

**Output locations:**

| Platform | Output path |
| -------- | ----------- |
| Windows  | `out/make/squirrel.windows/x64/AABuilder-Setup.exe` |
| Linux    | `out/make/deb/x64/aabuilder-electron_1.0.0_amd64.deb` |

---

## 📁 Project Structure

```
aabuilder-electron/
├── src/
│   ├── main.ts              # Electron main process
│   ├── renderer.ts          # Renderer process (UI)
│   ├── preload.ts           # Preload script
│   ├── BuildAutomator.ts    # Build automation logic
│   └── index.css            # Styles
├── out/                     # Build output
├── bundletool.jar          # Android bundletool
├── forge.config.ts         # Electron Forge configuration
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

---

## 🛠️ Tech Stack

| Technology         | Purpose                                      |
| ------------------ | -------------------------------------------- |
| **Electron**       | Cross-platform desktop application framework |
| **TypeScript**     | Type-safe JavaScript development             |
| **Vite**           | Fast build tool and development server       |
| **Tailwind CSS**   | Utility-first CSS framework for modern UI    |
| **Electron Forge** | Build and packaging tooling                  |
| **Node.js**        | Runtime for build processes                  |
| **bundletool**     | Android App Bundle tool                      |

---

## 📝 Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `npm start`          | Start the application in development mode         |
| `npm run package`    | Package the application (no installer)            |
| `npm run make`       | Create distributable installers for current platform |
| `npm run make:win`   | Create Windows installer only                     |
| `npm run make:linux` | Create Linux (.deb) package for Debian/Ubuntu     |
| `npm run lint`       | Run ESLint for code quality                       |

---

## ❓ Troubleshooting

### Common Issues

#### ❌ "Java Runtime Environment (JRE) is not installed"

**Solution**: Install Java from https://www.java.com/download/ and restart AABuilder

#### ❌ "bundletool.jar not found"

**Solution**:

1. Download `bundletool.jar` from https://github.com/google/bundletool/releases
2. Place it in the same directory as the AABuilder executable
3. **Windows**: Or place it in `C:\Program Files\AABuilder\`
4. **Linux**: Or place it in the app’s `resources` directory (e.g. `/usr/lib/aabuilder-electron/resources/`)

#### ❌ "Project path must contain package.json"

**Solution**: Make sure you're selecting the root directory of your React Native project

#### ❌ Build fails with Gradle errors

**Solution**:

1. Enable **Clean Build** option
2. Ensure your React Native environment is properly set up
3. Check that Android SDK is correctly configured

#### ❌ "Cannot create output directory"

**Solution**: Ensure you have write permissions for the selected output directory

---

## 🔒 Security

- **Keystore passwords** are handled securely in memory and never written to disk
- **Project configurations** are stored locally in your AppData folder
- **No telemetry** or data collection

> ⚠️ **Important**: Never share your keystore files or passwords publicly!

---

## 🗺️ Roadmap

- [ ] **macOS Support** - Build for macOS platform
- [x] **Linux Support** - Native Linux builds (Debian/Ubuntu .deb)
- [ ] **iOS Build Support** - Add iOS build capabilities
- [ ] **Build History** - Track and manage previous builds
- [ ] **Batch Building** - Build multiple projects at once
- [ ] **Cloud Integration** - Upload builds directly to Play Store
- [ ] **Build Notifications** - Desktop notifications for build completion
- [ ] **Dark Mode** - Theme switching option
- [ ] **Multi-language Support** - Internationalization

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

### Made with ❤️ for [Infornics](https://infornics.com)

_Happy Building! 🚀_
