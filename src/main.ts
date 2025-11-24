import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import * as fs from 'fs';
import started from 'electron-squirrel-startup';
import { BuildAutomator, BuildConfig } from './BuildAutomator';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let buildAutomator: BuildAutomator | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Initialize BuildAutomator
  buildAutomator = new BuildAutomator();
  buildAutomator.setProgressCallback((message, type) => {
    if (mainWindow) {
      mainWindow.webContents.send('build:progress', { message, type });
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools in development
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

// IPC Handlers
ipcMain.handle('dialog:selectDirectory', async (_event, title: string) => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    title: title || 'Select Directory',
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('dialog:selectFile', async (_event, title: string, filters: { name: string; extensions: string[] }[]) => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    title: title || 'Select File',
    properties: ['openFile'],
    filters: filters || [],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('build:aab', async (_event, config: BuildConfig) => {
  if (!buildAutomator) {
    return { success: false, error: 'BuildAutomator not initialized' };
  }

  try {
    const result = await buildAutomator.buildAAB(config);
    return {
      success: result !== null,
      path: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

ipcMain.handle('build:apk', async (_event, config: BuildConfig) => {
  if (!buildAutomator) {
    return { success: false, error: 'BuildAutomator not initialized' };
  }

  try {
    const result = await buildAutomator.buildAPK(config);
    return {
      success: result !== null,
      path: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Project Management
const getProjectsDirectory = (): string => {
  const userDataPath = app.getPath('userData');
  const projectsDir = path.join(userDataPath, 'projects');
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }
  return projectsDir;
};

interface ProjectData extends BuildConfig {
  name: string;
  createdAt: string;
  updatedAt: string;
}

ipcMain.handle('project:list', async () => {
  try {
    console.log('[Main] project:list called');
    const projectsDir = getProjectsDirectory();
    console.log('[Main] Projects directory:', projectsDir);
    
    if (!fs.existsSync(projectsDir)) {
      console.log('[Main] Projects directory does not exist, creating...');
      fs.mkdirSync(projectsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
    console.log('[Main] Found', files.length, 'project files:', files);
    
    const projects = files.map(file => {
      const filePath = path.join(projectsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return {
        id: path.basename(file, '.json'),
        name: data.name || path.basename(file, '.json'),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
    
    console.log('[Main] Returning', projects.length, 'projects');
    return { success: true, projects: projects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ) };
  } catch (error) {
    console.error('[Main] Error listing projects:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('project:load', async (_event, projectId: string) => {
  try {
    const projectsDir = getProjectsDirectory();
    const filePath = path.join(projectsDir, `${projectId}.json`);
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'Project not found' };
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // Remove metadata fields
    const { name: _name, createdAt: _createdAt, updatedAt: _updatedAt, ...config } = data;
    return { success: true, config };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('project:save', async (_event, projectName: string, config: BuildConfig) => {
  try {
    console.log('[Main] project:save called with name:', projectName);
    const projectsDir = getProjectsDirectory();
    console.log('[Main] Projects directory:', projectsDir);
    const projectId = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    console.log('[Main] Generated project ID:', projectId);
    const filePath = path.join(projectsDir, `${projectId}.json`);
    console.log('[Main] File path:', filePath);
    
    const projectData: ProjectData = {
      ...config,
      name: projectName,
      createdAt: fs.existsSync(filePath) 
        ? JSON.parse(fs.readFileSync(filePath, 'utf-8')).createdAt 
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('[Main] Writing project data to file...');
    fs.writeFileSync(filePath, JSON.stringify(projectData, null, 2), 'utf-8');
    console.log('[Main] Project saved successfully');
    
    // Verify file was created
    if (fs.existsSync(filePath)) {
      console.log('[Main] File verified to exist');
    } else {
      console.error('[Main] ERROR: File was not created!');
    }
    
    return { success: true, projectId };
  } catch (error) {
    console.error('[Main] Error saving project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('project:delete', async (_event, projectId: string) => {
  try {
    const projectsDir = getProjectsDirectory();
    const filePath = path.join(projectsDir, `${projectId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'Project not found' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('project:saveAs', async (_event, projectName: string, config: BuildConfig) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Project',
      defaultPath: `${projectName}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'Save cancelled' };
    }

    const projectData: ProjectData = {
      ...config,
      name: projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(result.filePath, JSON.stringify(projectData, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('project:loadFromFile', async (_event) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Load Project',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'Load cancelled' };
    }

    const filePath = result.filePaths[0];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { name, createdAt: _createdAt, updatedAt: _updatedAt, ...config } = data;
    return { success: true, config, name: name || path.basename(filePath, '.json') };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
