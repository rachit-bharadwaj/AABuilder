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
      projectList: () => Promise<{ success: boolean; projects?: Array<{ id: string; name: string; createdAt: string; updatedAt: string }>; error?: string }>;
      projectLoad: (projectId: string) => Promise<{ success: boolean; config?: BuildConfig; error?: string }>;
      projectSave: (projectName: string, config: BuildConfig) => Promise<{ success: boolean; projectId?: string; error?: string }>;
      projectDelete: (projectId: string) => Promise<{ success: boolean; error?: string }>;
      projectSaveAs: (projectName: string, config: BuildConfig) => Promise<{ success: boolean; error?: string }>;
      projectLoadFromFile: () => Promise<{ success: boolean; config?: BuildConfig; name?: string; error?: string }>;
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
    <div class="min-h-screen bg-gray-50">
      <!-- Professional Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-8 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900 tracking-tight">AABuilder</h1>
              <p class="text-xs text-gray-500 font-normal">React Native Build Automator</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="saveProjectBtn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-all text-sm font-medium cursor-pointer flex items-center gap-2 border border-gray-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              Save Project
            </button>
            <button type="button" id="updateProjectBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all text-sm font-medium cursor-pointer flex items-center gap-2 shadow-sm hidden">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <span>Update Project</span>
            </button>
            <button type="button" id="undoChangesBtn" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-all text-sm font-medium cursor-pointer flex items-center gap-2 shadow-sm hidden">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
              </svg>
              Undo Changes
            </button>
            <button type="button" id="loadProjectBtn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-all text-sm font-medium cursor-pointer flex items-center gap-2 border border-gray-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              Load Project
            </button>
          </div>
        </div>
      </header>

      <!-- Project Name Input Modal -->
      <div id="projectNameModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-2xl max-w-md w-full border border-gray-200">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Save Project</h3>
            <p class="text-sm text-gray-500 mt-1">Enter a name for this project configuration</p>
          </div>
          <div class="px-6 py-5">
            <input 
              type="text" 
              id="projectNameInput"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Enter project name..."
              autofocus
            />
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end rounded-b-lg">
            <button 
              id="cancelSaveProject"
              class="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              id="confirmSaveProject"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Project Management Modal -->
      <div id="projectModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Project Management</h2>
              <p class="text-sm text-gray-500 mt-0.5">Load or manage saved project configurations</p>
            </div>
            <button id="closeProjectModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            <div id="projectList" class="space-y-3">
              <!-- Projects will be loaded here -->
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50">
            <button id="loadFromFileBtn" class="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md transition-colors text-sm font-medium">
              Load from File
            </button>
            <button id="saveAsFileBtn" class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm">
              Save As File
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-8 py-8 max-w-[1600px]">
          <div class="space-y-6">
          <!-- Project Configuration - Full Width -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div class="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Project Configuration</h2>
                <p class="text-xs text-gray-500 font-normal">Configure your React Native project settings</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <!-- Project Path -->
                <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Project Path <span class="text-red-500">*</span></label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="projectPath"
                    class="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400"
                      placeholder="Select project path..."
                    />
                    <button 
                      id="browseProjectPath"
                    class="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-all border border-gray-300 hover:border-gray-400 text-sm whitespace-nowrap"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                <!-- Output Path -->
                <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Output Path <span class="text-red-500">*</span></label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="outputPath"
                    class="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400"
                      placeholder="Select output path..."
                    />
                    <button 
                      id="browseOutputPath"
                    class="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-all border border-gray-300 hover:border-gray-400 text-sm whitespace-nowrap"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                <!-- Keystore -->
                <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Keystore <span class="text-red-500">*</span></label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="keystore"
                    class="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400"
                      placeholder="Select keystore file..."
                    />
                    <button 
                      id="browseKeystore"
                    class="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-all border border-gray-300 hover:border-gray-400 text-sm whitespace-nowrap"
                    >
                      Browse
                    </button>
                  </div>
                </div>

              <!-- Keystore Password -->
                <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Keystore Password <span class="text-red-500">*</span></label>
                  <input 
                    type="password" 
                  id="keystorePassword"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400"
                  placeholder="Enter keystore password..."
                  />
                </div>

              <!-- Key Alias -->
                <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Key Alias <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                  id="keyAlias"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400"
                  placeholder="Enter key alias..."
                  />
                </div>

                <!-- Key Password -->
                <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Key Password <span class="text-red-500">*</span></label>
                  <input 
                    type="password" 
                    id="keyPassword"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400"
                    placeholder="Enter key password..."
                  />
                </div>
            </div>
          </div>

          <!-- Build Actions and Build Options - Side by Side -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Build Actions -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div class="w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Build Actions</h2>
                  <p class="text-xs text-gray-500 font-normal">Generate AAB or APK files</p>
                </div>
              </div>
              <div class="space-y-3">
                <button 
                  id="buildAAB"
                  class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 flex items-center justify-center gap-2"
                  disabled
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Build AAB
                </button>
                <button 
                  id="buildAPK"
                  class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
                  disabled
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  Build APK
                </button>
                <button 
                  id="clearLog"
                  class="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-all border border-gray-300 hover:border-gray-400 text-sm"
                >
                  Clear Log
                </button>
              </div>
            </div>

            <!-- Build Options -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div class="w-8 h-8 bg-purple-50 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Build Options</h2>
                  <p class="text-xs text-gray-500 font-normal">Configure build settings and preferences</p>
                </div>
              </div>
              <div class="space-y-5">
                <!-- Build Mode -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Build Mode</label>
                  <select 
                    id="buildMode"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white text-sm text-gray-900"
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
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label for="cleanBuild" class="ml-3 text-sm font-medium text-gray-700">
                    Clean build before compiling
                  </label>
                </div>

                <!-- Output Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Output Name <span class="text-gray-400 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    id="outputName"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Build Log - Full Width -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
            <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div class="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Build Log</h2>
                <p class="text-xs text-gray-500 font-normal">Real-time build output and messages</p>
              </div>
            </div>
            <!-- Progress Bar -->
            <div id="progressBarContainer" class="mb-4 hidden">
              <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div id="progressBar" class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style="width: 100%"></div>
              </div>
            </div>
            <div 
              id="buildLog"
              class="flex-1 bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded-md overflow-y-auto min-h-[400px] max-h-[600px] border border-gray-800"
            >
              <div class="text-gray-500">Ready to build. Please configure your project settings.</div>
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

  // Project Management
  let currentProjectId: string | null = null;
  let currentProjectName: string | null = null;
  let originalConfig: BuildConfig | null = null; // Store original loaded config for undo
  
  const projectModal = document.getElementById('projectModal');
  const closeProjectModal = document.getElementById('closeProjectModal');
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const updateProjectBtn = document.getElementById('updateProjectBtn');
  const undoChangesBtn = document.getElementById('undoChangesBtn');
  const loadProjectBtn = document.getElementById('loadProjectBtn');
  const loadFromFileBtn = document.getElementById('loadFromFileBtn');
  const saveAsFileBtn = document.getElementById('saveAsFileBtn');
  const projectList = document.getElementById('projectList');

  function updateProjectButtons() {
    if (currentProjectId) {
      // Project is loaded, show Update and Undo buttons
      if (saveProjectBtn) saveProjectBtn.classList.add('hidden');
      if (updateProjectBtn) {
        updateProjectBtn.classList.remove('hidden');
        const textSpan = updateProjectBtn.querySelector('span');
        if (textSpan) {
          textSpan.textContent = `Update "${currentProjectName || 'Project'}"`;
        }
      }
      if (undoChangesBtn) undoChangesBtn.classList.remove('hidden');
    } else {
      // No project loaded, show Save button
      if (saveProjectBtn) saveProjectBtn.classList.remove('hidden');
      if (updateProjectBtn) updateProjectBtn.classList.add('hidden');
      if (undoChangesBtn) undoChangesBtn.classList.add('hidden');
    }
  }

  function applyConfigToForm(config: BuildConfig) {
    (document.getElementById('projectPath') as HTMLInputElement).value = config.projectPath || '';
    (document.getElementById('outputPath') as HTMLInputElement).value = config.outputPath || '';
    (document.getElementById('keystore') as HTMLInputElement).value = config.keystorePath || '';
    (document.getElementById('keystorePassword') as HTMLInputElement).value = config.keystorePassword || '';
    (document.getElementById('keyAlias') as HTMLInputElement).value = config.keyAlias || '';
    (document.getElementById('keyPassword') as HTMLInputElement).value = config.keyPassword || '';
    (document.getElementById('outputName') as HTMLInputElement).value = config.outputFileName || '';
    (document.getElementById('buildMode') as HTMLSelectElement).value = config.buildMode || 'release';
    (document.getElementById('cleanBuild') as HTMLInputElement).checked = config.cleanBuild || false;
    validateInputs();
  }

  function undoChanges() {
    if (!originalConfig) {
      addLog('No original configuration to restore', 'error');
      return;
    }

    applyConfigToForm(originalConfig);
    addLog('Changes undone - restored to original project values', 'success');
  }

  function showProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('hidden');
      loadProjects();
    }
  }

  function hideProjectModal() {
    if (projectModal) {
      projectModal.classList.add('hidden');
    }
  }

  async function loadProjects() {
    if (!projectList) return;
    
    try {
      console.log('Loading projects...');
      const result = await window.electronAPI.projectList();
      console.log('projectList result:', result);
      if (result.success && result.projects) {
        if (result.projects.length === 0) {
          projectList.innerHTML = `
            <div class="text-center py-12">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-900">No saved projects</p>
              <p class="text-xs text-gray-500 mt-1">Save your current configuration to get started</p>
            </div>
          `;
        } else {
          projectList.innerHTML = result.projects.map(project => `
            <div class="bg-white hover:bg-gray-50 rounded-md p-4 border border-gray-200 transition-all group" data-project-id="${project.id}">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-900 truncate">${project.name}</h3>
                  <p class="text-xs text-gray-500 mt-1">Last updated: ${new Date(project.updatedAt).toLocaleString()}</p>
                </div>
                <div class="flex gap-2 ml-4">
                  <button class="load-project-btn px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm" data-project-id="${project.id}">
                    Load
                  </button>
                  <button class="delete-project-btn px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors shadow-sm" data-project-id="${project.id}">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          `).join('');

          // Add event listeners for load and delete buttons
          projectList.querySelectorAll('.load-project-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.stopPropagation();
              const projectId = (e.target as HTMLElement).getAttribute('data-project-id');
              if (projectId) {
                await loadProject(projectId);
              }
            });
          });

          projectList.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.stopPropagation();
              const projectId = (e.target as HTMLElement).getAttribute('data-project-id');
              if (projectId && confirm('Are you sure you want to delete this project?')) {
                const result = await window.electronAPI.projectDelete(projectId);
                if (result.success) {
                  addLog(`Project deleted successfully`, 'success');
                  loadProjects();
                } else {
                  addLog(`Failed to delete project: ${result.error}`, 'error');
                }
              }
            });
          });
        }
      }
    } catch (error) {
      addLog(`Error loading projects: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  async function loadProject(projectId: string) {
    try {
      const result = await window.electronAPI.projectLoad(projectId);
      if (result.success && result.config) {
        const config = result.config;
        
        // Store original config for undo functionality
        originalConfig = { ...config };
        
        // Apply config to form
        applyConfigToForm(config);
        
        // Track loaded project
        currentProjectId = projectId;
        // Get project name from the list
        const listResult = await window.electronAPI.projectList();
        if (listResult.success && listResult.projects) {
          const project = listResult.projects.find(p => p.id === projectId);
          currentProjectName = project?.name || null;
        }
        
        updateProjectButtons();
        hideProjectModal();
        addLog(`Project "${currentProjectName || projectId}" loaded successfully`, 'success');
      } else {
        addLog(`Failed to load project: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Error loading project: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  async function updateCurrentProject() {
    if (!currentProjectId || !currentProjectName) {
      addLog('No project loaded to update', 'error');
      return;
    }

    if (!window.electronAPI) {
      addLog('Error: electronAPI not available', 'error');
      return;
    }

    try {
      const config = getBuildConfig();
      console.log('Updating project:', currentProjectId, 'with name:', currentProjectName);
      const result = await window.electronAPI.projectSave(currentProjectName, config);
      
      if (result && result.success) {
        // Update original config to current state after successful update
        originalConfig = { ...config };
        addLog(`Project "${currentProjectName}" updated successfully`, 'success');
        if (projectModal && !projectModal.classList.contains('hidden')) {
          loadProjects();
        }
      } else {
        const errorMsg = result?.error || 'Unknown error';
        addLog(`Failed to update project: ${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      addLog(`Error updating project: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  const projectNameModal = document.getElementById('projectNameModal');
  const projectNameInput = document.getElementById('projectNameInput') as HTMLInputElement;
  const confirmSaveProject = document.getElementById('confirmSaveProject');
  const cancelSaveProject = document.getElementById('cancelSaveProject');

  function showProjectNameModal(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!projectNameModal || !projectNameInput) {
        resolve(null);
        return;
      }

      projectNameModal.classList.remove('hidden');
      projectNameInput.value = '';
      projectNameInput.focus();

      const handleConfirm = () => {
        const name = projectNameInput.value.trim();
        projectNameModal.classList.add('hidden');
        cleanup();
        resolve(name || null);
      };

      const handleCancel = () => {
        projectNameModal.classList.add('hidden');
        cleanup();
        resolve(null);
      };

      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleConfirm();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      };

      const cleanup = () => {
        confirmSaveProject?.removeEventListener('click', handleConfirm);
        cancelSaveProject?.removeEventListener('click', handleCancel);
        projectNameInput.removeEventListener('keydown', handleKeyPress);
      };

      confirmSaveProject?.addEventListener('click', handleConfirm);
      cancelSaveProject?.addEventListener('click', handleCancel);
      projectNameInput.addEventListener('keydown', handleKeyPress);
    });
  }

  async function saveCurrentProject() {
    console.log('saveCurrentProject function called');
    addLog('Save Project clicked', 'info');
    
    if (!window.electronAPI) {
      addLog('Error: electronAPI not available', 'error');
      console.error('electronAPI not available');
      return;
    }

    if (!window.electronAPI.projectSave) {
      addLog('Error: projectSave method not available', 'error');
      console.error('projectSave method not available');
      return;
    }

    const projectName = await showProjectNameModal();
    console.log('Project name input returned:', projectName);
    if (!projectName || !projectName.trim()) {
      console.log('No project name provided or cancelled');
      return;
    }

    try {
      console.log('Getting build config...');
      const config = getBuildConfig();
      console.log('Build config:', config);
      console.log('Calling projectSave with name:', projectName.trim());
      const result = await window.electronAPI.projectSave(projectName.trim(), config);
      console.log('projectSave result:', result);
      
      if (result && result.success) {
        // Track the newly saved project
        currentProjectId = result.projectId || null;
        currentProjectName = projectName;
        // Store current config as original for undo
        originalConfig = { ...config };
        updateProjectButtons();
        
        addLog(`Project "${projectName}" saved successfully`, 'success');
        console.log('Project saved successfully');
        if (projectModal && !projectModal.classList.contains('hidden')) {
          loadProjects();
        }
      } else {
        const errorMsg = result?.error || 'Unknown error';
        console.error('Failed to save project:', errorMsg);
        addLog(`Failed to save project: ${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error('Error in saveCurrentProject:', error);
      addLog(`Error saving project: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  if (saveProjectBtn) {
    console.log('Save Project button found, attaching listener');
    saveProjectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Save Project button clicked!');
      saveCurrentProject();
    });
    // Test if button is clickable
    saveProjectBtn.style.cursor = 'pointer';
  } else {
    console.error('saveProjectBtn not found in DOM');
    addLog('Warning: Save Project button not found', 'error');
    // Try to find it again after a delay
    setTimeout(() => {
      const btn = document.getElementById('saveProjectBtn');
      if (btn) {
        console.log('Found saveProjectBtn on retry');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          saveCurrentProject();
        });
      }
    }, 1000);
  }
  saveProjectBtn?.addEventListener('click', saveCurrentProject);
  updateProjectBtn?.addEventListener('click', updateCurrentProject);
  undoChangesBtn?.addEventListener('click', undoChanges);
  loadProjectBtn?.addEventListener('click', showProjectModal);
  closeProjectModal?.addEventListener('click', hideProjectModal);

  // Initialize button states
  updateProjectButtons();

  loadFromFileBtn?.addEventListener('click', async () => {
    try {
      const result = await window.electronAPI.projectLoadFromFile();
      if (result.success && result.config) {
        const config = result.config;
        (document.getElementById('projectPath') as HTMLInputElement).value = config.projectPath || '';
        (document.getElementById('outputPath') as HTMLInputElement).value = config.outputPath || '';
        (document.getElementById('keystore') as HTMLInputElement).value = config.keystorePath || '';
        (document.getElementById('keystorePassword') as HTMLInputElement).value = config.keystorePassword || '';
        (document.getElementById('keyAlias') as HTMLInputElement).value = config.keyAlias || '';
        (document.getElementById('keyPassword') as HTMLInputElement).value = config.keyPassword || '';
        (document.getElementById('outputName') as HTMLInputElement).value = config.outputFileName || '';
        (document.getElementById('buildMode') as HTMLSelectElement).value = config.buildMode || 'release';
        (document.getElementById('cleanBuild') as HTMLInputElement).checked = config.cleanBuild || false;
        
        // Store original config for undo (file-based projects)
        originalConfig = { ...config };
        
        // Clear current project tracking (file-based projects aren't tracked)
        currentProjectId = null;
        currentProjectName = null;
        updateProjectButtons();
        
        hideProjectModal();
        addLog(`Project "${result.name || 'Unknown'}" loaded from file`, 'success');
      } else {
        addLog(`Failed to load project: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Error loading project: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  });

  saveAsFileBtn?.addEventListener('click', async () => {
    const projectName = prompt('Enter project name:');
    if (!projectName || !projectName.trim()) {
      return;
    }

    try {
      const config = getBuildConfig();
      const result = await window.electronAPI.projectSaveAs(projectName.trim(), config);
      if (result.success) {
        addLog(`Project "${projectName}" saved to file`, 'success');
        hideProjectModal();
      } else {
        addLog(`Failed to save project: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Error saving project: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  });

  // Close modal on background click
  projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      hideProjectModal();
    }
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
