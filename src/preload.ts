// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  selectDirectory: (title: string) => ipcRenderer.invoke('dialog:selectDirectory', title),
  selectFile: (title: string, filters: { name: string; extensions: string[] }[]) => 
    ipcRenderer.invoke('dialog:selectFile', title, filters),
  
  // Build operations
  buildAAB: (config: any) => ipcRenderer.invoke('build:aab', config),
  buildAPK: (config: any) => ipcRenderer.invoke('build:apk', config),
  
  // Progress updates
  onBuildProgress: (callback: (data: { message: string; type: 'info' | 'success' | 'error' }) => void) => {
    ipcRenderer.on('build:progress', (_event, data) => callback(data));
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
});
