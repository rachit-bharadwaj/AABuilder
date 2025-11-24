/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 */

import './index.css';

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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Project Path</label>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Output Path</label>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Keystore</label>
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

                <!-- Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    id="password"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter password..."
                  />
                </div>

                <!-- Alias -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Alias</label>
                  <input 
                    type="text" 
                    id="alias"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter alias..."
                  />
                </div>

                <!-- Key Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Key Password</label>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Output Name</label>
                  <input 
                    type="text" 
                    id="outputName"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter output name..."
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
                  class="w-full px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Build AAB
                </button>
                <button 
                  id="buildAPK"
                  class="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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
              <div 
                id="buildLog"
                class="flex-1 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg overflow-y-auto min-h-[400px] max-h-[600px]"
              >
                <div class="text-gray-400">MainWindow initialized successfully</div>
                <div class="text-gray-400 mt-1">BuildAutomator callbacks set up</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  setupEventListeners();
  
  console.log('MainWindow initialized successfully');
  console.log('BuildAutomator callbacks set up');
});

function setupEventListeners() {
  // Browse buttons
  document.getElementById('browseProjectPath')?.addEventListener('click', () => {
    console.log('Browse project path clicked');
    // TODO: Implement file browser
  });

  document.getElementById('browseOutputPath')?.addEventListener('click', () => {
    console.log('Browse output path clicked');
    // TODO: Implement file browser
  });

  document.getElementById('browseKeystore')?.addEventListener('click', () => {
    console.log('Browse keystore clicked');
    // TODO: Implement file browser
  });

  // Build buttons
  document.getElementById('buildAAB')?.addEventListener('click', () => {
    addLog('Starting AAB build...', 'info');
    // TODO: Implement AAB build
  });

  document.getElementById('buildAPK')?.addEventListener('click', () => {
    addLog('Starting APK build...', 'info');
    // TODO: Implement APK build
  });

  document.getElementById('clearLog')?.addEventListener('click', () => {
    const logElement = document.getElementById('buildLog');
    if (logElement) {
      logElement.innerHTML = '';
    }
  });
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
