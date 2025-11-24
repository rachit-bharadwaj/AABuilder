import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { app } from 'electron';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);
const access = promisify(fs.access);

export interface BuildConfig {
  projectPath: string;
  outputPath: string;
  outputFileName: string;
  keystorePath: string;
  keystorePassword: string;
  keyAlias: string;
  keyPassword: string;
  buildMode: string;
  cleanBuild: boolean;
}

export type ProgressCallback = (message: string, type: 'info' | 'success' | 'error') => void;

export class BuildAutomator {
  private progressCallback?: ProgressCallback;
  private buildProcess?: ChildProcess;
  private isBuilding: boolean = false;

  setProgressCallback(callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  private log(message: string, type: 'info' | 'success' | 'error' = 'info') {
    if (this.progressCallback) {
      this.progressCallback(message, type);
    }
  }

  private async validateConfig(config: BuildConfig, requireKeystore: boolean = false): Promise<boolean> {
    // Validate project path
    if (!config.projectPath || !fs.existsSync(config.projectPath)) {
      this.log('Error: Project path does not exist', 'error');
      return false;
    }

    const packageJsonPath = path.join(config.projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.log('Error: Project path must contain package.json', 'error');
      return false;
    }

    // Validate output path
    if (!config.outputPath) {
      this.log('Error: Output path is required', 'error');
      return false;
    }

    try {
      await access(config.outputPath);
    } catch {
      try {
        await mkdir(config.outputPath, { recursive: true });
      } catch (err) {
        this.log(`Error: Cannot create output directory: ${err}`, 'error');
        return false;
      }
    }

    // Validate keystore if required
    if (requireKeystore) {
      if (!config.keystorePath || !fs.existsSync(config.keystorePath)) {
        this.log('Error: Keystore file does not exist', 'error');
        return false;
      }

      if (!config.keystorePassword) {
        this.log('Error: Keystore password is required', 'error');
        return false;
      }

      if (!config.keyAlias) {
        this.log('Error: Key alias is required', 'error');
        return false;
      }

      if (!config.keyPassword) {
        this.log('Error: Key password is required', 'error');
        return false;
      }
    }

    return true;
  }

  private async executeCommandNoShell(
    command: string,
    args: string[],
    cwd: string,
    env?: NodeJS.ProcessEnv
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.log(`Executing: ${command} ${args.join(' ')}`, 'info');

      this.buildProcess = spawn(command, args, {
        cwd,
        shell: false, // Don't use shell to properly handle paths with spaces
        env: { ...process.env, ...env },
      });

      let stdoutBuffer = '';
      let stderrBuffer = '';

      this.buildProcess.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        stdoutBuffer += text;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        lines.forEach(line => this.log(line, 'info'));
      });

      this.buildProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        stderrBuffer += text;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        lines.forEach(line => this.log(line, 'info'));
      });

      this.buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          this.log(`Command failed with exit code ${code}`, 'error');
          if (stderrBuffer) {
            this.log(`Error output: ${stderrBuffer.slice(-500)}`, 'error');
          }
          resolve(false);
        }
        this.buildProcess = undefined;
      });

      this.buildProcess.on('error', (error) => {
        this.log(`Command execution error: ${error.message}`, 'error');
        resolve(false);
        this.buildProcess = undefined;
      });
    });
  }

  private async executeCommand(
    command: string,
    args: string[],
    cwd: string,
    env?: NodeJS.ProcessEnv
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.log(`Executing: ${command} ${args.join(' ')}`, 'info');

      const isWindows = process.platform === 'win32';
      const shell = isWindows ? true : false;
      const cmd = isWindows ? command : command;

      this.buildProcess = spawn(cmd, args, {
        cwd,
        shell,
        env: { ...process.env, ...env },
      });

      let stdoutBuffer = '';
      let stderrBuffer = '';

      this.buildProcess.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        stdoutBuffer += text;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        lines.forEach(line => this.log(line, 'info'));
      });

      this.buildProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        stderrBuffer += text;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        lines.forEach(line => this.log(line, 'info'));
      });

      this.buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          this.log(`Command failed with exit code ${code}`, 'error');
          if (stderrBuffer) {
            this.log(`Error output: ${stderrBuffer.slice(-500)}`, 'error');
          }
          resolve(false);
        }
        this.buildProcess = undefined;
      });

      this.buildProcess.on('error', (error) => {
        this.log(`Command execution error: ${error.message}`, 'error');
        resolve(false);
        this.buildProcess = undefined;
      });
    });
  }

  private generateOutputFileName(config: BuildConfig, extension: string): string {
    let baseName: string;

    if (config.outputFileName && config.outputFileName.trim()) {
      baseName = config.outputFileName.trim();
      // Remove extension if present
      if (baseName.endsWith('.aab') || baseName.endsWith('.apk')) {
        baseName = baseName.substring(0, baseName.lastIndexOf('.'));
      }
    } else {
      // Auto-generate from project name + date
      const projectName = path.basename(config.projectPath);
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      baseName = `${projectName}${day}${month}${year}`;
    }

    return `${baseName}.${extension}`;
  }

  private async ensureUniqueFileName(outputPath: string, fileName: string): Promise<string> {
    const filePath = path.join(outputPath, fileName);
    
    if (!fs.existsSync(filePath)) {
      return fileName;
    }

    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    let counter = 1;
    let newFileName: string;

    do {
      newFileName = `${base}-${counter}${ext}`;
      counter++;
    } while (fs.existsSync(path.join(outputPath, newFileName)));

    return newFileName;
  }

  async buildAAB(config: BuildConfig): Promise<string | null> {
    if (this.isBuilding) {
      this.log('Error: Build already in progress', 'error');
      return null;
    }

    this.isBuilding = true;

    try {
      return await this.buildAABInternal(config);
    } finally {
      this.isBuilding = false;
    }
  }

  private async buildAABInternal(config: BuildConfig): Promise<string | null> {
    try {
      if (!(await this.validateConfig(config, false))) {
        return null;
      }

      this.log('Starting AAB build process...', 'info');

      // Optional clean build
      if (config.cleanBuild) {
        this.log('Cleaning previous build...', 'info');
        const androidPath = path.join(config.projectPath, 'android');
        const isWindows = process.platform === 'win32';
        const gradlewName = isWindows ? 'gradlew.bat' : 'gradlew';
        const gradlewPath = path.join(androidPath, gradlewName);
        
        // Check if gradlew exists
        try {
          await access(gradlewPath);
        } catch {
          this.log(`Warning: Gradle wrapper not found at ${gradlewPath}, skipping clean`, 'info');
        }
        
        const cleanSuccess = await this.executeCommand(
          isWindows ? gradlewPath : './gradlew',
          ['clean'],
          androidPath
        );

        if (!cleanSuccess) {
          this.log('Warning: Clean build failed, continuing anyway...', 'info');
        }
      }

      // Build AAB
      this.log('Building Android App Bundle...', 'info');
      const buildSuccess = await this.executeCommand(
        'npx',
        ['react-native', 'build-android', '--mode', config.buildMode || 'release'],
        config.projectPath
      );

      if (!buildSuccess) {
        this.log('AAB build failed', 'error');
        return null;
      }

      // Locate generated AAB
      const mode = config.buildMode || 'release';
      const aabPath = path.join(
        config.projectPath,
        'android',
        'app',
        'build',
        'outputs',
        'bundle',
        mode,
        `app-${mode}.aab`
      );

      if (!fs.existsSync(aabPath)) {
        this.log(`Error: AAB file not found at expected path: ${aabPath}`, 'error');
        return null;
      }

      this.log(`AAB generated successfully at: ${aabPath}`, 'success');

      // Generate output filename
      const outputFileName = this.generateOutputFileName(config, 'aab');
      const uniqueFileName = await this.ensureUniqueFileName(config.outputPath, outputFileName);
      const finalPath = path.join(config.outputPath, uniqueFileName);

      // Copy to output directory
      await copyFile(aabPath, finalPath);
      this.log(`AAB copied to: ${finalPath}`, 'success');
      this.log('AAB build completed successfully!', 'success');

      return finalPath;
    } catch (error) {
      this.log(`Error during AAB build: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return null;
    }
  }

  private async findBundletool(): Promise<string | null> {
    // Get the app's root directory (where package.json is)
    let appRoot: string;
    try {
      // In Electron, app.getAppPath() returns the directory containing the app
      appRoot = (app && typeof app.getAppPath === 'function') ? app.getAppPath() : process.cwd();
    } catch {
      appRoot = process.cwd();
    }
    
    const possiblePaths = [
      'C:\\Program Files\\React Native Build Automator\\bundletool.jar',
      path.join(process.resourcesPath || __dirname, 'bundletool.jar'),
      path.join(__dirname, 'bundletool.jar'),
      path.join(appRoot, 'bundletool.jar'), // Project root (where package.json is)
      path.join(process.cwd(), 'bundletool.jar'), // Current working directory
    ];

    for (const bundletoolPath of possiblePaths) {
      try {
        await access(bundletoolPath);
        return bundletoolPath;
      } catch {
        continue;
      }
    }

    return null;
  }

  private async extractAPKFromAPKS(apksPath: string, outputDir: string): Promise<string | null> {
    const isWindows = process.platform === 'win32';
    const zipPath = apksPath.replace('.apks', '.zip');

    try {
      // Rename .apks to .zip
      await rename(apksPath, zipPath);

      // Extract zip
      const extractDir = path.join(outputDir, 'extracted_apk');
      await mkdir(extractDir, { recursive: true });

      if (isWindows) {
        // Use PowerShell to extract on Windows
        // Properly escape paths with spaces for PowerShell
        const escapedZipPath = zipPath.replace(/"/g, '`"');
        const escapedExtractDir = extractDir.replace(/"/g, '`"');
        const extractSuccess = await this.executeCommandNoShell(
          'powershell',
          [
            '-Command',
            `Expand-Archive -Path "${escapedZipPath}" -DestinationPath "${escapedExtractDir}" -Force`
          ],
          process.cwd()
        );

        if (!extractSuccess) {
          throw new Error('Failed to extract APK from .apks file');
        }
      } else {
        // Use unzip on Unix
        const extractSuccess = await this.executeCommand(
          'unzip',
          ['-o', zipPath, '-d', extractDir],
          process.cwd()
        );

        if (!extractSuccess) {
          throw new Error('Failed to extract APK from .apks file');
        }
      }

      // Find APK file in extracted directory (recursively)
      const findAPKFile = async (dir: string): Promise<string | null> => {
        const entries = await readdir(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stats = await stat(fullPath);
          if (stats.isDirectory()) {
            const found = await findAPKFile(fullPath);
            if (found) return found;
          } else if (entry.endsWith('.apk')) {
            return fullPath;
          }
        }
        return null;
      };

      const extractedAPKPath = await findAPKFile(extractDir);
      if (!extractedAPKPath) {
        throw new Error('No APK file found in extracted archive');
      }
      
      // Clean up zip file
      try {
        await unlink(zipPath);
      } catch {
        // Ignore cleanup errors
      }

      return extractedAPKPath;
    } catch (error) {
      this.log(`Error extracting APK: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return null;
    }
  }

  async buildAPK(config: BuildConfig): Promise<string | null> {
    if (this.isBuilding) {
      this.log('Error: Build already in progress', 'error');
      return null;
    }

    this.isBuilding = true;

    try {
      if (!(await this.validateConfig(config, true))) {
        return null;
      }

      this.log('Starting APK build process...', 'info');

      // Step 1: Build AAB first (use internal method to avoid isBuilding check)
      const aabPath = await this.buildAABInternal(config);
      if (!aabPath) {
        this.log('Failed to build AAB, cannot proceed with APK build', 'error');
        return null;
      }

      // Step 2: Find bundletool
      this.log('Locating bundletool...', 'info');
      const bundletoolPath = await this.findBundletool();
      if (!bundletoolPath) {
        this.log('Error: bundletool.jar not found. Please ensure it is installed.', 'error');
        this.log('Expected locations:', 'info');
        this.log('  - C:\\Program Files\\React Native Build Automator\\bundletool.jar', 'info');
        this.log('  - Same directory as executable', 'info');
        return null;
      }

      this.log(`Found bundletool at: ${bundletoolPath}`, 'success');

      // Step 3: Convert AAB to APK using bundletool
      this.log('Converting AAB to APK...', 'info');
      const baseName = path.basename(aabPath, '.aab');
      const apksPath = path.join(config.outputPath, `${baseName}.apks`);

      // Execute bundletool command without shell to properly handle paths with spaces
      const bundletoolSuccess = await this.executeCommandNoShell(
        'java',
        [
          '-jar',
          bundletoolPath,
          'build-apks',
          `--bundle=${aabPath}`,
          `--output=${apksPath}`,
          `--ks=${config.keystorePath}`,
          `--ks-key-alias=${config.keyAlias}`,
          `--ks-pass=pass:${config.keystorePassword}`,
          `--key-pass=pass:${config.keyPassword}`,
          '--mode=universal',
        ],
        process.cwd()
      );

      if (!bundletoolSuccess) {
        this.log('Failed to convert AAB to APK', 'error');
        return null;
      }

      // Step 4: Extract APK from .apks
      this.log('Extracting APK from archive...', 'info');
      const extractedAPKPath = await this.extractAPKFromAPKS(apksPath, config.outputPath);
      if (!extractedAPKPath) {
        return null;
      }

      // Step 5: Finalize APK
      const outputFileName = this.generateOutputFileName(config, 'apk');
      const uniqueFileName = await this.ensureUniqueFileName(config.outputPath, outputFileName);
      const finalAPKPath = path.join(config.outputPath, uniqueFileName);

      await copyFile(extractedAPKPath, finalAPKPath);
      this.log(`APK copied to: ${finalAPKPath}`, 'success');

      // Clean up temporary files
      try {
        const extractDir = path.dirname(extractedAPKPath);
        const deleteDir = async (dir: string) => {
          const entries = await readdir(dir);
          for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stats = await stat(fullPath);
            if (stats.isDirectory()) {
              await deleteDir(fullPath);
            } else {
              await unlink(fullPath);
            }
          }
          await fs.promises.rmdir(dir);
        };
        await deleteDir(extractDir);
      } catch {
        // Ignore cleanup errors
      }

      this.log('APK build completed successfully!', 'success');
      return finalAPKPath;
    } catch (error) {
      this.log(`Error during APK build: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return null;
    } finally {
      this.isBuilding = false;
    }
  }

  cancelBuild() {
    if (this.buildProcess) {
      this.buildProcess.kill();
      this.buildProcess = undefined;
      this.log('Build cancelled by user', 'info');
    }
    this.isBuilding = false;
  }
}

