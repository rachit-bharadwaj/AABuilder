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
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <!-- Title Bar -->
      <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl">
        <div class="px-6 py-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold tracking-tight">AABuilder</h1>
          </div>
          <div class="flex gap-2">
            <button type="button" id="saveProjectBtn" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium cursor-pointer">
              💾 Save Project
            </button>
            <button type="button" id="loadProjectBtn" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium cursor-pointer">
              📂 Load Project
            </button>
          </div>
        </div>
      </div>

      <!-- Project Name Input Modal -->
      <div id="projectNameModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Save Project</h3>
          <input 
            type="text" 
            id="projectNameInput"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
            placeholder="Enter project name..."
            autofocus
          />
          <div class="flex gap-3">
            <button 
              id="confirmSaveProject"
              class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              Save
            </button>
            <button 
              id="cancelSaveProject"
              class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Project Management Modal -->
      <div id="projectModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">Project Management</h2>
            <button id="closeProjectModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            <div id="projectList" class="space-y-2">
              <!-- Projects will be loaded here -->
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-2">
            <button id="loadFromFileBtn" class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
              Load from File
            </button>
            <button id="saveAsFileBtn" class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium">
              Save As File
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-6 py-6 max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Project Configuration -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-800 mb-5 pb-3 border-b-2 border-indigo-200 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
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
                      class="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-all border border-indigo-200 hover:border-indigo-300 shadow-sm"
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
                      class="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-all border border-indigo-200 hover:border-indigo-300 shadow-sm"
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
                      class="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-all border border-indigo-200 hover:border-indigo-300 shadow-sm"
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
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-800 mb-5 pb-3 border-b-2 border-purple-200 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
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
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-800 mb-5 pb-3 border-b-2 border-pink-200 flex items-center gap-2">
                <svg class="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Build Actions
              </h2>
              <div class="space-y-3">
                <button 
                  id="buildAAB"
                  class="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Build AAB
                </button>
                <button 
                  id="buildAPK"
                  class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  Build APK
                </button>
                <button 
                  id="clearLog"
                  class="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all border border-gray-300 hover:border-gray-400 shadow-sm"
                >
                  Clear Log
                </button>
              </div>
            </div>

            <!-- Build Log -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 flex flex-col h-full">
              <h2 class="text-xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-gray-200 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
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

  // Project Management
  const projectModal = document.getElementById('projectModal');
  const closeProjectModal = document.getElementById('closeProjectModal');
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const loadProjectBtn = document.getElementById('loadProjectBtn');
  const loadFromFileBtn = document.getElementById('loadFromFileBtn');
  const saveAsFileBtn = document.getElementById('saveAsFileBtn');
  const projectList = document.getElementById('projectList');

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
            <div class="text-center py-8 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p>No saved projects yet</p>
              <p class="text-sm mt-2">Save your current configuration to get started</p>
            </div>
          `;
        } else {
          projectList.innerHTML = result.projects.map(project => `
            <div class="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 transition-all cursor-pointer group" data-project-id="${project.id}">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">${project.name}</h3>
                  <p class="text-sm text-gray-500 mt-1">Updated: ${new Date(project.updatedAt).toLocaleString()}</p>
                </div>
                <div class="flex gap-2">
                  <button class="load-project-btn px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors" data-project-id="${project.id}">
                    Load
                  </button>
                  <button class="delete-project-btn px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors" data-project-id="${project.id}">
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
        hideProjectModal();
        addLog(`Project loaded successfully`, 'success');
      } else {
        addLog(`Failed to load project: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Error loading project: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
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
  loadProjectBtn?.addEventListener('click', showProjectModal);
  closeProjectModal?.addEventListener('click', hideProjectModal);

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
        
        validateInputs();
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
