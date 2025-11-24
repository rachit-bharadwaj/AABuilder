/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 */

import './index.css';

// Type definitions for electronAPI
declare global {
  interface Window {
    electronAPI: {
      selectDirectory: (title: string) => Promise<string | null>;
      selectFile: (title: string, filters: { name: string; extensions: string[] }[]) => Promise<string | null>;
      buildAAB: (config: any) => Promise<{ success: boolean; path?: string; error?: string }>;
      buildAPK: (config: any) => Promise<{ success: boolean; path?: string; error?: string }>;
      onBuildProgress: (callback: (data: { message: string; type: 'info' | 'success' | 'error' }) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

interface BuildConfig {
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = document.body;
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Title Bar -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-bold">React Native Build Automator</h1>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-6 py-6 max-w-6xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Project Configuration -->
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Project Configuration
              </h2>
              <div class="space-y-4">
                <!-- Project Path -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Project Path *</label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="projectPath"
                      class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="Select project path..."
                    />
                    <button 
                      id="browseProjectPath"
                      class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                <!-- Output Path -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Output Path *</label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="outputPath"
                      class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="Select output path..."
                    />
                    <button 
                      id="browseOutputPath"
                      class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                <!-- Keystore -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Keystore *</label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="keystore"
                      class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="Select keystore file..."
                    />
                    <button 
                      id="browseKeystore"
                      class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                <!-- Keystore Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Keystore Password *</label>
                  <input 
                    type="password" 
                    id="keystorePassword"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter keystore password..."
                  />
                </div>

                <!-- Key Alias -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Key Alias *</label>
                  <input 
                    type="text" 
                    id="keyAlias"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter key alias..."
                  />
                </div>

                <!-- Key Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Key Password *</label>
                  <input 
                    type="password" 
                    id="keyPassword"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter key password..."
                  />
                </div>
              </div>
            </div>

            <!-- Build Options -->
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Build Options
              </h2>
              <div class="space-y-4">
                <!-- Build Mode -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Build Mode</label>
                  <select 
                    id="buildMode"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white"
                  >
                    <option value="release" selected>Release</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                <!-- Clean Build -->
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    id="cleanBuild"
                    class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label for="cleanBuild" class="ml-3 text-sm font-medium text-gray-700">
                    Clean build
                  </label>
                </div>

                <!-- Output Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Output Name (Optional)</label>
                  <input 
                    type="text" 
                    id="outputName"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Build Actions -->
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Build Actions
              </h2>
              <div class="space-y-3">
                <button 
                  id="buildAAB"
                  class="w-full px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled
                >
                  Build AAB
                </button>
                <button 
                  id="buildAPK"
                  class="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled
                >
                  Build APK
                </button>
                <button 
                  id="clearLog"
                  class="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors border border-gray-300"
                >
                  Clear Log
                </button>
              </div>
            </div>

            <!-- Build Log -->
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col h-full">
              <h2 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Build Log
              </h2>
              <!-- Progress Bar -->
              <div id="progressBarContainer" class="mb-4 hidden">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div id="progressBar" class="bg-purple-600 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
                </div>
              </div>
              <div 
                id="buildLog"
                class="flex-1 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg overflow-y-auto min-h-[400px] max-h-[600px]"
              >
                <div class="text-gray-400">Ready to build. Please configure your project settings.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  setupEventListeners();
  
  addLog('Application initialized', 'info');
});

function setupEventListeners() {
  if (!window.electronAPI) {
    console.error('electronAPI not available');
    return;
  }

  let isBuilding = false;

  // Auto-generate output name when project path changes
  const projectPathInput = document.getElementById('projectPath') as HTMLInputElement;
  const outputNameInput = document.getElementById('outputName') as HTMLInputElement;

  projectPathInput?.addEventListener('change', () => {
    const projectPath = projectPathInput.value.trim();
    if (projectPath && !outputNameInput.value.trim()) {
      const projectName = projectPath.split(/[/\\]/).pop() || 'project';
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      outputNameInput.value = `${projectName}${day}${month}${year}`;
    }
    validateInputs();
  });

  // Browse buttons
  document.getElementById('browseProjectPath')?.addEventListener('click', async () => {
    const path = await window.electronAPI.selectDirectory('Select React Native Project Directory');
    if (path) {
      projectPathInput.value = path;
      projectPathInput.dispatchEvent(new Event('change'));
    }
  });

  document.getElementById('browseOutputPath')?.addEventListener('click', async () => {
    const path = await window.electronAPI.selectDirectory('Select Output Directory');
    if (path) {
      (document.getElementById('outputPath') as HTMLInputElement).value = path;
      validateInputs();
    }
  });

  document.getElementById('browseKeystore')?.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFile('Select Keystore File', [
      { name: 'Keystore Files', extensions: ['keystore', 'jks'] },
      { name: 'All Files', extensions: ['*'] },
    ]);
    if (path) {
      (document.getElementById('keystore') as HTMLInputElement).value = path;
      validateInputs();
    }
  });

  // Input validation on change
  const inputs = ['projectPath', 'outputPath', 'keystore', 'keystorePassword', 'keyAlias', 'keyPassword'];
  inputs.forEach(id => {
    const input = document.getElementById(id) as HTMLInputElement;
    input?.addEventListener('input', validateInputs);
    input?.addEventListener('change', validateInputs);
  });

  // Build buttons
  document.getElementById('buildAAB')?.addEventListener('click', async () => {
    if (isBuilding) return;
    
    const config = getBuildConfig();
    if (!validateConfigForAAB(config)) {
      return;
    }

    isBuilding = true;
    setBuildState(true);
    addLog('Starting AAB build...', 'info');

    try {
      const result = await window.electronAPI.buildAAB(config);
      if (result.success && result.path) {
        addLog(`AAB build completed! File saved to: ${result.path}`, 'success');
      } else {
        addLog(`AAB build failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      isBuilding = false;
      setBuildState(false);
    }
  });

  document.getElementById('buildAPK')?.addEventListener('click', async () => {
    if (isBuilding) return;
    
    const config = getBuildConfig();
    if (!validateConfigForAPK(config)) {
      return;
    }

    isBuilding = true;
    setBuildState(true);
    addLog('Starting APK build...', 'info');

    try {
      const result = await window.electronAPI.buildAPK(config);
      if (result.success && result.path) {
        addLog(`APK build completed! File saved to: ${result.path}`, 'success');
      } else {
        addLog(`APK build failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      isBuilding = false;
      setBuildState(false);
    }
  });

  document.getElementById('clearLog')?.addEventListener('click', () => {
    const logElement = document.getElementById('buildLog');
    if (logElement) {
      logElement.innerHTML = '';
      addLog('Log cleared', 'info');
    }
  });

  // Listen for build progress updates
  window.electronAPI.onBuildProgress((data) => {
    addLog(data.message, data.type);
  });

  function getBuildConfig(): BuildConfig {
    return {
      projectPath: (document.getElementById('projectPath') as HTMLInputElement)?.value.trim() || '',
      outputPath: (document.getElementById('outputPath') as HTMLInputElement)?.value.trim() || '',
      outputFileName: (document.getElementById('outputName') as HTMLInputElement)?.value.trim() || '',
      keystorePath: (document.getElementById('keystore') as HTMLInputElement)?.value.trim() || '',
      keystorePassword: (document.getElementById('keystorePassword') as HTMLInputElement)?.value || '',
      keyAlias: (document.getElementById('keyAlias') as HTMLInputElement)?.value.trim() || '',
      keyPassword: (document.getElementById('keyPassword') as HTMLInputElement)?.value || '',
      buildMode: (document.getElementById('buildMode') as HTMLSelectElement)?.value || 'release',
      cleanBuild: (document.getElementById('cleanBuild') as HTMLInputElement)?.checked || false,
    };
  }

  function validateConfigForAAB(config: BuildConfig): boolean {
    if (!config.projectPath) {
      alert('Please select a project path');
      return false;
    }
    if (!config.outputPath) {
      alert('Please select an output path');
      return false;
    }
    return true;
  }

  function validateConfigForAPK(config: BuildConfig): boolean {
    if (!validateConfigForAAB(config)) {
      return false;
    }
    if (!config.keystorePath) {
      alert('Please select a keystore file');
      return false;
    }
    if (!config.keystorePassword) {
      alert('Please enter keystore password');
      return false;
    }
    if (!config.keyAlias) {
      alert('Please enter key alias');
      return false;
    }
    if (!config.keyPassword) {
      alert('Please enter key password');
      return false;
    }
    return true;
  }

  function validateInputs() {
    const config = getBuildConfig();
    const aabButton = document.getElementById('buildAAB') as HTMLButtonElement;
    const apkButton = document.getElementById('buildAPK') as HTMLButtonElement;

    if (aabButton) {
      aabButton.disabled = isBuilding || !config.projectPath || !config.outputPath;
    }
    if (apkButton) {
      apkButton.disabled = isBuilding || 
        !config.projectPath || 
        !config.outputPath || 
        !config.keystorePath || 
        !config.keystorePassword || 
        !config.keyAlias || 
        !config.keyPassword;
    }
  }

  function setBuildState(building: boolean) {
    isBuilding = building;
    const progressContainer = document.getElementById('progressBarContainer');
    if (progressContainer) {
      progressContainer.classList.toggle('hidden', !building);
    }
    validateInputs();
  }

  // Initial validation
  validateInputs();
}

function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const logElement = document.getElementById('buildLog');
  if (!logElement) return;

  const timestamp = new Date().toLocaleTimeString();
  const colorClass = type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-gray-400';
  
  const logLine = document.createElement('div');
  logLine.className = `${colorClass} mt-1`;
  logLine.textContent = `[${timestamp}] ${message}`;
  
  logElement.appendChild(logLine);
  logElement.scrollTop = logElement.scrollHeight;
}
