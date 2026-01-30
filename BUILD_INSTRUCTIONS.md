# Building AABuilder for Distribution

This guide explains how to build distributable installers for AABuilder on Windows and Linux (Debian).

## Prerequisites

1. **Node.js** (v16 or higher) and npm installed
2. **Target OS** (Windows for .exe, Linux for .deb)
3. All dependencies installed: `npm install`

### Step 1: Ensure bundletool.jar is in the project root

Make sure `bundletool.jar` is present in the root directory of the project (same level as `package.json`).

---

## Building for Linux (Debian)

### Requirements

- Linux (Debian, Ubuntu, or similar)
- `dpkg` and `fakeroot` (for building .deb):

  ```bash
  sudo apt-get install dpkg fakeroot
  ```

### Build the .deb package

From the project root:

```bash
npm run make:linux
```

Or:

```bash
npm run make
```

### Output location

The Debian package will be at:

```
out/make/deb/x64/aabuilder-electron_1.0.0_amd64.deb
```

### Install on Debian/Ubuntu

```bash
sudo dpkg -i out/make/deb/x64/aabuilder-electron_1.0.0_amd64.deb
```

If dependencies are missing, run:

```bash
sudo apt-get install -f
```

### What's included (Linux)

- AABuilder application
- bundletool.jar (in app resources)
- Dependencies packaged for .deb

---

## Building for Windows

### Build the Windows installer

```bash
npm run make:win
```

Or to build for the current platform:

```bash
npm run make
```

### Output location

```
out/make/squirrel.windows/x64/AABuilder-Setup.exe
```

### What's included (Windows)

- AABuilder application executable
- bundletool.jar (automatically bundled)
- Windows installer (Squirrel)

---

## General notes

- Installers are **unsigned** by default. For production, consider code signing.
- **Java Runtime Environment (JRE)** must be installed on the target machine for bundletool to work.
- On Windows, the first run may show a security warning for unsigned executables.
