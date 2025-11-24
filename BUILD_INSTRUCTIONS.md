# Building AABuilder for Distribution

This guide explains how to build a distributable Windows installer (.exe) for AABuilder.

## Prerequisites

1. **Node.js** (v16 or higher) and npm installed
2. **Windows** (for building Windows installers)
3. All dependencies installed: `npm install`

## Building the Installer

### Step 1: Ensure bundletool.jar is in the project root

Make sure `bundletool.jar` is present in the root directory of the project (same level as `package.json`).

### Step 2: Build the Windows Installer

Run the following command to create a Windows installer:

```bash
npm run make:win
```

Or to build for all platforms:

```bash
npm run make
```

### Step 3: Find the Installer

After building, the installer will be located at:

```
out/make/squirrel.windows/x64/AABuilder-Setup.exe
```

## What Gets Included

The installer includes:
- ✅ AABuilder application executable
- ✅ bundletool.jar (automatically bundled)
- ✅ All required dependencies
- ✅ Windows installer with automatic setup

## Distribution

You can share the `AABuilder-Setup.exe` file with anyone. When they run it:
1. It will install AABuilder to their system
2. bundletool.jar will be automatically placed in the correct location
3. The application will be ready to use

## Installation Location

By default, the installer places the application in:
- **User's AppData folder** (for per-user installation)
- The `bundletool.jar` will be in the `resources` folder alongside the executable

## Notes

- The installer is unsigned by default. For production distribution, consider code signing.
- The first run may take a moment as Windows may show a security warning (this is normal for unsigned executables).
- Users will need Java Runtime Environment (JRE) installed on their system for bundletool to work.

